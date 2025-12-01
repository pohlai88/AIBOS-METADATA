import {
    InventoryValuationService,
    StockMovementEvent,
} from "./services";
import {
    InventoryValuationServiceDeps,
    CostLayer,
} from "./ports";
import {
    StockLedgerEntry,
    ItemId,
    WarehouseId,
} from "./types";
import {
    DecimalString,
    EntityId,
    ISODate,
    TenantId,
} from "../../core/types";
import { Decimal } from "../gl/decimal-utils";

/**
 * InventoryValuationServiceImpl
 * -----------------------------
 * Implements PRD Domain B (IAS 2):
 * - Moving Average valuation
 * - FIFO via cost layers
 *
 * TODO markers:
 * - PRD B.1.x: negative stock policy
 * - PRD B.2.x: NRV adjustments
 * - PRD B.3.x: rounding & precision
 */
export class InventoryValuationServiceImpl
    implements InventoryValuationService {
    private readonly deps: InventoryValuationServiceDeps;

    constructor(deps: InventoryValuationServiceDeps) {
        this.deps = deps;
    }

    async applyStockMovement(
        event: StockMovementEvent
    ): Promise<StockLedgerEntry> {
        const item = await this.deps.stockItemRepo.findById({
            tenantId: event.tenantId,
            entityId: event.entityId,
            itemId: event.itemId as ItemId,
        });

        if (!item) {
            throw new Error(
                `StockItem not found: itemId=${event.itemId}`
            );
        }

        const method = item.valuationMethod;

        switch (method) {
            case "MOVING_AVERAGE":
                return this.applyMovingAverage(event);
            case "FIFO":
                return this.applyFifo(event);
            default: {
                // In case new methods appear in future
                const exhaustive: never = method;
                throw new Error(`Unsupported valuation method: ${exhaustive}`);
            }
        }
    }

    async getValuationSnapshot(params: {
        tenantId: string;
        entityId: string;
        itemId: string;
        warehouseId: string;
        cutoffDate: ISODate;
    }): Promise<{
        qty: DecimalString;
        valuationRate: DecimalString;
        value: DecimalString;
    }> {
        const last = await this.deps.stockLedgerRepo.getLastEntry({
            tenantId: params.tenantId as TenantId,
            entityId: params.entityId as EntityId,
            itemId: params.itemId as ItemId,
            warehouseId: params.warehouseId as WarehouseId,
            cutoffDate: params.cutoffDate,
        });

        if (!last) {
            return {
                qty: Decimal.zero(),
                valuationRate: Decimal.zero(),
                value: Decimal.zero(),
            };
        }

        return {
            qty: last.balanceQty,
            valuationRate: last.valuationRate,
            value: last.balanceValue,
        };
    }

    // ---------------------------------------------------------------------------
    // MOVING AVERAGE
    // ---------------------------------------------------------------------------

    private async applyMovingAverage(
        event: StockMovementEvent
    ): Promise<StockLedgerEntry> {
        const { tenantId, entityId, itemId, warehouseId, postingDate } = event;

        const last = await this.deps.stockLedgerRepo.getLastEntry({
            tenantId,
            entityId,
            itemId: itemId as ItemId,
            warehouseId: warehouseId as WarehouseId,
            cutoffDate: postingDate,
        });

        const prevQty = last ? last.balanceQty : Decimal.zero();
        const prevRate = last ? last.valuationRate : Decimal.zero();
        const prevValue = last ? last.balanceValue : Decimal.zero();

        const qtyChange = event.qtyChange;

        // PRD B.1.x - negative stock policy
        // Decide if negative balances are allowed; if not, validate here.

        const newQty = Decimal.add(prevQty, qtyChange);

        // Receipt (qtyChange > 0)
        if (Decimal.isPositive(qtyChange)) {
            if (!event.incomingRate) {
                throw new Error(
                    "Incoming rate is required for positive qty movement in Moving Average."
                );
            }

            const incomingValue = this.mul(
                qtyChange,
                event.incomingRate
            );
            const totalValue = Decimal.add(prevValue, incomingValue);

            const valuationRate =
                Decimal.isZero(newQty) ?
                    Decimal.zero() :
                    this.div(totalValue, newQty);

            const balanceValue = totalValue;

            return this.persistSle({
                prev: last,
                event,
                newQty,
                valuationRate,
                balanceValue,
            });
        }

        // Issue (qtyChange < 0) – use existing valuation rate
        // PRD B.1.x: if negative stock not allowed, validate newQty >= 0 here.
        const valuationRate = prevRate;
        const issueValue = this.mul(qtyChange, prevRate); // qtyChange is negative
        const balanceValue = Decimal.add(prevValue, issueValue);

        return this.persistSle({
            prev: last,
            event,
            newQty,
            valuationRate,
            balanceValue,
        });
    }

    // ---------------------------------------------------------------------------
    // FIFO
    // ---------------------------------------------------------------------------

    private async applyFifo(
        event: StockMovementEvent
    ): Promise<StockLedgerEntry> {
        const { tenantId, entityId, itemId, warehouseId, postingDate } = event;

        const last = await this.deps.stockLedgerRepo.getLastEntry({
            tenantId,
            entityId,
            itemId: itemId as ItemId,
            warehouseId: warehouseId as WarehouseId,
            cutoffDate: postingDate,
        });

        const prevQty = last ? last.balanceQty : Decimal.zero();
        const prevValue = last ? last.balanceValue : Decimal.zero();

        const qtyChange = event.qtyChange;
        const newQty = Decimal.add(prevQty, qtyChange);

        const layers = await this.deps.costLayerRepo.getLayers({
            tenantId,
            entityId,
            itemId: itemId as ItemId,
            warehouseId: warehouseId as WarehouseId,
        });

        if (Decimal.isPositive(qtyChange)) {
            // Receipt: create new cost layer
            if (!event.incomingRate) {
                throw new Error(
                    "Incoming rate is required for positive qty movement in FIFO."
                );
            }

            const unitCost = event.incomingRate;
            const incomingValue = this.mul(qtyChange, unitCost);
            const balanceValue = Decimal.add(prevValue, incomingValue);

            const valuationRate =
                Decimal.isZero(newQty) ?
                    Decimal.zero() :
                    this.div(balanceValue, newQty);

            // Create new FIFO layer
            await this.deps.costLayerRepo.createLayer({
                tenantId,
                entityId,
                itemId: itemId as ItemId,
                warehouseId: warehouseId as WarehouseId,
                remainingQty: qtyChange,
                unitCost,
            });

            return this.persistSle({
                prev: last,
                event,
                newQty,
                valuationRate,
                balanceValue,
            });
        }

        // Issue: consume quantity from oldest layers
        const issueQty = qtyChange; // negative

        // PRD B.1.x: negative stock policy (ensure enough layer qty)
        const consumed = this.consumeFifoLayers(
            layers,
            issueQty
        );

        // Update layers after consumption
        await this.deps.costLayerRepo.updateLayers(consumed.updatedLayers);

        const issueValue = consumed.totalCost; // negative
        const balanceValue = Decimal.add(prevValue, issueValue);

        const valuationRate =
            Decimal.isZero(newQty) ?
                Decimal.zero() :
                this.div(balanceValue, newQty);

        return this.persistSle({
            prev: last,
            event,
            newQty,
            valuationRate,
            balanceValue,
        });
    }

    /**
     * Consumes FIFO layers for an issue movement.
     * Assumes issueQty is negative.
     * Returns updated layers + total cost (negative).
     */
    private consumeFifoLayers(
        layers: readonly CostLayer[],
        issueQty: DecimalString
    ): {
        updatedLayers: CostLayer[];
        totalCost: DecimalString;
    } {
        let remainingToIssue = Math.abs(Number(issueQty)); // positive number
        let totalCostNum = 0;
        const updated: CostLayer[] = [];

        for (const layer of layers) {
            if (remainingToIssue <= 0) {
                updated.push(layer);
                continue;
            }

            const layerQtyNum = Math.abs(Number(layer.remainingQty));
            if (layerQtyNum <= 0) {
                updated.push(layer);
                continue;
            }

            const qtyFromThisLayer =
                remainingToIssue <= layerQtyNum ?
                    remainingToIssue :
                    layerQtyNum;

            const costFromThisLayer =
                qtyFromThisLayer * Number(layer.unitCost);

            totalCostNum += costFromThisLayer;

            const newRemaining = layerQtyNum - qtyFromThisLayer;

            updated.push({
                ...layer,
                remainingQty: Decimal.from(newRemaining),
            });

            remainingToIssue -= qtyFromThisLayer;
        }

        // PRD B.1.x - if remainingToIssue > 0, we have negative stock (no enough layers)
        // Decide whether to:
        // - throw
        // - or allow and treat missing quantity using last known cost
        if (remainingToIssue > 0) {
            // For now, we throw; PRD can override behaviour.
            throw new Error(
                `FIFO layers insufficient for issue quantity. Remaining to issue: ${remainingToIssue}`
            );
        }

        // totalCostNum is positive; for issue (qtyChange negative), cost should be negative
        const totalCost = Decimal.from(-totalCostNum);

        return {
            updatedLayers: updated,
            totalCost,
        };
    }

    // ---------------------------------------------------------------------------
    // Shared helpers
    // ---------------------------------------------------------------------------

    private mul(
        a: DecimalString,
        b: DecimalString
    ): DecimalString {
        return Decimal.from(Number(a) * Number(b));
    }

    private div(
        a: DecimalString,
        b: DecimalString
    ): DecimalString {
        if (Decimal.isZero(b)) return Decimal.zero();
        return Decimal.from(Number(a) / Number(b));
    }

    private async persistSle(args: {
        prev: StockLedgerEntry | null;
        event: StockMovementEvent;
        newQty: DecimalString;
        valuationRate: DecimalString;
        balanceValue: DecimalString;
    }): Promise<StockLedgerEntry> {
        const { prev, event, newQty, valuationRate, balanceValue } = args;

        const now = this.deps.clock.now();
        const sleId = this.deps.idGenerator.generate();

        const sle: StockLedgerEntry = {
            sleId,
            tenantId: event.tenantId,
            entityId: event.entityId,
            itemId: event.itemId as ItemId,
            warehouseId: event.warehouseId as WarehouseId,
            postingDate: event.postingDate,
            postingTime: now,
            qtyChange: event.qtyChange,
            balanceQty: newQty,
            incomingRate: event.incomingRate ?? Decimal.zero(),
            valuationRate,
            balanceValue,
            currency: prev?.currency ?? "MYR", // TODO: PRD B.x.x - default/base currency resolution
            sourceSystem: event.sourceSystem,
            sourceReference: event.sourceReference,
            metadata: undefined,
        };

        return this.deps.stockLedgerRepo.saveEntry(sle);
    }
}


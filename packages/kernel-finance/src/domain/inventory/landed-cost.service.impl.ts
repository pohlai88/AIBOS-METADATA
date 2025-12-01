import {
    LandedCostService,
} from "./services";
import {
    LandedCostServiceDeps,
} from "./ports.landed-cost";
import {
    LandedCostAllocationMethod,
    LandedCostAllocationResultLine,
    LandedCostLine,
} from "./types";
import { Decimal } from "../gl/decimal-utils";
import { DecimalString, EntityId, TenantId } from "../../core/types";

/**
 * LandedCostServiceImpl
 * ---------------------
 * Implements PRD Domain B landed cost allocation:
 * - Allocates freight/insurance/etc. across items by value or qty.
 *
 * This service only computes allocation.
 * Actual application into inventory valuation is done by
 * LandedCostApplicationRepository.
 */
export class LandedCostServiceImpl implements LandedCostService {
    private readonly deps: LandedCostServiceDeps;

    constructor(deps: LandedCostServiceDeps) {
        this.deps = deps;
    }

    async allocateLandedCost(params: {
        tenantId: string;
        entityId: string;
        baseDocumentId: string;
        landedCostLines: readonly LandedCostLine[];
        method: LandedCostAllocationMethod;
    }): Promise<readonly LandedCostAllocationResultLine[]> {
        const { tenantId, entityId, baseDocumentId, landedCostLines, method } =
            params;

        if (!landedCostLines.length) {
            return [];
        }

        const baseLines = await this.deps.baseRepo.getBaseLines({
            tenantId: tenantId as TenantId,
            entityId: entityId as EntityId,
            baseDocumentId,
        });

        if (!baseLines.length) {
            throw new Error(
                `No base lines found for baseDocumentId=${baseDocumentId}`
            );
        }

        const totalLandedCost = landedCostLines.reduce<DecimalString>(
            (acc, line) => Decimal.add(acc, line.amount),
            Decimal.zero()
        );

        if (Decimal.isZero(totalLandedCost)) {
            return [];
        }

        const allocations =
            method === "BY_VALUE"
                ? this.allocateByValue(baseLines, totalLandedCost)
                : this.allocateByQty(baseLines, totalLandedCost);

        // Let repository handle the actual effect on valuation
        await this.deps.applyRepo.applyAllocation({
            tenantId: tenantId as TenantId,
            entityId: entityId as EntityId,
            baseDocumentId,
            allocations,
        });

        return allocations;
    }

    // ---------------------------------------------------------------------------
    // Allocation strategies
    // ---------------------------------------------------------------------------

    private allocateByValue(
        baseLines: readonly {
            lineId: string;
            itemId: string;
            warehouseId: string;
            qty: string;
            baseValue: string;
        }[],
        totalLandedCost: DecimalString
    ): LandedCostAllocationResultLine[] {
        const totalValue = baseLines.reduce<DecimalString>(
            (acc, line) => Decimal.add(acc, line.baseValue),
            Decimal.zero()
        );

        if (Decimal.isZero(totalValue)) {
            // Fallback: if baseValue all zero, fallback to qty allocation
            return this.allocateByQty(baseLines, totalLandedCost);
        }

        const result: LandedCostAllocationResultLine[] = [];

        for (const line of baseLines) {
            const ratio = this.safeDiv(line.baseValue, totalValue);
            const allocated = this.mul(totalLandedCost, ratio);

            result.push({
                itemId: line.itemId as any,
                warehouseId: line.warehouseId as any,
                additionalCost: allocated,
            });
        }

        return result;
    }

    private allocateByQty(
        baseLines: readonly {
            lineId: string;
            itemId: string;
            warehouseId: string;
            qty: string;
            baseValue: string;
        }[],
        totalLandedCost: DecimalString
    ): LandedCostAllocationResultLine[] {
        const totalQty = baseLines.reduce<DecimalString>(
            (acc, line) => Decimal.add(acc, line.qty),
            Decimal.zero()
        );

        const result: LandedCostAllocationResultLine[] = [];

        if (Decimal.isZero(totalQty)) {
            // No qty to allocate: return zero allocation
            for (const line of baseLines) {
                result.push({
                    itemId: line.itemId as any,
                    warehouseId: line.warehouseId as any,
                    additionalCost: Decimal.zero(),
                });
            }
            return result;
        }

        for (const line of baseLines) {
            const ratio = this.safeDiv(line.qty, totalQty);
            const allocated = this.mul(totalLandedCost, ratio);

            result.push({
                itemId: line.itemId as any,
                warehouseId: line.warehouseId as any,
                additionalCost: allocated,
            });
        }

        return result;
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    private mul(
        a: DecimalString,
        b: DecimalString
    ): DecimalString {
        return Decimal.from(Number(a) * Number(b));
    }

    private safeDiv(
        a: DecimalString,
        b: DecimalString
    ): DecimalString {
        if (Decimal.isZero(b)) return Decimal.zero();
        return Decimal.from(Number(a) / Number(b));
    }
}


import {
    DecimalString,
    EntityId,
    ISODate,
    ISODateTime,
    TenantId,
    Ulid,
} from "../../core/types";
import {
    StockItem,
    StockLedgerEntry,
    ItemId,
    WarehouseId,
} from "./types";

/**
 * Cost layer for FIFO valuation.
 * Each layer represents a batch of units with a fixed unit cost.
 */
export interface CostLayer {
    readonly layerId: Ulid;
    readonly tenantId: TenantId;
    readonly entityId: EntityId;

    readonly itemId: ItemId;
    readonly warehouseId: WarehouseId;

    readonly remainingQty: DecimalString;
    readonly unitCost: DecimalString;

    readonly createdAt: ISODateTime;
}

/**
 * Stock item repository (metadata).
 */
export interface StockItemRepository {
    findById(params: {
        tenantId: TenantId;
        entityId: EntityId;
        itemId: ItemId;
    }): Promise<StockItem | null>;
}

/**
 * Stock ledger repository.
 */
export interface StockLedgerRepository {
    /**
     * Returns latest SLE on or before cutoffDate,
     * for given item & warehouse.
     */
    getLastEntry(params: {
        tenantId: TenantId;
        entityId: EntityId;
        itemId: ItemId;
        warehouseId: WarehouseId;
        cutoffDate: ISODate;
    }): Promise<StockLedgerEntry | null>;

    /**
     * Persists a new SLE.
     */
    saveEntry(
        entry: Omit<
            StockLedgerEntry,
            "sleId" | "postingTime"
        > & {
            sleId?: Ulid;
            postingTime?: ISODateTime;
        }
    ): Promise<StockLedgerEntry>;
}

/**
 * Cost layer repository for FIFO.
 */
export interface CostLayerRepository {
    /**
     * Returns existing cost layers for FIFO,
     * sorted by oldest first (for consumption).
     */
    getLayers(params: {
        tenantId: TenantId;
        entityId: EntityId;
        itemId: ItemId;
        warehouseId: WarehouseId;
    }): Promise<readonly CostLayer[]>;

    /**
     * Creates a new layer (for receipts).
     */
    createLayer(
        layer: Omit<CostLayer, "layerId" | "createdAt">
    ): Promise<CostLayer>;

    /**
     * Updates remaining qty of layers after issues.
     */
    updateLayers(
        layers: readonly CostLayer[]
    ): Promise<void>;
}

/**
 * Dependencies for InventoryValuationServiceImpl.
 */
export interface InventoryValuationServiceDeps {
    stockItemRepo: StockItemRepository;
    stockLedgerRepo: StockLedgerRepository;
    costLayerRepo: CostLayerRepository;

    idGenerator: { generate: () => Ulid };
    clock: { now: () => ISODateTime };
}


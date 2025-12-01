import {
  LandedCostAllocationMethod,
  LandedCostAllocationResultLine,
  LandedCostLine,
  StockLedgerEntry,
  WarehouseId,
} from "./types";
import {
  DecimalString,
  EntityId,
  ISODate,
  TenantId,
  Ulid,
} from "../../core/types";

export interface StockMovementEvent {
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly itemId: Ulid;
  readonly warehouseId: WarehouseId;

  readonly postingDate: ISODate;
  readonly qtyChange: DecimalString;

  readonly incomingRate?: DecimalString; // required for receipts
  readonly sourceSystem?: string;
  readonly sourceReference?: string;
}

/**
 * InventoryValuationService
 * -------------------------
 * Core IAS 2 engine (FIFO / Moving Average).
 */
export interface InventoryValuationService {
  /**
   * Applies a stock movement and returns the resulting SLE.
   */
  applyStockMovement(
    event: StockMovementEvent
  ): Promise<StockLedgerEntry>;

  /**
   * Computes current valuation snapshot for an item/warehouse.
   */
  getValuationSnapshot(params: {
    tenantId: TenantId;
    entityId: EntityId;
    itemId: Ulid;
    warehouseId: WarehouseId;
    cutoffDate: ISODate;
  }): Promise<{
    qty: DecimalString;
    valuationRate: DecimalString;
    value: DecimalString;
  }>;
}

/**
 * LandedCostService
 * -----------------
 * Distributes additional costs over underlying stock.
 */
export interface LandedCostService {
  allocateLandedCost(params: {
    tenantId: TenantId;
    entityId: EntityId;
    baseDocumentId: string; // e.g. GRN/PO id
    landedCostLines: readonly LandedCostLine[];
    method: LandedCostAllocationMethod;
  }): Promise<readonly LandedCostAllocationResultLine[]>;
}


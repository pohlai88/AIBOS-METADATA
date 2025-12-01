import {
  CurrencyCode,
  DecimalString,
  EntityId,
  ISODate,
  ISODateTime,
  MetadataBag,
  TenantId,
  Ulid,
} from "../../core/types";

export type ItemId = Ulid;
export type WarehouseId = Ulid;

export type ValuationMethod = "FIFO" | "MOVING_AVERAGE";

export interface StockItem {
  readonly itemId: ItemId;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly sku: string;
  readonly name: string;

  readonly valuationMethod: ValuationMethod;
  readonly baseUom: string;

  readonly inventoryAccountId: Ulid;
  readonly cogsAccountId: Ulid;
  readonly adjustmentAccountId: Ulid;

  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface StockLedgerEntry {
  readonly sleId: Ulid;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly itemId: ItemId;
  readonly warehouseId: WarehouseId;

  readonly postingDate: ISODate;
  readonly postingTime: ISODateTime;

  readonly qtyChange: DecimalString; // + for in, - for out
  readonly balanceQty: DecimalString;

  readonly incomingRate: DecimalString; // per unit cost (for receipts)
  readonly valuationRate: DecimalString; // per unit
  readonly balanceValue: DecimalString;

  readonly currency: CurrencyCode;

  readonly sourceSystem?: string;
  readonly sourceReference?: string;
  readonly metadata?: MetadataBag;
}

/**
 * Landed cost allocation line.
 */
export interface LandedCostLine {
  readonly expenseAccountId: Ulid; // freight, insurance etc.
  readonly amount: DecimalString; // in base currency
}

export type LandedCostAllocationMethod = "BY_VALUE" | "BY_QTY";

/**
 * Allocation result per item/warehouse.
 */
export interface LandedCostAllocationResultLine {
  readonly itemId: ItemId;
  readonly warehouseId: WarehouseId;
  readonly additionalCost: DecimalString; // per unit or total, depending on contract
}


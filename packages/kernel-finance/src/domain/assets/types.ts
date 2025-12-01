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

export type AssetId = Ulid;

export type DepreciationMethod =
  | "STRAIGHT_LINE"
  // room for future:
  | "DECLINING_BALANCE";

export interface Asset {
  readonly assetId: AssetId;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly assetNumber: string;
  readonly name: string;
  readonly assetClass: string;

  readonly acquisitionDate: ISODate;
  readonly currency: CurrencyCode;

  readonly cost: DecimalString;
  readonly salvageValue: DecimalString;
  readonly usefulLifeMonths: number;

  readonly depreciationMethod: DepreciationMethod;

  readonly assetAccountId: Ulid;
  readonly accumulatedDepreciationAccountId: Ulid;
  readonly depreciationExpenseAccountId: Ulid;

  readonly metadata?: MetadataBag;

  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface DepreciationScheduleLine {
  readonly scheduleLineId: Ulid;
  readonly assetId: AssetId;

  readonly periodNumber: number;
  readonly periodStart: ISODate;
  readonly periodEnd: ISODate;

  readonly depreciationAmount: DecimalString;
  readonly accumulatedDepreciation: DecimalString;
  readonly netBookValue: DecimalString;

  readonly postedJournalId?: Ulid; // GL journal when posted
}


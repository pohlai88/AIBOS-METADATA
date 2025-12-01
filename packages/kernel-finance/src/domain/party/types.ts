import {
  CurrencyCode,
  EntityId,
  ISODateTime,
  TenantId,
  Ulid,
} from "../../core/types";

export type PartyId = Ulid;
export type PartyType = "CUSTOMER" | "SUPPLIER";

export interface Party {
  readonly partyId: PartyId;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly type: PartyType;
  readonly name: string;
  readonly legalName?: string;
  readonly taxId?: string;

  readonly defaultCurrency?: CurrencyCode;
  readonly defaultPaymentTermDays?: number;

  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}


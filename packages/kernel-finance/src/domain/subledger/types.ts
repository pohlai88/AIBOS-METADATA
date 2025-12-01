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
import { PartyId, PartyType } from "../party/types";

export type SubLedgerType = "AR" | "AP";
export type InvoiceStatus = "OPEN" | "PARTIAL" | "PAID" | "CANCELLED";

export interface SubLedgerInvoice {
  readonly invoiceId: Ulid;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly subLedgerType: SubLedgerType;
  readonly partyId: PartyId;
  readonly partyType: PartyType;

  readonly invoiceNumber: string;
  readonly invoiceDate: ISODate;
  readonly dueDate: ISODate;

  readonly currency: CurrencyCode;
  readonly amount: DecimalString; // gross invoice amount (incl/excl tax by policy)
  readonly openBalance: DecimalString; // remaining balance in invoice currency

  readonly status: InvoiceStatus;

  readonly controlAccountId: Ulid; // GL control account bound by PRD
  readonly metadata?: MetadataBag;

  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

/**
 * Cash/bank movement applied against invoices.
 * Actual GL posting still goes via PostingService;
 * this object is the sub-ledger view.
 */
export interface PaymentEntry {
  readonly paymentId: Ulid;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly subLedgerType: SubLedgerType;
  readonly partyId: PartyId;
  readonly partyType: PartyType;

  readonly paymentDate: ISODate;
  readonly currency: CurrencyCode;
  readonly amount: DecimalString; // signed (AR: positive = receipt, AP: positive = payment)

  readonly bankAccountId: Ulid; // GL bank/cash account
  readonly reference?: string;
  readonly metadata?: MetadataBag;

  readonly createdAt: ISODateTime;
}

/**
 * Individual allocation of a payment to an invoice.
 */
export interface PaymentAllocation {
  readonly allocationId: Ulid;
  readonly paymentId: Ulid;
  readonly invoiceId: Ulid;

  readonly appliedAmount: DecimalString; // in invoice currency

  readonly createdAt: ISODateTime;
}

/**
 * Aging bucket configuration & line result.
 */
export interface AgingBucketConfig {
  readonly label: string; // "0-30", "31-60", etc.
  readonly minDays: number;
  readonly maxDays?: number;
}

export interface AgingBucketLine {
  readonly bucket: string; // label
  readonly amount: DecimalString;
}

export interface AgingSummaryPerParty {
  readonly partyId: PartyId;
  readonly partyName: string;
  readonly currency: CurrencyCode;
  readonly totalOpen: DecimalString;
  readonly buckets: readonly AgingBucketLine[];
}


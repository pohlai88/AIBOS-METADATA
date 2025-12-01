import {
  AgingBucketConfig,
  AgingSummaryPerParty,
  PaymentAllocation,
  PaymentEntry,
  SubLedgerType,
} from "./types";
import { EntityId, ISODate, TenantId } from "../../core/types";

export type AllocationStrategy = "FIFO" | "SPECIFIC";

export interface PaymentAllocationRequest {
  readonly payment: PaymentEntry;
  readonly targetInvoiceIds?: readonly string[]; // used when strategy = SPECIFIC
}

export interface PaymentAllocationResult {
  readonly allocations: readonly PaymentAllocation[];
  readonly unappliedAmount: string; // DecimalString
}

/**
 * PaymentAllocationService
 * ------------------------
 * Encapsulates FIFO / specific allocation logic.
 */
export interface PaymentAllocationService {
  allocatePayment(
    request: PaymentAllocationRequest,
    strategy: AllocationStrategy
  ): Promise<PaymentAllocationResult>;
}

/**
 * AgingReportService
 * ------------------
 * Produces IFRS-9 style aging buckets for AR/AP.
 */
export interface AgingReportService {
  getAgingSummary(params: {
    tenantId: TenantId;
    entityId: EntityId;
    subLedgerType: SubLedgerType;
    asOfDate: ISODate;
    buckets: readonly AgingBucketConfig[];
  }): Promise<readonly AgingSummaryPerParty[]>;
}

/**
 * SubLedgerReconciliationService
 * ------------------------------
 * Compares sub-ledger balances to GL control accounts.
 * Actual GL trial balance retrieval is via GL services.
 */
export interface SubLedgerReconciliationService {
  reconcileControlAccounts(params: {
    tenantId: TenantId;
    entityId: EntityId;
    asOfDate: ISODate;
    subLedgerType: SubLedgerType;
  }): Promise<{
    isInBalance: boolean;
    differences: readonly {
      controlAccountId: string;
      controlAccountCode: string;
      controlBalance: string; // DecimalString base currency
      subLedgerBalance: string; // DecimalString base currency
    }[];
  }>;
}


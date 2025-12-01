import {
    DecimalString,
    EntityId,
    ISODate,
    ISODateTime,
    TenantId,
    Ulid,
} from "../../core/types";
import {
    SubLedgerInvoice,
    SubLedgerType,
    PaymentEntry,
    PaymentAllocation,
    AgingBucketConfig,
} from "./types";
import { PartyId } from "../party/types";

/**
 * Read/write abstraction for sub-ledger invoices.
 */
export interface SubLedgerInvoiceRepository {
    /**
     * Get all OPEN/PARTIAL invoices for allocation, for a given party.
     */
    findOpenInvoicesByParty(params: {
        tenantId: TenantId;
        entityId: EntityId;
        subLedgerType: SubLedgerType;
        partyId: PartyId;
    }): Promise<readonly SubLedgerInvoice[]>;

    /**
     * Get specific invoices by IDs (for SPECIFIC allocation).
     */
    findInvoicesByIds(params: {
        tenantId: TenantId;
        entityId: EntityId;
        invoiceIds: readonly Ulid[];
    }): Promise<readonly SubLedgerInvoice[]>;
}

/**
 * Persistence for payments and their allocations.
 * (Domain services can compute; adapters persist.)
 */
export interface PaymentRepository {
    savePaymentEntry(entry: PaymentEntry): Promise<PaymentEntry>;

    saveAllocations(
        allocations: readonly PaymentAllocation[]
    ): Promise<void>;
}

/**
 * Data for aging report.
 */
export interface AgingInvoiceViewRepository {
    /**
     * Returns all open invoices needed for aging.
     * Implementation can be a view or query that exposes:
     * - partyName
     * - dueDate / invoiceDate
     * - openBalance
     */
    getOpenInvoicesForAging(params: {
        tenantId: TenantId;
        entityId: EntityId;
        subLedgerType: SubLedgerType;
        asOfDate: ISODate;
    }): Promise<
        readonly {
            invoiceId: Ulid;
            partyId: PartyId;
            partyName: string;
            currency: string;
            invoiceDate: ISODate;
            dueDate: ISODate;
            openBalance: DecimalString;
        }[]
    >;
}

/**
 * GL control account balances (from trial balance).
 */
export interface ControlAccountBalanceRepository {
    getControlBalances(params: {
        tenantId: TenantId;
        entityId: EntityId;
        subLedgerType: SubLedgerType;
        asOfDate: ISODate;
    }): Promise<
        readonly {
            controlAccountId: Ulid;
            controlAccountCode: string;
            balanceBase: DecimalString; // base currency
        }[]
    >;
}

/**
 * Sub-ledger control totals (from invoices).
 */
export interface SubLedgerControlBalanceRepository {
    getSubLedgerBalances(params: {
        tenantId: TenantId;
        entityId: EntityId;
        subLedgerType: SubLedgerType;
        asOfDate: ISODate;
    }): Promise<
        readonly {
            controlAccountId: Ulid;
            balanceBase: DecimalString; // base currency
        }[]
    >;
}

// ---------------------------------------------------------------------------
// Dependency bundles
// ---------------------------------------------------------------------------

export interface PaymentAllocationServiceDeps {
    invoiceRepo: SubLedgerInvoiceRepository;
    paymentRepo?: PaymentRepository; // optional: use if you want the service to persist
    idGenerator: { generate: () => Ulid };
    clock: { now: () => ISODateTime };
}

export interface AgingReportServiceDeps {
    agingRepo: AgingInvoiceViewRepository;
}

export interface SubLedgerReconciliationServiceDeps {
    controlRepo: ControlAccountBalanceRepository;
    subLedgerRepo: SubLedgerControlBalanceRepository;
}


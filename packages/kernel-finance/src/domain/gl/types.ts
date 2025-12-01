import {
  AccountId,
  AccountType,
  DecimalString,
  EntityId,
  ISODate,
  ISODateTime,
  JournalStatus,
  MetadataBag,
  PeriodId,
  PeriodStatus,
  ProjectId,
  SegmentId,
  TenantId,
  Ulid,
  UserId,
  CurrencyCode,
  OriginCellMeta,
} from "../../core/types";

/**
 * Chart of Accounts entry (IFRS-first, vendor-neutral).
 */
export interface Account {
  readonly accountId: AccountId;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly code: string; // e.g. "1001-01"
  readonly name: string; // e.g. "Cash at Bank - OCBC"
  readonly type: AccountType;

  readonly normalBalance: "DEBIT" | "CREDIT";

  readonly isPostingAllowed: boolean;
  readonly isControlAccount: boolean;

  readonly ifrsDomain?: string; // e.g. "IAS1", "IAS2", "IAS7"
  readonly parentAccountId?: AccountId;

  readonly createdAt: ISODateTime;
  readonly createdBy: UserId;
  readonly updatedAt: ISODateTime;
  readonly updatedBy: UserId;
}

/**
 * Reporting segment, aligned with IFRS 8 conceptually.
 */
export interface Segment {
  readonly segmentId: SegmentId;
  readonly tenantId: TenantId;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
}

/**
 * Accounting period. PeriodClosingService transitions status.
 */
export interface Period {
  readonly periodId: PeriodId;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly name: string; // e.g. "2025-01"
  readonly startDate: ISODate;
  readonly endDate: ISODate;

  readonly status: PeriodStatus;

  readonly createdAt: ISODateTime;
  readonly createdBy: UserId;
  readonly updatedAt: ISODateTime;
  readonly updatedBy: UserId;
}

/**
 * Shared shape for journal line amounts.
 * Debit and credit are mutually exclusive at runtime
 * (kernel invariants enforce this).
 */
export interface JournalAmount {
  readonly debit: DecimalString; // "0.00" if not used
  readonly credit: DecimalString; // "0.00" if not used
}

/**
 * Draft line before posting. Used by PostingService input.
 */
export interface JournalLineDraft extends JournalAmount {
  readonly tempLineId: string;

  readonly accountId: AccountId;

  readonly segmentId?: SegmentId;
  readonly costCenterId?: Ulid;
  readonly projectId?: ProjectId;
  readonly entityId?: EntityId; // can override parent journal entity if needed

  readonly description?: string;
  readonly metadata?: MetadataBag;
}

/**
 * Draft journal before PostingService validation.
 */
export interface JournalEntryDraft {
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly journalDate: ISODate; // posting date
  readonly documentDate?: ISODate; // invoice date, etc.
  readonly currency: CurrencyCode;

  readonly reference?: string; // external doc number
  readonly memo?: string;

  readonly origin: OriginCellMeta;

  readonly lines: readonly JournalLineDraft[];
}

/**
 * Posted journal line. Immutable once posted.
 */
export interface JournalLine extends JournalAmount {
  readonly journalLineId: Ulid;
  readonly journalId: Ulid;

  readonly accountId: AccountId;

  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly segmentId?: SegmentId;
  readonly costCenterId?: Ulid;
  readonly projectId?: ProjectId;

  readonly description?: string;
  readonly metadata?: MetadataBag;
}

/**
 * Posted journal entry. Immutable (no updates, only reversal).
 */
export interface JournalEntry {
  readonly journalId: Ulid;

  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly journalDate: ISODate;
  readonly documentDate?: ISODate;
  readonly currency: CurrencyCode;

  readonly reference?: string;
  readonly memo?: string;

  readonly origin: OriginCellMeta;

  readonly status: JournalStatus;

  readonly lines: readonly JournalLine[];

  readonly createdAt: ISODateTime;
  readonly createdBy: UserId;
}

/**
 * Trial balance line for a given cutoff.
 */
export interface TrialBalanceLine {
  readonly tenantId: TenantId;
  readonly entityId: EntityId;
  readonly accountId: AccountId;

  readonly periodId?: PeriodId; // optional for ad-hoc cutoff
  readonly accountCode: string;
  readonly accountName: string;
  readonly accountType: AccountType;

  readonly openingDebit: DecimalString;
  readonly openingCredit: DecimalString;
  readonly movementDebit: DecimalString;
  readonly movementCredit: DecimalString;
  readonly closingDebit: DecimalString;
  readonly closingCredit: DecimalString;
}

/**
 * Validation rule severity, used by PostingService & BalanceValidationService.
 */
export type ValidationSeverity = "INFO" | "WARNING" | "ERROR";

/**
 * Structured validation message.
 */
export interface ValidationMessage {
  readonly code: string; // e.g. "GL-001"
  readonly message: string;
  readonly severity: ValidationSeverity;
  readonly path?: string; // e.g. "lines[2].debit"
}

/**
 * Result of validation for a journal or trial balance.
 */
export interface ValidationReport {
  readonly isValid: boolean;
  readonly messages: readonly ValidationMessage[];
}

/**
 * Result of period closing, including journals created.
 */
export interface PeriodClosingResult {
  readonly periodId: PeriodId;
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly closingJournals: readonly JournalEntry[];
  readonly validationReport: ValidationReport;
}


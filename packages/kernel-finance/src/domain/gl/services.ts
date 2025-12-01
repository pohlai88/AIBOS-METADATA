import {
  EntityId,
  ISODate,
  PeriodId,
  TenantId,
} from "../../core/types";
import {
  JournalEntry,
  JournalEntryDraft,
  Period,
  PeriodClosingResult,
  TrialBalanceLine,
  ValidationReport,
} from "./types";

/**
 * PostingService
 * --------------
 * Single gatekeeper that turns JournalEntryDraft into immutable JournalEntry.
 */
export interface PostingService {
  /**
   * Validates and posts a draft journal.
   * - Ensures double-entry (sum debit = sum credit)
   * - Ensures no posting to blocked/non-posting accounts
   * - Ensures period is open
   * - Enforces rounding rules
   */
  postJournal(
    draft: JournalEntryDraft
  ): Promise<{
    journal: JournalEntry | null; // null if not posted
    validation: ValidationReport; // always present
  }>;

  /**
   * Validates a draft without posting (dry-run).
   */
  validateJournalDraft(
    draft: JournalEntryDraft
  ): Promise<ValidationReport>;
}

/**
 * BalanceValidationService
 * ------------------------
 * Used for Trial Balance / integrity checks.
 */
export interface BalanceValidationService {
  /**
   * Returns a trial balance for a given cutoff date.
   */
  getTrialBalance(params: {
    tenantId: TenantId;
    entityId: EntityId;
    cutoffDate: ISODate;
  }): Promise<TrialBalanceLine[]>;

  /**
   * Validates that:
   * - Overall debits = credits
   * - Control accounts match sub-ledger totals (via adapters)
   */
  validateTrialBalance(params: {
    tenantId: TenantId;
    entityId: EntityId;
    cutoffDate: ISODate;
  }): Promise<ValidationReport>;
}

/**
 * PeriodClosingService
 * --------------------
 * Responsible for:
 * - Validating period readiness
 * - Running FX revaluation (Domain F)
 * - Posting closing entries (e.g. P&L to Retained Earnings, if enabled in V1.1+)
 * - Locking the period
 */
export interface PeriodClosingService {
  /**
   * Closes the given period if all validations pass.
   */
  closePeriod(params: {
    tenantId: TenantId;
    entityId: EntityId;
    periodId: PeriodId;
  }): Promise<PeriodClosingResult>;

  /**
   * Returns current period metadata.
   */
  getPeriod(periodId: PeriodId): Promise<Period | null>;
}


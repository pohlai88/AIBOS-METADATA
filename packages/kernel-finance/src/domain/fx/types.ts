import {
  CurrencyCode,
  DecimalString,
  EntityId,
  FxRateId,
  ISODate,
  ISODateTime,
  MetadataBag,
  TenantId,
  Ulid,
} from "../../core/types";

/**
 * Type of FX rate as per IFRS 21 use:
 * - "SPOT" for transaction date
 * - "CLOSING" for balance sheet date
 * - "AVERAGE" for P&L approximations (e.g. monthly average)
 */
export type FxRateType = "SPOT" | "CLOSING" | "AVERAGE";

/**
 * FX rate record.
 */
export interface FxRate {
  readonly fxRateId: FxRateId;
  readonly tenantId: TenantId;

  readonly fromCurrency: CurrencyCode;
  readonly toCurrency: CurrencyCode;

  readonly rateType: FxRateType;
  readonly rateDate: ISODate;

  /**
   * Represented as target units per 1 base unit, e.g.
   * fromCurrency: "USD", toCurrency: "MYR", rate: "4.7000"
   * -> 1 USD = 4.7000 MYR
   */
  readonly rate: DecimalString;

  readonly sourceSystem?: string; // e.g. "BNM", "ECB", "Custom"
  readonly metadata?: MetadataBag;

  readonly createdAt: ISODateTime;
}

/**
 * Parameters for running FX revaluation on monetary balances.
 */
export interface FxRevaluationParams {
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly baseCurrency: CurrencyCode;
  readonly cutoffDate: ISODate;

  /**
   * Optional: restrict to specific currencies or account ranges.
   */
  readonly includedCurrencies?: readonly CurrencyCode[];
  readonly excludedCurrencies?: readonly CurrencyCode[];
}

/**
 * Single revaluation line result (per account & currency).
 */
export interface FxRevaluationLineResult {
  readonly accountId: Ulid;
  readonly currency: CurrencyCode;

  readonly balanceForeign: DecimalString;
  readonly balanceBaseBefore: DecimalString;
  readonly balanceBaseAfter: DecimalString;

  readonly deltaBase: DecimalString; // gain(+) or loss(-) in base currency

  readonly unrealisedGainLossAccountId: Ulid;
}

/**
 * Summary of a revaluation run, including journal references.
 */
export interface FxRevaluationResult {
  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly cutoffDate: ISODate;
  readonly baseCurrency: CurrencyCode;

  readonly lines: readonly FxRevaluationLineResult[];
  readonly revaluationJournalId: Ulid | null; // journal posted by GL PostingService
}


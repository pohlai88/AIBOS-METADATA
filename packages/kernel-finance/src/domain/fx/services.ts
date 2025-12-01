import {
  CurrencyCode,
  DecimalString,
  EntityId,
  ISODate,
  TenantId,
  FxRateId,
} from "../../core/types";
import {
  FxRate,
  FxRevaluationParams,
  FxRevaluationResult,
} from "./types";

/**
 * FxRateService
 * -------------
 * Manages registration and retrieval of FX rates.
 * Kernel governance ensures that:
 * - Rates are consistent per date/type
 * - No "mystery" rates are used at posting time
 */
export interface FxRateService {
  /**
   * Registers or updates an FX rate (idempotent per date/type/currency pair).
   */
  upsertRate(rate: Omit<FxRate, "fxRateId" | "createdAt">): Promise<FxRate>;

  /**
   * Gets the applicable rate for a transaction date & type.
   */
  getRate(params: {
    tenantId: TenantId;
    fromCurrency: CurrencyCode;
    toCurrency: CurrencyCode;
    rateDate: ISODate;
    rateType: "SPOT" | "CLOSING" | "AVERAGE";
  }): Promise<FxRate | null>;
}

/**
 * FxRevaluationService
 * --------------------
 * Performs IAS 21 closing-rate revaluation of monetary balances
 * and requests a revaluation journal via GL PostingService.
 */
export interface FxRevaluationService {
  /**
   * Runs revaluation for monetary accounts at cutoffDate.
   * - Pulls balances from GL
   * - Finds appropriate CLOSING rates
   * - Calculates deltas
   * - Requests PostingService to create unrealised gain/loss journal
   */
  runRevaluation(
    params: FxRevaluationParams
  ): Promise<FxRevaluationResult>;
}

/**
 * Realised FX computation when settling a foreign-currency transaction.
 */
export interface RealisedFxService {
  /**
   * Computes realised FX gain/loss and returns the amount
   * that should be posted to the realised FX account.
   *
   * @param originalCurrency   Currency of the original invoice
   * @param baseCurrency       Functional currency of the entity
   * @param originalAmount     Amount of the invoice in originalCurrency
   * @param originalRate       Spot rate used when invoice was recognised
   * @param settlementAmount   Amount paid/received in originalCurrency
   * @param settlementRate     Spot rate at settlement date
   */
  computeRealisedGainLoss(params: {
    originalCurrency: CurrencyCode;
    baseCurrency: CurrencyCode;
    originalAmount: DecimalString;
    originalRate: DecimalString;

    settlementAmount: DecimalString;
    settlementRate: DecimalString;
  }): Promise<{
    realisedGainLossBase: DecimalString; // + = gain, - = loss
  }>;
}


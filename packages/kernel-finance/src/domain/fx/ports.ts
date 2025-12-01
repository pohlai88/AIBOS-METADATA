import {
    CurrencyCode,
    DecimalString,
    EntityId,
    ISODate,
    ISODateTime,
    TenantId,
    Ulid,
} from "../../core/types";
import { FxRateService } from "./services";
import { PostingService } from "../gl/services";
import { FinanceEventPublisher } from "../gl/ports"; // reuse publisher
import { FxRevaluationParams } from "./types";

/**
 * Snapshot of monetary balances per account & currency, as of cutoffDate.
 * This is the "view" of GL that FX engine uses.
 */
export interface MonetaryBalanceSnapshot {
    readonly accountId: Ulid;
    readonly accountCode: string;
    readonly currency: CurrencyCode;

    readonly isMonetary: boolean; // PRD F.1.x: ensure only monetary accounts are revalued

    /**
     * Balance in foreign currency (e.g. USD).
     */
    readonly balanceForeign: DecimalString;

    /**
     * Current carrying amount in base currency (before revaluation).
     * Depending on implementation, this can be:
     * - stored, or
     * - recomputed using previous closing rate.
     */
    readonly balanceBaseBefore: DecimalString;
}

/**
 * Abstraction over how we read balances from GL.
 */
export interface MonetaryBalanceRepository {
    getMonetaryBalances(params: FxRevaluationParams): Promise<
        readonly MonetaryBalanceSnapshot[]
    >;
}

/**
 * Configuration for FX revaluation journal patterns.
 */
export interface FxRevaluationConfig {
    /**
     * Account for unrealised FX gain (credit on gain).
     */
    readonly unrealisedGainAccountId: Ulid;

    /**
     * Account for unrealised FX loss (debit on loss).
     */
    readonly unrealisedLossAccountId: Ulid;

    /**
     * Optional: prefix for revaluation journal memo.
     */
    readonly journalMemoPrefix?: string;
}

/**
 * Dependencies required by FxRevaluationServiceImpl.
 */
export interface FxRevaluationServiceDeps {
    balancesRepo: MonetaryBalanceRepository;
    fxRateService: FxRateService;
    postingService: PostingService;
    eventPublisher: FinanceEventPublisher;

    config: FxRevaluationConfig;

    idGenerator: { generate: () => Ulid };
    clock: { now: () => ISODateTime };
}


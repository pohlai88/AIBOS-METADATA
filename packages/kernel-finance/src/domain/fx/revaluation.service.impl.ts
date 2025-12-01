import {
    CurrencyCode,
    DecimalString,
    EntityId,
    ISODate,
    TenantId,
    Ulid,
} from "../../core/types";
import {
    FxRevaluationParams,
    FxRevaluationResult,
    FxRevaluationLineResult,
} from "./types";
import {
    FxRevaluationService,
} from "./services";
import {
    FxRevaluationServiceDeps,
} from "./ports";
import { Decimal } from "../gl/decimal-utils";
import { JournalEntryDraft, JournalLineDraft } from "../gl/types";
import { FxRevaluationRunEvent } from "../../events/finance-events";

/**
 * FxRevaluationServiceImpl
 * ------------------------
 * Implements PRD Domain F:
 * - IAS 21 closing-rate revaluation of monetary balances
 * - Creates unrealised FX gain/loss journal via PostingService
 *
 * TODO markers:
 * - PRD F.1.x: definition of "monetary" accounts
 * - PRD F.2.x: treatment of different account types (asset/liability)
 * - PRD F.3.x: rounding & threshold rules
 */
export class FxRevaluationServiceImpl implements FxRevaluationService {
    private readonly deps: FxRevaluationServiceDeps;

    constructor(deps: FxRevaluationServiceDeps) {
        this.deps = deps;
    }

    async runRevaluation(
        params: FxRevaluationParams
    ): Promise<FxRevaluationResult> {
        const { tenantId, entityId, baseCurrency, cutoffDate } = params;

        // 1) Get monetary balances from GL view
        const balances = await this.deps.balancesRepo.getMonetaryBalances(params);

        // 2) Build per-account revaluation lines
        const lines: FxRevaluationLineResult[] = [];

        for (const bal of balances) {
            if (!bal.isMonetary) {
                // PRD F.1.x - non-monetary accounts must never be revalued
                continue;
            }

            if (bal.currency === baseCurrency) {
                // Already in base currency; no revaluation
                continue;
            }

            if (Decimal.isZero(bal.balanceForeign)) {
                // Zero foreign balance; skip
                continue;
            }

            const closingRate = await this.getClosingRateAt(
                tenantId,
                bal.currency,
                baseCurrency,
                cutoffDate
            );

            if (!closingRate) {
                // TODO: PRD F.4.x - treatment when closing rate missing:
                // - block revaluation?
                // - warn + skip?
                // For now: skip with implicit "warning" (you may want to log).
                continue;
            }

            const balanceBaseAfter = this.toBase(
                bal.balanceForeign,
                closingRate.rate
            );

            const deltaBase = Decimal.subtract(
                balanceBaseAfter,
                bal.balanceBaseBefore
            );

            if (Decimal.isZero(deltaBase)) {
                continue;
            }

            // Determine which unrealised account to use (gain vs loss)
            const isGain = Decimal.isPositive(deltaBase);

            const unrealisedAccountId = isGain
                ? this.deps.config.unrealisedGainAccountId
                : this.deps.config.unrealisedLossAccountId;

            const line: FxRevaluationLineResult = {
                accountId: bal.accountId,
                currency: bal.currency,
                balanceForeign: bal.balanceForeign,
                balanceBaseBefore: bal.balanceBaseBefore,
                balanceBaseAfter,
                deltaBase,
                unrealisedGainLossAccountId: unrealisedAccountId,
            };

            lines.push(line);
        }

        // 3) Build and post revaluation journal via GL PostingService
        const journalId = await this.postRevaluationJournal({
            tenantId,
            entityId,
            baseCurrency,
            cutoffDate,
            lines,
        });

        // 4) Emit FX.REVALUATION_RUN event
        const now = this.deps.clock.now();
        const event: FxRevaluationRunEvent = {
            eventId: this.deps.idGenerator.generate(),
            eventType: "FX.REVALUATION_RUN",
            tenantId,
            entityId,
            occurredAt: now,
            payloadVersion: "1.0.0",
            payload: {
                cutoffDate,
                baseCurrency,
                revaluationJournalId: journalId as Ulid | null,
            },
        };

        await this.deps.eventPublisher.publish(event);

        const result: FxRevaluationResult = {
            tenantId,
            entityId,
            cutoffDate,
            baseCurrency,
            lines,
            revaluationJournalId: journalId as Ulid | null,
        };

        return result;
    }

    // --- Internal helpers -----------------------------------------------------

    private async getClosingRateAt(
        tenantId: TenantId,
        fromCurrency: CurrencyCode,
        toCurrency: CurrencyCode,
        rateDate: ISODate
    ) {
        // PRD F.x.x: closing rate policy (exact date vs nearest prior)
        return this.deps.fxRateService.getRate({
            tenantId,
            fromCurrency,
            toCurrency,
            rateDate,
            rateType: "CLOSING",
        });
    }

    private toBase(
        amountForeign: DecimalString,
        rate: DecimalString
    ): DecimalString {
        // PRD F.3.x: rounding rules (scale, rounding mode)
        return Decimal.from(Number(amountForeign) * Number(rate));
    }

    /**
     * Creates and posts the revaluation journal via GL PostingService.
     * This is where debit/credit patterns are determined.
     *
     * PRD F.2.x: patterns differ for asset vs liability accounts.
     * For now, we assume:
     * - Positive deltaBase = gain -> credit unrealised gain, debit balance account
     * - Negative deltaBase = loss -> debit unrealised loss, credit balance account
     *
     * You can refine this using AccountType once wired to AccountRepository.
     */
    private async postRevaluationJournal(args: {
        tenantId: TenantId;
        entityId: EntityId;
        baseCurrency: CurrencyCode;
        cutoffDate: ISODate;
        lines: readonly FxRevaluationLineResult[];
    }): Promise<Ulid | null> {
        const { tenantId, entityId, baseCurrency, cutoffDate, lines } = args;

        if (!lines.length) {
            // Nothing to post
            return null;
        }

        const journalLines: JournalLineDraft[] = [];

        for (const line of lines) {
            const isGain = Decimal.isPositive(line.deltaBase);
            const magnitude = Decimal.from(Math.abs(Number(line.deltaBase)));

            // TODO: PRD F.2.x - refine debit/credit direction using account type
            if (isGain) {
                // Gain: increase base value of asset/liability, credit unrealised gain
                journalLines.push({
                    tempLineId: `FX-BASE-${line.accountId}`,
                    accountId: line.accountId,
                    debit: magnitude,
                    credit: Decimal.zero(),
                    description: `FX revaluation base adjustment (${line.currency})`,
                });

                journalLines.push({
                    tempLineId: `FX-GAIN-${line.accountId}`,
                    accountId: line.unrealisedGainLossAccountId,
                    debit: Decimal.zero(),
                    credit: magnitude,
                    description: `Unrealised FX gain (${line.currency})`,
                });
            } else {
                // Loss
                journalLines.push({
                    tempLineId: `FX-BASE-${line.accountId}`,
                    accountId: line.accountId,
                    debit: Decimal.zero(),
                    credit: magnitude,
                    description: `FX revaluation base adjustment (${line.currency})`,
                });

                journalLines.push({
                    tempLineId: `FX-LOSS-${line.accountId}`,
                    accountId: line.unrealisedGainLossAccountId,
                    debit: magnitude,
                    credit: Decimal.zero(),
                    description: `Unrealised FX loss (${line.currency})`,
                });
            }
        }

        const draft: JournalEntryDraft = {
            tenantId,
            entityId,
            journalDate: cutoffDate,
            documentDate: cutoffDate,
            currency: baseCurrency,
            reference: `FX-REV-${cutoffDate}`,
            memo:
                this.deps.config.journalMemoPrefix ??
                "FX revaluation (IAS 21 closing rate)",
            origin: {
                cellId: "kernel.fx.revaluation",
                sourceSystem: "AI-BOS-KERNEL",
                sourceReference: cutoffDate,
            },
            lines: journalLines,
        };

        const result = await this.deps.postingService.postJournal(draft);

        if (!result.validation.isValid || !result.journal) {
            // TODO: PRD F.5.x - define behaviour if FX journal fails validation
            // - raise alert?
            // - block period closing?
            return null;
        }

        return result.journal.journalId;
    }
}


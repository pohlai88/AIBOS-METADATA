import {
    JournalEntry,
    JournalEntryDraft,
    JournalLine,
    ValidationMessage,
    ValidationReport,
} from "./types";
import { PostingService } from "./services";
import {
    PostingServiceDeps,
} from "./ports";
import {
    DecimalString,
    JournalStatus,
} from "../../core/types";
import { Decimal } from "./decimal-utils";
import { JournalPostedEvent } from "../../events/finance-events";

/**
 * PostingServiceImpl
 * ------------------
 * Implements PRD Domain A:
 * - Double-entry enforcement (sum debit = sum credit)
 * - No posting to blocked/non-posting accounts
 * - Period open check
 * - Immutability (journals are write-once)
 *
 * NOTE:
 * - All "TODO: PRD A.x" markers indicate where to plug in your
 *   Master PRD-specific rules and test cases.
 */
export class PostingServiceImpl implements PostingService {
    private readonly deps: PostingServiceDeps;

    constructor(deps: PostingServiceDeps) {
        this.deps = deps;
    }

    /**
     * High-level flow:
     * 1) Validate draft (structural + business rules)
     * 2) If invalid: return validation, journal = null
     * 3) Build JournalEntry object
     * 4) Persist via JournalRepository
     * 5) Emit GL.JOURNAL_POSTED event
     */
    async postJournal(
        draft: JournalEntryDraft
    ): Promise<{ journal: JournalEntry | null; validation: ValidationReport }> {
        const validation = await this.validateJournalDraft(draft);

        if (!validation.isValid) {
            // ❗ No posting if any ERROR severity in validation
            return { journal: null, validation };
        }

        const now = this.deps.clock.now();
        const journalId = this.deps.idGenerator.generate();
        const createdBy = this.deps.currentUserProvider();

        const lines: JournalLine[] = draft.lines.map((lineDraft) => ({
            journalLineId: this.deps.idGenerator.generate(),
            journalId,
            tenantId: draft.tenantId,
            entityId: draft.entityId,
            accountId: lineDraft.accountId,
            debit: lineDraft.debit,
            credit: lineDraft.credit,
            segmentId: lineDraft.segmentId,
            costCenterId: lineDraft.costCenterId,
            projectId: lineDraft.projectId,
            description: lineDraft.description,
            metadata: lineDraft.metadata,
        }));

        const journalToPersist: Omit<JournalEntry, "createdAt" | "createdBy"> = {
            journalId,
            tenantId: draft.tenantId,
            entityId: draft.entityId,
            journalDate: draft.journalDate,
            documentDate: draft.documentDate,
            currency: draft.currency,
            reference: draft.reference,
            memo: draft.memo,
            origin: draft.origin,
            status: "POSTED" as JournalStatus,
            lines,
        };

        const saved = await this.deps.journalRepository.savePosted({
            ...journalToPersist,
            createdAt: now,
            createdBy,
        });

        // Emit event for orchestras / telemetry
        const event: JournalPostedEvent = {
            eventId: this.deps.idGenerator.generate(),
            eventType: "GL.JOURNAL_POSTED",
            tenantId: saved.tenantId,
            entityId: saved.entityId,
            occurredAt: now,
            payloadVersion: "1.0.0",
            payload: {
                journalId: saved.journalId,
                journalDate: saved.journalDate,
                currency: saved.currency,
                originCellId: saved.origin.cellId,
            },
        };

        await this.deps.eventPublisher.publish(event);

        return { journal: saved, validation };
    }

    /**
     * validateJournalDraft
     * --------------------
     * Structural + business-rule validation.
     *
     * PRD hooks:
     * - PRD A.1.x: double-entry rule
     * - PRD A.2.x: period open rule
     * - PRD A.3.x: account posting constraints
     * - PRD A.4.x: rounding & precision
     */
    async validateJournalDraft(
        draft: JournalEntryDraft
    ): Promise<ValidationReport> {
        const messages: ValidationMessage[] = [];

        // --- Structural checks ---
        if (!draft.lines.length) {
            messages.push({
                code: "GL-EMPTY-LINES",
                message: "Journal must contain at least one line.",
                severity: "ERROR",
            });
        }

        // Sum debits & credits across all lines (PRD A.1 - Double-entry)
        let totalDebit: DecimalString = Decimal.zero();
        let totalCredit: DecimalString = Decimal.zero();

        for (let i = 0; i < draft.lines.length; i++) {
            const line = draft.lines[i];

            totalDebit = Decimal.add(totalDebit, line.debit);
            totalCredit = Decimal.add(totalCredit, line.credit);

            const path = `lines[${i}]`;

            // Ensure not both debit and credit non-zero
            const hasDebit = !Decimal.isZero(line.debit);
            const hasCredit = !Decimal.isZero(line.credit);

            if (hasDebit && hasCredit) {
                messages.push({
                    code: "GL-LINE-BOTH-DEBIT-CREDIT",
                    message: "Journal line cannot have both debit and credit non-zero.",
                    severity: "ERROR",
                    path,
                });
            }

            if (!hasDebit && !hasCredit) {
                messages.push({
                    code: "GL-LINE-NO-AMOUNT",
                    message: "Journal line must have either debit or credit amount.",
                    severity: "ERROR",
                    path,
                });
            }

            // Account exists & allowed (PRD A.3 - Posting allowed flag)
            const account = await this.deps.accountRepository.findById(
                line.accountId
            );

            if (!account) {
                messages.push({
                    code: "GL-ACCOUNT-NOT-FOUND",
                    message: `Account not found for accountId=${line.accountId}`,
                    severity: "ERROR",
                    path,
                });
            } else {
                if (!account.isPostingAllowed) {
                    messages.push({
                        code: "GL-ACCOUNT-NOT-POSTING",
                        message: `Account ${account.code} is not allowed for direct posting.`,
                        severity: "ERROR",
                        path,
                    });
                }

                // TODO: PRD A.3.x - additional account-type checks
                // e.g. block posting to Retained Earnings except via closing engine
            }
        }

        // Double-entry check (sum debit == sum credit)
        if (!Decimal.equal(totalDebit, totalCredit)) {
            messages.push({
                code: "GL-IMBALANCED",
                message: `Journal not balanced: totalDebit=${totalDebit}, totalCredit=${totalCredit}`,
                severity: "ERROR",
            });
        }

        // --- Period checks (PRD A.2 - Period open) ---
        const period = await this.deps.periodRepository.findByDate({
            tenantId: draft.tenantId,
            entityId: draft.entityId,
            date: draft.journalDate,
        });

        if (!period) {
            messages.push({
                code: "GL-PERIOD-NOT-FOUND",
                message: `No accounting period found for date ${draft.journalDate}.`,
                severity: "ERROR",
            });
        } else if (period.status !== "OPEN") {
            messages.push({
                code: "GL-PERIOD-NOT-OPEN",
                message: `Period ${period.name} is not open for posting.`,
                severity: "ERROR",
            });
        }

        // TODO: PRD A.x.x - Rounding / precision rules, currency constraints

        const isValid = messages.every((m) => m.severity !== "ERROR");

        const report: ValidationReport = {
            isValid,
            messages,
        };

        return report;
    }
}


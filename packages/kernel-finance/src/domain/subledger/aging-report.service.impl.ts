import {
    AgingReportService,
} from "./services";
import {
    AgingReportServiceDeps,
} from "./ports";
import {
    AgingBucketConfig,
    AgingBucketLine,
    AgingSummaryPerParty,
} from "./types";
import {
    DecimalString,
    EntityId,
    ISODate,
    TenantId,
} from "../../core/types";
import { PartyId } from "../party/types";
import { Decimal } from "../gl/decimal-utils";

/**
 * AgingReportServiceImpl
 * ----------------------
 * Implements PRD Domain H:
 * - Builds AR/AP aging buckets for each party & currency.
 *
 * TODO markers:
 * - PRD H.3.x: definition of "past due" vs "not due"
 * - PRD H.3.x: treatment of credit notes / negative balances
 */
export class AgingReportServiceImpl
    implements AgingReportService {
    private readonly deps: AgingReportServiceDeps;

    constructor(deps: AgingReportServiceDeps) {
        this.deps = deps;
    }

    async getAgingSummary(params: {
        tenantId: string;
        entityId: string;
        subLedgerType: "AR" | "AP";
        asOfDate: ISODate;
        buckets: readonly AgingBucketConfig[];
    }): Promise<readonly AgingSummaryPerParty[]> {
        const { tenantId, entityId, subLedgerType, asOfDate, buckets } = params;

        const invoices =
            await this.deps.agingRepo.getOpenInvoicesForAging({
                tenantId: tenantId as TenantId,
                entityId: entityId as EntityId,
                subLedgerType,
                asOfDate,
            });

        // Group by party + currency
        const key = (p: { partyId: string; currency: string }) =>
            `${p.partyId}::${p.currency}`;

        const grouped = new Map<
            string,
            {
                partyId: PartyId;
                partyName: string;
                currency: string;
                invoices: Array<typeof invoices[number]>;
            }
        >();

        for (const inv of invoices) {
            const k = key(inv);
            if (!grouped.has(k)) {
                grouped.set(k, {
                    partyId: inv.partyId,
                    partyName: inv.partyName,
                    currency: inv.currency,
                    invoices: [],
                });
            }
            grouped.get(k)!.invoices.push(inv);
        }

        const summaries: AgingSummaryPerParty[] = [];

        for (const group of grouped.values()) {
            const summary = this.buildSummaryForParty(
                group.invoices,
                buckets,
                asOfDate,
                group.partyId,
                group.partyName,
                group.currency
            );
            summaries.push(summary);
        }

        return summaries;
    }

    // ---------------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------------

    private buildSummaryForParty(
        invoices: readonly {
            invoiceId: string;
            partyId: PartyId;
            partyName: string;
            currency: string;
            invoiceDate: ISODate;
            dueDate: ISODate;
            openBalance: DecimalString;
        }[],
        buckets: readonly AgingBucketConfig[],
        asOfDate: ISODate,
        partyId: PartyId,
        partyName: string,
        currency: string
    ): AgingSummaryPerParty {
        const totalOpen = invoices.reduce<DecimalString>(
            (acc, inv) => Decimal.add(acc, inv.openBalance),
            Decimal.zero()
        );

        const bucketSums = new Map<string, DecimalString>();
        for (const b of buckets) {
            bucketSums.set(b.label, Decimal.zero());
        }

        for (const inv of invoices) {
            const daysPastDue = this.daysBetween(inv.dueDate, asOfDate);

            // PRD H.3.x - "past due" definition:
            // - if dueDate <= asOfDate: positive or zero days
            // - if dueDate > asOfDate: negative days (not yet due) — you may choose special bucket

            const bucket = this.findBucketForDays(buckets, daysPastDue);
            if (!bucket) {
                // If no bucket matches, we skip or put in implicit "Other"
                continue;
            }

            const current = bucketSums.get(bucket.label) ?? Decimal.zero();
            bucketSums.set(
                bucket.label,
                Decimal.add(current, inv.openBalance)
            );
        }

        const bucketLines: AgingBucketLine[] = buckets.map((b) => ({
            bucket: b.label,
            amount: bucketSums.get(b.label) ?? Decimal.zero(),
        }));

        return {
            partyId,
            partyName,
            currency,
            totalOpen,
            buckets: bucketLines,
        };
    }

    private daysBetween(from: ISODate, to: ISODate): number {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const diffMs = toDate.getTime() - fromDate.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    private findBucketForDays(
        buckets: readonly AgingBucketConfig[],
        daysPastDue: number
    ): AgingBucketConfig | undefined {
        return buckets.find((b) => {
            const minOk = daysPastDue >= b.minDays;
            const maxOk =
                typeof b.maxDays === "number"
                    ? daysPastDue <= b.maxDays
                    : true;
            return minOk && maxOk;
        });
    }
}


import {
    Asset,
} from "./types";
import {
    AssetLifecycleService,
} from "./services";
import {
    AssetLifecycleServiceDeps,
} from "./ports";
import {
    DecimalString,
    ISODate,
    Ulid,
} from "../../core/types";
import { Decimal } from "../gl/decimal-utils";
import { JournalEntryDraft, JournalLineDraft } from "../gl/types";

/**
 * AssetLifecycleServiceImpl
 * -------------------------
 * Implements PRD Domain C, lifecycle part:
 * - Asset registration (capitalisation)
 * - Asset disposal
 *
 * TODO markers:
 * - PRD C.1.x: capitalisation rules (what qualifies as PPE)
 * - PRD C.2.x: disposal rules & approvals
 * - PRD C.3.x: rounding & useful life constraints
 */
export class AssetLifecycleServiceImpl implements AssetLifecycleService {
    private readonly deps: AssetLifecycleServiceDeps;

    constructor(deps: AssetLifecycleServiceDeps) {
        this.deps = deps;
    }

    async registerAsset(
        draft: Omit<Asset, "assetId" | "createdAt" | "updatedAt">
    ): Promise<Asset> {
        // TODO: PRD C.1.x - validation: useful life > 0, cost >= salvage, etc.

        const now = this.deps.clock.now();
        const assetId = this.deps.idGenerator.generate();

        const asset: Asset = {
            ...draft,
            assetId,
            createdAt: now,
            updatedAt: now,
        };

        const saved = await this.deps.assetRepo.create(asset);

        // Optionally: generate schedule immediately
        // This is also exposed via AssetDepreciationService.generateSchedule
        // You can choose where to call it from in your flow.

        return saved;
    }

    async disposeAsset(params: {
        assetId: Ulid;
        disposalDate: ISODate;
        proceeds: string; // DecimalString
    }): Promise<{
        gainLossAmount: string; // DecimalString
        disposalJournalId?: Ulid;
    }> {
        const { assetId, disposalDate, proceeds } = params;

        const asset = await this.deps.assetRepo.findById(assetId);
        if (!asset) {
            throw new Error(`Asset not found: assetId=${assetId}`);
        }

        // Fetch schedule to derive NBV at disposal date
        const schedule =
            await this.deps.scheduleRepo.getByAssetId(assetId);

        const nbvAtDisposal = this.computeNbvAtDate(
            asset,
            schedule,
            disposalDate
        );

        const gainLoss = Decimal.subtract(
            proceeds,
            nbvAtDisposal
        );

        // Build disposal journal draft using PRD C.x patterns
        const journalId = await this.postDisposalJournal({
            asset,
            disposalDate,
            proceeds,
            nbv: nbvAtDisposal,
            gainLoss,
        });

        // TODO: PRD C.2.x - mark asset as disposed (you might add a status field)
        // For now we don't mutate the Asset beyond journal.

        return {
            gainLossAmount: gainLoss,
            disposalJournalId: journalId ?? undefined,
        };
    }

    // ---------------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------------

    /**
     * Computes Net Book Value at disposalDate using schedule.
     * NOTE:
     * - Assumes schedule is up to date; if not, you should have
     *   posted depreciation up to the last period before disposal.
     */
    private computeNbvAtDate(
        asset: Asset,
        schedule: readonly {
            periodEnd: ISODate;
            netBookValue: DecimalString;
        }[],
        disposalDate: ISODate
    ): DecimalString {
        // PRD C.1.x - policy: use last schedule line <= disposalDate
        const sorted = [...schedule].sort(
            (a, b) => (a.periodEnd < b.periodEnd ? -1 : 1)
        );

        let lastNbv = asset.cost;

        for (const line of sorted) {
            if (line.periodEnd <= disposalDate) {
                lastNbv = line.netBookValue;
            } else {
                break;
            }
        }

        return lastNbv;
    }

    private async postDisposalJournal(args: {
        asset: Asset;
        disposalDate: ISODate;
        proceeds: DecimalString;
        nbv: DecimalString;
        gainLoss: DecimalString;
    }): Promise<Ulid | null> {
        const { asset, disposalDate, proceeds, nbv, gainLoss } = args;

        // If proceeds and NBV are 0, nothing to post
        if (Decimal.isZero(proceeds) && Decimal.isZero(nbv)) {
            return null;
        }

        const lines: JournalLineDraft[] = [];

        // 1) Remove asset cost from asset account (credit asset)
        lines.push({
            tempLineId: "ASSET-DISPOSAL-ASSET",
            accountId: asset.assetAccountId,
            debit: Decimal.zero(),
            credit: asset.cost,
            description: `Disposal of asset ${asset.assetNumber} - cost`,
        });

        // 2) Remove accumulated depreciation (debit accumulated depreciation)
        // NBV = cost - accumulated; so accumulated = cost - NBV
        const accumulated = Decimal.subtract(asset.cost, nbv);

        if (!Decimal.isZero(accumulated)) {
            lines.push({
                tempLineId: "ASSET-DISPOSAL-ACCUM-DEPR",
                accountId: asset.accumulatedDepreciationAccountId,
                debit: accumulated,
                credit: Decimal.zero(),
                description: `Disposal of asset ${asset.assetNumber} - accumulated depreciation`,
            });
        }

        // 3) Record proceeds (debit cash/bank) – PRD C.2.x: which account?
        // For now, we assume proceeds received via generic "proceeds" account;
        // in practice, the calling flow should know the actual bank/cash account.
        // You may extend Asset or args to pass that explicitly.
        // >>> TODO: PRD C.2.x – define disposal cash/bank account resolution

        // 4) Record gain/loss (P&L)
        if (!Decimal.isZero(gainLoss)) {
            const isGain = Decimal.isPositive(gainLoss);

            const gainAccount =
                this.deps.config.gainOnDisposalAccountId ??
                asset.depreciationExpenseAccountId; // fallback, you may want a dedicated account

            const lossAccount =
                this.deps.config.lossOnDisposalAccountId ??
                asset.depreciationExpenseAccountId;

            const magnitude = Decimal.from(
                Math.abs(Number(gainLoss))
            );

            if (isGain) {
                // Gain: credit gain account
                lines.push({
                    tempLineId: "ASSET-DISPOSAL-GAIN",
                    accountId: gainAccount,
                    debit: Decimal.zero(),
                    credit: magnitude,
                    description: `Gain on disposal of asset ${asset.assetNumber}`,
                });
            } else {
                // Loss: debit loss account
                lines.push({
                    tempLineId: "ASSET-DISPOSAL-LOSS",
                    accountId: lossAccount,
                    debit: magnitude,
                    credit: Decimal.zero(),
                    description: `Loss on disposal of asset ${asset.assetNumber}`,
                });
            }
        }

        const draft: JournalEntryDraft = {
            tenantId: asset.tenantId,
            entityId: asset.entityId,
            journalDate: disposalDate,
            documentDate: disposalDate,
            currency: asset.currency,
            reference: `ASSET-DISPOSE-${asset.assetNumber}`,
            memo:
                this.deps.config.disposalMemoPrefix ??
                "Asset disposal (IAS 16)",
            origin: {
                cellId: "kernel.assets.lifecycle",
                sourceSystem: "AI-BOS-KERNEL",
                sourceReference: asset.assetNumber,
            },
            lines,
        };

        const result = await this.deps.postingService.postJournal(
            draft
        );

        if (!result.validation.isValid || !result.journal) {
            // TODO: PRD C.2.x - decide behaviour on failed disposal journal
            return null;
        }

        return result.journal.journalId;
    }
}


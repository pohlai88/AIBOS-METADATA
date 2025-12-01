import {
  Asset,
  DepreciationScheduleLine,
} from "./types";
import {
  AssetDepreciationService,
} from "./services";
import {
  AssetDepreciationServiceDeps,
} from "./ports";
import {
  DecimalString,
  EntityId,
  PeriodId,
  ISODate,
  TenantId,
  Ulid,
} from "../../core/types";
import { Decimal } from "../gl/decimal-utils";
import { JournalEntryDraft, JournalLineDraft } from "../gl/types";

/**
 * AssetDepreciationServiceImpl
 * ----------------------------
 * Implements PRD Domain C:
 * - Straight-line depreciation schedule generation
 * - Periodic depreciation posting via GL
 *
 * TODO markers:
 * - PRD C.1.x: exact schedule policy (prorata, mid-month conventions)
 * - PRD C.3.x: rounding & final-period adjustment
 */
export class AssetDepreciationServiceImpl
  implements AssetDepreciationService
{
  private readonly deps: AssetDepreciationServiceDeps;

  constructor(deps: AssetDepreciationServiceDeps) {
    this.deps = deps;
  }

  async generateSchedule(
    assetId: Ulid
  ): Promise<readonly DepreciationScheduleLine[]> {
    const asset = await this.deps.assetRepo.findById(assetId);
    if (!asset) {
      throw new Error(`Asset not found: assetId=${assetId}`);
    }

    // TODO: PRD C.1.x - handle different methods; for now straight-line
    if (asset.depreciationMethod !== "STRAIGHT_LINE") {
      throw new Error(
        `Unsupported depreciation method: ${asset.depreciationMethod}`
      );
    }

    const lines = this.buildStraightLineSchedule(asset);
    await this.deps.scheduleRepo.saveLines(lines);
    return lines;
  }

  async postDepreciation(params: {
    tenantId: string;
    entityId: string;
    periodId: PeriodId;
  }): Promise<{
    postedAssets: readonly {
      assetId: Ulid;
      journalId: Ulid;
    }[];
  }> {
    const { tenantId, entityId, periodId } = params;

    const period =
      await this.deps.periodResolver.getPeriodById(periodId);
    if (!period) {
      throw new Error(`Period not found: periodId=${periodId}`);
    }

    if (period.status !== "OPEN") {
      // PRD C.x.x - policy: cannot post depreciation to closed period
      throw new Error(
        `Cannot post depreciation to non-open period: ${period.name}`
      );
    }

    const assets =
      await this.deps.assetRepo.findDepreciableAssets({
        tenantId: tenantId as TenantId,
        entityId: entityId as EntityId,
        periodId,
      });

    const results: { assetId: Ulid; journalId: Ulid }[] = [];

    for (const asset of assets) {
      const schedule =
        await this.deps.scheduleRepo.getByAssetId(asset.assetId);

      const periodLine = this.findScheduleLineForPeriod(
        schedule,
        period
      );

      if (!periodLine) {
        // No depreciation for this period (maybe fully depreciated)
        continue;
      }

      // If already posted, skip
      if (periodLine.postedJournalId) {
        continue;
      }

      const journalId = await this.postDepreciationJournal({
        asset,
        period,
        depAmount: periodLine.depreciationAmount,
      });

      if (journalId) {
        results.push({
          assetId: asset.assetId,
          journalId,
        });
      }
    }

    // Persist updated schedule lines with postedJournalId
    // NOTE: In a real implementation you might want more granular updates.
    if (results.length) {
      const allScheduleLines = await Promise.all(
        results.map(async (r) => {
          const assetSchedule = await this.deps.scheduleRepo.getByAssetId(r.assetId);
          const periodLine = this.findScheduleLineForPeriod(assetSchedule, period);
          if (periodLine) {
            return {
              ...periodLine,
              postedJournalId: r.journalId as Ulid | undefined,
            } as DepreciationScheduleLine;
          }
          return null;
        })
      );
      
      const updatedLines = allScheduleLines.filter((line): line is DepreciationScheduleLine => line !== null);
      await this.deps.scheduleRepo.updateLines(updatedLines);
    }

    return { postedAssets: results };
  }

  // ---------------------------------------------------------------------------
  // Schedule generation helpers
  // ---------------------------------------------------------------------------

  private buildStraightLineSchedule(
    asset: Asset
  ): DepreciationScheduleLine[] {
    const lines: DepreciationScheduleLine[] = [];

    const totalDepreciable = Decimal.subtract(
      asset.cost,
      asset.salvageValue
    );

    const totalMonths = asset.usefulLifeMonths;

    if (totalMonths <= 0) {
      throw new Error(
        `Invalid useful life for asset ${asset.assetNumber}: ${totalMonths}`
      );
    }

    // Simple straight-line: equal monthly depreciation
    const monthlyRaw = this.safeDiv(
      totalDepreciable,
      String(totalMonths)
    );

    // PRD C.3.x - rounding: last period may need adjustment
    let accumulated = Decimal.zero();
    let nbv = asset.cost;

    for (let i = 1; i <= totalMonths; i++) {
      const depreciationAmount =
        i === totalMonths
          ? Decimal.subtract(
              totalDepreciable,
              accumulated
            ) // final adjustment
          : monthlyRaw;

      accumulated = Decimal.add(
        accumulated,
        depreciationAmount
      );
      nbv = Decimal.subtract(nbv, depreciationAmount);

      const scheduleLineId =
        this.deps.idGenerator.generate();

      // TODO: PRD C.1.x - determine periodStart/End dates correctly
      const periodStart = asset.acquisitionDate;
      const periodEnd = asset.acquisitionDate;

      const line: DepreciationScheduleLine = {
        scheduleLineId,
        assetId: asset.assetId,
        periodNumber: i,
        periodStart,
        periodEnd,
        depreciationAmount,
        accumulatedDepreciation: accumulated,
        netBookValue: nbv,
        postedJournalId: undefined,
      };

      lines.push(line);
    }

    return lines;
  }

  private findScheduleLineForPeriod(
    schedule: readonly DepreciationScheduleLine[],
    period: {
      startDate: ISODate;
      endDate: ISODate;
    }
  ): DepreciationScheduleLine | undefined {
    // PRD C.1.x - mapping rule: periodEnd within accounting period
    return schedule.find((line) => {
      return (
        line.periodEnd >= period.startDate &&
        line.periodEnd <= period.endDate
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Journal posting
  // ---------------------------------------------------------------------------

  private async postDepreciationJournal(args: {
    asset: Asset;
    period: {
      periodId: PeriodId;
      tenantId: string;
      entityId: string;
      name: string;
      startDate: ISODate;
      endDate: ISODate;
    };
    depAmount: DecimalString;
  }): Promise<Ulid | null> {
    const { asset, period, depAmount } = args;

    if (Decimal.isZero(depAmount)) {
      return null;
    }

    const lines: JournalLineDraft[] = [];

    // Debit depreciation expense
    lines.push({
      tempLineId: "ASSET-DEPR-EXP",
      accountId: asset.depreciationExpenseAccountId,
      debit: depAmount,
      credit: Decimal.zero(),
      description: `Depreciation for asset ${asset.assetNumber} - period ${period.name}`,
    });

    // Credit accumulated depreciation
    lines.push({
      tempLineId: "ASSET-DEPR-ACCUM",
      accountId: asset.accumulatedDepreciationAccountId,
      debit: Decimal.zero(),
      credit: depAmount,
      description: `Accumulated depreciation for asset ${asset.assetNumber} - period ${period.name}`,
    });

    const draft: JournalEntryDraft = {
      tenantId: asset.tenantId,
      entityId: asset.entityId,
      journalDate: period.endDate,
      documentDate: period.endDate,
      currency: asset.currency,
      reference: `DEPR-${asset.assetNumber}-${period.name}`,
      memo:
        this.deps.config.depreciationMemoPrefix ??
        "Asset depreciation (IAS 16)",
      origin: {
        cellId: "kernel.assets.depreciation",
        sourceSystem: "AI-BOS-KERNEL",
        sourceReference: `${asset.assetNumber}-${period.name}`,
      },
      lines,
    };

    const result = await this.deps.postingService.postJournal(
      draft
    );

    if (!result.validation.isValid || !result.journal) {
      // TODO: PRD C.3.x - behaviour on failed depreciation journal:
      // - log & alert
      // - block period closing
      return null;
    }

    return result.journal.journalId;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private safeDiv(
    a: DecimalString,
    b: DecimalString
  ): DecimalString {
    if (Decimal.isZero(b)) return Decimal.zero();
    return Decimal.from(Number(a) / Number(b));
  }
}


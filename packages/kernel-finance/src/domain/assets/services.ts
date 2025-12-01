import {
  Asset,
  DepreciationScheduleLine,
} from "./types";
import {
  EntityId,
  ISODate,
  PeriodId,
  TenantId,
  Ulid,
} from "../../core/types";

export interface AssetLifecycleService {
  /**
   * Registers a capitalised asset.
   */
  registerAsset(
    draft: Omit<Asset, "assetId" | "createdAt" | "updatedAt">
  ): Promise<Asset>;

  /**
   * Marks asset as disposed and returns disposal info.
   */
  disposeAsset(params: {
    assetId: Ulid;
    disposalDate: ISODate;
    proceeds: string; // DecimalString
  }): Promise<{
    gainLossAmount: string; // DecimalString
    disposalJournalId?: Ulid;
  }>;
}

/**
 * AssetDepreciationService
 * ------------------------
 * Generates schedules & posts periodic depreciation.
 */
export interface AssetDepreciationService {
  generateSchedule(assetId: Ulid): Promise<readonly DepreciationScheduleLine[]>;

  /**
   * Posts depreciation for a period (via GL PostingService).
   */
  postDepreciation(params: {
    tenantId: TenantId;
    entityId: EntityId;
    periodId: PeriodId;
  }): Promise<{
    postedAssets: readonly {
      assetId: Ulid;
      journalId: Ulid;
    }[];
  }>;
}


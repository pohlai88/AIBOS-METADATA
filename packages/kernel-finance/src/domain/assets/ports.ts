import {
    Asset,
    DepreciationScheduleLine,
} from "./types";
import {
    DecimalString,
    EntityId,
    ISODate,
    ISODateTime,
    PeriodId,
    TenantId,
    Ulid,
} from "../../core/types";
import { PostingService } from "../gl/services";
import { FinanceEventPublisher } from "../gl/ports";

/**
 * Repository for Asset master data.
 */
export interface AssetRepository {
    create(
        draft: Omit<Asset, "assetId" | "createdAt" | "updatedAt">
    ): Promise<Asset>;

    findById(
        assetId: Ulid
    ): Promise<Asset | null>;

    update(asset: Asset): Promise<Asset>;

    /**
     * Returns all depreciable assets for a given period,
     * filtered by tenant/entity.
     */
    findDepreciableAssets(params: {
        tenantId: TenantId;
        entityId: EntityId;
        periodId: PeriodId;
    }): Promise<readonly Asset[]>;
}

/**
 * Repository for Depreciation Schedules.
 */
export interface DepreciationScheduleRepository {
    getByAssetId(
        assetId: Ulid
    ): Promise<readonly DepreciationScheduleLine[]>;

    saveLines(
        lines: readonly DepreciationScheduleLine[]
    ): Promise<void>;

    updateLines(
        lines: readonly DepreciationScheduleLine[]
    ): Promise<void>;
}

/**
 * Service / port to resolve period boundaries.
 * (We re-use PeriodRepository, but this port is asset-focused.)
 */
export interface PeriodResolver {
    getPeriodById(
        periodId: PeriodId
    ): Promise<{
        periodId: PeriodId;
        tenantId: TenantId;
        entityId: EntityId;
        name: string;
        startDate: ISODate;
        endDate: ISODate;
        status: "OPEN" | "CLOSED" | "LOCKED";
    } | null>;
}

/**
 * Config for journal patterns used by depreciation & disposal.
 * NOTE: each Asset already carries its own accounts, but config
 * can hold global flags (e.g. separate gain/loss accounts).
 */
export interface AssetJournalConfig {
    /**
     * Optional: global gain/loss on disposal accounts.
     * If not provided, kernel may derive from Asset accounts
     * + generic P&L accounts.
     */
    gainOnDisposalAccountId?: Ulid;
    lossOnDisposalAccountId?: Ulid;

    /**
     * Memo prefix for depreciation journals.
     */
    depreciationMemoPrefix?: string;

    /**
     * Memo prefix for disposal journals.
     */
    disposalMemoPrefix?: string;
}

/**
 * Dependencies for AssetLifecycleServiceImpl.
 */
export interface AssetLifecycleServiceDeps {
    assetRepo: AssetRepository;
    scheduleRepo: DepreciationScheduleRepository;
    postingService: PostingService;
    periodResolver: PeriodResolver;
    eventPublisher: FinanceEventPublisher;
    config: AssetJournalConfig;

    idGenerator: { generate: () => Ulid };
    clock: { now: () => ISODateTime };
}

/**
 * Dependencies for AssetDepreciationServiceImpl.
 */
export interface AssetDepreciationServiceDeps {
    assetRepo: AssetRepository;
    scheduleRepo: DepreciationScheduleRepository;
    postingService: PostingService;
    periodResolver: PeriodResolver;
    eventPublisher: FinanceEventPublisher;
    config: AssetJournalConfig;

    idGenerator: { generate: () => Ulid };
    clock: { now: () => ISODateTime };
}


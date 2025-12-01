import {
    Account,
    JournalEntry,
} from "./types";
import {
    AccountId,
    EntityId,
    ISODate,
    ISODateTime,
    PeriodId,
    TenantId,
    Ulid,
    UserId,
} from "../../core/types";
import { FinanceEvent } from "../../events/finance-events";
import { Period } from "./types";

/**
 * Abstraction over persistence for journals.
 */
export interface JournalRepository {
    /**
     * Persists a fully built JournalEntry as POSTED.
     * Implementation must treat this as immutable (no updates).
     */
    savePosted(journal: Omit<JournalEntry, "journalId" | "createdAt" | "createdBy"> & {
        journalId?: Ulid;
        createdAt?: ISODateTime;
        createdBy?: UserId;
    }): Promise<JournalEntry>;
}

/**
 * Read-only access to COA.
 */
export interface AccountRepository {
    findById(accountId: AccountId): Promise<Account | null>;
}

/**
 * Access to accounting periods.
 */
export interface PeriodRepository {
    /**
     * Finds the period that contains the given date.
     */
    findByDate(params: {
        tenantId: TenantId;
        entityId: EntityId;
        date: ISODate;
    }): Promise<Period | null>;

    findById(periodId: PeriodId): Promise<Period | null>;
}

/**
 * Simple time abstraction.
 */
export interface Clock {
    now(): ISODateTime;
}

/**
 * ULID/UUID generator abstraction.
 */
export interface IdGenerator {
    generate(): Ulid;
}

/**
 * Finance event publisher (to your orchestras / telemetry).
 */
export interface FinanceEventPublisher {
    publish(event: FinanceEvent): Promise<void>;
}

/**
 * All dependencies required to construct a PostingServiceImpl.
 */
export interface PostingServiceDeps {
    journalRepository: JournalRepository;
    accountRepository: AccountRepository;
    periodRepository: PeriodRepository;
    clock: Clock;
    idGenerator: IdGenerator;
    eventPublisher: FinanceEventPublisher;
    currentUserProvider: () => UserId;
}


import {
  CurrencyCode,
  EntityId,
  ISODate,
  ISODateTime,
  TenantId,
  Ulid,
} from "../core/types";

export type FinanceEventType =
  | "GL.JOURNAL_POSTED"
  | "GL.PERIOD_CLOSED"
  | "FX.REVALUATION_RUN";

export interface BaseFinanceEvent {
  readonly eventId: Ulid;
  readonly eventType: FinanceEventType;

  readonly tenantId: TenantId;
  readonly entityId: EntityId;

  readonly occurredAt: ISODateTime;
  readonly payloadVersion: string; // "1.0.0"
}

export interface JournalPostedEvent extends BaseFinanceEvent {
  readonly eventType: "GL.JOURNAL_POSTED";
  readonly payload: {
    readonly journalId: Ulid;
    readonly journalDate: ISODate;
    readonly currency: CurrencyCode;
    readonly originCellId: string;
  };
}

export interface PeriodClosedEvent extends BaseFinanceEvent {
  readonly eventType: "GL.PERIOD_CLOSED";
  readonly payload: {
    readonly periodId: Ulid;
    readonly periodName: string;
    readonly startDate: ISODate;
    readonly endDate: ISODate;
  };
}

export interface FxRevaluationRunEvent extends BaseFinanceEvent {
  readonly eventType: "FX.REVALUATION_RUN";
  readonly payload: {
    readonly cutoffDate: ISODate;
    readonly baseCurrency: CurrencyCode;
    readonly revaluationJournalId: Ulid | null;
  };
}

export type FinanceEvent =
  | JournalPostedEvent
  | PeriodClosedEvent
  | FxRevaluationRunEvent;


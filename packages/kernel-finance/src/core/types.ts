/**
 * Core type aliases shared across finance domains.
 * Pure domain layer (no framework / DB details).
 */

export type Uuid = string & { readonly __brand: "Uuid" };
export type Ulid = string & { readonly __brand: "Ulid" };

export type TenantId = Ulid;
export type EntityId = Ulid;
export type UserId = Ulid;
export type SegmentId = Ulid;
export type CostCenterId = Ulid;
export type ProjectId = Ulid;
export type PeriodId = Ulid;
export type AccountId = Ulid;
export type FxRateId = Ulid;

export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // ISO 8601
export type CurrencyCode = string; // ISO 4217, e.g. "MYR", "SGD", "USD"

export type DecimalString = string; // Use string to avoid float issues

/**
 * IFRS-inspired account types. Core breakdown only.
 */
export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "INCOME"
  | "EXPENSE";

/**
 * Used for status of journals and periods.
 */
export type JournalStatus = "DRAFT" | "POSTED" | "LOCKED";

export type PeriodStatus = "OPEN" | "CLOSED" | "LOCKED";

/**
 * Origin cell = which engine/module initiated the posting
 * (revenue engine, lease engine, inventory, etc.).
 */
export interface OriginCellMeta {
  readonly cellId: string; // e.g. "kernel.inventory", "engine.revenue.ifrs15"
  readonly sourceSystem?: string; // external system name (POS, ERP, etc.)
  readonly sourceReference?: string; // invoice number, DO number, etc.
}

/**
 * Metadata bag for extra dimensions (safe for evolution).
 * Everything here should be governed by Metadata Studio,
 * but the kernel remains flexible.
 */
export type MetadataBag = Record<string, unknown>;


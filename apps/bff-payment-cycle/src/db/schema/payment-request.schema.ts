/**
 * Payment Request Schema
 *
 * Core payment case table - tracks the full lifecycle from request to disbursement.
 * Every payment has a stable trace_id for full auditability.
 */

import {
  pgTable,
  uuid,
  text,
  varchar,
  decimal,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export const paymentStatusEnum = pgEnum("payment_status", [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "DISBURSED",
  "DISBURSED_AWAITING_SLIP",
  "COMPLETED",
  "CANCELLED",
]);

export const payeeTypeEnum = pgEnum("payee_type", [
  "VENDOR",
  "EMPLOYEE",
  "CONTRACTOR",
  "OTHER",
]);

// ─────────────────────────────────────────
// PAYMENT REQUESTS TABLE
// ─────────────────────────────────────────

export const paymentRequests = pgTable("payment_requests", {
  // Primary Key
  id: uuid("id").primaryKey().defaultRandom(),

  // Traceability - stable trace_id for the full case lifecycle
  traceId: uuid("trace_id").notNull().defaultRandom(),

  // Multi-tenancy
  tenantId: uuid("tenant_id").notNull(),

  // Requestor
  requestorUserId: uuid("requestor_user_id").notNull(),

  // Core fields
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("MYR"),

  // Status & State Machine
  status: paymentStatusEnum("status").notNull().default("DRAFT"),

  // Category & Classification
  categoryCode: varchar("category_code", { length: 50 }),

  // Payee Information
  payeeType: payeeTypeEnum("payee_type"),
  payeeName: varchar("payee_name", { length: 255 }),
  payeeAccountRef: varchar("payee_account_ref", { length: 255 }),

  // Treasury & Cashflow Hooks (references for future integration)
  treasuryAccountRef: varchar("treasury_account_ref", { length: 100 }),
  cashflowProfileRef: varchar("cashflow_profile_ref", { length: 100 }),

  // Dates
  dueDate: timestamp("due_date", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

  // Optimistic Locking
  version: integer("version").notNull().default(1),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
});

// Type exports
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type NewPaymentRequest = typeof paymentRequests.$inferInsert;


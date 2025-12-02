/**
 * Payment Approval Schema
 *
 * Tracks approval/rejection decisions for payment requests.
 * Supports multi-step approval chains via sequence_order.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { paymentRequests } from "./payment-request.schema";

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export const approvalDecisionEnum = pgEnum("approval_decision", [
  "APPROVED",
  "REJECTED",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "PENDING",
  "COMPLETED",
  "SKIPPED",
]);

// ─────────────────────────────────────────
// PAYMENT APPROVALS TABLE
// ─────────────────────────────────────────

export const paymentApprovals = pgTable("payment_approvals", {
  // Primary Key
  id: uuid("id").primaryKey().defaultRandom(),

  // Traceability - matches parent payment request
  traceId: uuid("trace_id").notNull(),

  // Foreign Key
  paymentRequestId: uuid("payment_request_id")
    .notNull()
    .references(() => paymentRequests.id, { onDelete: "cascade" }),

  // Multi-tenancy
  tenantId: uuid("tenant_id").notNull(),

  // Approver
  approverUserId: uuid("approver_user_id").notNull(),

  // Decision
  decision: approvalDecisionEnum("decision"),
  decisionReason: text("decision_reason"), // Required when REJECTED
  decidedAt: timestamp("decided_at", { withTimezone: true }),

  // Multi-step approval support
  sequenceOrder: integer("sequence_order").notNull().default(1),
  status: approvalStatusEnum("status").notNull().default("PENDING"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Type exports
export type PaymentApproval = typeof paymentApprovals.$inferSelect;
export type NewPaymentApproval = typeof paymentApprovals.$inferInsert;


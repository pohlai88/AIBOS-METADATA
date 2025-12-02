/**
 * Payment Audit Event Schema
 *
 * Audit trail for payment cycle events.
 * Follows the same hash-chain model as MVP1 (admin-config).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────
// PAYMENT AUDIT EVENTS TABLE
// ─────────────────────────────────────────

export const paymentAuditEvents = pgTable("payment_audit_events", {
  // Primary Key
  id: uuid("id").primaryKey().defaultRandom(),

  // Traceability
  traceId: uuid("trace_id").notNull(),

  // Multi-tenancy
  tenantId: uuid("tenant_id").notNull(),

  // Resource being audited
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  // e.g., "PAYMENT_REQUEST", "PAYMENT_APPROVAL", "PAYMENT_DISBURSEMENT", "PAYMENT_SLIP"
  resourceId: uuid("resource_id").notNull(),

  // Action
  action: varchar("action", { length: 50 }).notNull(),
  // e.g., "CREATE", "SUBMIT", "APPROVE", "REJECT", "DISBURSE", "UPLOAD_SLIP", "CANCEL"

  // Actor
  actorUserId: uuid("actor_user_id"),

  // Change Details
  metadataDiff: jsonb("metadata_diff"),
  // Before/after snapshot for updates

  // Location Reference (for slip uploads)
  locationRef: varchar("location_ref", { length: 255 }),

  // Context
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),

  // Hash Chain (for immutability verification)
  prevHash: varchar("prev_hash", { length: 64 }),
  hash: varchar("hash", { length: 64 }).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Type exports
export type PaymentAuditEvent = typeof paymentAuditEvents.$inferSelect;
export type NewPaymentAuditEvent = typeof paymentAuditEvents.$inferInsert;


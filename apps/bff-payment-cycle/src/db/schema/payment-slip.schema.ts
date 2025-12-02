/**
 * Payment Slip Schema
 *
 * Stores uploaded bank slips, receipts, and payment evidence.
 * Includes location_ref for Oracle/SAP-style "who picked what from where" tracking.
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { paymentRequests } from "./payment-request.schema";

// ─────────────────────────────────────────
// PAYMENT SLIPS TABLE
// ─────────────────────────────────────────

export const paymentSlips = pgTable("payment_slips", {
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

  // Uploader
  uploadedByUserId: uuid("uploaded_by_user_id").notNull(),

  // File Storage
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: varchar("file_size", { length: 50 }),

  // Location Reference (Oracle/SAP-style tracking)
  // e.g., "C12", "PAYMENT_BOARD:row3/col4", "IMPORT_BATCH:2025-01"
  locationRef: varchar("location_ref", { length: 255 }),

  // Timestamps
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});

// Type exports
export type PaymentSlip = typeof paymentSlips.$inferSelect;
export type NewPaymentSlip = typeof paymentSlips.$inferInsert;


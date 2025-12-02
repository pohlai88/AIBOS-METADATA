/**
 * Payment Tag Schema
 *
 * Many-to-many relationship for payment tags.
 * Supports free-form tags (can be constrained to metadata aliases later).
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { paymentRequests } from "./payment-request.schema";

// ─────────────────────────────────────────
// PAYMENT TAGS TABLE
// ─────────────────────────────────────────

export const paymentTags = pgTable("payment_tags", {
  // Primary Key
  id: uuid("id").primaryKey().defaultRandom(),

  // Foreign Key
  paymentRequestId: uuid("payment_request_id")
    .notNull()
    .references(() => paymentRequests.id, { onDelete: "cascade" }),

  // Multi-tenancy
  tenantId: uuid("tenant_id").notNull(),

  // Tag Value
  tagValue: varchar("tag_value", { length: 100 }).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Type exports
export type PaymentTag = typeof paymentTags.$inferSelect;
export type NewPaymentTag = typeof paymentTags.$inferInsert;


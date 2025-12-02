/**
 * Payment Disbursement Schema
 *
 * Records when payments are actually paid out.
 * Links treasury/finance actions to the payment case.
 */

import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { paymentRequests } from "./payment-request.schema";

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export const disbursementMethodEnum = pgEnum("disbursement_method", [
  "BANK_TRANSFER",
  "CASH",
  "CHEQUE",
  "EWALLET",
  "OTHER",
]);

// ─────────────────────────────────────────
// PAYMENT DISBURSEMENTS TABLE
// ─────────────────────────────────────────

export const paymentDisbursements = pgTable("payment_disbursements", {
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

  // Disburser (Treasury/Finance user)
  disburserUserId: uuid("disburser_user_id").notNull(),

  // Disbursement Details
  disbursedAmount: decimal("disbursed_amount", { precision: 18, scale: 2 }).notNull(),
  disbursedCurrency: varchar("disbursed_currency", { length: 3 }).notNull(),
  disbursementDate: date("disbursement_date").notNull(),

  // Payment Method
  method: disbursementMethodEnum("method").notNull(),
  bankReference: varchar("bank_reference", { length: 255 }),

  // Treasury Hooks
  treasuryAccountRef: varchar("treasury_account_ref", { length: 100 }),
  cashflowProfileRef: varchar("cashflow_profile_ref", { length: 100 }),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Type exports
export type PaymentDisbursement = typeof paymentDisbursements.$inferSelect;
export type NewPaymentDisbursement = typeof paymentDisbursements.$inferInsert;


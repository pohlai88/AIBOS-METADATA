/**
 * Payment Slip Repository
 *
 * Data access layer for payment slips/receipts.
 */

import { eq, desc } from "drizzle-orm";
import { paymentSlips, type PaymentSlip, type NewPaymentSlip } from "../db/schema";

type Database = ReturnType<typeof import("../config/database").getDatabase>;

export class PaymentSlipRepository {
  constructor(private readonly db: Database) {}

  /**
   * Create a new slip record
   */
  async create(data: NewPaymentSlip): Promise<PaymentSlip> {
    const [result] = await this.db.insert(paymentSlips).values(data).returning();
    return result;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<PaymentSlip | null> {
    const [result] = await this.db
      .select()
      .from(paymentSlips)
      .where(eq(paymentSlips.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Find all slips for a payment request
   */
  async findByPaymentRequest(paymentRequestId: string): Promise<PaymentSlip[]> {
    return this.db
      .select()
      .from(paymentSlips)
      .where(eq(paymentSlips.paymentRequestId, paymentRequestId))
      .orderBy(desc(paymentSlips.uploadedAt));
  }

  /**
   * Find by trace ID
   */
  async findByTraceId(traceId: string): Promise<PaymentSlip[]> {
    return this.db
      .select()
      .from(paymentSlips)
      .where(eq(paymentSlips.traceId, traceId))
      .orderBy(desc(paymentSlips.uploadedAt));
  }

  /**
   * Delete slip
   */
  async delete(id: string): Promise<void> {
    await this.db.delete(paymentSlips).where(eq(paymentSlips.id, id));
  }

  /**
   * Delete all slips for a payment
   */
  async deleteByPaymentRequest(paymentRequestId: string): Promise<void> {
    await this.db
      .delete(paymentSlips)
      .where(eq(paymentSlips.paymentRequestId, paymentRequestId));
  }
}


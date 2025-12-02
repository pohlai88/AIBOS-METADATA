/**
 * Payment Disbursement Repository
 *
 * Data access layer for payment disbursements.
 */

import { eq } from "drizzle-orm";
import { paymentDisbursements, type PaymentDisbursement, type NewPaymentDisbursement } from "../db/schema";

type Database = ReturnType<typeof import("../config/database").getDatabase>;

export class PaymentDisbursementRepository {
  constructor(private readonly db: Database) {}

  /**
   * Create a new disbursement record
   */
  async create(data: NewPaymentDisbursement): Promise<PaymentDisbursement> {
    const [result] = await this.db.insert(paymentDisbursements).values(data).returning();
    return result;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<PaymentDisbursement | null> {
    const [result] = await this.db
      .select()
      .from(paymentDisbursements)
      .where(eq(paymentDisbursements.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Find disbursement for a payment request
   */
  async findByPaymentRequest(paymentRequestId: string): Promise<PaymentDisbursement | null> {
    const [result] = await this.db
      .select()
      .from(paymentDisbursements)
      .where(eq(paymentDisbursements.paymentRequestId, paymentRequestId))
      .limit(1);
    return result || null;
  }

  /**
   * Find by trace ID
   */
  async findByTraceId(traceId: string): Promise<PaymentDisbursement | null> {
    const [result] = await this.db
      .select()
      .from(paymentDisbursements)
      .where(eq(paymentDisbursements.traceId, traceId))
      .limit(1);
    return result || null;
  }

  /**
   * Update disbursement
   */
  async update(
    id: string,
    data: Partial<NewPaymentDisbursement>
  ): Promise<PaymentDisbursement | null> {
    const [result] = await this.db
      .update(paymentDisbursements)
      .set(data)
      .where(eq(paymentDisbursements.id, id))
      .returning();
    return result || null;
  }
}


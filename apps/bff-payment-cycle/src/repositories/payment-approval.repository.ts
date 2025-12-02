/**
 * Payment Approval Repository
 *
 * Data access layer for payment approvals.
 */

import { eq, and, desc } from "drizzle-orm";
import { paymentApprovals, type PaymentApproval, type NewPaymentApproval } from "../db/schema";

type Database = ReturnType<typeof import("../config/database").getDatabase>;

export class PaymentApprovalRepository {
  constructor(private readonly db: Database) {}

  /**
   * Create a new approval record
   */
  async create(data: NewPaymentApproval): Promise<PaymentApproval> {
    const [result] = await this.db.insert(paymentApprovals).values(data).returning();
    return result;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<PaymentApproval | null> {
    const [result] = await this.db
      .select()
      .from(paymentApprovals)
      .where(eq(paymentApprovals.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Find all approvals for a payment request
   */
  async findByPaymentRequest(paymentRequestId: string): Promise<PaymentApproval[]> {
    return this.db
      .select()
      .from(paymentApprovals)
      .where(eq(paymentApprovals.paymentRequestId, paymentRequestId))
      .orderBy(paymentApprovals.sequenceOrder);
  }

  /**
   * Find pending approvals for a payment
   */
  async findPendingForPayment(paymentRequestId: string): Promise<PaymentApproval[]> {
    return this.db
      .select()
      .from(paymentApprovals)
      .where(
        and(
          eq(paymentApprovals.paymentRequestId, paymentRequestId),
          eq(paymentApprovals.status, "PENDING")
        )
      )
      .orderBy(paymentApprovals.sequenceOrder);
  }

  /**
   * Find next pending approver for a payment
   */
  async findNextPendingApprover(paymentRequestId: string): Promise<PaymentApproval | null> {
    const [result] = await this.db
      .select()
      .from(paymentApprovals)
      .where(
        and(
          eq(paymentApprovals.paymentRequestId, paymentRequestId),
          eq(paymentApprovals.status, "PENDING")
        )
      )
      .orderBy(paymentApprovals.sequenceOrder)
      .limit(1);
    return result || null;
  }

  /**
   * Update approval decision
   */
  async recordDecision(
    id: string,
    decision: "APPROVED" | "REJECTED",
    decisionReason?: string
  ): Promise<PaymentApproval | null> {
    const [result] = await this.db
      .update(paymentApprovals)
      .set({
        decision,
        decisionReason,
        decidedAt: new Date(),
        status: "COMPLETED",
        updatedAt: new Date(),
      })
      .where(eq(paymentApprovals.id, id))
      .returning();
    return result || null;
  }

  /**
   * Skip remaining approvals (when rejected)
   */
  async skipRemainingApprovals(
    paymentRequestId: string,
    afterSequence: number
  ): Promise<void> {
    await this.db
      .update(paymentApprovals)
      .set({
        status: "SKIPPED",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(paymentApprovals.paymentRequestId, paymentRequestId),
          eq(paymentApprovals.status, "PENDING")
        )
      );
  }

  /**
   * Reset all approvals for a payment (when re-submitted)
   */
  async resetApprovals(paymentRequestId: string): Promise<void> {
    await this.db
      .update(paymentApprovals)
      .set({
        decision: null,
        decisionReason: null,
        decidedAt: null,
        status: "PENDING",
        updatedAt: new Date(),
      })
      .where(eq(paymentApprovals.paymentRequestId, paymentRequestId));
  }

  /**
   * Delete approvals for a payment
   */
  async deleteByPaymentRequest(paymentRequestId: string): Promise<void> {
    await this.db
      .delete(paymentApprovals)
      .where(eq(paymentApprovals.paymentRequestId, paymentRequestId));
  }
}


/**
 * Payment Request Repository
 *
 * Data access layer for payment requests.
 */

import { eq, and, desc, sql, ilike, or, inArray } from "drizzle-orm";
import { paymentRequests, type PaymentRequest, type NewPaymentRequest } from "../db/schema";

type Database = ReturnType<typeof import("../config/database").getDatabase>;

export class PaymentRequestRepository {
  constructor(private readonly db: Database) {}

  /**
   * Create a new payment request
   */
  async create(data: NewPaymentRequest): Promise<PaymentRequest> {
    const [result] = await this.db.insert(paymentRequests).values(data).returning();
    return result;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<PaymentRequest | null> {
    const [result] = await this.db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Find by trace ID
   */
  async findByTraceId(traceId: string): Promise<PaymentRequest | null> {
    const [result] = await this.db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.traceId, traceId))
      .limit(1);
    return result || null;
  }

  /**
   * Find all payments for a tenant with filters
   */
  async findByTenant(
    tenantId: string,
    filters?: {
      status?: string | string[];
      requestorUserId?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ payments: PaymentRequest[]; total: number }> {
    const conditions = [eq(paymentRequests.tenantId, tenantId)];

    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      conditions.push(inArray(paymentRequests.status, statuses as any));
    }

    if (filters?.requestorUserId) {
      conditions.push(eq(paymentRequests.requestorUserId, filters.requestorUserId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(paymentRequests.title, `%${filters.search}%`),
          ilike(paymentRequests.payeeName, `%${filters.search}%`)
        )!
      );
    }

    const payments = await this.db
      .select()
      .from(paymentRequests)
      .where(and(...conditions))
      .orderBy(desc(paymentRequests.createdAt))
      .limit(filters?.limit || 100)
      .offset(filters?.offset || 0);

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(paymentRequests)
      .where(and(...conditions));

    return { payments, total: Number(count) };
  }

  /**
   * Find payments needing approval by a specific user
   */
  async findNeedingApproval(
    tenantId: string,
    approverUserId: string
  ): Promise<PaymentRequest[]> {
    // For MVP, return all UNDER_REVIEW payments
    // TODO: Filter by actual approver assignment in payment_approvals
    const payments = await this.db
      .select()
      .from(paymentRequests)
      .where(
        and(
          eq(paymentRequests.tenantId, tenantId),
          eq(paymentRequests.status, "UNDER_REVIEW")
        )
      )
      .orderBy(paymentRequests.submittedAt);

    return payments;
  }

  /**
   * Find payments ready to disburse
   */
  async findReadyToDisburse(tenantId: string): Promise<PaymentRequest[]> {
    const payments = await this.db
      .select()
      .from(paymentRequests)
      .where(
        and(
          eq(paymentRequests.tenantId, tenantId),
          eq(paymentRequests.status, "APPROVED")
        )
      )
      .orderBy(paymentRequests.approvedAt);

    return payments;
  }

  /**
   * Update payment request
   */
  async update(
    id: string,
    data: Partial<NewPaymentRequest>
  ): Promise<PaymentRequest | null> {
    const [result] = await this.db
      .update(paymentRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentRequests.id, id))
      .returning();
    return result || null;
  }

  /**
   * Update status with optimistic locking
   */
  async updateStatus(
    id: string,
    newStatus: PaymentRequest["status"],
    expectedVersion: number,
    additionalFields?: Partial<NewPaymentRequest>
  ): Promise<PaymentRequest | null> {
    const [result] = await this.db
      .update(paymentRequests)
      .set({
        status: newStatus,
        version: expectedVersion + 1,
        updatedAt: new Date(),
        ...additionalFields,
      })
      .where(
        and(
          eq(paymentRequests.id, id),
          eq(paymentRequests.version, expectedVersion)
        )
      )
      .returning();
    return result || null;
  }

  /**
   * Delete payment request (soft delete via CANCELLED status)
   */
  async cancel(id: string, userId: string): Promise<PaymentRequest | null> {
    const [result] = await this.db
      .update(paymentRequests)
      .set({
        status: "CANCELLED",
        cancelledAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(paymentRequests.id, id))
      .returning();
    return result || null;
  }
}


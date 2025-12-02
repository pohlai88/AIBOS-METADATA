/**
 * Payment Audit Repository
 *
 * Data access layer for payment audit events.
 * Follows hash-chain pattern for immutability verification.
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { paymentAuditEvents, type PaymentAuditEvent, type NewPaymentAuditEvent } from "../db/schema";

type Database = ReturnType<typeof import("../config/database").getDatabase>;

export class PaymentAuditRepository {
  constructor(private readonly db: Database) {}

  /**
   * Create a new audit event
   */
  async create(data: Omit<NewPaymentAuditEvent, "hash">): Promise<PaymentAuditEvent> {
    const hash = this.computeHash(data);
    const [result] = await this.db
      .insert(paymentAuditEvents)
      .values({ ...data, hash })
      .returning();
    return result;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<PaymentAuditEvent | null> {
    const [result] = await this.db
      .select()
      .from(paymentAuditEvents)
      .where(eq(paymentAuditEvents.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Find all events for a trace ID (payment timeline)
   */
  async findByTraceId(traceId: string): Promise<PaymentAuditEvent[]> {
    return this.db
      .select()
      .from(paymentAuditEvents)
      .where(eq(paymentAuditEvents.traceId, traceId))
      .orderBy(paymentAuditEvents.createdAt);
  }

  /**
   * Get latest event for a trace (for hash chain)
   */
  async getLatestByTraceId(traceId: string): Promise<PaymentAuditEvent | null> {
    const [result] = await this.db
      .select()
      .from(paymentAuditEvents)
      .where(eq(paymentAuditEvents.traceId, traceId))
      .orderBy(desc(paymentAuditEvents.createdAt))
      .limit(1);
    return result || null;
  }

  /**
   * Find events by resource
   */
  async findByResource(
    resourceType: string,
    resourceId: string
  ): Promise<PaymentAuditEvent[]> {
    return this.db
      .select()
      .from(paymentAuditEvents)
      .where(
        and(
          eq(paymentAuditEvents.resourceType, resourceType),
          eq(paymentAuditEvents.resourceId, resourceId)
        )
      )
      .orderBy(paymentAuditEvents.createdAt);
  }

  /**
   * Find events by tenant with filters
   */
  async findByTenant(
    tenantId: string,
    filters?: {
      resourceType?: string;
      action?: string;
      actorUserId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<PaymentAuditEvent[]> {
    const conditions = [eq(paymentAuditEvents.tenantId, tenantId)];

    if (filters?.resourceType) {
      conditions.push(eq(paymentAuditEvents.resourceType, filters.resourceType));
    }
    if (filters?.action) {
      conditions.push(eq(paymentAuditEvents.action, filters.action));
    }
    if (filters?.actorUserId) {
      conditions.push(eq(paymentAuditEvents.actorUserId, filters.actorUserId));
    }

    return this.db
      .select()
      .from(paymentAuditEvents)
      .where(and(...conditions))
      .orderBy(desc(paymentAuditEvents.createdAt))
      .limit(filters?.limit || 100)
      .offset(filters?.offset || 0);
  }

  /**
   * Compute hash for audit event (SHA-256)
   */
  computeHash(data: Record<string, unknown>): string {
    const content = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    });
    return createHash("sha256").update(content).digest("hex");
  }

  /**
   * Verify hash chain integrity for a trace
   */
  async verifyChainIntegrity(traceId: string): Promise<{
    valid: boolean;
    brokenAt?: number;
  }> {
    const events = await this.findByTraceId(traceId);

    for (let i = 1; i < events.length; i++) {
      if (events[i].prevHash !== events[i - 1].hash) {
        return { valid: false, brokenAt: i };
      }
    }

    return { valid: true };
  }
}


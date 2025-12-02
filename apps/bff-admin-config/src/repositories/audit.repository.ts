import { eq, and, desc, gte, lte } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { iamAuditEvent } from "../db/schema/audit-event.schema";
import * as schema from "../db/schema";

/**
 * Audit Event Data (Plain object)
 */
export interface AuditEventData {
  id: string;
  traceId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  actorUserId?: string;
  metadataDiff?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  prevHash?: string | null;
  hash: string;
  createdAt: Date;
}

/**
 * Audit Repository - Drizzle Implementation
 *
 * Immutable audit log for compliance and traceability
 */
export class AuditRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(event: {
    traceId: string;
    resourceType: string;
    resourceId: string;
    action: string;
    actorUserId?: string;
    metadataDiff?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    prevHash?: string | null;
    hash: string;
  }): Promise<AuditEventData> {
    const [created] = await this.db
      .insert(iamAuditEvent)
      .values({
        traceId: event.traceId,
        resourceType: event.resourceType as any,
        resourceId: event.resourceId,
        action: event.action as any,
        actorUserId: event.actorUserId,
        metadataDiff: event.metadataDiff || {},
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        prevHash: event.prevHash,
        hash: event.hash,
      })
      .returning();

    return this.mapToData(created);
  }

  async getLatestByTraceId(traceId: string): Promise<AuditEventData | null> {
    const [event] = await this.db
      .select()
      .from(iamAuditEvent)
      .where(eq(iamAuditEvent.traceId, traceId))
      .orderBy(desc(iamAuditEvent.createdAt))
      .limit(1);

    return event ? this.mapToData(event) : null;
  }

  async findByResource(
    resourceType: string,
    resourceId: string,
    options?: { limit?: number }
  ): Promise<AuditEventData[]> {
    const events = await this.db
      .select()
      .from(iamAuditEvent)
      .where(
        and(
          eq(iamAuditEvent.resourceType, resourceType as any),
          eq(iamAuditEvent.resourceId, resourceId)
        )
      )
      .orderBy(desc(iamAuditEvent.createdAt))
      .limit(options?.limit || 100);

    return events.map((e) => this.mapToData(e));
  }

  async findByTenant(
    _tenantId: string,
    options?: {
      resourceType?: string;
      action?: string;
      userId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<AuditEventData[]> {
    const events = await this.db
      .select()
      .from(iamAuditEvent)
      .orderBy(desc(iamAuditEvent.createdAt))
      .limit(options?.limit || 100)
      .offset(options?.offset || 0);

    return events.map((e) => this.mapToData(e));
  }

  async findByTraceId(traceId: string): Promise<AuditEventData[]> {
    const events = await this.db
      .select()
      .from(iamAuditEvent)
      .where(eq(iamAuditEvent.traceId, traceId))
      .orderBy(iamAuditEvent.createdAt);

    return events.map((e) => this.mapToData(e));
  }

  async findByActor(
    actorUserId: string,
    limit: number = 100
  ): Promise<AuditEventData[]> {
    const events = await this.db
      .select()
      .from(iamAuditEvent)
      .where(eq(iamAuditEvent.actorUserId, actorUserId))
      .orderBy(desc(iamAuditEvent.createdAt))
      .limit(limit);

    return events.map((e) => this.mapToData(e));
  }

  async findByAction(
    action: string,
    limit: number = 100
  ): Promise<AuditEventData[]> {
    const events = await this.db
      .select()
      .from(iamAuditEvent)
      .where(eq(iamAuditEvent.action, action as any))
      .orderBy(desc(iamAuditEvent.createdAt))
      .limit(limit);

    return events.map((e) => this.mapToData(e));
  }

  private mapToData(row: typeof iamAuditEvent.$inferSelect): AuditEventData {
    return {
      id: row.auditId,
      traceId: row.traceId,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      action: row.action,
      actorUserId: row.actorUserId || undefined,
      metadataDiff: (row.metadataDiff as Record<string, unknown>) || {},
      ipAddress: row.ipAddress || undefined,
      userAgent: row.userAgent || undefined,
      prevHash: row.prevHash,
      hash: row.hash,
      createdAt: row.createdAt,
    };
  }
}

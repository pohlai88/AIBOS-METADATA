import { eq, and, desc, gte, lte } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { IAuditRepository } from "../../../../application/ports/outbound/audit.repository.port";
import type { AuditEvent } from "../../../../domain/entities/audit-event.entity";
import { auditEventSchema } from "../schema/audit-event.schema";
import * as schema from "../schema";

/**
 * Audit Repository - Drizzle Implementation
 * 
 * Immutable audit log for compliance and traceability
 */
export class AuditRepository implements IAuditRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async create(
    event: Omit<AuditEvent, "id" | "createdAt">
  ): Promise<AuditEvent> {
    const [created] = await this.db
      .insert(auditEventSchema)
      .values({
        traceId: event.traceId,
        tenantId: event.tenantId,
        userId: event.userId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        changes: event.changes || {},
        metadata: event.metadata || {},
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      })
      .returning();

    return this.mapToEntity(created);
  }

  async findByTenant(
    tenantId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditEvent[]> {
    const events = await this.db
      .select()
      .from(auditEventSchema)
      .where(eq(auditEventSchema.tenantId, tenantId))
      .orderBy(desc(auditEventSchema.createdAt))
      .limit(limit)
      .offset(offset);

    return events.map((e) => this.mapToEntity(e));
  }

  async findByUser(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditEvent[]> {
    const events = await this.db
      .select()
      .from(auditEventSchema)
      .where(eq(auditEventSchema.userId, userId))
      .orderBy(desc(auditEventSchema.createdAt))
      .limit(limit)
      .offset(offset);

    return events.map((e) => this.mapToEntity(e));
  }

  async findByTraceId(traceId: string): Promise<AuditEvent[]> {
    const events = await this.db
      .select()
      .from(auditEventSchema)
      .where(eq(auditEventSchema.traceId, traceId))
      .orderBy(auditEventSchema.createdAt);

    return events.map((e) => this.mapToEntity(e));
  }

  async findByEntity(
    entityType: string,
    entityId: string
  ): Promise<AuditEvent[]> {
    const events = await this.db
      .select()
      .from(auditEventSchema)
      .where(
        and(
          eq(auditEventSchema.entityType, entityType),
          eq(auditEventSchema.entityId, entityId)
        )
      )
      .orderBy(auditEventSchema.createdAt);

    return events.map((e) => this.mapToEntity(e));
  }

  async findByAction(
    action: string,
    limit: number = 100
  ): Promise<AuditEvent[]> {
    const events = await this.db
      .select()
      .from(auditEventSchema)
      .where(eq(auditEventSchema.action, action))
      .orderBy(desc(auditEventSchema.createdAt))
      .limit(limit);

    return events.map((e) => this.mapToEntity(e));
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    tenantId?: string
  ): Promise<AuditEvent[]> {
    const conditions = [
      gte(auditEventSchema.createdAt, startDate),
      lte(auditEventSchema.createdAt, endDate),
    ];

    if (tenantId) {
      conditions.push(eq(auditEventSchema.tenantId, tenantId));
    }

    const events = await this.db
      .select()
      .from(auditEventSchema)
      .where(and(...conditions))
      .orderBy(desc(auditEventSchema.createdAt));

    return events.map((e) => this.mapToEntity(e));
  }

  async count(tenantId?: string): Promise<number> {
    const query = this.db.select().from(auditEventSchema);

    if (tenantId) {
      query.where(eq(auditEventSchema.tenantId, tenantId));
    }

    const result = await query;
    return result.length;
  }

  private mapToEntity(
    row: typeof auditEventSchema.$inferSelect
  ): AuditEvent {
    return {
      id: row.id,
      traceId: row.traceId,
      tenantId: row.tenantId,
      userId: row.userId,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      changes: row.changes as Record<string, unknown>,
      metadata: row.metadata as Record<string, unknown>,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
    };
  }
}


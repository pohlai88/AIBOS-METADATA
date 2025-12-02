// apps/bff-admin-config/src/infrastructure/repository-adapters.ts
/**
 * Repository Adapters
 * 
 * Bridges BFF Drizzle repositories with Business Engine interfaces.
 * Converts between DB rows ↔ Domain entities.
 * 
 * COMPOSITION ROOT:
 * - createRepositoryScope() is the factory that creates all repos
 * - Each repo implements the interface from the Business Engine
 * - The BFF owns the concrete implementations
 */

import { eq, and, desc, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Business Engine Domain
import { User } from "../../../../business-engine/admin-config/domain/entities/user.entity";
import { Tenant } from "../../../../business-engine/admin-config/domain/entities/tenant.entity";
import { Membership } from "../../../../business-engine/admin-config/domain/entities/membership.entity";
import { AuditEvent } from "../../../../business-engine/admin-config/domain/entities/audit-event.entity";
import { AuditConcurrencyError } from "../../../../business-engine/admin-config/domain/errors/concurrency.error";

// Business Engine Ports
import type { IUserRepository } from "../../../../business-engine/admin-config/application/ports/outbound/user.repository.port";
import type { ITenantRepository } from "../../../../business-engine/admin-config/application/ports/outbound/tenant.repository.port";
import type { IMembershipRepository } from "../../../../business-engine/admin-config/application/ports/outbound/membership.repository.port";
import type { IAuditRepository } from "../../../../business-engine/admin-config/application/ports/outbound/audit.repository.port";
import type { ITokenRepository, InviteTokenData, PasswordResetTokenData } from "../../../../business-engine/admin-config/application/ports/outbound/token.repository.port";
import type { TransactionScope } from "../../../../business-engine/admin-config/application/ports/outbound/transaction.manager.port";

// DB Schema
import * as schema from "../db/schema";

type DbClient = PostgresJsDatabase<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITION ROOT FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a TransactionScope with all repositories bound to a DB/transaction client.
 * 
 * This is the "Composition Root" - it wires all concrete implementations
 * to the Business Engine's port interfaces.
 * 
 * @param db - Drizzle database client (or transaction client)
 * @returns TransactionScope with all repositories
 * 
 * @example
 * const txManager = new DrizzleTransactionManager(db, createRepositoryScope);
 */
export function createRepositoryScope(db: DbClient): TransactionScope {
  return {
    userRepository: createUserRepository(db),
    tenantRepository: createTenantRepository(db),
    membershipRepository: createMembershipRepository(db),
    auditRepository: createAuditRepository(db),
    tokenRepository: createTokenRepository(db),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// USER REPOSITORY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────

export function createUserRepository(db: DbClient): IUserRepository {
  return {
    async findById(id: string): Promise<User | null> {
      const [row] = await db
        .select()
        .from(schema.iamUser)
        .where(eq(schema.iamUser.id, id))
        .limit(1);

      return row ? mapRowToUser(row) : null;
    },

    async findByEmail(email: string): Promise<User | null> {
      const [row] = await db
        .select()
        .from(schema.iamUser)
        .where(eq(schema.iamUser.email, email))
        .limit(1);

      return row ? mapRowToUser(row) : null;
    },

    async save(user: User): Promise<User> {
      const data = user.toPersistence();

      if (user.id) {
        // Update
        const [updated] = await db
          .update(schema.iamUser)
          .set({
            email: data.email as string,
            name: data.name as string,
            passwordHash: data.passwordHash as string | undefined,
            avatarUrl: data.avatarUrl as string | undefined,
            locale: data.locale as string,
            timezone: data.timezone as string,
            status: data.status as any,
            lastLoginAt: data.lastLoginAt as Date | undefined,
            updatedAt: new Date(),
          })
          .where(eq(schema.iamUser.id, user.id))
          .returning();

        return mapRowToUser(updated);
      } else {
        // Insert
        const [created] = await db
          .insert(schema.iamUser)
          .values({
            traceId: data.traceId as string,
            email: data.email as string,
            name: data.name as string,
            passwordHash: data.passwordHash as string | undefined,
            avatarUrl: data.avatarUrl as string | undefined,
            locale: data.locale as string,
            timezone: data.timezone as string,
            status: data.status as any,
          })
          .returning();

        return mapRowToUser(created);
      }
    },

    async getPasswordHash(userId: string): Promise<string | null> {
      const [row] = await db
        .select({ passwordHash: schema.iamUser.passwordHash })
        .from(schema.iamUser)
        .where(eq(schema.iamUser.id, userId))
        .limit(1);

      return row?.passwordHash ?? null;
    },

    async existsByEmail(email: string): Promise<boolean> {
      const [row] = await db
        .select({ id: schema.iamUser.id })
        .from(schema.iamUser)
        .where(eq(schema.iamUser.email, email))
        .limit(1);

      return !!row;
    },
  };
}

function mapRowToUser(row: typeof schema.iamUser.$inferSelect): User {
  return User.fromPersistence({
    id: row.id,
    traceId: row.traceId,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    locale: row.locale,
    timezone: row.timezone,
    status: row.status,
    lastLoginAt: row.lastLoginAt ?? undefined,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt!,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TENANT REPOSITORY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────

export function createTenantRepository(db: DbClient): ITenantRepository {
  return {
    async findById(id: string): Promise<Tenant | null> {
      const [row] = await db
        .select()
        .from(schema.iamTenant)
        .where(eq(schema.iamTenant.id, id))
        .limit(1);

      return row ? mapRowToTenant(row) : null;
    },

    async findBySlug(slug: string): Promise<Tenant | null> {
      const [row] = await db
        .select()
        .from(schema.iamTenant)
        .where(eq(schema.iamTenant.slug, slug))
        .limit(1);

      return row ? mapRowToTenant(row) : null;
    },

    async save(tenant: Tenant): Promise<Tenant> {
      const data = tenant.toPersistence();

      if (tenant.id) {
        const [updated] = await db
          .update(schema.iamTenant)
          .set({
            name: data.name as string,
            slug: data.slug as string,
            status: data.status as any,
            timezone: data.timezone as string,
            locale: data.locale as string,
            logoUrl: data.logoUrl as string | undefined,
            domain: data.domain as string | undefined,
            updatedAt: new Date(),
            updatedBy: data.updatedBy as string,
          })
          .where(eq(schema.iamTenant.id, tenant.id))
          .returning();

        return mapRowToTenant(updated);
      } else {
        const [created] = await db
          .insert(schema.iamTenant)
          .values({
            traceId: data.traceId as string,
            name: data.name as string,
            slug: data.slug as string,
            status: data.status as any,
            timezone: data.timezone as string,
            locale: data.locale as string,
            logoUrl: data.logoUrl as string | undefined,
            domain: data.domain as string | undefined,
            createdBy: data.createdBy as string,
            updatedBy: data.updatedBy as string,
          })
          .returning();

        return mapRowToTenant(created);
      }
    },

    async existsBySlug(slug: string): Promise<boolean> {
      const [row] = await db
        .select({ id: schema.iamTenant.id })
        .from(schema.iamTenant)
        .where(eq(schema.iamTenant.slug, slug))
        .limit(1);

      return !!row;
    },
  };
}

function mapRowToTenant(row: typeof schema.iamTenant.$inferSelect): Tenant {
  return Tenant.fromPersistence({
    id: row.id,
    traceId: row.traceId,
    name: row.name,
    slug: row.slug,
    status: row.status,
    timezone: row.timezone,
    locale: row.locale,
    logoUrl: row.logoUrl ?? undefined,
    domain: row.domain ?? undefined,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt!,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP REPOSITORY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────

export function createMembershipRepository(db: DbClient): IMembershipRepository {
  return {
    async findByUserAndTenant(userId: string, tenantId: string): Promise<Membership | null> {
      const [row] = await db
        .select()
        .from(schema.iamUserTenantMembership)
        .where(
          and(
            eq(schema.iamUserTenantMembership.userId, userId),
            eq(schema.iamUserTenantMembership.tenantId, tenantId),
          ),
        )
        .limit(1);

      return row ? mapRowToMembership(row) : null;
    },

    async findByUserId(userId: string): Promise<Membership[]> {
      const rows = await db
        .select()
        .from(schema.iamUserTenantMembership)
        .where(eq(schema.iamUserTenantMembership.userId, userId));

      return rows.map(mapRowToMembership);
    },

    async findByTenantId(tenantId: string): Promise<Membership[]> {
      const rows = await db
        .select()
        .from(schema.iamUserTenantMembership)
        .where(eq(schema.iamUserTenantMembership.tenantId, tenantId));

      return rows.map(mapRowToMembership);
    },

    async save(membership: Membership): Promise<Membership> {
      const data = membership.toPersistence();

      if (membership.id) {
        const [updated] = await db
          .update(schema.iamUserTenantMembership)
          .set({
            role: data.role as any,
            updatedAt: new Date(),
            updatedBy: data.updatedBy as string,
          })
          .where(eq(schema.iamUserTenantMembership.id, membership.id))
          .returning();

        return mapRowToMembership(updated);
      } else {
        const [created] = await db
          .insert(schema.iamUserTenantMembership)
          .values({
            userId: data.userId as string,
            tenantId: data.tenantId as string,
            role: data.role as any,
            createdBy: data.createdBy as string,
            updatedBy: data.updatedBy as string,
          })
          .returning();

        return mapRowToMembership(created);
      }
    },

    async delete(membershipId: string): Promise<void> {
      await db
        .delete(schema.iamUserTenantMembership)
        .where(eq(schema.iamUserTenantMembership.id, membershipId));
    },
  };
}

function mapRowToMembership(row: typeof schema.iamUserTenantMembership.$inferSelect): Membership {
  return Membership.fromPersistence({
    id: row.id,
    userId: row.userId,
    tenantId: row.tenantId,
    role: row.role,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt!,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT REPOSITORY ADAPTER (with optimistic locking)
// ─────────────────────────────────────────────────────────────────────────────

export function createAuditRepository(db: DbClient): IAuditRepository {
  return {
    async appendEvent(event: AuditEvent): Promise<AuditEvent> {
      const data = event.toPersistence();

      // ─────────────────────────────────────────────────────────────────────
      // OPTIMISTIC LOCKING via Conditional INSERT
      // 
      // This uses a single atomic SQL statement to:
      // 1. Check that prevHash matches the current chain head
      // 2. Insert only if the check passes
      // 3. Return 0 rows if another write raced ahead
      //
      // This is race-condition-free because it's a single DB operation.
      // ─────────────────────────────────────────────────────────────────────

      // Handle prevHash - null means genesis event
      const prevHash = data.prevHash ?? null;
      const isGenesis = prevHash === null;
      
      let result;
      
      if (isGenesis) {
        // GENESIS EVENT: Insert only if no events exist for this trace
        result = await db.execute(sql`
          INSERT INTO iam_audit_event (
            trace_id, resource_type, resource_id, action,
            actor_user_id, location_ref, metadata_diff,
            ip_address, user_agent, prev_hash, hash
          )
          SELECT 
            ${data.traceId}::uuid,
            ${data.resourceType}::text,
            ${data.resourceId}::uuid,
            ${data.action}::text,
            ${data.actorUserId ? sql`${data.actorUserId}::uuid` : sql`NULL`},
            ${data.locationRef ?? null}::text,
            ${data.metadataDiff ? sql`${JSON.stringify(data.metadataDiff)}::jsonb` : sql`NULL`},
            ${data.ipAddress ?? null}::text,
            ${data.userAgent ?? null}::text,
            NULL,
            ${data.hash}::text
          WHERE NOT EXISTS (
            SELECT 1 FROM iam_audit_event WHERE trace_id = ${data.traceId}::uuid
          )
          RETURNING *
        `);
      } else {
        // CONTINUATION: Insert only if prevHash is the current tail
        result = await db.execute(sql`
          INSERT INTO iam_audit_event (
            trace_id, resource_type, resource_id, action,
            actor_user_id, location_ref, metadata_diff,
            ip_address, user_agent, prev_hash, hash
          )
          SELECT 
            ${data.traceId}::uuid,
            ${data.resourceType}::text,
            ${data.resourceId}::uuid,
            ${data.action}::text,
            ${data.actorUserId ? sql`${data.actorUserId}::uuid` : sql`NULL`},
            ${data.locationRef ?? null}::text,
            ${data.metadataDiff ? sql`${JSON.stringify(data.metadataDiff)}::jsonb` : sql`NULL`},
            ${data.ipAddress ?? null}::text,
            ${data.userAgent ?? null}::text,
            ${prevHash}::text,
            ${data.hash}::text
          WHERE EXISTS (
            SELECT 1 FROM iam_audit_event 
            WHERE trace_id = ${data.traceId}::uuid 
            AND hash = ${prevHash}::text
            AND NOT EXISTS (
              SELECT 1 FROM iam_audit_event e2
              WHERE e2.trace_id = ${data.traceId}::uuid
              AND e2.prev_hash = iam_audit_event.hash
            )
          )
          RETURNING *
        `);
      }

      // postgres.js returns an array directly, not { rows: [...] }
      const rows = Array.isArray(result) ? result : (result as any).rows ?? [];
      
      // If no rows returned, another write raced ahead
      if (rows.length === 0) {
        throw new AuditConcurrencyError(
          data.traceId as string,
          data.prevHash as string | null,
        );
      }

      // Map the returned row to AuditEvent
      const row = rows[0] as any;
      return AuditEvent.fromPersistence({
        auditId: row.audit_id,
        traceId: row.trace_id,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        action: row.action,
        actorUserId: row.actor_user_id,
        locationRef: row.location_ref,
        metadataDiff: row.metadata_diff,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at,
        prevHash: row.prev_hash,
        hash: row.hash,
      });
    },

    async save(event: AuditEvent): Promise<AuditEvent> {
      const data = event.toPersistence();

      const [created] = await db
        .insert(schema.iamAuditEvent)
        .values({
          traceId: data.traceId as string,
          resourceType: data.resourceType as any,
          resourceId: data.resourceId as string,
          action: data.action as any,
          actorUserId: data.actorUserId as string | null,
          locationRef: data.locationRef as string | undefined,
          metadataDiff: data.metadataDiff as any,
          ipAddress: data.ipAddress as string | undefined,
          userAgent: data.userAgent as string | undefined,
          prevHash: data.prevHash as string | null,
          hash: data.hash as string,
        })
        .returning();

      return mapRowToAuditEvent(created);
    },

    async getLatestByTraceId(traceId: string): Promise<AuditEvent | null> {
      const [row] = await db
        .select()
        .from(schema.iamAuditEvent)
        .where(eq(schema.iamAuditEvent.traceId, traceId))
        .orderBy(desc(schema.iamAuditEvent.createdAt))
        .limit(1);

      return row ? mapRowToAuditEvent(row) : null;
    },

    async getTimelineByTraceId(traceId: string, options?: any): Promise<AuditEvent[]> {
      const rows = await db
        .select()
        .from(schema.iamAuditEvent)
        .where(eq(schema.iamAuditEvent.traceId, traceId))
        .orderBy(desc(schema.iamAuditEvent.createdAt))
        .limit(options?.limit ?? 100);

      return rows.map(mapRowToAuditEvent);
    },

    async findByResource(resourceType: any, resourceId: string, options?: any): Promise<AuditEvent[]> {
      const rows = await db
        .select()
        .from(schema.iamAuditEvent)
        .where(
          and(
            eq(schema.iamAuditEvent.resourceType, resourceType),
            eq(schema.iamAuditEvent.resourceId, resourceId),
          ),
        )
        .orderBy(desc(schema.iamAuditEvent.createdAt))
        .limit(options?.limit ?? 100);

      return rows.map(mapRowToAuditEvent);
    },

    async findByActor(actorUserId: string, options?: any): Promise<AuditEvent[]> {
      const rows = await db
        .select()
        .from(schema.iamAuditEvent)
        .where(eq(schema.iamAuditEvent.actorUserId, actorUserId))
        .orderBy(desc(schema.iamAuditEvent.createdAt))
        .limit(options?.limit ?? 100);

      return rows.map(mapRowToAuditEvent);
    },

    async findByAction(action: any, options?: any): Promise<AuditEvent[]> {
      const rows = await db
        .select()
        .from(schema.iamAuditEvent)
        .where(eq(schema.iamAuditEvent.action, action))
        .orderBy(desc(schema.iamAuditEvent.createdAt))
        .limit(options?.limit ?? 100);

      return rows.map(mapRowToAuditEvent);
    },

    async verifyHashChain(traceId: string): Promise<{ isValid: boolean; brokenAt?: string }> {
      const events = await db
        .select()
        .from(schema.iamAuditEvent)
        .where(eq(schema.iamAuditEvent.traceId, traceId))
        .orderBy(schema.iamAuditEvent.createdAt);

      let prevHash: string | null = null;
      for (const event of events) {
        if (event.prevHash !== prevHash) {
          return { isValid: false, brokenAt: event.auditId };
        }
        prevHash = event.hash;
      }

      return { isValid: true };
    },
  };
}

function mapRowToAuditEvent(row: typeof schema.iamAuditEvent.$inferSelect): AuditEvent {
  return AuditEvent.fromPersistence({
    auditId: row.auditId,
    traceId: row.traceId,
    resourceType: row.resourceType as any,
    resourceId: row.resourceId,
    action: row.action as any,
    actorUserId: row.actorUserId,
    locationRef: row.locationRef ?? undefined,
    metadataDiff: row.metadataDiff as Record<string, unknown> | undefined,
    ipAddress: row.ipAddress ?? undefined,
    userAgent: row.userAgent ?? undefined,
    createdAt: row.createdAt!,
    prevHash: row.prevHash,
    hash: row.hash,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN REPOSITORY ADAPTER
// ─────────────────────────────────────────────────────────────────────────────

export function createTokenRepository(db: DbClient): ITokenRepository {
  return {
    async saveInviteToken(params: {
      tokenHash: string;
      userId: string;
      tenantId: string;
      role: 'org_admin' | 'member' | 'viewer';
      expiresAt: Date;
      invitedBy: string;
    }): Promise<InviteTokenData> {
      const [created] = await db
        .insert(schema.iamInviteToken)
        .values({
          tokenHash: params.tokenHash,
          userId: params.userId,
          tenantId: params.tenantId,
          role: params.role,
          expiresAt: params.expiresAt,
          invitedBy: params.invitedBy,
        })
        .returning();

      return {
        id: created.id,
        tokenHash: created.tokenHash,
        userId: created.userId,
        tenantId: created.tenantId,
        role: created.role as any,
        expiresAt: created.expiresAt,
        usedAt: created.usedAt ?? undefined,
        isUsed: !!created.usedAt,
        invitedBy: created.invitedBy,
        createdAt: created.createdAt!,
      };
    },

    async findInviteTokenByHash(tokenHash: string): Promise<InviteTokenData | null> {
      const [row] = await db
        .select()
        .from(schema.iamInviteToken)
        .where(eq(schema.iamInviteToken.tokenHash, tokenHash))
        .limit(1);

      if (!row) return null;

      return {
        id: row.id,
        tokenHash: row.tokenHash,
        userId: row.userId,
        tenantId: row.tenantId,
        role: row.role as any,
        expiresAt: row.expiresAt,
        usedAt: row.usedAt ?? undefined,
        isUsed: !!row.usedAt,
        invitedBy: row.invitedBy,
        createdAt: row.createdAt!,
      };
    },

    async markInviteTokenUsed(id: string): Promise<void> {
      await db
        .update(schema.iamInviteToken)
        .set({ usedAt: new Date() })
        .where(eq(schema.iamInviteToken.id, id));
    },

    async findActiveInviteTokenForUser(userId: string): Promise<InviteTokenData | null> {
      const [row] = await db
        .select()
        .from(schema.iamInviteToken)
        .where(
          and(
            eq(schema.iamInviteToken.userId, userId),
            sql`${schema.iamInviteToken.usedAt} IS NULL`,
            sql`${schema.iamInviteToken.expiresAt} > NOW()`,
          ),
        )
        .limit(1);

      if (!row) return null;

      return {
        id: row.id,
        tokenHash: row.tokenHash,
        userId: row.userId,
        tenantId: row.tenantId,
        role: row.role as any,
        expiresAt: row.expiresAt,
        usedAt: row.usedAt ?? undefined,
        isUsed: !!row.usedAt,
        invitedBy: row.invitedBy,
        createdAt: row.createdAt!,
      };
    },

    async deleteExpiredInviteTokens(): Promise<number> {
      const result = await db
        .delete(schema.iamInviteToken)
        .where(sql`${schema.iamInviteToken.expiresAt} < NOW()`);

      return 0; // Drizzle doesn't return count easily
    },

    async savePasswordResetToken(params: {
      tokenHash: string;
      userId: string;
      expiresAt: Date;
      requestedIp?: string;
      requestedUserAgent?: string;
    }): Promise<PasswordResetTokenData> {
      const [created] = await db
        .insert(schema.iamPasswordResetToken)
        .values({
          tokenHash: params.tokenHash,
          userId: params.userId,
          expiresAt: params.expiresAt,
          requestedIp: params.requestedIp,
          requestedUserAgent: params.requestedUserAgent,
        })
        .returning();

      return {
        id: created.id,
        tokenHash: created.tokenHash,
        userId: created.userId,
        expiresAt: created.expiresAt,
        usedAt: created.usedAt ?? undefined,
        isUsed: !!created.usedAt,
        requestedIp: created.requestedIp ?? undefined,
        requestedUserAgent: created.requestedUserAgent ?? undefined,
        createdAt: created.createdAt!,
      };
    },

    async findPasswordResetTokenByHash(tokenHash: string): Promise<PasswordResetTokenData | null> {
      const [row] = await db
        .select()
        .from(schema.iamPasswordResetToken)
        .where(eq(schema.iamPasswordResetToken.tokenHash, tokenHash))
        .limit(1);

      if (!row) return null;

      return {
        id: row.id,
        tokenHash: row.tokenHash,
        userId: row.userId,
        expiresAt: row.expiresAt,
        usedAt: row.usedAt ?? undefined,
        isUsed: !!row.usedAt,
        requestedIp: row.requestedIp ?? undefined,
        requestedUserAgent: row.requestedUserAgent ?? undefined,
        createdAt: row.createdAt!,
      };
    },

    async markPasswordResetTokenUsed(id: string): Promise<void> {
      await db
        .update(schema.iamPasswordResetToken)
        .set({ usedAt: new Date() })
        .where(eq(schema.iamPasswordResetToken.id, id));
    },

    async invalidateAllPasswordResetTokensForUser(userId: string): Promise<void> {
      await db
        .update(schema.iamPasswordResetToken)
        .set({ usedAt: new Date() })
        .where(eq(schema.iamPasswordResetToken.userId, userId));
    },

    async deleteExpiredPasswordResetTokens(): Promise<number> {
      await db
        .delete(schema.iamPasswordResetToken)
        .where(sql`${schema.iamPasswordResetToken.expiresAt} < NOW()`);

      return 0;
    },
  };
}


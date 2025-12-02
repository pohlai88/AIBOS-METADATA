import { eq, and, isNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { IMembershipRepository } from "../../../../application/ports/outbound/membership.repository.port";
import type { UserTenantMembership } from "../../../../domain/entities/membership.entity";
import { membershipSchema } from "../schema/membership.schema";
import * as schema from "../schema";

/**
 * Membership Repository - Drizzle Implementation
 * 
 * Manages user-tenant relationships and roles
 */
export class MembershipRepository implements IMembershipRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async create(
    membership: Omit<UserTenantMembership, "id" | "createdAt" | "updatedAt">
  ): Promise<UserTenantMembership> {
    const [created] = await this.db
      .insert(membershipSchema)
      .values({
        userId: membership.userId,
        tenantId: membership.tenantId,
        role: membership.role,
        invitedBy: membership.invitedBy,
        metadata: membership.metadata || {},
      })
      .returning();

    return this.mapToEntity(created);
  }

  async findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<UserTenantMembership | null> {
    const [membership] = await this.db
      .select()
      .from(membershipSchema)
      .where(
        and(
          eq(membershipSchema.userId, userId),
          eq(membershipSchema.tenantId, tenantId),
          isNull(membershipSchema.deletedAt)
        )
      )
      .limit(1);

    return membership ? this.mapToEntity(membership) : null;
  }

  async findByUser(userId: string): Promise<UserTenantMembership[]> {
    const memberships = await this.db
      .select()
      .from(membershipSchema)
      .where(and(eq(membershipSchema.userId, userId), isNull(membershipSchema.deletedAt)));

    return memberships.map((m) => this.mapToEntity(m));
  }

  async findByTenant(tenantId: string): Promise<UserTenantMembership[]> {
    const memberships = await this.db
      .select()
      .from(membershipSchema)
      .where(and(eq(membershipSchema.tenantId, tenantId), isNull(membershipSchema.deletedAt)))
      .orderBy(membershipSchema.createdAt);

    return memberships.map((m) => this.mapToEntity(m));
  }

  async findByTenantWithRole(
    tenantId: string,
    role: string
  ): Promise<UserTenantMembership[]> {
    const memberships = await this.db
      .select()
      .from(membershipSchema)
      .where(
        and(
          eq(membershipSchema.tenantId, tenantId),
          eq(membershipSchema.role, role),
          isNull(membershipSchema.deletedAt)
        )
      );

    return memberships.map((m) => this.mapToEntity(m));
  }

  async update(
    userId: string,
    tenantId: string,
    data: Partial<UserTenantMembership>
  ): Promise<UserTenantMembership> {
    const [updated] = await this.db
      .update(membershipSchema)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(membershipSchema.userId, userId),
          eq(membershipSchema.tenantId, tenantId),
          isNull(membershipSchema.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      throw new Error(`Membership not found for user ${userId} in tenant ${tenantId}`);
    }

    return this.mapToEntity(updated);
  }

  async delete(userId: string, tenantId: string): Promise<void> {
    // Soft delete
    await this.db
      .update(membershipSchema)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(membershipSchema.userId, userId),
          eq(membershipSchema.tenantId, tenantId)
        )
      );
  }

  async exists(userId: string, tenantId: string): Promise<boolean> {
    const [membership] = await this.db
      .select({ id: membershipSchema.id })
      .from(membershipSchema)
      .where(
        and(
          eq(membershipSchema.userId, userId),
          eq(membershipSchema.tenantId, tenantId),
          isNull(membershipSchema.deletedAt)
        )
      )
      .limit(1);

    return !!membership;
  }

  private mapToEntity(
    row: typeof membershipSchema.$inferSelect
  ): UserTenantMembership {
    return {
      id: row.id,
      userId: row.userId,
      tenantId: row.tenantId,
      role: row.role as "platform_admin" | "org_admin" | "member" | "viewer",
      invitedBy: row.invitedBy,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}


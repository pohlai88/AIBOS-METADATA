import { eq, and } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { iamUserTenantMembership } from "../db/schema/membership.schema";
import * as schema from "../db/schema";

/**
 * Membership Data (Plain object)
 */
export interface MembershipData {
  id: string;
  userId: string;
  tenantId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Membership Repository - Drizzle Implementation
 */
export class MembershipRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(membership: {
    id?: string;
    userId: string;
    tenantId: string;
    role: string;
    createdBy: string;
  }): Promise<MembershipData> {
    if (membership.id) {
      // Update existing
      const [updated] = await this.db
        .update(iamUserTenantMembership)
        .set({
          role: membership.role as any,
          updatedAt: new Date(),
          updatedBy: membership.createdBy,
        })
        .where(eq(iamUserTenantMembership.id, membership.id))
        .returning();

      return this.mapToData(updated);
    } else {
      // Create new
      const [created] = await this.db
        .insert(iamUserTenantMembership)
        .values({
          userId: membership.userId,
          tenantId: membership.tenantId,
          role: membership.role as any,
          createdBy: membership.createdBy,
          updatedBy: membership.createdBy,
        })
        .returning();

      return this.mapToData(created);
    }
  }

  async findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<MembershipData | null> {
    const [membership] = await this.db
      .select()
      .from(iamUserTenantMembership)
      .where(
        and(
          eq(iamUserTenantMembership.userId, userId),
          eq(iamUserTenantMembership.tenantId, tenantId)
        )
      )
      .limit(1);

    return membership ? this.mapToData(membership) : null;
  }

  async findByUser(userId: string): Promise<MembershipData[]> {
    const memberships = await this.db
      .select()
      .from(iamUserTenantMembership)
      .where(eq(iamUserTenantMembership.userId, userId));

    return memberships.map((m) => this.mapToData(m));
  }

  async findByTenant(tenantId: string): Promise<MembershipData[]> {
    const memberships = await this.db
      .select()
      .from(iamUserTenantMembership)
      .where(eq(iamUserTenantMembership.tenantId, tenantId))
      .orderBy(iamUserTenantMembership.createdAt);

    return memberships.map((m) => this.mapToData(m));
  }

  async findAdminsByTenant(tenantId: string): Promise<MembershipData[]> {
    const memberships = await this.db
      .select()
      .from(iamUserTenantMembership)
      .where(
        and(
          eq(iamUserTenantMembership.tenantId, tenantId),
          eq(iamUserTenantMembership.role, "org_admin")
        )
      );

    return memberships.map((m) => this.mapToData(m));
  }

  async updateRole(
    userId: string,
    tenantId: string,
    role: string,
    updatedBy: string
  ): Promise<void> {
    await this.db
      .update(iamUserTenantMembership)
      .set({ role: role as any, updatedAt: new Date(), updatedBy })
      .where(
        and(
          eq(iamUserTenantMembership.userId, userId),
          eq(iamUserTenantMembership.tenantId, tenantId)
        )
      );
  }

  async delete(userId: string, tenantId: string): Promise<void> {
    await this.db
      .delete(iamUserTenantMembership)
      .where(
        and(
          eq(iamUserTenantMembership.userId, userId),
          eq(iamUserTenantMembership.tenantId, tenantId)
        )
      );
  }

  private mapToData(
    row: typeof iamUserTenantMembership.$inferSelect
  ): MembershipData {
    return {
      id: row.id,
      userId: row.userId,
      tenantId: row.tenantId,
      role: row.role,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
    };
  }
}

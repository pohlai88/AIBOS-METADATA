import { eq, and, isNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ITenantRepository } from "../../../../application/ports/outbound/tenant.repository.port";
import type { Tenant } from "../../../../domain/entities/tenant.entity";
import { tenantSchema } from "../schema/tenant.schema";
import * as schema from "../schema";

/**
 * Tenant Repository - Drizzle Implementation
 * 
 * Implements ITenantRepository using Drizzle ORM
 * Handles multi-tenant isolation and soft deletes
 */
export class TenantRepository implements ITenantRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async create(tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant> {
    const [created] = await this.db
      .insert(tenantSchema)
      .values({
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        contactEmail: tenant.contactEmail,
        website: tenant.website,
        address: tenant.address,
        logoUrl: tenant.logoUrl,
        metadata: tenant.metadata || {},
      })
      .returning();

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Tenant | null> {
    const [tenant] = await this.db
      .select()
      .from(tenantSchema)
      .where(and(eq(tenantSchema.id, id), isNull(tenantSchema.deletedAt)))
      .limit(1);

    return tenant ? this.mapToEntity(tenant) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const [tenant] = await this.db
      .select()
      .from(tenantSchema)
      .where(and(eq(tenantSchema.slug, slug), isNull(tenantSchema.deletedAt)))
      .limit(1);

    return tenant ? this.mapToEntity(tenant) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await this.db
      .select()
      .from(tenantSchema)
      .where(isNull(tenantSchema.deletedAt))
      .orderBy(tenantSchema.createdAt);

    return tenants.map((t) => this.mapToEntity(t));
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const [updated] = await this.db
      .update(tenantSchema)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(tenantSchema.id, id), isNull(tenantSchema.deletedAt)))
      .returning();

    if (!updated) {
      throw new Error(`Tenant with id ${id} not found`);
    }

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await this.db
      .update(tenantSchema)
      .set({ deletedAt: new Date() })
      .where(eq(tenantSchema.id, id));
  }

  async exists(slug: string): Promise<boolean> {
    const [tenant] = await this.db
      .select({ id: tenantSchema.id })
      .from(tenantSchema)
      .where(and(eq(tenantSchema.slug, slug), isNull(tenantSchema.deletedAt)))
      .limit(1);

    return !!tenant;
  }

  private mapToEntity(row: typeof tenantSchema.$inferSelect): Tenant {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status as "active" | "inactive" | "suspended",
      contactEmail: row.contactEmail,
      website: row.website,
      address: row.address,
      logoUrl: row.logoUrl,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}


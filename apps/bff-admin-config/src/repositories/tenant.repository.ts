import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { iamTenant } from "../db/schema/tenant.schema";
import * as schema from "../db/schema";

/**
 * Tenant Data (Plain object)
 */
export interface TenantData {
  id: string;
  traceId: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  locale: string;
  logoUrl?: string;
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Tenant Repository - Drizzle Implementation
 */
export class TenantRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  async save(tenant: {
    id?: string;
    traceId: string;
    name: string;
    slug: string;
    status?: string;
    timezone?: string;
    locale?: string;
    logoUrl?: string;
    domain?: string;
    createdBy: string;
  }): Promise<TenantData> {
    if (tenant.id) {
      // Update existing
      const [updated] = await this.db
        .update(iamTenant)
        .set({
          name: tenant.name,
          slug: tenant.slug,
          status: (tenant.status || "active") as any,
          timezone: tenant.timezone || "UTC",
          locale: tenant.locale || "en",
          logoUrl: tenant.logoUrl,
          domain: tenant.domain,
          updatedAt: new Date(),
          updatedBy: tenant.createdBy,
        })
        .where(eq(iamTenant.id, tenant.id))
        .returning();

      return this.mapToData(updated);
    } else {
      // Create new
      const [created] = await this.db
        .insert(iamTenant)
        .values({
          traceId: tenant.traceId,
          name: tenant.name,
          slug: tenant.slug,
          status: (tenant.status || "pending_setup") as any,
          timezone: tenant.timezone || "UTC",
          locale: tenant.locale || "en",
          logoUrl: tenant.logoUrl,
          domain: tenant.domain,
          createdBy: tenant.createdBy,
          updatedBy: tenant.createdBy,
        })
        .returning();

      return this.mapToData(created);
    }
  }

  async findById(id: string): Promise<TenantData | null> {
    const [tenant] = await this.db
      .select()
      .from(iamTenant)
      .where(eq(iamTenant.id, id))
      .limit(1);

    return tenant ? this.mapToData(tenant) : null;
  }

  async findBySlug(slug: string): Promise<TenantData | null> {
    const [tenant] = await this.db
      .select()
      .from(iamTenant)
      .where(eq(iamTenant.slug, slug))
      .limit(1);

    return tenant ? this.mapToData(tenant) : null;
  }

  async findAll(): Promise<TenantData[]> {
    const tenants = await this.db
      .select()
      .from(iamTenant)
      .orderBy(iamTenant.createdAt);

    return tenants.map((t) => this.mapToData(t));
  }

  async exists(slug: string): Promise<boolean> {
    const [tenant] = await this.db
      .select({ id: iamTenant.id })
      .from(iamTenant)
      .where(eq(iamTenant.slug, slug))
      .limit(1);

    return !!tenant;
  }

  private mapToData(row: typeof iamTenant.$inferSelect): TenantData {
    return {
      id: row.id,
      traceId: row.traceId,
      name: row.name,
      slug: row.slug,
      status: row.status,
      timezone: row.timezone,
      locale: row.locale,
      logoUrl: row.logoUrl || undefined,
      domain: row.domain || undefined,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
    };
  }
}

// business-engine/admin-config/infrastructure/persistence/drizzle/schema/tenant.schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * iam_tenant
 * 
 * Tenant/Organization profile table.
 * GRCD Ref: §7.1 Core Entities - tenants
 * 
 * Naming Convention: iam_ prefix for Identity & Access Management domain
 * (aligned with metadata-studio's mdm_ prefix pattern)
 */
export const iamTenant = pgTable(
  'iam_tenant',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Traceability UUID - immutable, for audit correlation
    // GRCD F-TRACE-1: Every tenant MUST have a stable trace_id
    traceId: uuid('trace_id').notNull(),

    // Tenant identity
    name: text('name').notNull(),
    slug: text('slug').notNull(),

    // Status lifecycle: pending_setup | trial | active | suspended
    status: text('status')
      .$type<'pending_setup' | 'trial' | 'active' | 'suspended'>()
      .notNull()
      .default('pending_setup'),

    // Configuration
    timezone: text('timezone').notNull().default('UTC'),
    locale: text('locale').notNull().default('en'),

    // Optional metadata
    logoUrl: text('logo_url'),
    domain: text('domain'), // Custom domain if any

    // Audit trail (aligned with metadata-studio pattern)
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: text('created_by').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => ({
    // Unique slug constraint
    slugUq: uniqueIndex('iam_tenant_slug_uq').on(table.slug),

    // Unique trace_id constraint (immutable identifier)
    traceIdUq: uniqueIndex('iam_tenant_trace_id_uq').on(table.traceId),

    // Index for status filtering
    statusIdx: index('iam_tenant_status_idx').on(table.status),
  }),
);

// Types
export type IamTenantTable = typeof iamTenant.$inferSelect;
export type InsertIamTenant = typeof iamTenant.$inferInsert;


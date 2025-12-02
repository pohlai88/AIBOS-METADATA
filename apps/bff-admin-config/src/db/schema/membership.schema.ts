// business-engine/admin-config/infrastructure/persistence/drizzle/schema/membership.schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { iamUser } from './user.schema';
import { iamTenant } from './tenant.schema';

/**
 * iam_user_tenant_membership
 * 
 * Join table for user-tenant relationship with role assignment.
 * GRCD Ref: §7.1 Core Entities - user_tenant_memberships
 * 
 * Supports multi-tenant users (one user can belong to multiple tenants).
 */
export const iamUserTenantMembership = pgTable(
  'iam_user_tenant_membership',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Foreign keys
    userId: uuid('user_id')
      .notNull()
      .references(() => iamUser.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => iamTenant.id, { onDelete: 'cascade' }),

    // Role within this tenant
    // GRCD F-ROLE-1: platform_admin | org_admin | member | viewer
    role: text('role')
      .$type<'platform_admin' | 'org_admin' | 'member' | 'viewer'>()
      .notNull()
      .default('member'),

    // Audit trail
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: text('created_by').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => ({
    // Unique constraint: one membership per user-tenant pair
    userTenantUq: uniqueIndex('iam_membership_user_tenant_uq').on(
      table.userId,
      table.tenantId,
    ),

    // Index for querying all members of a tenant
    tenantIdx: index('iam_membership_tenant_idx').on(table.tenantId),

    // Index for querying all tenants a user belongs to
    userIdx: index('iam_membership_user_idx').on(table.userId),

    // Index for role-based queries
    tenantRoleIdx: index('iam_membership_tenant_role_idx').on(
      table.tenantId,
      table.role,
    ),
  }),
);

// Types
export type IamUserTenantMembershipTable =
  typeof iamUserTenantMembership.$inferSelect;
export type InsertIamUserTenantMembership =
  typeof iamUserTenantMembership.$inferInsert;


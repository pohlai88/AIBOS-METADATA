// business-engine/admin-config/infrastructure/persistence/drizzle/schema/user.schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * iam_user
 * 
 * Global user identity table.
 * GRCD Ref: §7.1 Core Entities - users
 * 
 * Users can belong to multiple tenants via iam_user_tenant_membership.
 */
export const iamUser = pgTable(
  'iam_user',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Traceability UUID - immutable, for audit correlation
    // GRCD F-TRACE-1: Every user MUST have a stable trace_id
    traceId: uuid('trace_id').notNull(),

    // Identity
    email: text('email').notNull(),
    name: text('name').notNull(),

    // Security (never exposed in API responses)
    // GRCD C-ORG-2: Password NOT logged in plaintext
    passwordHash: text('password_hash'),

    // Profile (My Profile settings - F-USER-6)
    avatarUrl: text('avatar_url'),
    locale: text('locale').notNull().default('en'),
    timezone: text('timezone').notNull().default('UTC'),

    // Status lifecycle: invited | active | inactive | locked
    // GRCD F-USER-3: Deactivate/reactivate users
    status: text('status')
      .$type<'invited' | 'active' | 'inactive' | 'locked'>()
      .notNull()
      .default('invited'),

    // Last login tracking
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

    // Audit trail
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Unique email constraint (global uniqueness)
    emailUq: uniqueIndex('iam_user_email_uq').on(table.email),

    // Unique trace_id constraint (immutable identifier)
    traceIdUq: uniqueIndex('iam_user_trace_id_uq').on(table.traceId),

    // Index for status filtering
    statusIdx: index('iam_user_status_idx').on(table.status),

    // Index for last login queries (e.g., find inactive users)
    lastLoginIdx: index('iam_user_last_login_idx').on(table.lastLoginAt),
  }),
);

// Types
export type IamUserTable = typeof iamUser.$inferSelect;
export type InsertIamUser = typeof iamUser.$inferInsert;


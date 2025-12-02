// business-engine/admin-config/infrastructure/persistence/drizzle/schema/invite-token.schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { iamUser } from './user.schema';
import { iamTenant } from './tenant.schema';

/**
 * iam_invite_token
 * 
 * Secure tokens for user invitation flow.
 * GRCD F-USER-1: Invite users via email with invite_token + expiry
 * GRCD C-ORG-2: Secure, expiring tokens; NOT logged in plaintext
 */
export const iamInviteToken = pgTable(
  'iam_invite_token',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Token value (hashed for security)
    tokenHash: text('token_hash').notNull(),

    // Who the invite is for
    userId: uuid('user_id')
      .notNull()
      .references(() => iamUser.id, { onDelete: 'cascade' }),

    // Which tenant the invite is for
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => iamTenant.id, { onDelete: 'cascade' }),

    // Initial role for the invited user
    role: text('role')
      .$type<'org_admin' | 'member' | 'viewer'>()
      .notNull()
      .default('member'),

    // Token lifecycle
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    isUsed: boolean('is_used').notNull().default(false),

    // Who sent the invite
    invitedBy: text('invited_by').notNull(),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Unique token hash
    tokenHashUq: uniqueIndex('iam_invite_token_hash_uq').on(table.tokenHash),

    // Index for finding tokens by user
    userIdx: index('iam_invite_token_user_idx').on(table.userId),

    // Index for cleanup of expired tokens
    expiresAtIdx: index('iam_invite_token_expires_at_idx').on(table.expiresAt),
  }),
);

// Types
export type IamInviteTokenTable = typeof iamInviteToken.$inferSelect;
export type InsertIamInviteToken = typeof iamInviteToken.$inferInsert;


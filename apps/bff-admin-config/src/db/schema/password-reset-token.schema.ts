// business-engine/admin-config/infrastructure/persistence/drizzle/schema/password-reset-token.schema.ts
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

/**
 * iam_password_reset_token
 * 
 * Secure tokens for password reset flow.
 * GRCD F-USER-5: Forgot password → secure reset flow with tokens and expiry
 * GRCD C-ORG-2: Secure, expiring tokens; NOT logged in plaintext
 */
export const iamPasswordResetToken = pgTable(
  'iam_password_reset_token',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Token value (hashed for security)
    // The actual token is sent to user, only hash is stored
    tokenHash: text('token_hash').notNull(),

    // Who requested the reset
    userId: uuid('user_id')
      .notNull()
      .references(() => iamUser.id, { onDelete: 'cascade' }),

    // Token lifecycle
    // GRCD F-USER-5: Token invalid after use / expiry
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    isUsed: boolean('is_used').notNull().default(false),

    // Request metadata (for security monitoring)
    requestedIp: text('requested_ip'),
    requestedUserAgent: text('requested_user_agent'),

    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Unique token hash
    tokenHashUq: uniqueIndex('iam_password_reset_token_hash_uq').on(
      table.tokenHash,
    ),

    // Index for finding tokens by user
    userIdx: index('iam_password_reset_token_user_idx').on(table.userId),

    // Index for cleanup of expired tokens
    expiresAtIdx: index('iam_password_reset_token_expires_at_idx').on(
      table.expiresAt,
    ),
  }),
);

// Types
export type IamPasswordResetTokenTable =
  typeof iamPasswordResetToken.$inferSelect;
export type InsertIamPasswordResetToken =
  typeof iamPasswordResetToken.$inferInsert;


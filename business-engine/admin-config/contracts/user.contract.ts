// business-engine/admin-config/contracts/user.contract.ts
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS (Vocabulary Controlled)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User status lifecycle.
 * Vocabulary: active | inactive | invited | locked
 * GRCD Ref: F-USER-3 (deactivate/reactivate), F-USER-1 (invite)
 */
export const UserStatusEnum = z.enum([
  'active',
  'inactive',
  'invited',
  'locked',
]);
export type UserStatus = z.infer<typeof UserStatusEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * IAM User Schema
 * 
 * Maps to: iam_user table
 * GRCD Ref: §7.1 Core Entities - users
 */
export const IamUserSchema = z.object({
  id: z.string().uuid().optional(),

  // Traceability UUID - immutable, for audit correlation
  // GRCD F-TRACE-1: Every user MUST have a stable trace_id
  traceId: z.string().uuid(),

  // Identity
  email: z.string().email(),
  name: z.string().min(1).max(255),

  // Profile (My Profile settings - F-USER-6)
  avatarUrl: z.string().url().optional(),
  locale: z.string().default('en'),
  timezone: z.string().default('UTC'),

  // Status & lifecycle
  status: UserStatusEnum.default('invited'),

  // Security (password_hash NOT exposed in contract - internal only)
  lastLoginAt: z.string().datetime().optional(),

  // Audit trail
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type IamUser = z.infer<typeof IamUserSchema>;

/**
 * Invite User Input Schema
 * GRCD F-USER-1: Invite users via email to a specific tenant with an initial role
 */
export const InviteUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  tenantId: z.string().uuid(),
  role: z.enum(['org_admin', 'member', 'viewer']),
});

export type InviteUserInput = z.infer<typeof InviteUserInputSchema>;

/**
 * Accept Invite Input Schema
 * GRCD F-USER-2: Accept invite and set password
 */
export const AcceptInviteInputSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).optional(), // Optional name override
});

export type AcceptInviteInput = z.infer<typeof AcceptInviteInputSchema>;

/**
 * Update Profile Input Schema
 * GRCD F-USER-6: "My Profile" page for name, avatar, locale, timezone
 */
export const UpdateProfileInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/**
 * User List Item (for /admin/users response)
 */
export const UserListItemSchema = IamUserSchema.extend({
  // Include role from membership in list context
  role: z.enum(['platform_admin', 'org_admin', 'member', 'viewer']).optional(),
  membershipId: z.string().uuid().optional(),
});

export type UserListItem = z.infer<typeof UserListItemSchema>;


import { z } from "zod";

/**
 * Users Schemas - Zod definitions for OpenAPI auto-generation
 */

// ============================================
// ENUMS
// ============================================

export const UserRoleEnum = z.enum(["platform_admin", "org_admin", "member", "viewer"]);
export const UserStatusEnum = z.enum(["active", "inactive", "invited", "locked"]);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const InviteUserRequestSchema = z.object({
  email: z.string().email().describe("Email address to invite"),
  role: z.enum(["org_admin", "member", "viewer"]).describe("Role to assign"),
});

export const UpdateUserRequestSchema = z.object({
  displayName: z.string().min(2).optional().describe("Display name"),
  avatarUrl: z.string().nullable().optional().describe("Avatar URL"),
  status: UserStatusEnum.optional().describe("User status"),
});

export const DeactivateUserRequestSchema = z.object({
  reason: z.string().optional().describe("Reason for deactivation"),
});

export const ListUsersQuerySchema = z.object({
  q: z.string().optional().describe("Search query"),
  status: UserStatusEnum.optional().describe("Filter by status"),
  role: UserRoleEnum.optional().describe("Filter by role"),
  limit: z.coerce.number().default(50).describe("Page size"),
  offset: z.coerce.number().default(0).describe("Offset"),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const UserSchema = z.object({
  id: z.string().describe("User UUID"),
  email: z.string().email().describe("User email"),
  displayName: z.string().describe("Display name"),
  avatarUrl: z.string().nullable().describe("Avatar URL"),
  role: UserRoleEnum.describe("User role in tenant"),
  status: UserStatusEnum.describe("Account status"),
  joinedAt: z.string().datetime().describe("Join timestamp"),
  lastActive: z.string().datetime().nullable().describe("Last activity"),
});

export const UsersListResponseSchema = z.object({
  users: z.array(UserSchema).describe("List of users"),
  total: z.number().describe("Total count"),
});

export const UserDetailResponseSchema = z.object({
  user: UserSchema.extend({
    permissions: z.array(z.string()).describe("User permissions"),
    invitedBy: z.string().optional().describe("Who invited this user"),
  }),
});

export const InviteUserResponseSchema = z.object({
  message: z.string().describe("Success message"),
  email: z.string().email().describe("Invited email"),
});

export const UpdateUserResponseSchema = z.object({
  message: z.string().describe("Success message"),
});

export const DeactivateUserResponseSchema = z.object({
  message: z.string().describe("Success message"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type UserRole = z.infer<typeof UserRoleEnum>;
export type UserStatus = z.infer<typeof UserStatusEnum>;
export type User = z.infer<typeof UserSchema>;
export type InviteUserRequest = z.infer<typeof InviteUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;


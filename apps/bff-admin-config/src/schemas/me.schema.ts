import { z } from "zod";

/**
 * Me (Current User) Schemas - Zod definitions for OpenAPI auto-generation
 */

// ============================================
// REQUEST SCHEMAS
// ============================================

export const UpdateProfileRequestSchema = z.object({
  displayName: z.string().min(2).optional().describe("Display name"),
  avatarUrl: z.string().nullable().optional().describe("Avatar URL"),
  locale: z.string().optional().describe("Locale (e.g., en-US)"),
  timezone: z.string().optional().describe("Timezone (e.g., Asia/Kuala_Lumpur)"),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().describe("Current password"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .describe("New password"),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const MembershipSchema = z.object({
  tenantId: z.string().describe("Tenant UUID"),
  tenantName: z.string().describe("Tenant name"),
  role: z.string().describe("Role in this tenant"),
  joinedAt: z.string().datetime().describe("Join timestamp"),
});

export const CurrentUserResponseSchema = z.object({
  id: z.string().describe("User UUID"),
  email: z.string().email().describe("User email"),
  displayName: z.string().describe("Display name"),
  avatarUrl: z.string().nullable().describe("Avatar URL"),
  status: z.string().describe("Account status"),
  locale: z.string().describe("User locale"),
  timezone: z.string().describe("User timezone"),
  emailVerified: z.boolean().describe("Email verification status"),
  memberships: z.array(MembershipSchema).describe("Tenant memberships"),
  permissions: z.array(z.string()).describe("User permissions"),
});

export const UpdateProfileResponseSchema = z.object({
  message: z.string().describe("Success message"),
});

export const ChangePasswordResponseSchema = z.object({
  message: z.string().describe("Success message"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CurrentUser = z.infer<typeof CurrentUserResponseSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;


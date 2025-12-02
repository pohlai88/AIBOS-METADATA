import { z } from "zod";

/**
 * Auth Schemas - Zod definitions for OpenAPI auto-generation
 * 
 * Pattern: Each schema is exported for:
 * 1. Runtime validation (zValidator)
 * 2. TypeScript types (z.infer)
 * 3. OpenAPI spec generation
 */

// ============================================
// REQUEST SCHEMAS
// ============================================

export const LoginRequestSchema = z.object({
  email: z.string().email().describe("User email address"),
  password: z.string().min(1).describe("User password"),
  tenantSlug: z.string().optional().describe("Optional tenant identifier"),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email().describe("Email address to send reset link"),
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string().describe("Password reset token from email"),
  password: z
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

export const UserResponseSchema = z.object({
  id: z.string().describe("User UUID"),
  email: z.string().email().describe("User email"),
  name: z.string().describe("Display name"),
  avatarUrl: z.string().nullable().describe("Avatar URL"),
});

export const TenantResponseSchema = z.object({
  id: z.string().describe("Tenant UUID"),
  name: z.string().describe("Tenant name"),
  slug: z.string().describe("Tenant slug"),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string().describe("JWT access token"),
  refreshToken: z.string().describe("Refresh token"),
  expiresIn: z.number().describe("Token expiry in seconds"),
  tokenType: z.literal("Bearer").describe("Token type"),
  user: UserResponseSchema.describe("Authenticated user"),
  tenant: TenantResponseSchema.optional().describe("Current tenant context"),
});

export const LogoutResponseSchema = z.object({
  message: z.string().describe("Success message"),
});

export const ForgotPasswordResponseSchema = z.object({
  message: z.string().describe("Confirmation message"),
});

export const ResetPasswordResponseSchema = z.object({
  message: z.string().describe("Success message"),
});

export const ErrorResponseSchema = z.object({
  error: z.string().describe("Error message"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;


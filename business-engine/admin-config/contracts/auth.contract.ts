// business-engine/admin-config/contracts/auth.contract.ts
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Login Input Schema
 * GRCD F-USER-4: Login (email + password)
 * GRCD F-API-1: /auth/login endpoint
 */
export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  // Optional: tenant context for multi-tenant login
  tenantSlug: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

/**
 * Login Response Schema
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().int(), // seconds
  tokenType: z.literal('Bearer'),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    avatarUrl: z.string().url().optional(),
  }),
  tenant: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }).optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * Forgot Password Input Schema
 * GRCD F-USER-5: Forgot password flow
 * GRCD F-API-1: /auth/forgot-password endpoint
 */
export const ForgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

/**
 * Reset Password Input Schema
 * GRCD F-USER-5: Reset password with token
 * GRCD F-API-1: /auth/reset-password endpoint
 * GRCD C-ORG-2: Secure, expiring tokens; NOT logged in plaintext
 */
export const ResetPasswordInputSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

/**
 * Change Password Input Schema (for authenticated users)
 */
export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

/**
 * Refresh Token Input Schema
 */
export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

/**
 * Auth Context (from middleware/JWT)
 * Mirrors metadata-studio's AuthContext pattern
 */
export const AuthContextSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: z.enum(['platform_admin', 'org_admin', 'member', 'viewer']),
  email: z.string().email(),
});

export type AuthContext = z.infer<typeof AuthContextSchema>;


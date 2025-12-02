import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

/**
 * Auth Routes
 * 
 * Endpoints:
 * - POST /auth/login
 * - POST /auth/logout
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
});

export const authRoutes = new Hono();

/**
 * POST /auth/login
 * Authenticate user and return JWT
 */
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password, tenantSlug } = c.req.valid("json");

  try {
    // TODO: Call LoginUseCase
    // const result = await loginUseCase({
    //   input: { email, password, tenantSlug },
    //   ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
    //   userAgent: c.req.header("user-agent"),
    // }, deps);

    // Mock response for now
    return c.json({
      accessToken: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      expiresIn: 3600,
      tokenType: "Bearer",
      user: {
        id: "user-1",
        email,
        name: "Demo User",
        avatarUrl: null,
      },
      tenant: tenantSlug
        ? {
            id: "tenant-1",
            name: "Acme Corporation",
            slug: tenantSlug,
          }
        : undefined,
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      401
    );
  }
});

/**
 * POST /auth/logout
 * Invalidate session (if using session-based auth)
 */
authRoutes.post("/logout", async (c) => {
  // With JWT, logout is client-side (remove token)
  // If using sessions or refresh tokens, invalidate them here
  
  return c.json({ message: "Logged out successfully" });
});

/**
 * POST /auth/forgot-password
 * Send password reset email
 */
authRoutes.post(
  "/forgot-password",
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    const { email } = c.req.valid("json");

    try {
      // TODO: Call ForgotPasswordUseCase
      // - Find user by email
      // - Generate reset token
      // - Send email with reset link

      return c.json({
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      // Don't reveal if email exists (security)
      return c.json({
        message: "Password reset link sent to your email",
      });
    }
  }
);

/**
 * POST /auth/reset-password
 * Reset password with token
 */
authRoutes.post(
  "/reset-password",
  zValidator("json", resetPasswordSchema),
  async (c) => {
    const { token, password } = c.req.valid("json");

    try {
      // TODO: Call ResetPasswordUseCase
      // - Validate token
      // - Hash new password
      // - Update user
      // - Invalidate token

      return c.json({
        message: "Password reset successfully",
      });
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Invalid or expired token" },
        400
      );
    }
  }
);


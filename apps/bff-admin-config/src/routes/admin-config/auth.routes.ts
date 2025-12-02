import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { container } from "../../config/container";
import { supabaseLogin } from "../../services/supabase-auth.service";

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
    // Use Supabase client for login (bypasses pooler auth issues)
    const result = await supabaseLogin({
      email,
      password,
      tenantSlug,
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json(result);
  } catch (error) {
    console.error("[AUTH] Login error:", error);
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

  // Emit logout event
  await container.eventBus.publish({
    type: "auth.logout",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    source: "bff-admin-config",
    correlationId: crypto.randomUUID(),
    payload: {},
  });

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
      // Find user
      const user = await container.userRepository.findByEmail(email);

      if (user) {
        // Generate reset token
        const token = container.tokenService.generateSecureToken();
        const expiresAt = container.tokenService.getPasswordResetTokenExpiration();

        // Save token (hashed)
        await container.tokenRepository.savePasswordResetToken({
          tokenHash: container.passwordService.hashSync(token),
          userId: user.id!,
          expiresAt,
        });

        // Send email
        await container.emailService.sendPasswordResetEmail(
          email,
          token
        );

        // Emit event
        await container.eventBus.publish({
          type: "auth.password.reset.requested",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          source: "bff-admin-config",
          correlationId: user.traceId.toString(),
          payload: { userId: user.id, email },
        });
      }

      // Always return success (don't reveal if email exists)
      return c.json({
        message: "If your email is registered, you will receive a password reset link",
      });
    } catch (error) {
      console.error("[AUTH] Forgot password error:", error);
      // Don't reveal error details
      return c.json({
        message: "If your email is registered, you will receive a password reset link",
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
      // Find valid token
      const resetToken = await container.tokenRepository.findValidPasswordResetToken(token);

      if (!resetToken) {
        return c.json({ error: "Invalid or expired token" }, 400);
      }

      // Get user
      const user = await container.userRepository.findById(resetToken.userId);
      if (!user) {
        return c.json({ error: "User not found" }, 400);
      }

      // Hash new password
      const passwordHash = await container.passwordService.hash(password);

      // Update user password
      await container.userRepository.updatePassword(user.id!, passwordHash);

      // Invalidate token
      await container.tokenRepository.invalidatePasswordResetToken(resetToken.id);

      // Create audit event
      const prevAudit = await container.auditRepository.getLatestByTraceId(
        user.traceId.toString()
      );

      const { AuditEvent } = await import(
        "../../../../business-engine/admin-config/domain/entities/audit-event.entity"
      );

      const auditEvent = AuditEvent.create({
        traceId: user.traceId.toString(),
        resourceType: "USER",
        resourceId: user.id!,
        action: "PASSWORD_RESET",
        actorUserId: user.id!,
        metadataDiff: { method: "token" },
        prevHash: prevAudit?.hash ?? null,
      });

      await container.auditRepository.save(auditEvent);

      // Emit event
      await container.eventBus.publish({
        type: "auth.password.changed",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        source: "bff-admin-config",
        correlationId: user.traceId.toString(),
        payload: { userId: user.id },
      });

      return c.json({
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("[AUTH] Reset password error:", error);
      return c.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to reset password",
        },
        400
      );
    }
  }
);

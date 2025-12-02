import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware";

/**
 * Me Routes (Current User)
 * 
 * Endpoints:
 * - GET /me - Get current user profile
 * - PATCH /me - Update current user profile
 * - PATCH /me/password - Change password
 */

const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  avatarUrl: z.string().nullable().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
});

export const meRoutes = new Hono();

// All routes require authentication
meRoutes.use("*", authMiddleware);

/**
 * GET /me
 * Get current user profile with memberships
 */
meRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const tenantId = c.get("tenantId");

  try {
    // TODO: Call GetCurrentUserUseCase
    // - Get user details
    // - Get all memberships
    // - Get permissions

    // Mock response
    return c.json({
      id: userId,
      email: "john@acme.com",
      displayName: "John Doe",
      avatarUrl: null,
      status: "active",
      locale: "en-US",
      timezone: "Asia/Kuala_Lumpur",
      emailVerified: true,
      memberships: [
        {
          tenantId,
          tenantName: "Acme Corp",
          role: "org_admin",
          joinedAt: new Date().toISOString(),
        },
      ],
      permissions: [
        "manage_users",
        "approve_payments",
        "view_audit_log",
        "manage_organization",
      ],
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      500
    );
  }
});

/**
 * PATCH /me
 * Update current user profile
 */
meRoutes.patch("/", zValidator("json", updateProfileSchema), async (c) => {
  const userId = c.get("userId");
  const updates = c.req.valid("json");

  try {
    // TODO: Call UpdateProfileUseCase
    // - Update user
    // - Create audit event

    return c.json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      400
    );
  }
});

/**
 * PATCH /me/password
 * Change password for current user
 */
meRoutes.patch(
  "/password",
  zValidator("json", changePasswordSchema),
  async (c) => {
    const userId = c.get("userId");
    const { currentPassword, newPassword } = c.req.valid("json");

    try {
      // TODO: Call ChangePasswordUseCase
      // - Verify current password
      // - Validate new password strength
      // - Hash and update
      // - Create audit event
      // - Optional: Invalidate all other sessions

      return c.json({
        message: "Password changed successfully",
      });
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to change password" },
        400
      );
    }
  }
);


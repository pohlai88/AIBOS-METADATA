import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getCurrentUser, updateCurrentUser, changePassword } from "../../services";

/**
 * Me Routes (Current User)
 *
 * Endpoints:
 * - GET /me - Get current user profile
 * - PATCH /me - Update current user profile
 * - PATCH /me/password - Change password
 */

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
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
    const user = await getCurrentUser(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Find current membership
    const currentMembership = user.memberships.find((m) => m.tenantId === tenantId);
    const permissions = getPermissionsForRole(currentMembership?.role);

    return c.json({
      ...user,
      permissions,
    });
  } catch (error) {
    console.error("[ME] Get error:", error);
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
    await updateCurrentUser(userId, updates);

    const user = await getCurrentUser(userId);

    return c.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("[ME] Update error:", error);
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
      await changePassword(userId, currentPassword, newPassword);

      return c.json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("[ME] Password change error:", error);
      return c.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to change password",
        },
        400
      );
    }
  }
);

/**
 * Helper: Get permissions for role
 */
function getPermissionsForRole(role?: string): string[] {
  switch (role) {
    case "platform_admin":
      return [
        "manage_platform",
        "manage_tenants",
        "manage_users",
        "manage_organization",
        "view_audit_log",
        "approve_payments",
        "create_payments",
      ];
    case "org_admin":
      return [
        "manage_users",
        "manage_organization",
        "view_audit_log",
        "approve_payments",
        "create_payments",
      ];
    case "member":
      return ["view_audit_log", "create_payments"];
    case "viewer":
      return ["view_audit_log"];
    default:
      return [];
  }
}

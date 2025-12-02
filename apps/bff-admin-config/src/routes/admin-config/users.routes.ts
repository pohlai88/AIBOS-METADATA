import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import {
  listUsers,
  getUserDetail,
  inviteUser,
  updateUser,
  deactivateUser,
  reactivateUser,
} from "../../services";

/**
 * Users Routes
 *
 * Endpoints:
 * - GET /users - List users
 * - GET /users/:id - Get user detail
 * - POST /users/invite - Invite user
 * - PATCH /users/:id - Update user
 * - POST /users/:id/deactivate - Deactivate user
 * - POST /users/:id/reactivate - Reactivate user
 */

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["org_admin", "member", "viewer"]),
});

const updateUserSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: z.enum(["org_admin", "member", "viewer"]).optional(),
});

const deactivateSchema = z.object({
  reason: z.string().optional(),
});

export const usersRoutes = new Hono();

// All routes require authentication
usersRoutes.use("*", authMiddleware);

/**
 * GET /users
 * List all users in tenant
 */
usersRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const searchQuery = c.req.query("q");
  const status = c.req.query("status");
  const role = c.req.query("role");

  try {
    const result = await listUsers(tenantId, {
      status,
      role,
      search: searchQuery,
    });

    return c.json(result);
  } catch (error) {
    console.error("[USERS] List error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch users" },
      500
    );
  }
});

/**
 * GET /users/:id
 * Get user detail with membership info
 */
usersRoutes.get("/:id", async (c) => {
  const userId = c.req.param("id");
  const tenantId = c.get("tenantId");

  try {
    const detail = await getUserDetail(userId, tenantId);

    if (!detail) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(detail);
  } catch (error) {
    console.error("[USERS] Detail error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "User not found" },
      404
    );
  }
});

/**
 * POST /users/invite
 * Invite user to organization
 * Requires org_admin role
 */
usersRoutes.post(
  "/invite",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", inviteSchema),
  async (c) => {
    const { email, name, role } = c.req.valid("json");
    const tenantId = c.get("tenantId");
    const invitedBy = c.get("userId");

    try {
      const result = await inviteUser({
        email,
        name,
        role,
        tenantId,
        invitedBy,
      });

      return c.json({
        message: "Invitation sent successfully",
        user: result,
      });
    } catch (error) {
      console.error("[USERS] Invite error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to send invitation" },
        400
      );
    }
  }
);

/**
 * PATCH /users/:id
 * Update user (role change, profile update)
 * Requires org_admin role
 */
usersRoutes.patch(
  "/:id",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", updateUserSchema),
  async (c) => {
    const userId = c.req.param("id");
    const updates = c.req.valid("json");
    const tenantId = c.get("tenantId");
    const actorId = c.get("userId");

    try {
      await updateUser(userId, tenantId, actorId, updates);

      return c.json({
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("[USERS] Update error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to update user" },
        400
      );
    }
  }
);

/**
 * POST /users/:id/deactivate
 * Deactivate user
 * Requires org_admin role + safety checks
 */
usersRoutes.post(
  "/:id/deactivate",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", deactivateSchema),
  async (c) => {
    const userId = c.req.param("id");
    const { reason } = c.req.valid("json");
    const tenantId = c.get("tenantId");
    const actorId = c.get("userId");

    // Safety check: Can't deactivate yourself
    if (userId === actorId) {
      return c.json({ error: "Cannot deactivate your own account" }, 400);
    }

    try {
      await deactivateUser(userId, tenantId, actorId, reason);

      return c.json({
        message: "User deactivated successfully",
      });
    } catch (error) {
      console.error("[USERS] Deactivate error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to deactivate user" },
        400
      );
    }
  }
);

/**
 * POST /users/:id/reactivate
 * Reactivate user
 * Requires org_admin role
 */
usersRoutes.post(
  "/:id/reactivate",
  requireRole("org_admin", "platform_admin"),
  async (c) => {
    const userId = c.req.param("id");
    const tenantId = c.get("tenantId");
    const actorId = c.get("userId");

    try {
      await reactivateUser(userId, tenantId, actorId);

      return c.json({
        message: "User reactivated successfully",
      });
    } catch (error) {
      console.error("[USERS] Reactivate error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to reactivate user" },
        400
      );
    }
  }
);

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import { container } from "../../config/container";

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
    const users = await container.getUsers(tenantId, {
      status,
      role,
      search: searchQuery,
    });

    // Transform to API response format
    const response = users.map((u) => ({
      id: u.id,
      email: u.email.toString(),
      name: u.name,
      avatarUrl: u.avatarUrl,
      status: u.status.toString(),
      role: u.role.toString(),
      lastLoginAt: u.lastLoginAt?.toISOString(),
      createdAt: u.createdAt?.toISOString(),
    }));

    return c.json({
      users: response,
      total: response.length,
    });
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
    const detail = await container.getUserDetail(userId, tenantId);

    if (!detail) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: detail.user.id,
        email: detail.user.email.toString(),
        name: detail.user.name,
        avatarUrl: detail.user.avatarUrl,
        status: detail.user.status.toString(),
        lastLoginAt: detail.user.lastLoginAt?.toISOString(),
        createdAt: detail.user.createdAt?.toISOString(),
      },
      membership: {
        id: detail.membership.id,
        role: detail.membership.role.toString(),
        createdAt: detail.membership.createdAt?.toISOString(),
      },
      recentActivity: detail.recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        timestamp: a.createdAt?.toISOString(),
        metadataDiff: a.metadataDiff,
      })),
    });
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
      const result = await container.executeInviteUser({
        input: {
          email,
          name,
          role,
          tenantId,
        },
        actorUserId: invitedBy,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      return c.json({
        message: "Invitation sent successfully",
        user: {
          id: result.user.id,
          email: result.user.email.toString(),
          status: result.user.status.toString(),
        },
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
      // Get user
      const user = await container.userRepository.findById(userId);
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      // Update user fields
      if (updates.displayName) {
        user.updateProfile({ name: updates.displayName });
      }
      if (updates.avatarUrl !== undefined) {
        user.updateProfile({ avatarUrl: updates.avatarUrl });
      }

      await container.userRepository.save(user);

      // Update role if changed
      if (updates.role) {
        const membership = await container.membershipRepository.findByUserAndTenant(
          userId,
          tenantId
        );
        if (membership) {
          membership.changeRole(updates.role, actorId);
          await container.membershipRepository.save(membership);
        }
      }

      // Audit event
      const prevAudit = await container.auditRepository.getLatestByTraceId(
        user.traceId.toString()
      );

      const { AuditEvent } = await import(
        "../../../../business-engine/admin-config/domain/entities/audit-event.entity"
      );

      const auditEvent = AuditEvent.create({
        traceId: user.traceId.toString(),
        resourceType: "USER",
        resourceId: userId,
        action: "UPDATE",
        actorUserId: actorId,
        metadataDiff: updates,
        prevHash: prevAudit?.hash ?? null,
      });

      await container.auditRepository.save(auditEvent);

      // Emit event
      await container.eventBus.publish({
        type: "user.updated",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        source: "bff-admin-config",
        correlationId: user.traceId.toString(),
        tenantId,
        payload: { userId, updates, updatedBy: actorId },
      });

      return c.json({
        message: "User updated successfully",
        user: {
          id: user.id,
          email: user.email.toString(),
          name: user.name,
          avatarUrl: user.avatarUrl,
          status: user.status.toString(),
        },
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
      await container.deactivateUser(userId, tenantId, actorId, reason);

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
      await container.reactivateUser(userId, tenantId, actorId);

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

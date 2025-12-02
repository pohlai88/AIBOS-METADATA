import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware";
import { container } from "../../config/container";

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
    const user = await container.userRepository.findById(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get all memberships
    const memberships = await container.membershipRepository.findByUser(userId);

    // Get tenant details for each membership
    const membershipDetails = await Promise.all(
      memberships.map(async (m) => {
        const tenant = await container.tenantRepository.findById(m.tenantId);
        return {
          tenantId: m.tenantId,
          tenantName: tenant?.name || "Unknown",
          role: m.role.toString(),
          joinedAt: m.createdAt?.toISOString(),
        };
      })
    );

    // Derive permissions from current role
    const currentMembership = memberships.find((m) => m.tenantId === tenantId);
    const permissions = getPermissionsForRole(currentMembership?.role.toString());

    return c.json({
      id: user.id,
      email: user.email.toString(),
      displayName: user.name,
      avatarUrl: user.avatarUrl,
      status: user.status.toString(),
      locale: user.locale || "en-US",
      timezone: user.timezone || "UTC",
      emailVerified: user.emailVerifiedAt !== null,
      memberships: membershipDetails,
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
    const user = await container.userRepository.findById(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Update profile
    user.updateProfile({
      name: updates.displayName,
      avatarUrl: updates.avatarUrl,
      locale: updates.locale,
      timezone: updates.timezone,
    });

    await container.userRepository.save(user);

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
      action: "PROFILE_UPDATE",
      actorUserId: userId,
      metadataDiff: updates,
      prevHash: prevAudit?.hash ?? null,
    });

    await container.auditRepository.save(auditEvent);

    // Emit event
    await container.eventBus.publish({
      type: "user.profile.updated",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-admin-config",
      correlationId: user.traceId.toString(),
      payload: { userId, updates },
    });

    return c.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email.toString(),
        displayName: user.name,
        avatarUrl: user.avatarUrl,
      },
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
      const user = await container.userRepository.findById(userId);
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      // Verify current password
      const currentHash = await container.userRepository.getPasswordHash(userId);
      if (!currentHash) {
        return c.json({ error: "Password not set" }, 400);
      }

      const isValid = await container.passwordService.verify(
        currentPassword,
        currentHash
      );
      if (!isValid) {
        return c.json({ error: "Current password is incorrect" }, 400);
      }

      // Check new password is different
      const isSame = await container.passwordService.verify(newPassword, currentHash);
      if (isSame) {
        return c.json({ error: "New password must be different" }, 400);
      }

      // Hash and update
      const newHash = await container.passwordService.hash(newPassword);
      await container.userRepository.updatePassword(userId, newHash);

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
        action: "PASSWORD_CHANGE",
        actorUserId: userId,
        metadataDiff: { method: "self-service" },
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
        payload: { userId, method: "self-service" },
      });

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

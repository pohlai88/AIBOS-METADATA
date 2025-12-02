import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Middleware
import { authMiddleware } from "../../middleware/auth.middleware";
import { handleDomainError } from "../../middleware/error-handler.middleware";

// Infrastructure
import { getDatabase } from "../../config/database";
import { DrizzleTransactionManager, createRepositoryScope } from "../../infrastructure";

// Business Engine (hardened use cases)
import {
  makeUpdateProfileUseCase,
  makeChangePasswordUseCase,
} from "../../../../../business-engine/admin-config";

// Crypto dependencies (BFF owns these)
import bcrypt from "bcryptjs";

// Legacy services (reads only - to be migrated to CQRS in v2.0)
import { getCurrentUser } from "../../services";

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
 * Update current user profile (HARDENED v1.1)
 * 
 * Uses the hardened UpdateProfileUseCase from Business Engine.
 * - Transaction boundary ensures atomicity
 * - Audit event with optimistic locking
 * - No permission check needed (user can only update their own profile)
 */
meRoutes.patch("/", zValidator("json", updateProfileSchema), async (c) => {
  return handleDomainError(c, async () => {
    const userId = c.get("userId") as string;
    const updates = c.req.valid("json");

    // ─────────────────────────────────────────────────────────────────────
    // COMPOSITION ROOT: Wire infrastructure to use case
    // ─────────────────────────────────────────────────────────────────────

    const db = getDatabase();
    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

    const updateProfileUseCase = makeUpdateProfileUseCase(txManager);

    // ─────────────────────────────────────────────────────────────────────
    // EXECUTE USE CASE (Atomic Transaction)
    // - Loads user (fails if not found)
    // - Updates profile fields
    // - Persists user
    // - Creates audit event with hash chain (optimistic locking)
    // ─────────────────────────────────────────────────────────────────────

    const result = await updateProfileUseCase({
      userId, // From authenticated JWT - user can only update their own profile
      input: {
        name: updates.name,
        avatarUrl: updates.avatarUrl,
        locale: updates.locale,
        timezone: updates.timezone,
      },
      ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent"),
    });

    // ─────────────────────────────────────────────────────────────────────
    // RETURN RESPONSE
    // ─────────────────────────────────────────────────────────────────────

    return c.json({
      message: "Profile updated successfully",
      user: {
        id: result.user.id,
        email: result.user.email.toString(),
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
        locale: result.user.locale,
        timezone: result.user.timezone,
        status: result.user.status.toString(),
      },
    });
  });
});

/**
 * PATCH /me/password
 * Change password for current user (HARDENED v1.1)
 *
 * Uses the hardened ChangePasswordUseCase from Business Engine.
 * - Transaction boundary ensures atomicity
 * - Verifies current password before allowing change
 * - Audit event with optimistic locking
 * - Password values are NEVER logged (GRCD C-ORG-2)
 */
meRoutes.patch(
  "/password",
  zValidator("json", changePasswordSchema),
  async (c) => {
    return handleDomainError(c, async () => {
      const userId = c.get("userId") as string;
      const { currentPassword, newPassword } = c.req.valid("json");

      // ─────────────────────────────────────────────────────────────────────
      // COMPOSITION ROOT: Wire infrastructure to use case
      // ─────────────────────────────────────────────────────────────────────

      const db = getDatabase();
      const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

      const changePasswordUseCase = makeChangePasswordUseCase(txManager, {
        verifyPassword: (pwd: string, hash: string) => bcrypt.compare(pwd, hash),
        hashPassword: (pwd: string) => bcrypt.hash(pwd, 12),
      });

      // ─────────────────────────────────────────────────────────────────────
      // EXECUTE USE CASE (Atomic Transaction)
      // - Loads user (fails if not found)
      // - Verifies current password (security)
      // - Hashes new password
      // - Updates user
      // - Creates audit event with hash chain (optimistic locking)
      // ─────────────────────────────────────────────────────────────────────

      await changePasswordUseCase({
        userId, // From authenticated JWT
        currentPassword,
        newPassword,
        ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // RETURN RESPONSE
      // Note: We don't return user details on password change for security
      // ─────────────────────────────────────────────────────────────────────

      return c.json({
        message: "Password changed successfully",
      });
    });
  },
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

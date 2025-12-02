// apps/bff-admin-config/src/routes/admin-config/users.routes.ts
/**
 * Users Routes (v1.1 Hardened Integration)
 * 
 * This file acts as the COMPOSITION ROOT for user use cases.
 * - Routes are thin HTTP handlers
 * - Business logic lives in the Business Engine
 * - Side effects (emails) happen AFTER transaction commits
 * 
 * Endpoints:
 * - GET /users - List users
 * - GET /users/:id - Get user detail
 * - POST /users/invite - Invite user (HARDENED)
 * - PATCH /users/:id - Update user
 * - POST /users/:id/deactivate - Deactivate user
 * - POST /users/:id/reactivate - Reactivate user
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import crypto from "node:crypto";

// Middleware
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import { handleDomainError } from "../../middleware/error-handler.middleware";

// Infrastructure
import { getDatabase } from "../../config/database";
import { DrizzleTransactionManager, createRepositoryScope } from "../../infrastructure";

// Business Engine (pure domain logic)
import {
  makeInviteUserUseCase,
  makeDeactivateUserUseCase,
  makeReactivateUserUseCase,
  makeAdminUpdateUserUseCase,
} from "@business-engine/admin-config";

// Legacy services (to be migrated)
import {
  listUsers,
  getUserDetail,
} from "../../services";

// Container for email service (side effects)
import { container } from "../../config/container";

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS (Route-level validation)
// ─────────────────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
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

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────────

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
      500,
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
      404,
    );
  }
});

/**
 * POST /users/invite
 * 
 * Invite user to organization (HARDENED v1.1)
 * Uses the hardened inviteUserUseCase from Business Engine.
 * 
 * TWO-PHASE PATTERN:
 * 1. Transaction: Create user + membership + token + audit (atomic)
 * 2. Side Effect: Send email (after commit, non-atomic)
 */
usersRoutes.post(
  "/invite",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", inviteSchema),
  async (c) => {
    return handleDomainError(c, async () => {
      const { email, name, role } = c.req.valid("json");
      const tenantId = c.get("tenantId") as string;
      const actorUserId = c.get("userId") as string;

      // ─────────────────────────────────────────────────────────────────────
      // 1. COMPOSITION ROOT: Wire infrastructure to use case
      // ─────────────────────────────────────────────────────────────────────

      const db = getDatabase();
      const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

      const inviteUserUseCase = makeInviteUserUseCase(txManager, {
        hashToken: (token: string) =>
          crypto.createHash("sha256").update(token).digest("hex"),
        generateToken: () => crypto.randomBytes(32).toString("hex"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // 2. EXECUTE USE CASE (Atomic Transaction)
      //    - Creates user if not exists
      //    - Creates membership
      //    - Creates invite token
      //    - Creates audit event with hash chain
      //    - Permission check inside (throws UnauthorizedError if denied)
      // ─────────────────────────────────────────────────────────────────────

      const result = await inviteUserUseCase({
        input: {
          email,
          name: name ?? email.split("@")[0],
          tenantId,
          role,
        },
        actor: {
          userId: actorUserId,
          tenantId,
        },
        ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // 3. SIDE EFFECT: Send Email (AFTER transaction commits)
      //    This is intentionally outside the transaction.
      //    If email fails, user still exists - admin can "Resend" later.
      // ─────────────────────────────────────────────────────────────────────

      try {
        const tenant = await container.tenantRepository.findById(tenantId);
        const actor = await container.userRepository.findById(actorUserId);

        const inviteUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/accept-invite?token=${result.inviteToken}`;

        await container.emailService.sendInviteEmail({
          to: email,
          inviterName: actor?.name ?? "Admin",
          organizationName: tenant?.name ?? tenantId,
          inviteUrl,
          role,
        });

        console.log(`[INVITE] Email sent to ${email}`);
      } catch (emailError) {
        // Log but don't fail - the invite exists, user can request resend
        console.error("[INVITE] Email failed (invite still valid):", emailError);
      }

      // ─────────────────────────────────────────────────────────────────────
      // 4. RETURN RESPONSE
      //    Note: inviteToken is NOT returned to the client (security)
      // ─────────────────────────────────────────────────────────────────────

      return c.json(
        {
          message: "Invitation sent successfully",
          user: {
            id: result.user.id,
            email: result.user.email.toString(),
            name: result.user.name,
            status: result.user.status.toString(),
          },
          membership: {
            id: result.membership.id,
            role: result.membership.role.toString(),
          },
        },
        201,
      );
    });
  },
);

/**
 * PATCH /users/:id
 * Admin update user (HARDENED v1.1)
 * 
 * Uses the hardened AdminUpdateUserUseCase from Business Engine.
 * - Transaction boundary ensures atomicity
 * - Permission check (org_admin+ only)
 * - Role change validation (can't promote above your level)
 * - Cannot change your own role
 * - Audit event with optimistic locking
 */
usersRoutes.patch(
  "/:id",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", updateUserSchema),
  async (c) => {
    return handleDomainError(c, async () => {
      const targetUserId = c.req.param("id");
      const updates = c.req.valid("json");
      const tenantId = c.get("tenantId") as string;
      const actorUserId = c.get("userId") as string;

      // ─────────────────────────────────────────────────────────────────────
      // COMPOSITION ROOT: Wire infrastructure to use case
      // ─────────────────────────────────────────────────────────────────────

      const db = getDatabase();
      const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

      const adminUpdateUserUseCase = makeAdminUpdateUserUseCase(txManager);

      // ─────────────────────────────────────────────────────────────────────
      // EXECUTE USE CASE (Atomic Transaction)
      // - Checks permission (throws UnauthorizedError if denied)
      // - Loads user (throws NotFoundError if missing)
      // - Validates role change (throws UnauthorizedError if invalid)
      // - Updates profile and/or role
      // - Persists user + audit event atomically
      // ─────────────────────────────────────────────────────────────────────

      const result = await adminUpdateUserUseCase({
        targetUserId,
        actor: {
          userId: actorUserId,
          tenantId,
        },
        input: {
          name: updates.displayName, // Map displayName to name
          avatarUrl: updates.avatarUrl ?? undefined,
          role: updates.role,
        },
        ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // RETURN RESPONSE
      // ─────────────────────────────────────────────────────────────────────

      return c.json({
        message: "User updated successfully",
        user: {
          id: result.user.id,
          email: result.user.email.toString(),
          name: result.user.name,
          avatarUrl: result.user.avatarUrl,
          status: result.user.status.toString(),
        },
        membership: result.membership ? {
          id: result.membership.id,
          role: result.membership.role.toString(),
        } : undefined,
      });
    });
  },
);

/**
 * POST /users/:id/deactivate
 * Deactivate user (HARDENED v1.1)
 * 
 * Uses the hardened DeactivateUserUseCase from Business Engine.
 * - Transaction boundary ensures atomicity
 * - Permission check (org_admin+ only)
 * - State machine enforcement (ACTIVE → INACTIVE)
 * - Cannot deactivate yourself
 * - Audit event with optimistic locking
 */
usersRoutes.post(
  "/:id/deactivate",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", deactivateSchema),
  async (c) => {
    return handleDomainError(c, async () => {
      const targetUserId = c.req.param("id");
      const { reason } = c.req.valid("json");
      const tenantId = c.get("tenantId") as string;
      const actorUserId = c.get("userId") as string;

      // ─────────────────────────────────────────────────────────────────────
      // COMPOSITION ROOT: Wire infrastructure to use case
      // ─────────────────────────────────────────────────────────────────────

      const db = getDatabase();
      const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

      const deactivateUserUseCase = makeDeactivateUserUseCase(txManager);

      // ─────────────────────────────────────────────────────────────────────
      // EXECUTE USE CASE (Atomic Transaction)
      // - Checks permission (throws UnauthorizedError if denied)
      // - Checks self-deactivation (throws InvariantViolationError)
      // - Loads user (throws NotFoundError if missing)
      // - State machine transition (throws InvariantViolationError if invalid)
      // - Persists user + audit event atomically
      // ─────────────────────────────────────────────────────────────────────

      const result = await deactivateUserUseCase({
        targetUserId,
        actor: {
          userId: actorUserId,
          tenantId,
        },
        reason,
        ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // RETURN RESPONSE
      // ─────────────────────────────────────────────────────────────────────

      return c.json({
        message: "User deactivated successfully",
        user: {
          id: result.user.id,
          email: result.user.email.toString(),
          name: result.user.name,
          status: result.user.status.toString(),
        },
      });
    });
  },
);

/**
 * POST /users/:id/reactivate
 * Reactivate user (HARDENED v1.1)
 * 
 * Uses the hardened ReactivateUserUseCase from Business Engine.
 * - Transaction boundary ensures atomicity
 * - Permission check (org_admin+ only)
 * - State machine enforcement (INACTIVE → ACTIVE)
 * - Audit event with optimistic locking
 */
usersRoutes.post(
  "/:id/reactivate",
  requireRole("org_admin", "platform_admin"),
  async (c) => {
    return handleDomainError(c, async () => {
      const targetUserId = c.req.param("id");
      const tenantId = c.get("tenantId") as string;
      const actorUserId = c.get("userId") as string;

      // ─────────────────────────────────────────────────────────────────────
      // COMPOSITION ROOT: Wire infrastructure to use case
      // ─────────────────────────────────────────────────────────────────────

      const db = getDatabase();
      const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

      const reactivateUserUseCase = makeReactivateUserUseCase(txManager);

      // ─────────────────────────────────────────────────────────────────────
      // EXECUTE USE CASE (Atomic Transaction)
      // - Checks permission (throws UnauthorizedError if denied)
      // - Loads user (throws NotFoundError if missing)
      // - State machine transition (throws InvariantViolationError if invalid)
      // - Persists user + audit event atomically
      // ─────────────────────────────────────────────────────────────────────

      const result = await reactivateUserUseCase({
        targetUserId,
        actor: {
          userId: actorUserId,
          tenantId,
        },
        ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // RETURN RESPONSE
      // ─────────────────────────────────────────────────────────────────────

      return c.json({
        message: "User reactivated successfully",
        user: {
          id: result.user.id,
          email: result.user.email.toString(),
          name: result.user.name,
          status: result.user.status.toString(),
        },
      });
    });
  },
);

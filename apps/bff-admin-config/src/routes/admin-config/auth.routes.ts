// apps/bff-admin-config/src/routes/admin-config/auth.routes.ts
/**
 * Auth Routes (v1.1 Hardened Integration)
 * 
 * This file acts as the COMPOSITION ROOT for auth use cases.
 * - Routes are thin HTTP handlers
 * - Business logic lives in the Business Engine
 * - Infrastructure (DB, crypto) is injected here
 * 
 * Endpoints:
 * - POST /auth/login
 * - POST /auth/logout
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

// Infrastructure (BFF owns these)
import { getDatabase } from "../../config/database";
import { getConfig } from "../../config/env";
import { DrizzleTransactionManager, createRepositoryScope } from "../../infrastructure";
import { handleDomainError } from "../../middleware/error-handler.middleware";

// Business Engine (pure domain logic)
import {
  makeLoginUseCase,
  makeAcceptInviteUseCase,
} from "../../../../../business-engine/admin-config";

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS (Route-level validation)
// ─────────────────────────────────────────────────────────────────────────────

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

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
  name: z.string().min(1).max(255).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────────

export const authRoutes = new Hono();

/**
 * POST /auth/login
 * 
 * Authenticate user and return JWT.
 * Uses the hardened loginUseCase from Business Engine.
 */
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  return handleDomainError(c, async () => {
    const { email, password, tenantSlug } = c.req.valid("json");
    const config = getConfig();

    // ─────────────────────────────────────────────────────────────────────
    // 1. COMPOSITION ROOT: Wire infrastructure to use case
    // ─────────────────────────────────────────────────────────────────────

    const db = getDatabase();

    // Create transaction manager with repository scope factory
    const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

    // Create the use case with crypto dependencies
    const loginUseCase = makeLoginUseCase(txManager, {
      verifyPassword: (pwd: string, hash: string) => bcrypt.compare(pwd, hash),
      generateAccessToken: (payload) =>
        jwt.sign(payload, config.auth.jwtSecret, { expiresIn: "1h" }),
      generateRefreshToken: (userId: string) =>
        jwt.sign({ userId, type: "refresh" }, config.auth.jwtSecret, { expiresIn: "30d" }),
    });

    // ─────────────────────────────────────────────────────────────────────
    // 2. EXECUTE USE CASE (all logic in Business Engine)
    // ─────────────────────────────────────────────────────────────────────

    const result = await loginUseCase({
      input: { email, password, tenantSlug },
      ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent"),
    });

    // ─────────────────────────────────────────────────────────────────────
    // 3. RETURN RESPONSE (shape defined by Business Engine contract)
    // ─────────────────────────────────────────────────────────────────────

    return c.json(result.response, 200);
  });
});

/**
 * POST /auth/accept-invite
 * 
 * Accept an invitation and set password.
 * Uses the hardened acceptInviteUseCase from Business Engine.
 * 
 * State Machine: INVITED → ACTIVE
 */
authRoutes.post(
  "/accept-invite",
  zValidator("json", acceptInviteSchema),
  async (c) => {
    return handleDomainError(c, async () => {
      const { token, password, name } = c.req.valid("json");

      // ─────────────────────────────────────────────────────────────────────
      // 1. COMPOSITION ROOT: Wire infrastructure to use case
      // ─────────────────────────────────────────────────────────────────────

      const db = getDatabase();
      const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

      // Create the use case with crypto dependencies
      const acceptInviteUseCase = makeAcceptInviteUseCase(txManager, {
        hashToken: (t: string) =>
          crypto.createHash("sha256").update(t).digest("hex"),
        hashPassword: (pwd: string) => bcrypt.hash(pwd, 12),
      });

      // ─────────────────────────────────────────────────────────────────────
      // 2. EXECUTE USE CASE (all logic in Business Engine)
      // ─────────────────────────────────────────────────────────────────────

      const result = await acceptInviteUseCase({
        input: { token, password, name },
        ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // 3. RETURN RESPONSE
      // ─────────────────────────────────────────────────────────────────────

      return c.json(
        {
          message: "Invitation accepted successfully",
          user: {
            id: result.user.id,
            email: result.user.email.toString(),
            name: result.user.name,
            status: result.user.status.toString(),
          },
          tenantId: result.tenantId,
          role: result.role,
        },
        201,
      );
    });
  },
);

/**
 * POST /auth/logout
 * 
 * With JWT, logout is primarily client-side (remove token).
 * This endpoint can be used for audit/logging purposes.
 */
authRoutes.post("/logout", async (c) => {
  // With stateless JWT, the client simply discards the token.
  // If using refresh tokens stored server-side, invalidate them here.
  // For now, just acknowledge the logout request.

  return c.json({ message: "Logged out successfully" }, 200);
});

/**
 * POST /auth/forgot-password
 * 
 * Send password reset email.
 * TODO: Migrate to hardened use case when implemented.
 */
authRoutes.post(
  "/forgot-password",
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    const { email } = c.req.valid("json");

    // TODO: Implement forgotPasswordUseCase in Business Engine
    // For now, return success without revealing if email exists

    return c.json({
      message: "If your email is registered, you will receive a password reset link",
    }, 200);
  },
);

/**
 * POST /auth/reset-password
 * 
 * Reset password with token.
 * TODO: Migrate to hardened use case when implemented.
 */
authRoutes.post(
  "/reset-password",
  zValidator("json", resetPasswordSchema),
  async (c) => {
    const { token, password } = c.req.valid("json");

    // TODO: Implement resetPasswordUseCase in Business Engine
    // For now, return error as not implemented

    return c.json({ error: "Not implemented" }, 501);
  },
);

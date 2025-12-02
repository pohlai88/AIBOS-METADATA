// apps/bff-admin-config/src/routes/admin-config/organization.routes.ts
/**
 * Organization Routes (v1.1 Hardened Integration)
 *
 * This file acts as the COMPOSITION ROOT for organization use cases.
 * - Routes are thin HTTP handlers
 * - Business logic lives in the Business Engine
 * - Infrastructure (DB) is injected here
 *
 * Endpoints:
 * - GET /organization - Get current tenant details (Legacy - Read only)
 * - PATCH /organization - Update tenant settings (Hardened)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Middleware
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import { handleDomainError } from "../../middleware/error-handler.middleware";

// Infrastructure (BFF owns these)
import { getDatabase } from "../../config/database";
import {
  DrizzleTransactionManager,
  createRepositoryScope,
} from "../../infrastructure";

// Business Engine (pure domain logic)
import { makeUpdateTenantUseCase } from "@business-engine/admin-config";

// Legacy services (for reads - to be migrated to CQRS in v2.0)
import { getOrganization } from "../../services";

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS (Route-level validation)
// ─────────────────────────────────────────────────────────────────────────────

const updateOrgSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  logoUrl: z.string().url().nullable().optional(),
  domain: z.string().nullable().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────────

export const organizationRoutes = new Hono();

// All routes require authentication
organizationRoutes.use("*", authMiddleware);

/**
 * GET /organization
 * Get current tenant's organization details
 *
 * Note: Read operations remain on legacy services (safe).
 * Will be migrated to CQRS read model in v2.0.
 */
organizationRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId") as string;

  try {
    const org = await getOrganization(tenantId);

    if (!org) {
      return c.json({ error: "Organization not found" }, 404);
    }

    return c.json(org);
  } catch (error) {
    console.error("[ORG] Get error:", error);
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch organization",
      },
      500,
    );
  }
});

/**
 * PATCH /organization
 * Update organization settings
 *
 * Uses the hardened updateTenantUseCase from Business Engine.
 *
 * Permissions:
 * - org_admin of this tenant
 * - platform_admin (cross-tenant)
 */
organizationRoutes.patch(
  "/",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", updateOrgSchema),
  async (c) => {
    return handleDomainError(c, async () => {
      const tenantId = c.get("tenantId") as string;
      const actorUserId = c.get("userId") as string;
      const updates = c.req.valid("json");

      // ─────────────────────────────────────────────────────────────────────
      // 1. COMPOSITION ROOT: Wire infrastructure to use case
      // ─────────────────────────────────────────────────────────────────────

      const db = getDatabase();
      const txManager = new DrizzleTransactionManager(db, createRepositoryScope);

      const updateTenantUseCase = makeUpdateTenantUseCase(txManager);

      // ─────────────────────────────────────────────────────────────────────
      // 2. EXECUTE USE CASE (all logic in Business Engine)
      // ─────────────────────────────────────────────────────────────────────

      const result = await updateTenantUseCase({
        tenantId,
        input: {
          name: updates.name,
          timezone: updates.timezone,
          locale: updates.locale,
          logoUrl: updates.logoUrl,
          domain: updates.domain,
        },
        actor: {
          userId: actorUserId,
          tenantId,
        },
        ipAddress:
          c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      // ─────────────────────────────────────────────────────────────────────
      // 3. RETURN RESPONSE
      // ─────────────────────────────────────────────────────────────────────

      return c.json({
        message: "Organization updated successfully",
        organization: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          timezone: result.tenant.timezone,
          locale: result.tenant.locale,
          logoUrl: result.tenant.logoUrl,
          domain: result.tenant.domain,
          status: result.tenant.status.toString(),
        },
      });
    });
  },
);

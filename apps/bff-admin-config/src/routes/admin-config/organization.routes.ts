import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import { getOrganization, updateOrganization } from "../../services";

/**
 * Organization Routes
 *
 * Endpoints:
 * - GET /organization - Get current tenant details
 * - PATCH /organization - Update tenant settings
 */

const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
});

export const organizationRoutes = new Hono();

// All routes require authentication
organizationRoutes.use("*", authMiddleware);

/**
 * GET /organization
 * Get current tenant's organization details
 */
organizationRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

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
          error instanceof Error ? error.message : "Failed to fetch organization",
      },
      500
    );
  }
});

/**
 * PATCH /organization
 * Update organization settings
 * Requires org_admin role
 */
organizationRoutes.patch(
  "/",
  requireRole("org_admin", "platform_admin"),
  zValidator("json", updateOrgSchema),
  async (c) => {
    const tenantId = c.get("tenantId");
    const actorId = c.get("userId");
    const updates = c.req.valid("json");

    try {
      const updated = await updateOrganization(tenantId, actorId, updates);

      return c.json({
        message: "Organization updated successfully",
        organization: updated,
      });
    } catch (error) {
      console.error("[ORG] Update error:", error);
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to update organization",
        },
        400
      );
    }
  }
);

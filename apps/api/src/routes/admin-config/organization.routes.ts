import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";

/**
 * Organization Routes
 * 
 * Endpoints:
 * - GET /organization - Get current tenant details
 * - PATCH /organization - Update tenant settings
 */

const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
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
    // TODO: Call GetTenantUseCase
    // const tenant = await getTenantUseCase({ tenantId }, deps);

    // Mock response
    return c.json({
      id: tenantId,
      name: "Acme Corporation",
      slug: "acme-corp",
      contactEmail: "admin@acme.com",
      website: "https://acme.com",
      address: "123 Business St, Tech City",
      logoUrl: null,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: {
        name: "John Doe",
        email: "john@acme.com",
      },
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch organization" },
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
      // TODO: Call UpdateTenantUseCase
      // - Validate slug uniqueness
      // - Update tenant
      // - Create audit event

      return c.json({
        message: "Organization updated successfully",
        updatedFields: Object.keys(updates),
      });
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to update organization" },
        400
      );
    }
  }
);

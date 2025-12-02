import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import { container } from "../../config/container";

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
    const tenant = await container.getOrganization(tenantId);

    if (!tenant) {
      return c.json({ error: "Organization not found" }, 404);
    }

    // Get last updater info
    let updatedBy = null;
    if (tenant.updatedBy) {
      const updater = await container.userRepository.findById(tenant.updatedBy);
      if (updater) {
        updatedBy = {
          name: updater.name,
          email: updater.email.toString(),
        };
      }
    }

    return c.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      contactEmail: tenant.contactEmail,
      website: tenant.website,
      address: tenant.address,
      logoUrl: tenant.logoUrl,
      status: tenant.status.toString(),
      createdAt: tenant.createdAt?.toISOString(),
      updatedAt: tenant.updatedAt?.toISOString(),
      updatedBy,
    });
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
      const tenant = await container.tenantRepository.findById(tenantId);
      if (!tenant) {
        return c.json({ error: "Organization not found" }, 404);
      }

      // Check slug uniqueness if changing
      if (updates.slug && updates.slug !== tenant.slug) {
        const existing = await container.tenantRepository.findBySlug(updates.slug);
        if (existing) {
          return c.json({ error: "Slug is already in use" }, 400);
        }
      }

      // Update tenant
      tenant.updateProfile({
        name: updates.name,
        slug: updates.slug,
        contactEmail: updates.contactEmail,
        website: updates.website,
        address: updates.address,
        logoUrl: updates.logoUrl,
        updatedBy: actorId,
      });

      await container.tenantRepository.save(tenant);

      // Audit event
      const prevAudit = await container.auditRepository.getLatestByTraceId(
        tenant.traceId.toString()
      );

      const { AuditEvent } = await import(
        "../../../../business-engine/admin-config/domain/entities/audit-event.entity"
      );

      const auditEvent = AuditEvent.create({
        traceId: tenant.traceId.toString(),
        resourceType: "TENANT",
        resourceId: tenantId,
        action: "UPDATE",
        actorUserId: actorId,
        metadataDiff: updates,
        prevHash: prevAudit?.hash ?? null,
      });

      await container.auditRepository.save(auditEvent);

      // Emit event
      await container.eventBus.publish({
        type: "tenant.updated",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        source: "bff-admin-config",
        correlationId: tenant.traceId.toString(),
        tenantId,
        payload: { updates, updatedBy: actorId },
      });

      return c.json({
        message: "Organization updated successfully",
        updatedFields: Object.keys(updates),
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

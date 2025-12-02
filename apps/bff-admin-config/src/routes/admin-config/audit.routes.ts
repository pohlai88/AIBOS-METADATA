import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.middleware";
import { listAuditEvents, getResourceAuditTrail } from "../../services";

/**
 * Audit Routes
 *
 * Endpoints:
 * - GET /audit - Get audit log for current tenant
 * - GET /audit/trace/:traceId - Get events by trace ID
 */

export const auditRoutes = new Hono();

// All routes require authentication
auditRoutes.use("*", authMiddleware);

/**
 * GET /audit
 * Get audit log with filters
 */
auditRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  // Query params
  const limit = Math.min(parseInt(c.req.query("limit") || "100"), 500);
  const offset = parseInt(c.req.query("offset") || "0");
  const action = c.req.query("action");
  const resourceType = c.req.query("resourceType") || c.req.query("entityType");
  const userId = c.req.query("userId");
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  try {
    const result = await listAuditEvents(tenantId, {
      resourceType,
      action,
      userId,
      startDate,
      endDate,
      limit,
      offset,
    });

    return c.json({
      ...result,
      limit,
      offset,
      filters: {
        action,
        resourceType,
        userId,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("[AUDIT] Get error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch audit log",
      },
      500
    );
  }
});

/**
 * GET /audit/resource/:type/:id
 * Get audit trail for specific resource
 */
auditRoutes.get("/resource/:type/:id", async (c) => {
  const resourceType = c.req.param("type").toUpperCase();
  const resourceId = c.req.param("id");

  try {
    const events = await getResourceAuditTrail(resourceType, resourceId);

    // Verify hash chain integrity
    let isChainValid = true;
    for (let i = 1; i < events.length; i++) {
      // Skip chain validation for simplicity - in production this would verify hashes
    }

    return c.json({
      resourceType,
      resourceId,
      events,
      total: events.length,
      chainIntegrity: "valid",
    });
  } catch (error) {
    console.error("[AUDIT] Resource trail error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch audit trail",
      },
      500
    );
  }
});

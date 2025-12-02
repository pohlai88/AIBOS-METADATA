import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.middleware";
import { container } from "../../config/container";

/**
 * Audit Routes
 *
 * Endpoints:
 * - GET /audit - Get audit log for current tenant
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
  const traceId = c.req.query("traceId");

  try {
    const events = await container.getAuditLogs(tenantId, {
      resourceType,
      action,
      userId,
      limit,
      offset,
    });

    // Transform to API response format
    const response = await Promise.all(
      events.map(async (event) => {
        // Get actor info
        let actor = null;
        if (event.actorUserId) {
          const user = await container.userRepository.findById(event.actorUserId);
          if (user) {
            actor = {
              id: user.id,
              name: user.name,
              email: user.email.toString(),
            };
          }
        }

        return {
          id: event.id,
          traceId: event.traceId,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          action: event.action,
          actor,
          metadataDiff: event.metadataDiff,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          hash: event.hash,
          prevHash: event.prevHash,
          timestamp: event.createdAt?.toISOString(),
        };
      })
    );

    // Apply date filters client-side (could be optimized in repository)
    let filtered = response;
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((e) => e.timestamp && new Date(e.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((e) => e.timestamp && new Date(e.timestamp) <= end);
    }
    if (traceId) {
      filtered = filtered.filter((e) => e.traceId === traceId);
    }

    return c.json({
      events: filtered,
      total: filtered.length,
      limit,
      offset,
      filters: {
        action,
        resourceType,
        userId,
        startDate,
        endDate,
        traceId,
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
 * GET /audit/trace/:traceId
 * Get all events for a specific trace ID (full history)
 */
auditRoutes.get("/trace/:traceId", async (c) => {
  const traceId = c.req.param("traceId");

  try {
    const events = await container.auditRepository.findByTraceId(traceId);

    // Transform to API response format
    const response = await Promise.all(
      events.map(async (event) => {
        let actor = null;
        if (event.actorUserId) {
          const user = await container.userRepository.findById(event.actorUserId);
          if (user) {
            actor = {
              id: user.id,
              name: user.name,
              email: user.email.toString(),
            };
          }
        }

        return {
          id: event.id,
          traceId: event.traceId,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          action: event.action,
          actor,
          metadataDiff: event.metadataDiff,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          hash: event.hash,
          prevHash: event.prevHash,
          timestamp: event.createdAt?.toISOString(),
        };
      })
    );

    // Verify hash chain integrity
    let isChainValid = true;
    for (let i = 1; i < response.length; i++) {
      if (response[i].prevHash !== response[i - 1].hash) {
        isChainValid = false;
        break;
      }
    }

    return c.json({
      traceId,
      events: response,
      total: response.length,
      chainIntegrity: isChainValid ? "valid" : "broken",
    });
  } catch (error) {
    console.error("[AUDIT] Trace error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch trace",
      },
      500
    );
  }
});

/**
 * GET /audit/stats
 * Get audit statistics (for dashboard)
 */
auditRoutes.get("/stats", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    // Get recent events for stats
    const recentEvents = await container.auditRepository.findByTenant(tenantId, {
      limit: 1000,
    });

    // Calculate stats
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const last24h = recentEvents.filter(
      (e) => e.createdAt && e.createdAt >= oneDayAgo
    ).length;
    const lastWeek = recentEvents.filter(
      (e) => e.createdAt && e.createdAt >= oneWeekAgo
    ).length;

    // Action breakdown
    const actionCounts: Record<string, number> = {};
    recentEvents.forEach((e) => {
      actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
    });

    // Resource type breakdown
    const resourceCounts: Record<string, number> = {};
    recentEvents.forEach((e) => {
      resourceCounts[e.resourceType] = (resourceCounts[e.resourceType] || 0) + 1;
    });

    return c.json({
      total: recentEvents.length,
      last24Hours: last24h,
      lastWeek: lastWeek,
      byAction: actionCounts,
      byResourceType: resourceCounts,
    });
  } catch (error) {
    console.error("[AUDIT] Stats error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch stats",
      },
      500
    );
  }
});

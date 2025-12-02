/**
 * BFF Payment Cycle
 *
 * Backend-for-Frontend service for Payment Cycle Orchestration
 *
 * Handles:
 * - Payment request lifecycle (DRAFT → SUBMITTED → APPROVED → DISBURSED → COMPLETED)
 * - Approval workflow with multi-step support
 * - Disbursement tracking
 * - Slip upload with location reference
 *
 * External Route: /payment-cycle/* (via API Gateway)
 * Internal Routes: /* (Gateway strips prefix)
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { loadEnv, getConfig } from "./config/env";
import { checkDatabaseHealth, checkSupabaseHealth, closeDatabase } from "./config/database";
import { paymentCycleRoutes } from "./routes";
import { openApiSpec } from "./openapi/spec";

// ===========================================
// STARTUP: Load & Validate Environment
// ===========================================

loadEnv();
const config = getConfig();

// ===========================================
// APP SETUP
// ===========================================

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// ===========================================
// HEALTH CHECKS
// ===========================================

app.get("/health", async (c) => {
  const dbHealth = await checkDatabaseHealth();
  const supabaseHealth = await checkSupabaseHealth();

  const overallHealthy = dbHealth.healthy && supabaseHealth.healthy;
  const status = overallHealthy ? "healthy" : "degraded";
  const httpStatus = overallHealthy ? 200 : 503;

  return c.json(
    {
      status,
      timestamp: new Date().toISOString(),
      service: config.service.name,
      version: config.service.version,
      environment: config.service.environment,
      checks: {
        database: dbHealth,
        supabase: supabaseHealth,
      },
    },
    httpStatus
  );
});

app.get("/health/live", (c) => {
  return c.json({ status: "up" });
});

app.get("/health/ready", async (c) => {
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.healthy) {
    return c.json({ status: "ready", database: dbHealth });
  }
  return c.json({ status: "not ready", database: dbHealth }, 503);
});

// ===========================================
// API DOCS
// ===========================================

app.get("/openapi.json", (c) => {
  return c.json(openApiSpec);
});

app.get("/docs", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.service.name} - API Docs</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
          });
        </script>
      </body>
    </html>
  `);
});

// ===========================================
// ROUTES
// ===========================================

app.route("/", paymentCycleRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      path: c.req.path,
      service: config.service.name,
    },
    404
  );
});

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      error: err.message || "Internal Server Error",
    },
    500
  );
});

// ===========================================
// SERVER START
// ===========================================

const port = config.service.port;

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 ${config.service.name} v${config.service.version}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port:        ${port}
Environment: ${config.service.environment}
Log Level:   ${config.service.logLevel}
CORS:        ${config.cors.origins.join(", ")}
Storage:     ${config.storage.bucket}

Routes (via Gateway /payment-cycle/*):

Payment Requests:
  GET    /payments           List payments (lanes: my-requests, need-approval, ready-disburse)
  POST   /payments           Create payment request
  GET    /payments/:id       Get payment detail with timeline
  PATCH  /payments/:id       Update payment (draft/rejected only)
  DELETE /payments/:id       Cancel payment

Approval Workflow:
  POST   /payments/:id/submit     Submit for approval
  POST   /payments/:id/approve    Approve payment
  POST   /payments/:id/reject     Reject payment
  GET    /payments/:id/approvals  Get approval chain

Disbursement:
  POST   /payments/:id/disburse      Record disbursement
  POST   /payments/:id/slip          Upload payment slip
  POST   /payments/:id/complete      Complete payment
  GET    /payments/:id/disbursement  Get disbursement details
  GET    /payments/:id/slips         Get uploaded slips

Health:
  GET /health        (full check)
  GET /health/live   (liveness)
  GET /health/ready  (readiness)

Docs: GET /docs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

serve({
  fetch: app.fetch,
  port,
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing database connections.");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing database connections.");
  await closeDatabase();
  process.exit(0);
});

/**
 * BFF Admin Config
 *
 * Backend-for-Frontend service for Admin Config & User Management
 *
 * Configuration Principle: LOCAL to this service
 * - Database credentials from environment variables
 * - Secrets injected at deployment time (Vault, K8s Secrets)
 * - No shared config pillar for runtime values
 *
 * External Route: /admin-config/* (via API Gateway)
 * Internal Routes: /* (Gateway strips prefix)
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { loadEnv, getConfig } from "./config/env";
import { checkDatabaseHealth, closeDatabase } from "./config/database";
import { adminConfigRoutes } from "./routes/admin-config/index";
import { openApiSpec } from "./openapi/spec";

// ===========================================
// STARTUP: Load & Validate Environment
// ===========================================

// Load environment first - fails fast if invalid
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
// HEALTH CHECK
// ===========================================

app.get("/health", async (c) => {
  const dbHealth = await checkDatabaseHealth();

  const status = dbHealth.healthy ? "healthy" : "degraded";
  const httpStatus = dbHealth.healthy ? 200 : 503;

  return c.json(
    {
      status,
      timestamp: new Date().toISOString(),
      service: config.service.name,
      version: config.service.version,
      environment: config.service.environment,
      checks: {
        database: {
          healthy: dbHealth.healthy,
          latency: dbHealth.latency,
          error: dbHealth.error,
        },
      },
    },
    httpStatus
  );
});

// Liveness probe (simple, no dependencies)
app.get("/health/live", (c) => {
  return c.json({ status: "alive" });
});

// Readiness probe (checks all dependencies)
app.get("/health/ready", async (c) => {
  const dbHealth = await checkDatabaseHealth();

  if (!dbHealth.healthy) {
    return c.json({ status: "not ready", reason: "database" }, 503);
  }

  return c.json({ status: "ready" });
});

// ===========================================
// OPENAPI / SWAGGER
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
// API ROUTES
// ===========================================

// Mount all admin-config routes at root
// Gateway strips /admin-config prefix before forwarding
// External: /admin-config/auth/login → Internal: /auth/login
app.route("/", adminConfigRoutes);

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
  console.error(`[${config.service.name}] Error:`, err);

  // Don't expose internal errors in production
  const message = config.isProduction
    ? "Internal Server Error"
    : err.message || "Internal Server Error";

  return c.json({ error: message }, 500);
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================

async function shutdown(signal: string) {
  console.log(
    `\n[${config.service.name}] Received ${signal}, shutting down...`
  );

  try {
    await closeDatabase();
    console.log(`[${config.service.name}] Database closed`);
  } catch (error) {
    console.error(`[${config.service.name}] Error closing database:`, error);
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ===========================================
// START SERVER
// ===========================================

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 ${config.service.name} v${config.service.version}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port:        ${config.service.port}
Environment: ${config.service.environment}
Log Level:   ${config.service.logLevel}
CORS:        ${config.cors.origins.join(", ")}
Email:       ${config.email ? "configured" : "console (dev)"}

Routes (via Gateway /admin-config/*):
├── POST   /auth/login
├── POST   /auth/logout
├── POST   /auth/forgot-password
├── POST   /auth/reset-password
├── GET    /organization
├── PATCH  /organization
├── GET    /users
├── GET    /users/:id
├── POST   /users/invite
├── PATCH  /users/:id
├── POST   /users/:id/deactivate
├── POST   /users/:id/reactivate
├── GET    /me
├── PATCH  /me
├── PATCH  /me/password
└── GET    /audit

Health:
├── GET /health        (full check)
├── GET /health/live   (liveness)
└── GET /health/ready  (readiness)

Docs: GET /docs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

serve({
  fetch: app.fetch,
  port: config.service.port,
});

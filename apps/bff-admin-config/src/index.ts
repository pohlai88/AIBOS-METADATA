/**
 * BFF Admin Config
 *
 * Backend-for-Frontend service for Admin Config & User Management
 * Port: 3001
 *
 * External Route: /admin-config/* (via API Gateway)
 * Internal Routes: /* (Gateway strips prefix)
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { adminConfigRoutes } from "./routes/admin-config/index";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "bff-admin-config",
  });
});

// Mount all admin-config routes at root
// Gateway strips /admin-config prefix before forwarding
// External: /admin-config/auth/login → Internal: /auth/login
app.route("/", adminConfigRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      path: c.req.path,
      service: "bff-admin-config",
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      error: err.message || "Internal Server Error",
    },
    500
  );
});

const port = parseInt(process.env.PORT || "3001");

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 BFF Admin Config
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${port}
Environment: ${process.env.NODE_ENV || "development"}
Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}

Routes (via Gateway /admin-config/*):
- POST   /auth/login
- POST   /auth/logout
- POST   /auth/forgot-password
- POST   /auth/reset-password
- GET    /organization
- PATCH  /organization
- GET    /users
- GET    /users/:id
- POST   /users/invite
- PATCH  /users/:id
- POST   /users/:id/deactivate
- POST   /users/:id/reactivate
- GET    /me
- PATCH  /me
- PATCH  /me/password
- GET    /audit

Health: GET /health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

serve({
  fetch: app.fetch,
  port,
});

/**
 * AI-BOS Backend API Server
 *
 * Hosts:
 * - Admin Config & User Management API
 * - Payment Cycle API (future)
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
    service: "aibos-api",
  });
});

// Mount routes
app.route("/api/admin", adminConfigRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      path: c.req.path,
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
🚀 AI-BOS API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${port}
Environment: ${process.env.NODE_ENV || "development"}
Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}

Routes:
- POST   /api/admin/auth/login
- POST   /api/admin/auth/logout
- POST   /api/admin/auth/forgot-password
- POST   /api/admin/auth/reset-password
- GET    /api/admin/organization
- PATCH  /api/admin/organization
- GET    /api/admin/users
- GET    /api/admin/users/:id
- POST   /api/admin/users/invite
- PATCH  /api/admin/users/:id
- POST   /api/admin/users/:id/deactivate
- POST   /api/admin/users/:id/reactivate
- GET    /api/admin/me
- PATCH  /api/admin/me
- PATCH  /api/admin/me/password
- GET    /api/admin/audit

Health: GET /health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

serve({
  fetch: app.fetch,
  port,
});

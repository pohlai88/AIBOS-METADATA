import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

/**
 * BFF Payment Cycle
 * 
 * Backend-for-Frontend service for Payment Cycle Orchestrator
 * Port: 3002
 * 
 * Routes:
 * - /payments/* - Payment requests
 * - /approvals/* - Payment approvals
 * - /disbursements/* - Disbursement processing
 */

const app = new Hono();

// Middleware
app.use("*", logger());
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
    status: "ok",
    service: "bff-payment-cycle",
    timestamp: new Date().toISOString(),
  });
});

// TODO: Mount payment routes
// app.route("/payments", paymentRoutes);
// app.route("/approvals", approvalRoutes);
// app.route("/disbursements", disbursementRoutes);

// Placeholder route
app.get("/", (c) => {
  return c.json({
    service: "bff-payment-cycle",
    version: "0.1.0",
    status: "skeleton",
    message: "Payment Cycle BFF - Routes not yet implemented",
  });
});

// Start server
const port = parseInt(process.env.PORT || "3002");

console.log(`🚀 BFF Payment Cycle starting on port ${port}`);
console.log(`📍 Health check: http://localhost:${port}/health`);

serve({
  fetch: app.fetch,
  port,
});


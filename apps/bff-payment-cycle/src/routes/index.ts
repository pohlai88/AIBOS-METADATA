/**
 * Payment Cycle Routes
 *
 * Barrel export and route composition.
 */

import { Hono } from "hono";
import { paymentsRoutes } from "./payments.routes";
import { approvalRoutes } from "./approval.routes";
import { disbursementRoutes } from "./disbursement.routes";

export const paymentCycleRoutes = new Hono();

// Mount payment routes
paymentCycleRoutes.route("/payments", paymentsRoutes);

// Mount approval actions on payments
paymentCycleRoutes.route("/payments", approvalRoutes);

// Mount disbursement actions on payments
paymentCycleRoutes.route("/payments", disbursementRoutes);

// Export individual routes for testing
export { paymentsRoutes, approvalRoutes, disbursementRoutes };


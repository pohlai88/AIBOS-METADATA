/**
 * Approval Routes
 *
 * Approval workflow endpoints:
 * - POST /payments/:id/submit - Submit for approval
 * - POST /payments/:id/approve - Approve payment
 * - POST /payments/:id/reject - Reject payment
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requireApproverRole } from "../middleware/auth.middleware";
import { container } from "../config/container";

// ─────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────

const submitSchema = z.object({
  approverUserIds: z.array(z.string().uuid()).optional(),
});

const approveSchema = z.object({
  comment: z.string().optional(),
});

const rejectSchema = z.object({
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

export const approvalRoutes = new Hono();

// All routes require authentication
approvalRoutes.use("*", authMiddleware);

/**
 * POST /payments/:id/submit
 * Submit payment for approval
 */
approvalRoutes.post(
  "/:id/submit",
  zValidator("json", submitSchema),
  async (c) => {
    const paymentId = c.req.param("id");
    const tenantId = c.get("tenantId");
    const userId = c.get("userId");
    const { approverUserIds } = c.req.valid("json");

    try {
      const payment = await container.paymentService.submitForApproval({
        paymentId,
        tenantId,
        actorUserId: userId,
        approverUserIds,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      return c.json({
        message: "Payment submitted for approval",
        payment: {
          id: payment.id,
          status: payment.status,
          submittedAt: payment.submittedAt?.toISOString(),
        },
      });
    } catch (error) {
      console.error("[APPROVAL] Submit error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to submit payment" },
        400
      );
    }
  }
);

/**
 * POST /payments/:id/approve
 * Approve payment
 */
approvalRoutes.post(
  "/:id/approve",
  requireApproverRole,
  zValidator("json", approveSchema),
  async (c) => {
    const paymentId = c.req.param("id");
    const tenantId = c.get("tenantId");
    const userId = c.get("userId");
    const { comment } = c.req.valid("json");

    try {
      const payment = await container.paymentService.approvePayment({
        paymentId,
        tenantId,
        approverUserId: userId,
        comment,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      return c.json({
        message: payment.status === "APPROVED" 
          ? "Payment approved" 
          : "Approval recorded, awaiting next approver",
        payment: {
          id: payment.id,
          status: payment.status,
          approvedAt: payment.approvedAt?.toISOString(),
        },
      });
    } catch (error) {
      console.error("[APPROVAL] Approve error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to approve payment" },
        400
      );
    }
  }
);

/**
 * POST /payments/:id/reject
 * Reject payment
 */
approvalRoutes.post(
  "/:id/reject",
  requireApproverRole,
  zValidator("json", rejectSchema),
  async (c) => {
    const paymentId = c.req.param("id");
    const tenantId = c.get("tenantId");
    const userId = c.get("userId");
    const { reason } = c.req.valid("json");

    try {
      const payment = await container.paymentService.rejectPayment({
        paymentId,
        tenantId,
        approverUserId: userId,
        reason,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      return c.json({
        message: "Payment rejected",
        payment: {
          id: payment.id,
          status: payment.status,
          rejectedAt: payment.rejectedAt?.toISOString(),
        },
      });
    } catch (error) {
      console.error("[APPROVAL] Reject error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to reject payment" },
        400
      );
    }
  }
);

/**
 * GET /payments/:id/approvals
 * Get approval chain for a payment
 */
approvalRoutes.get("/:id/approvals", async (c) => {
  const paymentId = c.req.param("id");
  const tenantId = c.get("tenantId");

  try {
    // Verify access
    const payment = await container.paymentRequestRepository.findById(paymentId);
    if (!payment || payment.tenantId !== tenantId) {
      return c.json({ error: "Payment not found" }, 404);
    }

    const approvals = await container.paymentApprovalRepository.findByPaymentRequest(paymentId);

    // Find current approver
    const currentApproval = approvals.find((a) => a.status === "PENDING");

    return c.json({
      paymentId,
      status: payment.status,
      approvals: approvals.map((a) => ({
        id: a.id,
        approverUserId: a.approverUserId,
        sequenceOrder: a.sequenceOrder,
        status: a.status,
        decision: a.decision,
        decisionReason: a.decisionReason,
        decidedAt: a.decidedAt?.toISOString(),
        isCurrent: a.id === currentApproval?.id,
      })),
      currentApproverUserId: currentApproval?.approverUserId,
    });
  } catch (error) {
    console.error("[APPROVAL] Get approvals error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch approvals" },
      500
    );
  }
});


/**
 * Payment Routes
 *
 * Core payment request endpoints:
 * - GET /payments - List payments (My Requests, Need My Approval, Ready to Disburse)
 * - POST /payments - Create payment request
 * - GET /payments/:id - Get payment detail with timeline
 * - PATCH /payments/:id - Update payment (draft/rejected only)
 * - DELETE /payments/:id - Cancel payment
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.middleware";
import { container } from "../config/container";

// ─────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────

const createPaymentSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  currency: z.string().length(3).default("MYR"),
  categoryCode: z.string().optional(),
  payeeType: z.enum(["VENDOR", "EMPLOYEE", "CONTRACTOR", "OTHER"]).optional(),
  payeeName: z.string().optional(),
  payeeAccountRef: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

const updatePaymentSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  currency: z.string().length(3).optional(),
  categoryCode: z.string().optional(),
  payeeType: z.enum(["VENDOR", "EMPLOYEE", "CONTRACTOR", "OTHER"]).optional(),
  payeeName: z.string().optional(),
  payeeAccountRef: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

export const paymentsRoutes = new Hono();

// All routes require authentication
paymentsRoutes.use("*", authMiddleware);

/**
 * GET /payments
 * List payments with job-based lanes
 */
paymentsRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const lane = c.req.query("lane") || "all";
  const status = c.req.query("status");
  const search = c.req.query("q");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  try {
    let payments;
    let total = 0;

    switch (lane) {
      case "my-requests":
        // My Requests - payments I created
        ({ payments, total } = await container.paymentRequestRepository.findByTenant(
          tenantId,
          { requestorUserId: userId, status: status?.split(","), search, limit, offset }
        ));
        break;

      case "need-approval":
        // Need My Approval - UNDER_REVIEW payments I can approve
        payments = await container.paymentRequestRepository.findNeedingApproval(
          tenantId,
          userId
        );
        total = payments.length;
        break;

      case "ready-disburse":
        // Ready to Disburse - APPROVED payments
        payments = await container.paymentRequestRepository.findReadyToDisburse(tenantId);
        total = payments.length;
        break;

      default:
        // All payments
        ({ payments, total } = await container.paymentRequestRepository.findByTenant(
          tenantId,
          { status: status?.split(","), search, limit, offset }
        ));
    }

    return c.json({
      payments: payments.map((p) => ({
        id: p.id,
        traceId: p.traceId,
        title: p.title,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        categoryCode: p.categoryCode,
        payeeName: p.payeeName,
        dueDate: p.dueDate?.toISOString(),
        requestorUserId: p.requestorUserId,
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString(),
      })),
      total,
      lane,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[PAYMENTS] List error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch payments" },
      500
    );
  }
});

/**
 * POST /payments
 * Create new payment request
 */
paymentsRoutes.post("/", zValidator("json", createPaymentSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const data = c.req.valid("json");

  try {
    const payment = await container.paymentService.createPayment({
      tenantId,
      requestorUserId: userId,
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      categoryCode: data.categoryCode,
      payeeType: data.payeeType,
      payeeName: data.payeeName,
      payeeAccountRef: data.payeeAccountRef,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      tags: data.tags,
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json({
      message: "Payment request created",
      payment: {
        id: payment.id,
        traceId: payment.traceId,
        status: payment.status,
      },
    }, 201);
  } catch (error) {
    console.error("[PAYMENTS] Create error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to create payment" },
      400
    );
  }
});

/**
 * GET /payments/:id
 * Get payment detail with timeline
 */
paymentsRoutes.get("/:id", async (c) => {
  const paymentId = c.req.param("id");
  const tenantId = c.get("tenantId");

  try {
    const detail = await container.paymentService.getPaymentDetail(paymentId, tenantId);

    if (!detail) {
      return c.json({ error: "Payment not found" }, 404);
    }

    const { payment, approvals, timeline } = detail;

    // Build one-line story bar
    const storyBar = buildStoryBar(payment, timeline);

    return c.json({
      payment: {
        id: payment.id,
        traceId: payment.traceId,
        title: payment.title,
        description: payment.description,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        categoryCode: payment.categoryCode,
        payeeType: payment.payeeType,
        payeeName: payment.payeeName,
        payeeAccountRef: payment.payeeAccountRef,
        treasuryAccountRef: payment.treasuryAccountRef,
        dueDate: payment.dueDate?.toISOString(),
        submittedAt: payment.submittedAt?.toISOString(),
        approvedAt: payment.approvedAt?.toISOString(),
        rejectedAt: payment.rejectedAt?.toISOString(),
        disbursedAt: payment.disbursedAt?.toISOString(),
        completedAt: payment.completedAt?.toISOString(),
        requestorUserId: payment.requestorUserId,
        createdAt: payment.createdAt?.toISOString(),
        version: payment.version,
      },
      storyBar,
      approvals: approvals.map((a) => ({
        id: a.id,
        approverUserId: a.approverUserId,
        sequenceOrder: a.sequenceOrder,
        status: a.status,
        decision: a.decision,
        decisionReason: a.decisionReason,
        decidedAt: a.decidedAt?.toISOString(),
      })),
      timeline: timeline.map((t) => ({
        id: t.id,
        action: t.action,
        resourceType: t.resourceType,
        actorUserId: t.actorUserId,
        metadataDiff: t.metadataDiff,
        locationRef: t.locationRef,
        timestamp: t.createdAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[PAYMENTS] Detail error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch payment" },
      500
    );
  }
});

/**
 * PATCH /payments/:id
 * Update payment (draft/rejected only)
 */
paymentsRoutes.patch("/:id", zValidator("json", updatePaymentSchema), async (c) => {
  const paymentId = c.req.param("id");
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const updates = c.req.valid("json");

  try {
    const payment = await container.paymentService.updatePayment({
      paymentId,
      tenantId,
      actorUserId: userId,
      updates: {
        title: updates.title,
        description: updates.description,
        amount: updates.amount,
        currency: updates.currency,
        categoryCode: updates.categoryCode,
        payeeType: updates.payeeType as any,
        payeeName: updates.payeeName,
        payeeAccountRef: updates.payeeAccountRef,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
      },
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json({
      message: "Payment updated",
      payment: {
        id: payment.id,
        status: payment.status,
        updatedAt: payment.updatedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("[PAYMENTS] Update error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to update payment" },
      400
    );
  }
});

/**
 * DELETE /payments/:id
 * Cancel payment
 */
paymentsRoutes.delete("/:id", async (c) => {
  const paymentId = c.req.param("id");
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const reason = c.req.query("reason");

  try {
    await container.paymentService.cancelPayment({
      paymentId,
      tenantId,
      actorUserId: userId,
      reason,
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json({ message: "Payment cancelled" });
  } catch (error) {
    console.error("[PAYMENTS] Cancel error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to cancel payment" },
      400
    );
  }
});

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function buildStoryBar(payment: any, timeline: any[]): string {
  const parts: string[] = [];

  // Find key events
  const createEvent = timeline.find((t) => t.action === "CREATE");
  const submitEvent = timeline.find((t) => t.action === "SUBMIT");
  const approveEvent = timeline.find((t) => t.action === "APPROVE");
  const rejectEvent = timeline.find((t) => t.action === "REJECT");
  const disburseEvent = timeline.find((t) => t.action === "DISBURSE");
  const slipEvent = timeline.find((t) => t.action === "UPLOAD_SLIP");

  if (createEvent) {
    const date = new Date(createEvent.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    parts.push(`Created ${date}`);
  }

  if (submitEvent) {
    parts.push("Submitted for approval");
  }

  if (approveEvent) {
    const date = new Date(approveEvent.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    parts.push(`Approved ${date}`);
  }

  if (rejectEvent) {
    parts.push("Rejected");
  }

  if (disburseEvent) {
    const date = new Date(disburseEvent.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    parts.push(`Disbursed ${date}`);
  }

  if (slipEvent) {
    const location = (slipEvent.metadataDiff as any)?.locationRef;
    parts.push(location ? `Slip uploaded (${location})` : "Slip uploaded");
  }

  // Final status
  parts.push(`**${payment.status.replace(/_/g, " ")}**`);

  return parts.join(" · ");
}


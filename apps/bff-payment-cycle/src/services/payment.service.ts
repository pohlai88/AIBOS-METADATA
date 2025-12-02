/**
 * Payment Service
 *
 * Core business logic for payment request lifecycle.
 * Handles state machine transitions and validation.
 */

import { randomUUID } from "crypto";
import type { PaymentRequest, NewPaymentRequest, PaymentApproval } from "../db/schema";
import type { PaymentRequestRepository } from "../repositories/payment-request.repository";
import type { PaymentApprovalRepository } from "../repositories/payment-approval.repository";
import type { PaymentAuditRepository } from "../repositories/payment-audit.repository";
import type { IEventBus } from "../config/container";

// Valid state transitions
const STATE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "DRAFT", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "DRAFT"],
  APPROVED: ["DISBURSED", "DISBURSED_AWAITING_SLIP", "CANCELLED"],
  REJECTED: ["DRAFT", "CANCELLED"],
  DISBURSED: ["DISBURSED_AWAITING_SLIP", "COMPLETED"],
  DISBURSED_AWAITING_SLIP: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRequestRepository,
    private readonly approvalRepo: PaymentApprovalRepository,
    private readonly auditRepo: PaymentAuditRepository,
    private readonly eventBus: IEventBus
  ) {}

  /**
   * Create a new payment request (DRAFT)
   */
  async createPayment(params: {
    tenantId: string;
    requestorUserId: string;
    title: string;
    description?: string;
    amount: string;
    currency: string;
    categoryCode?: string;
    payeeType?: string;
    payeeName?: string;
    payeeAccountRef?: string;
    dueDate?: Date;
    tags?: string[];
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentRequest> {
    const traceId = randomUUID();

    const payment = await this.paymentRepo.create({
      traceId,
      tenantId: params.tenantId,
      requestorUserId: params.requestorUserId,
      title: params.title,
      description: params.description,
      amount: params.amount,
      currency: params.currency,
      categoryCode: params.categoryCode,
      payeeType: params.payeeType as any,
      payeeName: params.payeeName,
      payeeAccountRef: params.payeeAccountRef,
      dueDate: params.dueDate,
      status: "DRAFT",
      createdBy: params.requestorUserId,
      updatedBy: params.requestorUserId,
    });

    // Audit event
    await this.createAuditEvent({
      traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_REQUEST",
      resourceId: payment.id,
      action: "CREATE",
      actorUserId: params.requestorUserId,
      metadataDiff: { title: params.title, amount: params.amount, currency: params.currency },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Emit event
    await this.eventBus.publish({
      type: "payment.created",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: traceId,
      tenantId: params.tenantId,
      payload: { paymentId: payment.id, status: "DRAFT" },
    });

    return payment;
  }

  /**
   * Update a draft payment
   */
  async updatePayment(params: {
    paymentId: string;
    tenantId: string;
    actorUserId: string;
    updates: Partial<NewPaymentRequest>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentRequest> {
    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    // Only DRAFT and REJECTED can be edited
    if (!["DRAFT", "REJECTED"].includes(payment.status)) {
      throw new Error(`Cannot edit payment in ${payment.status} status`);
    }

    const updated = await this.paymentRepo.update(params.paymentId, {
      ...params.updates,
      updatedBy: params.actorUserId,
    });

    if (!updated) throw new Error("Update failed");

    // Audit
    await this.createAuditEvent({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_REQUEST",
      resourceId: payment.id,
      action: "UPDATE",
      actorUserId: params.actorUserId,
      metadataDiff: params.updates as Record<string, unknown>,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return updated;
  }

  /**
   * Submit payment for approval
   */
  async submitForApproval(params: {
    paymentId: string;
    tenantId: string;
    actorUserId: string;
    approverUserIds?: string[];
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentRequest> {
    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    // Validate state transition
    if (!this.canTransition(payment.status, "SUBMITTED")) {
      throw new Error(`Cannot submit payment from ${payment.status} status`);
    }

    // Update status
    const updated = await this.paymentRepo.updateStatus(
      params.paymentId,
      "SUBMITTED",
      payment.version,
      {
        submittedAt: new Date(),
        updatedBy: params.actorUserId,
      }
    );

    if (!updated) throw new Error("Update failed - concurrent modification");

    // Create approval records (for multi-step approval)
    if (params.approverUserIds && params.approverUserIds.length > 0) {
      for (let i = 0; i < params.approverUserIds.length; i++) {
        await this.approvalRepo.create({
          traceId: payment.traceId,
          paymentRequestId: payment.id,
          tenantId: params.tenantId,
          approverUserId: params.approverUserIds[i],
          sequenceOrder: i + 1,
          status: "PENDING",
        });
      }
    }

    // Auto-transition to UNDER_REVIEW
    const finalStatus = await this.paymentRepo.updateStatus(
      params.paymentId,
      "UNDER_REVIEW",
      updated.version
    );

    // Audit
    await this.createAuditEvent({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_REQUEST",
      resourceId: payment.id,
      action: "SUBMIT",
      actorUserId: params.actorUserId,
      metadataDiff: { previousStatus: payment.status, newStatus: "UNDER_REVIEW" },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Emit event
    await this.eventBus.publish({
      type: "payment.submitted",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: payment.traceId,
      tenantId: params.tenantId,
      payload: {
        paymentId: payment.id,
        requestorUserId: payment.requestorUserId,
        approverUserIds: params.approverUserIds,
      },
    });

    return finalStatus || updated;
  }

  /**
   * Approve a payment
   */
  async approvePayment(params: {
    paymentId: string;
    tenantId: string;
    approverUserId: string;
    comment?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentRequest> {
    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    if (payment.status !== "UNDER_REVIEW") {
      throw new Error(`Cannot approve payment in ${payment.status} status`);
    }

    // Find and update approval record
    const pendingApproval = await this.approvalRepo.findNextPendingApprover(params.paymentId);
    if (pendingApproval) {
      await this.approvalRepo.recordDecision(pendingApproval.id, "APPROVED", params.comment);
    }

    // Check if all approvals are complete
    const remainingApprovals = await this.approvalRepo.findPendingForPayment(params.paymentId);

    let newStatus: "UNDER_REVIEW" | "APPROVED" = "UNDER_REVIEW";
    if (remainingApprovals.length === 0) {
      newStatus = "APPROVED";
    }

    const updated = await this.paymentRepo.updateStatus(
      params.paymentId,
      newStatus,
      payment.version,
      newStatus === "APPROVED" ? { approvedAt: new Date() } : undefined
    );

    if (!updated) throw new Error("Update failed - concurrent modification");

    // Audit
    await this.createAuditEvent({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_APPROVAL",
      resourceId: pendingApproval?.id || payment.id,
      action: "APPROVE",
      actorUserId: params.approverUserId,
      metadataDiff: { decision: "APPROVED", comment: params.comment },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Emit event
    await this.eventBus.publish({
      type: newStatus === "APPROVED" ? "payment.approved" : "payment.approval.recorded",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: payment.traceId,
      tenantId: params.tenantId,
      payload: {
        paymentId: payment.id,
        approverUserId: params.approverUserId,
        finalStatus: newStatus,
      },
    });

    return updated;
  }

  /**
   * Reject a payment
   */
  async rejectPayment(params: {
    paymentId: string;
    tenantId: string;
    approverUserId: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentRequest> {
    if (!params.reason?.trim()) {
      throw new Error("Rejection reason is required");
    }

    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    if (payment.status !== "UNDER_REVIEW") {
      throw new Error(`Cannot reject payment in ${payment.status} status`);
    }

    // Record rejection
    const pendingApproval = await this.approvalRepo.findNextPendingApprover(params.paymentId);
    if (pendingApproval) {
      await this.approvalRepo.recordDecision(pendingApproval.id, "REJECTED", params.reason);
      // Skip remaining approvals
      await this.approvalRepo.skipRemainingApprovals(params.paymentId, pendingApproval.sequenceOrder);
    }

    const updated = await this.paymentRepo.updateStatus(
      params.paymentId,
      "REJECTED",
      payment.version,
      { rejectedAt: new Date() }
    );

    if (!updated) throw new Error("Update failed - concurrent modification");

    // Audit
    await this.createAuditEvent({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_APPROVAL",
      resourceId: pendingApproval?.id || payment.id,
      action: "REJECT",
      actorUserId: params.approverUserId,
      metadataDiff: { decision: "REJECTED", reason: params.reason },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Emit event
    await this.eventBus.publish({
      type: "payment.rejected",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: payment.traceId,
      tenantId: params.tenantId,
      payload: {
        paymentId: payment.id,
        approverUserId: params.approverUserId,
        reason: params.reason,
      },
    });

    return updated;
  }

  /**
   * Get payment detail with timeline
   */
  async getPaymentDetail(paymentId: string, tenantId: string) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) return null;
    if (payment.tenantId !== tenantId) return null;

    const approvals = await this.approvalRepo.findByPaymentRequest(paymentId);
    const timeline = await this.auditRepo.findByTraceId(payment.traceId);

    return { payment, approvals, timeline };
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(params: {
    paymentId: string;
    tenantId: string;
    actorUserId: string;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentRequest | null> {
    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    if (!this.canTransition(payment.status, "CANCELLED")) {
      throw new Error(`Cannot cancel payment in ${payment.status} status`);
    }

    const cancelled = await this.paymentRepo.cancel(params.paymentId, params.actorUserId);

    // Audit
    await this.createAuditEvent({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_REQUEST",
      resourceId: payment.id,
      action: "CANCEL",
      actorUserId: params.actorUserId,
      metadataDiff: { reason: params.reason },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Emit event
    await this.eventBus.publish({
      type: "payment.cancelled",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: payment.traceId,
      tenantId: params.tenantId,
      payload: { paymentId: payment.id, reason: params.reason },
    });

    return cancelled;
  }

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────

  private canTransition(from: string, to: string): boolean {
    return STATE_TRANSITIONS[from]?.includes(to) || false;
  }

  private async createAuditEvent(data: {
    traceId: string;
    tenantId: string;
    resourceType: string;
    resourceId: string;
    action: string;
    actorUserId: string;
    metadataDiff?: Record<string, unknown>;
    locationRef?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const prevAudit = await this.auditRepo.getLatestByTraceId(data.traceId);

    await this.auditRepo.create({
      ...data,
      prevHash: prevAudit?.hash || null,
    });
  }
}


/**
 * Disbursement Service
 *
 * Handles payment disbursement and slip upload workflows.
 */

import type { PaymentRequest, PaymentDisbursement, PaymentSlip } from "../db/schema";
import type { PaymentRequestRepository } from "../repositories/payment-request.repository";
import type { PaymentDisbursementRepository } from "../repositories/payment-disbursement.repository";
import type { PaymentSlipRepository } from "../repositories/payment-slip.repository";
import type { PaymentAuditRepository } from "../repositories/payment-audit.repository";
import type { IEventBus } from "../config/container";

export class DisbursementService {
  constructor(
    private readonly paymentRepo: PaymentRequestRepository,
    private readonly disbursementRepo: PaymentDisbursementRepository,
    private readonly slipRepo: PaymentSlipRepository,
    private readonly auditRepo: PaymentAuditRepository,
    private readonly eventBus: IEventBus
  ) {}

  /**
   * Record disbursement (Mark as Disbursed)
   */
  async recordDisbursement(params: {
    paymentId: string;
    tenantId: string;
    disburserUserId: string;
    disbursedAmount: string;
    disbursedCurrency: string;
    disbursementDate: string;
    method: "BANK_TRANSFER" | "CASH" | "CHEQUE" | "EWALLET" | "OTHER";
    bankReference?: string;
    treasuryAccountRef?: string;
    cashflowProfileRef?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ payment: PaymentRequest; disbursement: PaymentDisbursement }> {
    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    if (payment.status !== "APPROVED") {
      throw new Error(`Cannot disburse payment in ${payment.status} status`);
    }

    // Create disbursement record
    const disbursement = await this.disbursementRepo.create({
      traceId: payment.traceId,
      paymentRequestId: params.paymentId,
      tenantId: params.tenantId,
      disburserUserId: params.disburserUserId,
      disbursedAmount: params.disbursedAmount,
      disbursedCurrency: params.disbursedCurrency,
      disbursementDate: params.disbursementDate,
      method: params.method,
      bankReference: params.bankReference,
      treasuryAccountRef: params.treasuryAccountRef,
      cashflowProfileRef: params.cashflowProfileRef,
    });

    // Update payment status to DISBURSED_AWAITING_SLIP
    const updated = await this.paymentRepo.updateStatus(
      params.paymentId,
      "DISBURSED_AWAITING_SLIP",
      payment.version,
      { disbursedAt: new Date() }
    );

    if (!updated) throw new Error("Update failed - concurrent modification");

    // Audit
    const prevAudit = await this.auditRepo.getLatestByTraceId(payment.traceId);
    await this.auditRepo.create({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_DISBURSEMENT",
      resourceId: disbursement.id,
      action: "DISBURSE",
      actorUserId: params.disburserUserId,
      metadataDiff: {
        amount: params.disbursedAmount,
        currency: params.disbursedCurrency,
        method: params.method,
        bankReference: params.bankReference,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      prevHash: prevAudit?.hash || null,
    });

    // Emit event
    await this.eventBus.publish({
      type: "payment.disbursed",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: payment.traceId,
      tenantId: params.tenantId,
      payload: {
        paymentId: params.paymentId,
        disbursementId: disbursement.id,
        amount: params.disbursedAmount,
        currency: params.disbursedCurrency,
        method: params.method,
      },
    });

    return { payment: updated, disbursement };
  }

  /**
   * Upload payment slip
   */
  async uploadSlip(params: {
    paymentId: string;
    tenantId: string;
    uploaderUserId: string;
    storageKey: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: string;
    locationRef?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentSlip> {
    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    // Create slip record
    const slip = await this.slipRepo.create({
      traceId: payment.traceId,
      paymentRequestId: params.paymentId,
      tenantId: params.tenantId,
      uploadedByUserId: params.uploaderUserId,
      storageKey: params.storageKey,
      fileName: params.fileName,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      locationRef: params.locationRef,
    });

    // Audit with location reference
    const prevAudit = await this.auditRepo.getLatestByTraceId(payment.traceId);
    await this.auditRepo.create({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_SLIP",
      resourceId: slip.id,
      action: "UPLOAD_SLIP",
      actorUserId: params.uploaderUserId,
      metadataDiff: {
        fileName: params.fileName,
        mimeType: params.mimeType,
        locationRef: params.locationRef,
      },
      locationRef: params.locationRef,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      prevHash: prevAudit?.hash || null,
    });

    // Emit event
    await this.eventBus.publish({
      type: "payment.slip.uploaded",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: payment.traceId,
      tenantId: params.tenantId,
      payload: {
        paymentId: params.paymentId,
        slipId: slip.id,
        locationRef: params.locationRef,
      },
    });

    return slip;
  }

  /**
   * Complete payment (after slip upload)
   */
  async completePayment(params: {
    paymentId: string;
    tenantId: string;
    actorUserId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PaymentRequest> {
    const payment = await this.paymentRepo.findById(params.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.tenantId !== params.tenantId) throw new Error("Access denied");

    if (payment.status !== "DISBURSED_AWAITING_SLIP") {
      throw new Error(`Cannot complete payment in ${payment.status} status`);
    }

    // Verify slip exists
    const slips = await this.slipRepo.findByPaymentRequest(params.paymentId);
    if (slips.length === 0) {
      throw new Error("Cannot complete payment without uploaded slip");
    }

    // Update status to COMPLETED
    const updated = await this.paymentRepo.updateStatus(
      params.paymentId,
      "COMPLETED",
      payment.version,
      { completedAt: new Date() }
    );

    if (!updated) throw new Error("Update failed - concurrent modification");

    // Audit
    const prevAudit = await this.auditRepo.getLatestByTraceId(payment.traceId);
    await this.auditRepo.create({
      traceId: payment.traceId,
      tenantId: params.tenantId,
      resourceType: "PAYMENT_REQUEST",
      resourceId: payment.id,
      action: "COMPLETE",
      actorUserId: params.actorUserId,
      metadataDiff: { previousStatus: payment.status, newStatus: "COMPLETED" },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      prevHash: prevAudit?.hash || null,
    });

    // Emit event
    await this.eventBus.publish({
      type: "payment.completed",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      source: "bff-payment-cycle",
      correlationId: payment.traceId,
      tenantId: params.tenantId,
      payload: {
        paymentId: params.paymentId,
        slipCount: slips.length,
      },
    });

    return updated;
  }

  /**
   * Get disbursement details for a payment
   */
  async getDisbursementDetails(paymentId: string, tenantId: string) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment || payment.tenantId !== tenantId) return null;

    const disbursement = await this.disbursementRepo.findByPaymentRequest(paymentId);
    const slips = await this.slipRepo.findByPaymentRequest(paymentId);

    return { payment, disbursement, slips };
  }

  /**
   * Get slips for a payment
   */
  async getSlips(paymentId: string, tenantId: string): Promise<PaymentSlip[]> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment || payment.tenantId !== tenantId) return [];

    return this.slipRepo.findByPaymentRequest(paymentId);
  }
}


/**
 * Disbursement Routes
 *
 * Treasury/Finance endpoints:
 * - POST /payments/:id/disburse - Record disbursement
 * - POST /payments/:id/slip - Upload payment slip
 * - POST /payments/:id/complete - Complete payment
 * - GET /payments/:id/disbursement - Get disbursement details
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requireTreasuryRole } from "../middleware/auth.middleware";
import { container } from "../config/container";
import { getSupabaseClient } from "../config/database";
import { getConfig } from "../config/env";

// ─────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────

const disburseSchema = z.object({
  disbursedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  disbursedCurrency: z.string().length(3).default("MYR"),
  disbursementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  method: z.enum(["BANK_TRANSFER", "CASH", "CHEQUE", "EWALLET", "OTHER"]),
  bankReference: z.string().optional(),
  treasuryAccountRef: z.string().optional(),
  cashflowProfileRef: z.string().optional(),
});

const slipUploadSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.string().optional(),
  locationRef: z.string().optional(),
});

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

export const disbursementRoutes = new Hono();

// All routes require authentication
disbursementRoutes.use("*", authMiddleware);

/**
 * POST /payments/:id/disburse
 * Record disbursement (Mark as Disbursed)
 */
disbursementRoutes.post(
  "/:id/disburse",
  requireTreasuryRole,
  zValidator("json", disburseSchema),
  async (c) => {
    const paymentId = c.req.param("id");
    const tenantId = c.get("tenantId");
    const userId = c.get("userId");
    const data = c.req.valid("json");

    try {
      const result = await container.disbursementService.recordDisbursement({
        paymentId,
        tenantId,
        disburserUserId: userId,
        disbursedAmount: data.disbursedAmount,
        disbursedCurrency: data.disbursedCurrency,
        disbursementDate: data.disbursementDate,
        method: data.method,
        bankReference: data.bankReference,
        treasuryAccountRef: data.treasuryAccountRef,
        cashflowProfileRef: data.cashflowProfileRef,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      return c.json({
        message: "Disbursement recorded",
        payment: {
          id: result.payment.id,
          status: result.payment.status,
          disbursedAt: result.payment.disbursedAt?.toISOString(),
        },
        disbursement: {
          id: result.disbursement.id,
          amount: result.disbursement.disbursedAmount,
          currency: result.disbursement.disbursedCurrency,
          method: result.disbursement.method,
        },
      });
    } catch (error) {
      console.error("[DISBURSE] Error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to record disbursement" },
        400
      );
    }
  }
);

/**
 * POST /payments/:id/slip
 * Upload payment slip
 */
disbursementRoutes.post(
  "/:id/slip",
  zValidator("json", slipUploadSchema),
  async (c) => {
    const paymentId = c.req.param("id");
    const tenantId = c.get("tenantId");
    const userId = c.get("userId");
    const { fileName, mimeType, fileSize, locationRef } = c.req.valid("json");

    try {
      // Generate storage key
      const config = getConfig();
      const timestamp = Date.now();
      const storageKey = `${tenantId}/${paymentId}/${timestamp}-${fileName}`;

      // Get signed upload URL from Supabase Storage
      const supabase = getSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(config.storage.bucket)
        .createSignedUploadUrl(storageKey);

      if (uploadError) {
        throw new Error(`Failed to create upload URL: ${uploadError.message}`);
      }

      // Create slip record
      const slip = await container.disbursementService.uploadSlip({
        paymentId,
        tenantId,
        uploaderUserId: userId,
        storageKey,
        fileName,
        mimeType,
        fileSize,
        locationRef,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      return c.json({
        message: "Slip upload initiated",
        slip: {
          id: slip.id,
          storageKey: slip.storageKey,
          locationRef: slip.locationRef,
        },
        uploadUrl: uploadData.signedUrl,
        token: uploadData.token,
      });
    } catch (error) {
      console.error("[SLIP] Upload error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to upload slip" },
        400
      );
    }
  }
);

/**
 * POST /payments/:id/complete
 * Complete payment (after slip upload)
 */
disbursementRoutes.post(
  "/:id/complete",
  requireTreasuryRole,
  async (c) => {
    const paymentId = c.req.param("id");
    const tenantId = c.get("tenantId");
    const userId = c.get("userId");

    try {
      const payment = await container.disbursementService.completePayment({
        paymentId,
        tenantId,
        actorUserId: userId,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
      });

      return c.json({
        message: "Payment completed",
        payment: {
          id: payment.id,
          status: payment.status,
          completedAt: payment.completedAt?.toISOString(),
        },
      });
    } catch (error) {
      console.error("[COMPLETE] Error:", error);
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to complete payment" },
        400
      );
    }
  }
);

/**
 * GET /payments/:id/disbursement
 * Get disbursement details
 */
disbursementRoutes.get("/:id/disbursement", async (c) => {
  const paymentId = c.req.param("id");
  const tenantId = c.get("tenantId");

  try {
    const details = await container.disbursementService.getDisbursementDetails(
      paymentId,
      tenantId
    );

    if (!details) {
      return c.json({ error: "Payment not found" }, 404);
    }

    const { payment, disbursement, slips } = details;

    return c.json({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
      disbursement: disbursement
        ? {
            id: disbursement.id,
            disbursedAmount: disbursement.disbursedAmount,
            disbursedCurrency: disbursement.disbursedCurrency,
            disbursementDate: disbursement.disbursementDate,
            method: disbursement.method,
            bankReference: disbursement.bankReference,
            treasuryAccountRef: disbursement.treasuryAccountRef,
            createdAt: disbursement.createdAt?.toISOString(),
          }
        : null,
      slips: slips.map((s) => ({
        id: s.id,
        fileName: s.fileName,
        mimeType: s.mimeType,
        fileSize: s.fileSize,
        locationRef: s.locationRef,
        uploadedAt: s.uploadedAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[DISBURSE] Get details error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch disbursement" },
      500
    );
  }
});

/**
 * GET /payments/:id/slips
 * Get all slips for a payment
 */
disbursementRoutes.get("/:id/slips", async (c) => {
  const paymentId = c.req.param("id");
  const tenantId = c.get("tenantId");

  try {
    const slips = await container.disbursementService.getSlips(paymentId, tenantId);

    // Generate signed URLs for each slip
    const config = getConfig();
    const supabase = getSupabaseClient();

    const slipsWithUrls = await Promise.all(
      slips.map(async (slip) => {
        const { data } = await supabase.storage
          .from(config.storage.bucket)
          .createSignedUrl(slip.storageKey, 3600); // 1 hour expiry

        return {
          id: slip.id,
          fileName: slip.fileName,
          mimeType: slip.mimeType,
          fileSize: slip.fileSize,
          locationRef: slip.locationRef,
          uploadedAt: slip.uploadedAt?.toISOString(),
          downloadUrl: data?.signedUrl,
        };
      })
    );

    return c.json({ slips: slipsWithUrls });
  } catch (error) {
    console.error("[SLIPS] Get error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to fetch slips" },
      500
    );
  }
});


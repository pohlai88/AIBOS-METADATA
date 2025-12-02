import { z } from "zod";

/**
 * Payment Cycle Schemas - Placeholder
 * 
 * @package @aibos/schemas/payment-cycle
 * 
 * TODO: Implement when building payment-cycle BFF
 */

// ============================================
// ENUMS
// ============================================

export const PaymentStatusEnum = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "processing",
  "disbursed",
  "failed",
]);

export const PaymentTypeEnum = z.enum([
  "vendor_payment",
  "employee_reimbursement",
  "contractor_payment",
  "utility_payment",
]);

// ============================================
// PLACEHOLDER SCHEMAS
// ============================================

export const PaymentRequestSchema = z.object({
  type: PaymentTypeEnum.describe("Payment type"),
  amount: z.number().positive().describe("Payment amount"),
  currency: z.string().length(3).default("USD").describe("Currency code"),
  recipientId: z.string().describe("Recipient ID"),
  description: z.string().describe("Payment description"),
  dueDate: z.string().datetime().optional().describe("Due date"),
});

export const PaymentResponseSchema = z.object({
  id: z.string().describe("Payment UUID"),
  type: PaymentTypeEnum.describe("Payment type"),
  amount: z.number().describe("Payment amount"),
  currency: z.string().describe("Currency code"),
  status: PaymentStatusEnum.describe("Payment status"),
  createdAt: z.string().datetime().describe("Created timestamp"),
  updatedAt: z.string().datetime().describe("Updated timestamp"),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type PaymentType = z.infer<typeof PaymentTypeEnum>;
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;


/**
 * @aibos/schemas - Shared Zod schemas for AIBOS
 * 
 * Usage:
 * 
 * ```typescript
 * // Import all admin-config schemas
 * import { LoginRequestSchema, UserSchema } from "@aibos/schemas/admin-config";
 * 
 * // Import common schemas
 * import { ErrorResponseSchema, PaginationQuerySchema } from "@aibos/schemas/common";
 * 
 * // Import payment-cycle schemas
 * import { PaymentRequestSchema } from "@aibos/schemas/payment-cycle";
 * ```
 */

// Re-export all modules
export * from "./admin-config";
export * from "./common";
export * from "./payment-cycle";


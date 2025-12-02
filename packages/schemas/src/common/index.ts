import { z } from "zod";

/**
 * Common Schemas - Shared across all business engines
 *
 * @package @aibos/schemas/common
 */

// ============================================
// ERROR RESPONSE
// ============================================

export const ErrorResponseSchema = z.object({
  error: z.string().describe("Error message"),
  code: z.string().optional().describe("Error code"),
  details: z.record(z.unknown()).optional().describe("Additional details"),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============================================
// PAGINATION
// ============================================

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50).describe("Page size"),
  offset: z.coerce.number().min(0).default(0).describe("Offset"),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    items: z.array(itemSchema).describe("List of items"),
    total: z.number().describe("Total count"),
    limit: z.number().describe("Page size"),
    offset: z.number().describe("Current offset"),
  });

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// ============================================
// TIMESTAMPS
// ============================================

export const TimestampsSchema = z.object({
  createdAt: z.string().datetime().describe("Created timestamp"),
  updatedAt: z.string().datetime().describe("Updated timestamp"),
});

export type Timestamps = z.infer<typeof TimestampsSchema>;

// ============================================
// ACTOR
// ============================================

export const ActorSchema = z.object({
  actorId: z.string().describe("Actor ID"),
  actorType: z.enum(["HUMAN", "SYSTEM", "AGENT"]).describe("Actor type"),
});

export type Actor = z.infer<typeof ActorSchema>;

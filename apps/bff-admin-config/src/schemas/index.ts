/**
 * Centralized Schema Exports
 * 
 * All Zod schemas used for:
 * - Runtime validation (zValidator)
 * - TypeScript types
 * - OpenAPI auto-generation
 */

export * from "./auth.schema";
export * from "./users.schema";
export * from "./organization.schema";
export * from "./me.schema";
export * from "./audit.schema";

/**
 * Common Error Response Schema
 */
import { z } from "zod";

export const ErrorResponseSchema = z.object({
  error: z.string().describe("Error message"),
  code: z.string().optional().describe("Error code"),
  details: z.record(z.unknown()).optional().describe("Additional details"),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;


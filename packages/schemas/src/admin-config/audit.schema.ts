import { z } from "zod";

/**
 * Audit Schemas - Zod definitions for OpenAPI auto-generation
 */

// REQUEST SCHEMAS
export const AuditQuerySchema = z.object({
  limit: z.coerce.number().default(100).describe("Page size"),
  offset: z.coerce.number().default(0).describe("Offset"),
  action: z.string().optional().describe("Filter by action type"),
  entityType: z.string().optional().describe("Filter by entity type"),
  userId: z.string().optional().describe("Filter by actor user ID"),
  startDate: z.string().datetime().optional().describe("Filter from date"),
  endDate: z.string().datetime().optional().describe("Filter to date"),
});

// RESPONSE SCHEMAS
export const AuditEventSchema = z.object({
  id: z.string().describe("Event UUID"),
  traceId: z.string().describe("Trace ID for correlation"),
  action: z.string().describe("Action performed"),
  actorName: z.string().describe("Actor display name"),
  actorEmail: z.string().email().describe("Actor email"),
  targetType: z.string().describe("Target entity type"),
  targetId: z.string().describe("Target entity ID"),
  description: z.string().describe("Human-readable description"),
  timestamp: z.string().datetime().describe("Event timestamp"),
  metadata: z.record(z.unknown()).describe("Additional metadata"),
});

export const AuditListResponseSchema = z.object({
  events: z.array(AuditEventSchema).describe("Audit events"),
  total: z.number().describe("Total count"),
  limit: z.number().describe("Page size"),
  offset: z.number().describe("Current offset"),
});

// TYPE EXPORTS
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditQuery = z.infer<typeof AuditQuerySchema>;


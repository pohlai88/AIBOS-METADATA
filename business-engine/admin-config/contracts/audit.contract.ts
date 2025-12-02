// business-engine/admin-config/contracts/audit.contract.ts
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS (Vocabulary Controlled)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resource types that can be audited.
 * GRCD Ref: §7.1 audit_events.resource_type
 * 
 * Vocabulary aligned with GRCD + extensible for MVP2
 */
export const AuditResourceTypeEnum = z.enum([
  // MVP1 - Identity
  'TENANT',
  'USER',
  'USER_TENANT_MEMBERSHIP',
  // MVP2 - Payment Cycle (future)
  'PAYMENT_REQUEST',
  'PAYMENT_APPROVAL',
  'PAYMENT_DISBURSEMENT',
  'PAYMENT_SLIP',
]);
export type AuditResourceType = z.infer<typeof AuditResourceTypeEnum>;

/**
 * Audit action types.
 * GRCD Ref: §7.1 audit_events.action
 * 
 * Vocabulary: CREATE | UPDATE | INVITE | ACCEPT_INVITE | LOGIN | LOGOUT | ...
 */
export const AuditActionEnum = z.enum([
  // Lifecycle
  'CREATE',
  'UPDATE',
  'DELETE',
  'SOFT_DELETE',
  // User-specific
  'INVITE',
  'ACCEPT_INVITE',
  'DEACTIVATE',
  'REACTIVATE',
  'ROLE_CHANGE',
  'PROFILE_UPDATE',
  // Auth-specific
  'LOGIN',
  'LOGOUT',
  'PASSWORD_RESET_REQUEST',
  'PASSWORD_RESET_COMPLETE',
  'PASSWORD_CHANGE',
  // View/access (for payment slip tracking in MVP2)
  'VIEW',
  'DOWNLOAD',
  // Payment-specific (MVP2)
  'SUBMIT',
  'APPROVE',
  'REJECT',
  'DISBURSE',
  'UPLOAD_SLIP',
  'CANCEL',
]);
export type AuditAction = z.infer<typeof AuditActionEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * IAM Audit Event Schema
 * 
 * Maps to: iam_audit_event table
 * GRCD Ref: §7.1 Core Entities - audit_events
 * 
 * This is the SAP/Oracle-style document traceability system:
 * - trace_id: Links all events for a single business object
 * - prev_hash + hash: Immutable hash chain for tamper detection
 * - location_ref: "C12" style reference for UI position tracking
 */
export const IamAuditEventSchema = z.object({
  // Primary key
  auditId: z.string().uuid().optional(),

  // Traceability - links to business object's trace_id
  // GRCD F-TRACE-1: Correlate all related audit events
  traceId: z.string().uuid(),

  // What was changed
  resourceType: AuditResourceTypeEnum,
  resourceId: z.string().uuid(),

  // What action was performed
  action: AuditActionEnum,

  // Who performed the action (nullable for system actions)
  actorUserId: z.string().uuid().nullable(),

  // Location reference (optional) - e.g., "C12", UI route, workflow step
  // GRCD F-TRACE-4: Trace *where* an action came from
  locationRef: z.string().optional(),

  // Metadata diff (optional) - before/after snapshot
  metadataDiff: z.record(z.unknown()).optional(),

  // Client info (optional, subject to privacy rules)
  // GRCD C-ORG-1: Auditable to IP/device fingerprint where lawful
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),

  // Timestamp
  createdAt: z.string().datetime().optional(),

  // Hash chain for immutability
  // GRCD F-TRACE-5: prev_hash + hash for tamper-evident chain
  prevHash: z.string().nullable(),
  hash: z.string(),
});

export type IamAuditEvent = z.infer<typeof IamAuditEventSchema>;

/**
 * Create Audit Event Input Schema
 */
export const CreateAuditEventInputSchema = IamAuditEventSchema.pick({
  traceId: true,
  resourceType: true,
  resourceId: true,
  action: true,
  actorUserId: true,
  locationRef: true,
  metadataDiff: true,
  ipAddress: true,
  userAgent: true,
});

export type CreateAuditEventInput = z.infer<typeof CreateAuditEventInputSchema>;

/**
 * Audit Timeline Query Schema
 * GRCD F-TRACE-6: Reconstruct full lifecycle from audit events
 */
export const AuditTimelineQuerySchema = z.object({
  traceId: z.string().uuid(),
  resourceType: AuditResourceTypeEnum.optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});

export type AuditTimelineQuery = z.infer<typeof AuditTimelineQuerySchema>;


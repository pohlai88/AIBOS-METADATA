// business-engine/admin-config/infrastructure/persistence/drizzle/schema/audit-event.schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { iamUser } from './user.schema';

/**
 * iam_audit_event
 * 
 * Immutable audit log for SAP/Oracle-style document traceability.
 * GRCD Ref: §7.1 Core Entities - audit_events
 * 
 * Key features:
 * - trace_id: Links all events for a single business object
 * - prev_hash + hash: Immutable hash chain for tamper detection
 * - location_ref: "C12" style reference for UI position tracking
 */
export const iamAuditEvent = pgTable(
  'iam_audit_event',
  {
    // Primary key
    auditId: uuid('audit_id').defaultRandom().primaryKey(),

    // Traceability - links to business object's trace_id
    // GRCD F-TRACE-1: Correlate all related audit events
    traceId: uuid('trace_id').notNull(),

    // What was changed
    // GRCD F-TRACE-3: resource_type + resource_id
    resourceType: text('resource_type')
      .$type<
        | 'TENANT'
        | 'USER'
        | 'USER_TENANT_MEMBERSHIP'
        // MVP2 Payment Cycle (future)
        | 'PAYMENT_REQUEST'
        | 'PAYMENT_APPROVAL'
        | 'PAYMENT_DISBURSEMENT'
        | 'PAYMENT_SLIP'
      >()
      .notNull(),
    resourceId: uuid('resource_id').notNull(),

    // What action was performed
    // GRCD F-TRACE-3: action
    action: text('action')
      .$type<
        | 'CREATE'
        | 'UPDATE'
        | 'DELETE'
        | 'SOFT_DELETE'
        | 'INVITE'
        | 'ACCEPT_INVITE'
        | 'DEACTIVATE'
        | 'REACTIVATE'
        | 'ROLE_CHANGE'
        | 'PROFILE_UPDATE'
        | 'LOGIN'
        | 'LOGOUT'
        | 'PASSWORD_RESET_REQUEST'
        | 'PASSWORD_RESET_COMPLETE'
        | 'PASSWORD_CHANGE'
        | 'VIEW'
        | 'DOWNLOAD'
        // MVP2 Payment Cycle
        | 'SUBMIT'
        | 'APPROVE'
        | 'REJECT'
        | 'DISBURSE'
        | 'UPLOAD_SLIP'
        | 'CANCEL'
      >()
      .notNull(),

    // Who performed the action
    // GRCD F-TRACE-3: actor_user_id (nullable for system actions)
    actorUserId: uuid('actor_user_id').references(() => iamUser.id, {
      onDelete: 'set null',
    }),

    // Location reference (optional)
    // GRCD F-TRACE-4: location_ref (e.g., "C12", UI route, workflow step)
    locationRef: text('location_ref'),

    // Metadata diff (optional) - before/after snapshot
    // GRCD F-TRACE-3: metadata_diff
    metadataDiff: jsonb('metadata_diff'),

    // Client info (optional, subject to privacy rules)
    // GRCD C-ORG-1: Auditable to IP/device fingerprint where lawful
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // Timestamp
    // GRCD F-TRACE-3: timestamp
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Hash chain for immutability
    // GRCD F-TRACE-5: prev_hash + hash for tamper-evident chain
    prevHash: text('prev_hash'),
    hash: text('hash').notNull(),
  },
  (table) => ({
    // Index for reconstructing lifecycle by trace_id
    // GRCD F-TRACE-6: Reconstruct full lifecycle from audit events
    traceIdIdx: index('iam_audit_event_trace_id_idx').on(
      table.traceId,
      table.createdAt,
    ),

    // Index for filtering by resource type
    resourceTypeIdx: index('iam_audit_event_resource_type_idx').on(
      table.resourceType,
      table.resourceId,
    ),

    // Index for filtering by actor
    actorIdx: index('iam_audit_event_actor_idx').on(table.actorUserId),

    // Index for time-range queries
    createdAtIdx: index('iam_audit_event_created_at_idx').on(table.createdAt),
  }),
);

// Types
export type IamAuditEventTable = typeof iamAuditEvent.$inferSelect;
export type InsertIamAuditEvent = typeof iamAuditEvent.$inferInsert;


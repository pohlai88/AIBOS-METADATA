// packages/events/src/event-schemas.ts

/**
 * Zod schemas for all event payloads.
 *
 * Each event type has a specific payload schema that extends BaseEventSchema.
 * Events are validated using a discriminated union over the "type" field.
 */

import { z } from 'zod';
import {
  BaseEventSchema,
  EntityTypeEnum,
  GovernanceTierEnum,
  PriorityEnum,
  ActorTypeEnum,
} from './event.types';

// ═══════════════════════════════════════════════════════════════════════════
// PROFILER EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * metadata.profile.due
 *
 * Emitted by: Kernel Scheduler
 * When: Entity is due for profiling (Tier1: ≥7 days, Tier2: ≥14 days)
 * Consumed by: Metadata Studio (profile.subscriber.ts)
 */
export const ProfileDuePayloadSchema = z.object({
  entityType: EntityTypeEnum,
  entityId: z.string().uuid(),         // DB id (mdm_global_metadata.id)
  canonicalKey: z.string(),            // Stable key (mdm_global_metadata.canonical_key)
  tier: GovernanceTierEnum,
  priority: PriorityEnum.default('normal'),
  reason: z.enum([
    'SCHEDULE',              // Regular scheduled profiling
    'STRUCTURAL_CHANGE',     // Metadata structure changed
    'QUALITY_DROP',          // Previous profile showed quality degradation
    'MANUAL',                // Manually triggered
  ]).default('SCHEDULE'),
  lastProfiledAt: z.string().datetime().optional(), // When last profiled (if ever)
  standardPackId: z.string().optional(), // SoT pack reference (e.g. "IFRS_CORE")
});

export type ProfileDuePayload = z.infer<typeof ProfileDuePayloadSchema>;

/**
 * metadata.profile.completed
 *
 * Emitted by: Metadata Studio (quality.service.ts after runProfiler)
 * When: Profile run completed successfully
 * Consumed by: Analytics, Alerts, Dashboards
 */
export const ProfileCompletedPayloadSchema = z.object({
  entityType: EntityTypeEnum,
  entityId: z.string().uuid(),
  canonicalKey: z.string(),
  
  // Quality dimensions (0-100)
  completeness: z.number().min(0).max(100),
  uniqueness: z.number().min(0).max(100),
  validity: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  
  // Quality grade (A-F)
  qualityGrade: z.string(),
  
  // Profile metadata
  profileId: z.string().uuid(),        // mdm_profile.id
  rowCount: z.number().int().min(0),
  duration: z.number().min(0),         // seconds
  
  // Trigger context
  triggeredBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
});

export type ProfileCompletedPayload = z.infer<typeof ProfileCompletedPayloadSchema>;

/**
 * metadata.profile.failed
 *
 * Emitted by: Metadata Studio (quality.service.ts on error)
 * When: Profile run failed
 * Consumed by: Alerts, Monitoring
 */
export const ProfileFailedPayloadSchema = z.object({
  entityType: EntityTypeEnum,
  entityId: z.string().uuid(),
  canonicalKey: z.string(),
  error: z.string(),
  errorCode: z.string().optional(),
  triggeredBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
});

export type ProfileFailedPayload = z.infer<typeof ProfileFailedPayloadSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// METADATA LIFECYCLE EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * metadata.changed
 *
 * Emitted by: Metadata Studio (metadata.service.ts after upsertGlobalMetadata)
 * When: Metadata definition changed (immediate or post-approval)
 * Consumed by: Lineage, Impact Analysis, Profiler
 */
export const MetadataChangedPayloadSchema = z.object({
  entityId: z.string().uuid(),
  canonicalKey: z.string(),
  changeType: z.enum([
    'APPROVAL',     // Applied via approval workflow
    'MIGRATION',    // Applied via data migration
    'MANUAL',       // Direct edit (Tier3+)
  ]),
  tier: GovernanceTierEnum,
  standardPackId: z.string().optional(),
  
  // What changed
  changedFields: z.array(z.string()).optional(), // e.g. ['label', 'description', 'tier']
  
  // Who changed it
  changedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
});

export type MetadataChangedPayload = z.infer<typeof MetadataChangedPayloadSchema>;

/**
 * metadata.approved
 *
 * Emitted by: Metadata Studio (approvals.routes.ts after approval)
 * When: Metadata change approved by steward/architect
 * Consumed by: Profiler (trigger profile), Analytics
 */
export const MetadataApprovedPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  entityId: z.string().uuid().optional(), // null for new entity
  canonicalKey: z.string(),
  tier: GovernanceTierEnum,
  approvedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
  approvedAt: z.string().datetime(),
});

export type MetadataApprovedPayload = z.infer<typeof MetadataApprovedPayloadSchema>;

/**
 * metadata.deprecated
 *
 * Emitted by: Metadata Studio (metadata.service.ts)
 * When: Metadata marked as deprecated
 * Consumed by: Alerts, Lineage, Impact Analysis
 */
export const MetadataDeprecatedPayloadSchema = z.object({
  entityId: z.string().uuid(),
  canonicalKey: z.string(),
  reason: z.string().optional(),
  deprecatedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
});

export type MetadataDeprecatedPayload = z.infer<typeof MetadataDeprecatedPayloadSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// KPI LIFECYCLE EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * kpi.changed
 *
 * Emitted by: Metadata Studio (kpi.service.ts after upsertKpi)
 * When: KPI definition changed
 * Consumed by: Impact Analysis, Dashboards
 */
export const KpiChangedPayloadSchema = z.object({
  entityId: z.string().uuid(),
  canonicalKey: z.string(),
  changeType: z.enum(['APPROVAL', 'MIGRATION', 'MANUAL']),
  tier: GovernanceTierEnum,
  standardPackId: z.string().optional(),
  changedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
});

export type KpiChangedPayload = z.infer<typeof KpiChangedPayloadSchema>;

/**
 * kpi.approved
 *
 * Emitted by: Metadata Studio (approvals.routes.ts)
 * When: KPI change approved
 * Consumed by: Analytics, Dashboards
 */
export const KpiApprovedPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  entityId: z.string().uuid().optional(),
  canonicalKey: z.string(),
  tier: GovernanceTierEnum,
  approvedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
  approvedAt: z.string().datetime(),
});

export type KpiApprovedPayload = z.infer<typeof KpiApprovedPayloadSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// DATA EVENTS (ETL)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * data.refreshed
 *
 * Emitted by: ETL pipelines, Finance service
 * When: Data load/refresh completed
 * Consumed by: Metadata Studio (profile.subscriber.ts)
 */
export const DataRefreshedPayloadSchema = z.object({
  entityUrn: z.string(),               // e.g. "gl.account:revenue_gross"
  service: z.object({
    schema: z.string(),                // e.g. "public"
    table: z.string(),                 // e.g. "sales_transactions"
  }),
  rowsAffected: z.number().int().min(0),
  refreshType: z.enum(['full_load', 'incremental', 'upsert', 'delete']),
  completedAt: z.string().datetime(),
  duration: z.number().min(0).optional(), // seconds
  triggeredBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
  metadata: z.record(z.unknown()).optional(), // Job-specific metadata
});

export type DataRefreshedPayload = z.infer<typeof DataRefreshedPayloadSchema>;

/**
 * data.quality.degraded
 *
 * Emitted by: Metadata Studio (quality.service.ts after runProfiler)
 * When: Quality score dropped significantly (>10% drop)
 * Consumed by: Alerts, Monitoring
 */
export const DataQualityDegradedPayloadSchema = z.object({
  entityUrn: z.string(),
  canonicalKey: z.string(),
  previousQualityScore: z.number().min(0).max(100),
  currentQualityScore: z.number().min(0).max(100),
  drop: z.number().min(0).max(100),    // Percentage drop
  profileId: z.string().uuid(),
});

export type DataQualityDegradedPayload = z.infer<typeof DataQualityDegradedPayloadSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * approval.created
 *
 * Emitted by: Metadata Studio (approval.service.ts)
 * When: New approval request created
 * Consumed by: Notifications, Approval UI
 */
export const ApprovalCreatedPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  entityType: EntityTypeEnum,
  entityKey: z.string(),
  tier: GovernanceTierEnum,
  requiredRole: z.string(),
  requestedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
});

export type ApprovalCreatedPayload = z.infer<typeof ApprovalCreatedPayloadSchema>;

/**
 * approval.approved
 *
 * Emitted by: Metadata Studio (approvals.routes.ts)
 * When: Approval granted
 * Consumed by: Metadata/KPI services (apply changes)
 */
export const ApprovalApprovedPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  entityType: EntityTypeEnum,
  entityId: z.string().uuid().optional(),
  entityKey: z.string(),
  approvedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
  approvedAt: z.string().datetime(),
});

export type ApprovalApprovedPayload = z.infer<typeof ApprovalApprovedPayloadSchema>;

/**
 * approval.rejected
 *
 * Emitted by: Metadata Studio (approvals.routes.ts)
 * When: Approval rejected
 * Consumed by: Notifications
 */
export const ApprovalRejectedPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  entityType: EntityTypeEnum,
  entityKey: z.string(),
  reason: z.string().optional(),
  rejectedBy: z.object({
    actorId: z.string(),
    actorType: ActorTypeEnum,
  }),
  rejectedAt: z.string().datetime(),
});

export type ApprovalRejectedPayload = z.infer<typeof ApprovalRejectedPayloadSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// DISCRIMINATED UNION (Event Schema)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Complete event schema using discriminated union over "type".
 *
 * This allows TypeScript to narrow the event payload type based on event.type.
 */
export const EventSchema = z.discriminatedUnion('type', [
  // Profiler events
  BaseEventSchema.extend({
    type: z.literal('metadata.profile.due'),
    payload: ProfileDuePayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('metadata.profile.completed'),
    payload: ProfileCompletedPayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('metadata.profile.failed'),
    payload: ProfileFailedPayloadSchema,
  }),

  // Metadata lifecycle
  BaseEventSchema.extend({
    type: z.literal('metadata.changed'),
    payload: MetadataChangedPayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('metadata.approved'),
    payload: MetadataApprovedPayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('metadata.deprecated'),
    payload: MetadataDeprecatedPayloadSchema,
  }),

  // KPI lifecycle
  BaseEventSchema.extend({
    type: z.literal('kpi.changed'),
    payload: KpiChangedPayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('kpi.approved'),
    payload: KpiApprovedPayloadSchema,
  }),

  // Data events
  BaseEventSchema.extend({
    type: z.literal('data.refreshed'),
    payload: DataRefreshedPayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('data.quality.degraded'),
    payload: DataQualityDegradedPayloadSchema,
  }),

  // Approval events
  BaseEventSchema.extend({
    type: z.literal('approval.created'),
    payload: ApprovalCreatedPayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('approval.approved'),
    payload: ApprovalApprovedPayloadSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal('approval.rejected'),
    payload: ApprovalRejectedPayloadSchema,
  }),
]);

export type Event = z.infer<typeof EventSchema>;


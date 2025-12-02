// packages/events/src/index.ts

/**
 * @aibos/events
 *
 * Shared event schemas and types for AIBOS Metadata Platform.
 *
 * This package provides:
 * - Event type definitions (EventType, EntityType, etc.)
 * - Zod schemas for validation (EventSchema, ProfileDuePayloadSchema, etc.)
 * - TypeScript types for type safety
 *
 * Usage:
 * ```typescript
 * import { EventSchema, type Event } from '@aibos/events';
 *
 * const event: Event = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   type: 'metadata.profile.due',
 *   version: '1.0.0',
 *   tenantId: 'tenant-123',
 *   source: 'kernel.scheduler',
 *   createdAt: new Date().toISOString(),
 *   payload: {
 *     entityType: 'METADATA',
 *     entityId: 'meta-456',
 *     canonicalKey: 'revenue_gross',
 *     tier: 'tier1',
 *     priority: 'high',
 *     reason: 'SCHEDULE',
 *   }
 * };
 *
 * // Validate
 * const validated = EventSchema.parse(event);
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Enums
  EventSourceEnum,
  EventTypeEnum,
  EntityTypeEnum,
  GovernanceTierEnum,
  ActorTypeEnum,
  PriorityEnum,
  
  // Types
  type EventSource,
  type EventType,
  type EntityType,
  type GovernanceTier,
  type ActorType,
  type Priority,
  
  // Base event
  BaseEventSchema,
  type BaseEvent,
} from './event.types';

// ═══════════════════════════════════════════════════════════════════════════
// Event Schemas & Payloads
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Profiler events
  ProfileDuePayloadSchema,
  ProfileCompletedPayloadSchema,
  ProfileFailedPayloadSchema,
  type ProfileDuePayload,
  type ProfileCompletedPayload,
  type ProfileFailedPayload,
  
  // Metadata lifecycle
  MetadataChangedPayloadSchema,
  MetadataApprovedPayloadSchema,
  MetadataDeprecatedPayloadSchema,
  type MetadataChangedPayload,
  type MetadataApprovedPayload,
  type MetadataDeprecatedPayload,
  
  // KPI lifecycle
  KpiChangedPayloadSchema,
  KpiApprovedPayloadSchema,
  type KpiChangedPayload,
  type KpiApprovedPayload,
  
  // Data events
  DataRefreshedPayloadSchema,
  DataQualityDegradedPayloadSchema,
  type DataRefreshedPayload,
  type DataQualityDegradedPayload,
  
  // Approval events
  ApprovalCreatedPayloadSchema,
  ApprovalApprovedPayloadSchema,
  ApprovalRejectedPayloadSchema,
  type ApprovalCreatedPayload,
  type ApprovalApprovedPayload,
  type ApprovalRejectedPayload,
  
  // Complete event schema
  EventSchema,
  type Event,
} from './event-schemas';


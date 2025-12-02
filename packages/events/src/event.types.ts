// packages/events/src/event.types.ts

/**
 * Shared event type definitions for AIBOS Metadata Platform.
 *
 * This is the SSOT (Single Source of Truth) for event types
 * used across all components:
 * - metadata-studio (consumer)
 * - kernel (producer)
 * - etl-pipeline (producer)
 * - finance (producer/consumer)
 *
 * Design Principles:
 * - Events are immutable
 * - Events contain all necessary context (no DB lookups needed)
 * - Events use stable identifiers (canonicalKey, not DB IDs when possible)
 * - Events follow CloudEvents spec loosely (id, type, source, time)
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// Event Sources (WHO emits)
// ═══════════════════════════════════════════════════════════════════════════

export const EventSourceEnum = z.enum([
  'kernel.scheduler',      // Kernel scheduler (profile:due, compliance checks)
  'metadata-studio.api',   // Metadata Studio API (user actions)
  'metadata-studio.approval', // Approval workflow (approvals)
  'etl.pipeline',          // ETL pipelines (data refreshes)
  'finance.service',       // Finance service (domain events)
  'bff.graphql',           // BFF GraphQL layer (user queries)
  'agent.profiler',        // AI agent (automated profiling)
  'system.migration',      // System migrations
]);

export type EventSource = z.infer<typeof EventSourceEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// Event Types (WHAT happened)
// ═══════════════════════════════════════════════════════════════════════════

export const EventTypeEnum = z.enum([
  // Profiler events
  'metadata.profile.due',         // Profile is due (scheduled)
  'metadata.profile.completed',   // Profile run completed
  'metadata.profile.failed',      // Profile run failed

  // Metadata lifecycle events
  'metadata.changed',             // Metadata definition changed
  'metadata.approved',            // Metadata change approved
  'metadata.deprecated',          // Metadata marked as deprecated

  // KPI lifecycle events
  'kpi.changed',                  // KPI definition changed
  'kpi.approved',                 // KPI change approved
  'kpi.deprecated',               // KPI marked as deprecated

  // Data events (from ETL)
  'data.refreshed',               // Data load/refresh completed
  'data.quality.degraded',        // Quality score dropped significantly

  // Approval events
  'approval.created',             // New approval request
  'approval.approved',            // Approval granted
  'approval.rejected',            // Approval rejected

  // Lineage events
  'lineage.updated',              // Lineage graph updated

  // Glossary events
  'glossary.term.created',        // New glossary term
  'glossary.term.updated',        // Glossary term updated
]);

export type EventType = z.infer<typeof EventTypeEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// Entity Types (WHAT entity)
// ═══════════════════════════════════════════════════════════════════════════

export const EntityTypeEnum = z.enum([
  'METADATA',      // mdm_global_metadata
  'KPI',           // mdm_kpi_definition
  'GLOSSARY',      // mdm_glossary_term
  'BUSINESS_RULE', // mdm_business_rule
  'TAG',           // mdm_tag
  'LINEAGE',       // mdm_lineage_field
]);

export type EntityType = z.infer<typeof EntityTypeEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// Governance Tiers
// ═══════════════════════════════════════════════════════════════════════════

export const GovernanceTierEnum = z.enum(['tier1', 'tier2', 'tier3', 'tier4', 'tier5']);

export type GovernanceTier = z.infer<typeof GovernanceTierEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// Actor Types (WHO triggered)
// ═══════════════════════════════════════════════════════════════════════════

export const ActorTypeEnum = z.enum(['HUMAN', 'AGENT', 'SYSTEM']);

export type ActorType = z.infer<typeof ActorTypeEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// Priority Levels
// ═══════════════════════════════════════════════════════════════════════════

export const PriorityEnum = z.enum(['low', 'normal', 'high', 'critical']);

export type Priority = z.infer<typeof PriorityEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// Base Event Envelope
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base envelope for all events.
 * Follows CloudEvents spec loosely.
 */
export const BaseEventSchema = z.object({
  /** Unique event ID (UUID) */
  id: z.string().uuid(),

  /** Event type (what happened) */
  type: EventTypeEnum,

  /** Event schema version (for backward compatibility) */
  version: z.literal('1.0.0'),

  /** Tenant ID (multi-tenancy isolation) */
  tenantId: z.string().uuid(),

  /** Event source (who emitted) */
  source: EventSourceEnum,

  /** Correlation ID for tracing related events */
  correlationId: z.string().optional(),

  /** When the event was created (ISO 8601) */
  createdAt: z.string().datetime(),

  /** Optional trace context (OpenTelemetry) */
  traceContext: z.object({
    traceId: z.string().optional(),
    spanId: z.string().optional(),
  }).optional(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;


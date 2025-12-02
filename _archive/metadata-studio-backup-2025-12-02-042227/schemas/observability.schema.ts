/**
 * Observability Schema
 * Governance + Profiler + Usage tracking
 */

import { z } from 'zod';

// Governance Schema
export const GovernanceTierSchema = z.enum(['tier1', 'tier2', 'tier3', 'untiered']);

export const GovernanceRecordSchema = z.object({
  entityId: z.string().uuid(),
  tier: GovernanceTierSchema,
  auditReadiness: z.boolean().default(false),
  complianceScore: z.number().min(0).max(100).optional(),
  policies: z.array(z.object({
    policyId: z.string(),
    policyName: z.string(),
    status: z.enum(['compliant', 'non-compliant', 'warning']),
  })).default([]),
  lastAuditDate: z.date().or(z.string()).optional(),
  nextAuditDate: z.date().or(z.string()).optional(),
});

// Profiler Schema
export const ProfileStatisticsSchema = z.object({
  columnName: z.string(),
  dataType: z.string(),
  nullCount: z.number(),
  distinctCount: z.number(),
  min: z.any().optional(),
  max: z.any().optional(),
  mean: z.number().optional(),
  median: z.number().optional(),
  stdDev: z.number().optional(),
  topValues: z.array(z.object({
    value: z.any(),
    count: z.number(),
    percentage: z.number(),
  })).optional(),
});

export const DataProfileSchema = z.object({
  entityId: z.string().uuid(),
  profiledAt: z.date().or(z.string()),
  rowCount: z.number(),
  columnCount: z.number(),
  columnProfiles: z.array(ProfileStatisticsSchema),
  qualityScore: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  uniqueness: z.number().min(0).max(100),
  validity: z.number().min(0).max(100),
});

// Usage Tracking Schema
export const UsageEventSchema = z.object({
  eventId: z.string().uuid(),
  entityId: z.string().uuid(),
  userId: z.string(),
  eventType: z.enum(['read', 'write', 'query', 'export', 'download']),
  timestamp: z.date().or(z.string()),
  metadata: z.record(z.any()).optional(),
});

export const UsageStatsSchema = z.object({
  entityId: z.string().uuid(),
  period: z.enum(['daily', 'weekly', 'monthly']),
  totalAccess: z.number(),
  uniqueUsers: z.number(),
  readCount: z.number(),
  writeCount: z.number(),
  queryCount: z.number(),
  popularityScore: z.number().min(0).max(100),
  lastAccessedAt: z.date().or(z.string()).optional(),
});

export type GovernanceTier = z.infer<typeof GovernanceTierSchema>;
export type GovernanceRecord = z.infer<typeof GovernanceRecordSchema>;
export type ProfileStatistics = z.infer<typeof ProfileStatisticsSchema>;
export type DataProfile = z.infer<typeof DataProfileSchema>;
export type UsageEvent = z.infer<typeof UsageEventSchema>;
export type UsageStats = z.infer<typeof UsageStatsSchema>;


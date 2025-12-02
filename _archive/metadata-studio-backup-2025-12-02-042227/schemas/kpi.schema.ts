/**
 * KPI Schema
 * Key Performance Indicators and metrics
 */

import { z } from 'zod';

export const KPISchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  
  // KPI definition
  formula: z.string(),
  unit: z.string().optional(),
  aggregationType: z.enum(['sum', 'avg', 'count', 'min', 'max', 'distinct']),
  
  // Data source
  sourceEntities: z.array(z.string().uuid()),
  calculationSQL: z.string().optional(),
  
  // Targets & thresholds
  target: z.number().optional(),
  thresholds: z.object({
    critical: z.number().optional(),
    warning: z.number().optional(),
    good: z.number().optional(),
    excellent: z.number().optional(),
  }).optional(),
  
  // Time dimension
  timeGrain: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  
  // Ownership & governance
  owner: z.string().optional(),
  domain: z.string().optional(),
  tier: z.enum(['tier1', 'tier2', 'tier3']).optional(),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  createdBy: z.string(),
});

export const KPIValueSchema = z.object({
  kpiId: z.string().uuid(),
  value: z.number(),
  timestamp: z.date().or(z.string()),
  period: z.string(),
  dimensions: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type KPI = z.infer<typeof KPISchema>;
export type KPIValue = z.infer<typeof KPIValueSchema>;


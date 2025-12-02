/**
 * Standard Pack Schema
 * Defines standardized metadata packages (SOT Packs)
 */

import { z } from 'zod';

export const StandardPackSchema = z.object({
  packId: z.string(),
  packName: z.string(),
  version: z.string(),
  description: z.string(),
  category: z.enum(['finance', 'hr', 'operations', 'sales', 'marketing', 'general']),
  tier: z.enum(['tier1', 'tier2', 'tier3']),
  
  // Standard field definitions
  fields: z.array(z.object({
    fieldName: z.string(),
    displayName: z.string(),
    dataType: z.string(),
    required: z.boolean().default(false),
    description: z.string(),
    businessDefinition: z.string().optional(),
    validationRules: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
    format: z.string().optional(),
  })),
  
  // Business rules
  businessRules: z.array(z.object({
    ruleId: z.string(),
    ruleName: z.string(),
    description: z.string(),
    expression: z.string(),
  })).optional(),
  
  // Quality rules
  qualityRules: z.array(z.object({
    ruleId: z.string(),
    ruleName: z.string(),
    dimension: z.enum(['completeness', 'accuracy', 'consistency', 'validity', 'uniqueness']),
    threshold: z.number(),
  })).optional(),
  
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  createdBy: z.string(),
});

export const StandardPackConformanceSchema = z.object({
  entityId: z.string().uuid(),
  packId: z.string(),
  conformanceScore: z.number().min(0).max(100),
  conformantFields: z.array(z.string()),
  missingFields: z.array(z.string()),
  invalidFields: z.array(z.object({
    fieldName: z.string(),
    reason: z.string(),
  })),
  checkedAt: z.date().or(z.string()),
});

export type StandardPack = z.infer<typeof StandardPackSchema>;
export type StandardPackConformance = z.infer<typeof StandardPackConformanceSchema>;


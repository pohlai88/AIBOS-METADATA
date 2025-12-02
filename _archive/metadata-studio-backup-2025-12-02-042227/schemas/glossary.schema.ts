/**
 * Glossary Schema
 * Business glossary and terminology management
 */

import { z } from 'zod';

export const GlossaryTermSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  definition: z.string(),
  businessDefinition: z.string().optional(),
  technicalDefinition: z.string().optional(),
  category: z.string(),
  domain: z.string().optional(),
  
  // Relationships
  synonyms: z.array(z.string()).default([]),
  relatedTerms: z.array(z.string().uuid()).default([]),
  parentTermId: z.string().uuid().optional(),
  childTermIds: z.array(z.string().uuid()).default([]),
  
  // Ownership & governance
  owner: z.string().optional(),
  steward: z.string().optional(),
  status: z.enum(['draft', 'approved', 'deprecated']).default('draft'),
  
  // Usage
  usage: z.string().optional(),
  examples: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Metadata
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
});

export const GlossaryCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  parentCategoryId: z.string().uuid().optional(),
  termCount: z.number().default(0),
});

export const TermAssignmentSchema = z.object({
  termId: z.string().uuid(),
  entityId: z.string().uuid(),
  entityType: z.string(),
  assignedBy: z.string(),
  assignedAt: z.date().or(z.string()),
  confidence: z.number().min(0).max(100).default(100),
});

export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
export type GlossaryCategory = z.infer<typeof GlossaryCategorySchema>;
export type TermAssignment = z.infer<typeof TermAssignmentSchema>;


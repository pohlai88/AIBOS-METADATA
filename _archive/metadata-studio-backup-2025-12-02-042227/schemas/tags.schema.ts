/**
 * Tags Schema
 * Tag management and assignment
 */

import { z } from 'zod';

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  
  // Tag type
  type: z.enum(['system', 'user', 'automated']).default('user'),
  
  // Metadata
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  createdBy: z.string(),
});

export const TagAssignmentSchema = z.object({
  id: z.string().uuid(),
  tagId: z.string().uuid(),
  entityId: z.string().uuid(),
  entityType: z.string(),
  assignedBy: z.string(),
  assignedAt: z.date().or(z.string()),
  source: z.enum(['manual', 'automated', 'inherited']).default('manual'),
});

export const TagCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  tagCount: z.number().default(0),
});

export type Tag = z.infer<typeof TagSchema>;
export type TagAssignment = z.infer<typeof TagAssignmentSchema>;
export type TagCategory = z.infer<typeof TagCategorySchema>;


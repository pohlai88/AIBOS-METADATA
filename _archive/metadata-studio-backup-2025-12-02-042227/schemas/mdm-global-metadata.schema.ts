/**
 * MDM Global Metadata Schema
 * Single Source of Truth for metadata entities
 */

import { z } from 'zod';

export const MetadataEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  displayName: z.string().optional(),
  description: z.string().optional(),
  type: z.enum([
    'table',
    'view',
    'column',
    'dataset',
    'dashboard',
    'report',
    'metric',
    'kpi'
  ]),
  sourceSystem: z.string(),
  fullyQualifiedName: z.string(),
  aliases: z.array(z.string()).default([]),
  owner: z.string().optional(),
  steward: z.string().optional(),
  domain: z.string().optional(),
  classification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
  tags: z.array(z.string()).default([]),
  customProperties: z.record(z.any()).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const ColumnMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  dataType: z.string(),
  nullable: z.boolean().default(true),
  isPrimaryKey: z.boolean().default(false),
  isForeignKey: z.boolean().default(false),
  description: z.string().optional(),
  businessDefinition: z.string().optional(),
  format: z.string().optional(),
  defaultValue: z.any().optional(),
  constraints: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const TableMetadataSchema = MetadataEntitySchema.extend({
  type: z.literal('table'),
  schema: z.string(),
  database: z.string(),
  columns: z.array(ColumnMetadataSchema),
  rowCount: z.number().optional(),
  sizeBytes: z.number().optional(),
  partitionedBy: z.array(z.string()).optional(),
  clusteredBy: z.array(z.string()).optional(),
});

export type MetadataEntity = z.infer<typeof MetadataEntitySchema>;
export type ColumnMetadata = z.infer<typeof ColumnMetadataSchema>;
export type TableMetadata = z.infer<typeof TableMetadataSchema>;


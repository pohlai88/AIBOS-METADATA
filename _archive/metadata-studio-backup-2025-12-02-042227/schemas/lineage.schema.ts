/**
 * Lineage Schema
 * Data lineage and dependency tracking
 */

import { z } from 'zod';

export const LineageNodeSchema = z.object({
  id: z.string().uuid(),
  entityId: z.string().uuid(),
  entityName: z.string(),
  entityType: z.string(),
  fullyQualifiedName: z.string(),
  level: z.number().default(0),
});

export const LineageEdgeSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  edgeType: z.enum(['direct', 'indirect', 'derived', 'aggregation', 'join']),
  transformationLogic: z.string().optional(),
  confidence: z.number().min(0).max(100).default(100),
  metadata: z.record(z.any()).optional(),
});

export const LineageGraphSchema = z.object({
  rootEntityId: z.string().uuid(),
  direction: z.enum(['upstream', 'downstream', 'both']),
  depth: z.number().min(1).max(10).default(5),
  nodes: z.array(LineageNodeSchema),
  edges: z.array(LineageEdgeSchema),
  generatedAt: z.date().or(z.string()),
});

export const ColumnLineageSchema = z.object({
  id: z.string().uuid(),
  sourceColumnId: z.string().uuid(),
  targetColumnId: z.string().uuid(),
  sourceTable: z.string(),
  targetTable: z.string(),
  sourceColumn: z.string(),
  targetColumn: z.string(),
  transformationType: z.enum(['copy', 'cast', 'aggregate', 'calculation', 'join']),
  transformationSQL: z.string().optional(),
  createdAt: z.date().or(z.string()),
});

export type LineageNode = z.infer<typeof LineageNodeSchema>;
export type LineageEdge = z.infer<typeof LineageEdgeSchema>;
export type LineageGraph = z.infer<typeof LineageGraphSchema>;
export type ColumnLineage = z.infer<typeof ColumnLineageSchema>;


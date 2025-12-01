/**
 * Lineage Service
 * Business logic for lineage tracking and analysis
 */

import { lineageRepo } from '../db/lineage.repo';
import { LineageGraph, LineageGraphSchema } from '../schemas/lineage.schema';

export const lineageService = {
  async getUpstream(entityId: string, depth: number = 5): Promise<LineageGraph> {
    const graph = await lineageRepo.buildLineageGraph(entityId, 'upstream', depth);
    return LineageGraphSchema.parse(graph);
  },

  async getDownstream(entityId: string, depth: number = 5): Promise<LineageGraph> {
    const graph = await lineageRepo.buildLineageGraph(entityId, 'downstream', depth);
    return LineageGraphSchema.parse(graph);
  },

  async getFullLineage(entityId: string, depth: number = 5): Promise<LineageGraph> {
    const graph = await lineageRepo.buildLineageGraph(entityId, 'both', depth);
    return LineageGraphSchema.parse(graph);
  },

  async createLineage(data: unknown): Promise<any> {
    return await lineageRepo.createLineageEdge(data);
  },

  async getColumnLineage(columnId: string): Promise<any[]> {
    return await lineageRepo.getColumnLineage(columnId);
  },

  async calculateLineageCoverage(): Promise<number> {
    return await lineageRepo.calculateCoverage();
  },
};


/**
 * Impact Analysis Service
 * Business logic for impact analysis
 */

import { lineageService } from './lineage.service';
import { metadataRepo } from '../db/metadata.repo';

interface ImpactAnalysisResult {
  entityId: string;
  impactedEntities: Array<{
    id: string;
    name: string;
    type: string;
    impactLevel: 'high' | 'medium' | 'low';
    distance: number;
  }>;
  totalImpacted: number;
  criticalPaths: string[][];
}

export const impactAnalysisService = {
  async analyze(entityId: string): Promise<ImpactAnalysisResult> {
    // Get downstream lineage
    const lineage = await lineageService.getDownstream(entityId, 10);
    
    // Calculate impact levels based on distance and entity tier
    const impactedEntities = await Promise.all(
      lineage.nodes
        .filter(node => node.entityId !== entityId)
        .map(async node => {
          const metadata = await metadataRepo.findById(node.entityId);
          const impactLevel = node.level <= 2 ? 'high' : node.level <= 5 ? 'medium' : 'low';
          
          return {
            id: node.entityId,
            name: node.entityName,
            type: node.entityType,
            impactLevel,
            distance: node.level,
          };
        })
    );

    // Find critical paths (paths to tier1 entities)
    const criticalPaths: string[][] = [];
    // TODO: Implement critical path detection

    return {
      entityId,
      impactedEntities,
      totalImpacted: impactedEntities.length,
      criticalPaths,
    };
  },

  async simulate(changes: unknown): Promise<ImpactAnalysisResult> {
    // Simulate impact of proposed changes
    // TODO: Implement simulation logic
    throw new Error('Not implemented');
  },
};


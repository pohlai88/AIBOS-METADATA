/**
 * MCP Tools - Impact Analysis
 * Wraps impact analysis service for MCP agent consumption
 */

import { impactAnalysisService } from '../../services/impact-analysis.service';

export const impactTools = {
  async impact_analyze(args: { entityId: string }) {
    return await impactAnalysisService.analyze(args.entityId);
  },

  async impact_simulate(args: { changes: any }) {
    return await impactAnalysisService.simulate(args.changes);
  },
};


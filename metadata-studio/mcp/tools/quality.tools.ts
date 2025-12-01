/**
 * MCP Tools - Quality
 * Wraps quality service for MCP agent consumption
 */

import { qualityService } from '../../services/quality.service';

export const qualityTools = {
  async quality_get_score(args: { entityId: string }) {
    return await qualityService.getQualityScore(args.entityId);
  },

  async quality_get_profile(args: { entityId: string }) {
    return await qualityService.getProfile(args.entityId);
  },

  async quality_run_profiler(args: { config: any }) {
    return await qualityService.runProfiler(args.config);
  },

  async quality_get_history(args: { entityId: string; limit?: number }) {
    return await qualityService.getProfileHistory(args.entityId, args.limit || 10);
  },
};


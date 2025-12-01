/**
 * MCP Tools - Usage
 * Wraps usage service for MCP agent consumption
 */

import { usageService } from '../../services/usage.service';

export const usageTools = {
  async usage_get_stats(args: { entityId: string }) {
    return await usageService.getUsageStats(args.entityId);
  },

  async usage_track(args: { data: any }) {
    return await usageService.trackUsage(args.data);
  },

  async usage_get_popular(args: { limit?: number }) {
    return await usageService.getPopularEntities(args.limit || 10);
  },

  async usage_get_user_activity(args: { userId: string; days?: number }) {
    return await usageService.getUserActivity(args.userId, args.days || 30);
  },

  async usage_get_unused(args: { days?: number }) {
    return await usageService.getUnusedEntities(args.days || 90);
  },
};


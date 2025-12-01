/**
 * Usage Service
 * Business logic for usage tracking and analytics
 */

import { observabilityRepo } from '../db/observability.repo';
import { UsageStats, UsageEvent, UsageEventSchema } from '../schemas/observability.schema';

export const usageService = {
  async getUsageStats(entityId: string): Promise<UsageStats | null> {
    return await observabilityRepo.getUsageStats(entityId);
  },

  async trackUsage(data: unknown): Promise<UsageEvent> {
    const validated = UsageEventSchema.parse(data);
    return await observabilityRepo.trackUsageEvent(validated);
  },

  async getPopularEntities(limit: number = 10): Promise<any[]> {
    return await observabilityRepo.getPopularEntities(limit);
  },

  async getUserActivity(userId: string, days: number = 30): Promise<UsageEvent[]> {
    return await observabilityRepo.getUserActivity(userId, days);
  },

  async getUnusedEntities(days: number = 90): Promise<string[]> {
    return await observabilityRepo.getUnusedEntities(days);
  },
};


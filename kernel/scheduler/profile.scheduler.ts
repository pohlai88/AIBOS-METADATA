// kernel/scheduler/profile.scheduler.ts

/**
 * Kernel Scheduler - Profile Due Event Emitter
 *
 * Responsibilities:
 * - Query mdm_global_metadata for Tier1-Tier3 entities (profileable)
 * - Check last profile date from mdm_profile
 * - Emit metadata.profile.due events for stale profiles
 *
 * Governance Rules (GRCD Compliance):
 * - Tier1: Profile every 1 day (daily) - CRITICAL
 * - Tier2: Profile every 3 days
 * - Tier3: Profile every 7 days
 * - Tier4: Profile every 30 days (monthly)
 * - Tier5: Profile every 90 days (quarterly)
 *
 * Cost Optimization:
 * - Only profile entities with service bindings (physical tables)
 * - Skip if last profile is within interval (avoid duplicates)
 * - Tier1 gets 'high' priority, others get 'normal'
 *
 * Deployment Options:
 * 1. **Monorepo (single process):**
 *    - Import shared eventBus from metadata-studio/events
 *    - Events propagate in-memory via EventEmitter
 *
 * 2. **Distributed (multi-service):**
 *    - Create own RedisEventBus instance
 *    - Events propagate via Redis Pub/Sub
 *    - Kernel and Metadata Studio run in separate processes
 */

import type { EventBus } from '../../metadata-studio/events/redis-event-bus';
import type { GovernanceTier } from '@aibos/events';

/**
 * Tier-based profile intervals (in days).
 *
 * GRCD Compliance:
 * - Tier1: 1 day (critical - daily profiling required)
 * - Tier2: 3 days
 * - Tier3: 7 days (weekly)
 * - Tier4: 30 days (monthly)
 * - Tier5: 90 days (quarterly)
 */
export const TIER_PROFILE_INTERVAL_DAYS: Record<GovernanceTier, number> = {
  tier1: 1,   // Daily (GRCD compliance)
  tier2: 3,   // Every 3 days
  tier3: 7,   // Weekly
  tier4: 30,  // Monthly
  tier5: 90,  // Quarterly
};

/**
 * Calculate days between two dates.
 */
export function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return ms / (1000 * 60 * 60 * 24);
}

/**
 * Metadata entity (from mdm_global_metadata).
 */
export interface ProfileCandidate {
  id: string;
  tenantId: string;
  canonicalKey: string;
  tier: GovernanceTier;
  standardPackId?: string;
  hasServiceBinding: boolean; // True if entity maps to physical table
}

/**
 * Latest profile info (from mdm_profile).
 */
export interface LatestProfile {
  id: string;
  createdAt: Date;
  qualityScore: number;
}

/**
 * Repository interface for fetching profile candidates.
 * Abstraction layer for hexagonal architecture.
 */
export interface MetadataRepository {
  /**
   * List all metadata entities eligible for profiling.
   *
   * Filters:
   * - Tier1-Tier3 (Tier4-5 optional)
   * - Active status
   * - Has service binding (maps to physical table)
   *
   * @param tenantId - Tenant ID
   * @returns Array of profile candidates
   */
  listProfileCandidates(tenantId: string): Promise<ProfileCandidate[]>;
}

/**
 * Repository interface for fetching profile history.
 */
export interface ObservabilityRepository {
  /**
   * Get latest profile for an entity.
   *
   * @param tenantId - Tenant ID
   * @param entityUrn - Entity URN (e.g. "urn:aibos:metadata:tenant-123:revenue_gross")
   * @returns Latest profile or null if never profiled
   */
  getLatestProfile(
    tenantId: string,
    entityUrn: string
  ): Promise<LatestProfile | null>;
}

/**
 * Profile Scheduler Configuration
 */
export interface ProfileSchedulerConfig {
  /**
   * Event bus instance (EventEmitter or Redis).
   */
  eventBus: EventBus;

  /**
   * Metadata repository (for fetching profile candidates).
   */
  metadataRepo: MetadataRepository;

  /**
   * Observability repository (for fetching profile history).
   */
  observabilityRepo: ObservabilityRepository;

  /**
   * Minimum tiers to profile (default: ['tier1', 'tier2', 'tier3']).
   * Tier4/5 are optional (monthly/quarterly profiling).
   */
  minTiers?: GovernanceTier[];

  /**
   * Dry run mode (log events instead of emitting).
   * Useful for testing.
   */
  dryRun?: boolean;
}

/**
 * Profile Scheduler
 *
 * Emits metadata.profile.due events for entities that need profiling.
 *
 * @example
 * ```typescript
 * // Monorepo (single process)
 * import { eventBus } from '../../metadata-studio/events';
 * import { metadataRepo } from '../../metadata-studio/db/metadata.repo';
 * import { observabilityRepo } from '../../metadata-studio/db/observability.repo';
 *
 * const scheduler = new ProfileScheduler({
 *   eventBus,
 *   metadataRepo,
 *   observabilityRepo,
 * });
 *
 * await scheduler.emitProfileDueEventsForTenant('tenant-123');
 * ```
 *
 * @example
 * ```typescript
 * // Distributed (multi-service)
 * import { createEventBus } from '../../metadata-studio/events/event-bus-factory';
 * import { createMetadataRepo } from './metadata-client';
 * import { createObservabilityRepo } from './observability-client';
 *
 * const eventBus = await createEventBus({ type: 'redis', redisUrl: '...' });
 * const scheduler = new ProfileScheduler({
 *   eventBus,
 *   metadataRepo: createMetadataRepo(),
 *   observabilityRepo: createObservabilityRepo(),
 * });
 *
 * await scheduler.emitProfileDueEventsForTenant('tenant-123');
 * ```
 */
export class ProfileScheduler {
  private config: Required<ProfileSchedulerConfig>;

  constructor(config: ProfileSchedulerConfig) {
    this.config = {
      ...config,
      minTiers: config.minTiers ?? ['tier1', 'tier2', 'tier3'],
      dryRun: config.dryRun ?? false,
    };

    console.log('[ProfileScheduler] Initialized ✅');
    console.log(`[ProfileScheduler] Dry run: ${this.config.dryRun}`);
    console.log(`[ProfileScheduler] Min tiers: ${this.config.minTiers.join(', ')}`);
  }

  /**
   * Emit profile:due events for a single tenant.
   *
   * Algorithm:
   * 1. Fetch all profile candidates (Tier1-Tier3 with service bindings)
   * 2. For each candidate, check last profile date
   * 3. If stale (> interval), emit metadata.profile.due event
   * 4. Skip if recently profiled (cost optimization)
   *
   * @param tenantId - Tenant ID
   * @param now - Current time (for testing/replay)
   * @returns Number of events emitted
   */
  async emitProfileDueEventsForTenant(
    tenantId: string,
    now: Date = new Date()
  ): Promise<number> {
    console.log(`[ProfileScheduler] Processing tenant: ${tenantId}`);

    // 1. Fetch profile candidates
    const candidates = await this.config.metadataRepo.listProfileCandidates(
      tenantId
    );

    console.log(
      `[ProfileScheduler] Found ${candidates.length} profile candidates`
    );

    let emittedCount = 0;

    // 2. Process each candidate
    for (const meta of candidates) {
      // Filter by min tiers
      if (!this.config.minTiers.includes(meta.tier)) {
        continue;
      }

      // Skip if no service binding (can't profile without physical table)
      if (!meta.hasServiceBinding) {
        console.log(
          `[ProfileScheduler] Skipping ${meta.canonicalKey}: no service binding`
        );
        continue;
      }

      // 3. Check last profile date
      const entityUrn = `urn:aibos:metadata:${tenantId}:${meta.canonicalKey}`;
      const latestProfile = await this.config.observabilityRepo.getLatestProfile(
        tenantId,
        entityUrn
      );

      // 4. Calculate if profile is stale
      const minInterval = TIER_PROFILE_INTERVAL_DAYS[meta.tier];
      const daysSinceProfile = latestProfile
        ? daysBetween(latestProfile.createdAt, now)
        : Infinity;

      if (daysSinceProfile < minInterval) {
        // Too recent → skip (cost optimization)
        console.log(
          `[ProfileScheduler] Skipping ${meta.canonicalKey}: profiled ${daysSinceProfile.toFixed(1)} days ago (< ${minInterval} days)`
        );
        continue;
      }

      // 5. Emit profile:due event
      const event = {
        type: 'metadata.profile.due' as const,
        version: '1.0.0' as const,
        tenantId,
        source: 'kernel.scheduler' as const,
        correlationId: undefined,
        payload: {
          entityType: 'METADATA' as const,
          entityId: meta.id,
          canonicalKey: meta.canonicalKey,
          tier: meta.tier,
          priority: meta.tier === 'tier1' ? ('high' as const) : ('normal' as const),
          reason: 'SCHEDULE' as const,
          lastProfiledAt: latestProfile?.createdAt.toISOString(),
          standardPackId: meta.standardPackId,
        },
      };

      if (this.config.dryRun) {
        console.log(
          `[ProfileScheduler] [DRY RUN] Would emit profile:due for ${meta.canonicalKey} (tier: ${meta.tier}, priority: ${event.payload.priority})`
        );
      } else {
        await this.config.eventBus.publish(event);
        console.log(
          `[ProfileScheduler] Emitted profile:due for ${meta.canonicalKey} (tier: ${meta.tier}, priority: ${event.payload.priority})`
        );
      }

      emittedCount++;
    }

    console.log(
      `[ProfileScheduler] Tenant ${tenantId}: emitted ${emittedCount} profile:due events`
    );

    return emittedCount;
  }

  /**
   * Emit profile:due events for all tenants.
   *
   * @param tenantIds - Array of tenant IDs to process
   * @param now - Current time (for testing/replay)
   * @returns Total number of events emitted
   */
  async emitProfileDueEventsForAllTenants(
    tenantIds: string[],
    now: Date = new Date()
  ): Promise<number> {
    console.log(
      `[ProfileScheduler] Processing ${tenantIds.length} tenants...`
    );

    let totalEmitted = 0;

    for (const tenantId of tenantIds) {
      try {
        const count = await this.emitProfileDueEventsForTenant(tenantId, now);
        totalEmitted += count;
      } catch (error) {
        console.error(
          `[ProfileScheduler] Error processing tenant ${tenantId}:`,
          error
        );
        // Continue processing other tenants
      }
    }

    console.log(
      `[ProfileScheduler] Total: emitted ${totalEmitted} profile:due events across ${tenantIds.length} tenants`
    );

    return totalEmitted;
  }

  /**
   * Run the scheduler once (for manual invocation or testing).
   *
   * @param tenantIds - Array of tenant IDs to process
   */
  async run(tenantIds: string[]): Promise<void> {
    console.log('[ProfileScheduler] Running scheduler...');
    const startTime = Date.now();

    await this.emitProfileDueEventsForAllTenants(tenantIds);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`[ProfileScheduler] Scheduler completed in ${duration.toFixed(2)}s ✅`);
  }
}


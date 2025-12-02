// kernel/scheduler/monorepo-adapter.ts

/**
 * Monorepo Adapter for Profile Scheduler
 *
 * When Kernel and Metadata Studio run in the same Node.js process (monorepo),
 * this adapter allows the Kernel Scheduler to directly import:
 * - Shared event bus (in-memory EventEmitter)
 * - Metadata repository (Drizzle ORM)
 * - Observability repository (Drizzle ORM)
 *
 * Benefits:
 * - Zero network latency (in-process)
 * - Simpler deployment (single service)
 * - Easier development (no Redis required)
 *
 * Limitations:
 * - Single instance only (no horizontal scaling)
 * - Kernel and Metadata Studio must deploy together
 *
 * For distributed deployments, use distributed-adapter.ts instead.
 */

import { ProfileScheduler } from './profile.scheduler';
import type { MetadataRepository, ObservabilityRepository, ProfileCandidate, LatestProfile } from './profile.scheduler';

// Import shared event bus from metadata-studio
import { eventBus } from '../../metadata-studio/events';

// Import database client and schema
import { db } from '../../metadata-studio/db/client';
import { mdmGlobalMetadata } from '../../metadata-studio/db/schema/metadata.tables';
import { mdmProfile } from '../../metadata-studio/db/schema/observability.tables';
import { eq, and, desc, inArray } from 'drizzle-orm';

/**
 * Metadata Repository implementation using Drizzle ORM.
 *
 * Queries mdm_global_metadata for profile candidates.
 */
class DrizzleMetadataRepository implements MetadataRepository {
  async listProfileCandidates(tenantId: string): Promise<ProfileCandidate[]> {
    // Query Tier1-Tier3 metadata with active status
    const rows = await db
      .select({
        id: mdmGlobalMetadata.id,
        tenantId: mdmGlobalMetadata.tenantId,
        canonicalKey: mdmGlobalMetadata.canonicalKey,
        tier: mdmGlobalMetadata.tier,
        standardPackId: mdmGlobalMetadata.standardPackId,
        status: mdmGlobalMetadata.status,
      })
      .from(mdmGlobalMetadata)
      .where(
        and(
          eq(mdmGlobalMetadata.tenantId, tenantId),
          eq(mdmGlobalMetadata.status, 'active'),
          inArray(mdmGlobalMetadata.tier, ['tier1', 'tier2', 'tier3'])
        )
      );

    // Map to ProfileCandidate
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      canonicalKey: row.canonicalKey,
      tier: row.tier as any,
      standardPackId: row.standardPackId ?? undefined,
      // TODO: Check if entity has service binding (physical table mapping)
      // For now, assume all have bindings (will be filtered in subscriber)
      hasServiceBinding: true,
    }));
  }
}

/**
 * Observability Repository implementation using Drizzle ORM.
 *
 * Queries mdm_profile for latest profile.
 */
class DrizzleObservabilityRepository implements ObservabilityRepository {
  async getLatestProfile(
    tenantId: string,
    entityUrn: string
  ): Promise<LatestProfile | null> {
    const [row] = await db
      .select({
        id: mdmProfile.id,
        createdAt: mdmProfile.createdAt,
        qualityScore: mdmProfile.qualityScore,
      })
      .from(mdmProfile)
      .where(
        and(
          eq(mdmProfile.tenantId, tenantId),
          eq(mdmProfile.entityUrn, entityUrn)
        )
      )
      .orderBy(desc(mdmProfile.createdAt))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      createdAt: row.createdAt,
      qualityScore: parseFloat(row.qualityScore ?? '0'),
    };
  }
}

/**
 * Create a ProfileScheduler instance for monorepo deployment.
 *
 * Uses:
 * - Shared event bus from metadata-studio/events
 * - Drizzle ORM for database access
 * - In-process communication (no network calls)
 *
 * @param options - Optional configuration overrides
 * @returns ProfileScheduler instance
 *
 * @example
 * ```typescript
 * const scheduler = await createMonorepoScheduler();
 * await scheduler.emitProfileDueEventsForTenant('tenant-123');
 * ```
 */
export async function createMonorepoScheduler(options?: {
  dryRun?: boolean;
  minTiers?: Array<'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5'>;
}): Promise<ProfileScheduler> {
  console.log('[MonorepoAdapter] Creating ProfileScheduler (monorepo mode)...');

  // Create repository instances
  const metadataRepo = new DrizzleMetadataRepository();
  const observabilityRepo = new DrizzleObservabilityRepository();

  // Create scheduler
  const scheduler = new ProfileScheduler({
    eventBus: eventBus as any, // EventBus interface compatibility
    metadataRepo,
    observabilityRepo,
    dryRun: options?.dryRun ?? false,
    minTiers: options?.minTiers,
  });

  console.log('[MonorepoAdapter] ProfileScheduler created ✅');

  return scheduler;
}


// kernel/scheduler/index.ts

/**
 * Kernel Scheduler - Cron Wrapper
 *
 * Runs the ProfileScheduler on a schedule (cron-like).
 *
 * Deployment Options:
 * 1. **Monorepo (single process):**
 *    - Import shared eventBus from metadata-studio/events
 *    - Import repositories from metadata-studio/db
 *    - Run in same Node.js process as Metadata Studio
 *
 * 2. **Distributed (multi-service):**
 *    - Create own RedisEventBus instance
 *    - Query database directly or via API
 *    - Run in separate Node.js process/container
 *
 * 3. **Serverless (Lambda/Cloud Function):**
 *    - Triggered by CloudWatch Events / Cloud Scheduler
 *    - Connect to Redis + Database
 *    - Emit events and exit
 *
 * Schedule:
 * - Default: Every night at 2 AM UTC
 * - Customizable via PROFILE_SCHEDULER_CRON env var
 *
 * Usage:
 * ```bash
 * # Monorepo
 * PROFILE_SCHEDULER_CRON="0 2 * * *" tsx kernel/scheduler/index.ts
 *
 * # Distributed
 * EVENT_BUS_TYPE=redis REDIS_URL=redis://localhost:6379 tsx kernel/scheduler/index.ts
 * ```
 */

import { CronJob } from 'cron';
import { ProfileScheduler } from './profile.scheduler';
import { createMonorepoScheduler } from './monorepo-adapter';

/**
 * Get active tenant IDs.
 *
 * In production, this would query a tenant registry or database.
 * For now, we read from environment variable.
 *
 * @returns Array of tenant IDs
 */
async function getActiveTenantIds(): Promise<string[]> {
  const tenantsEnv = process.env.ACTIVE_TENANTS;

  if (tenantsEnv) {
    return tenantsEnv.split(',').map((id) => id.trim());
  }

  // TODO: Query tenant registry/database
  console.warn(
    '[ProfileScheduler] No ACTIVE_TENANTS env var, using empty array'
  );
  return [];
}

/**
 * Run the profile scheduler once.
 * Called by cron or for manual invocation.
 */
async function runScheduler(): Promise<void> {
  console.log('[ProfileScheduler] Starting scheduled run...');

  try {
    // Get active tenants
    const tenantIds = await getActiveTenantIds();

    if (tenantIds.length === 0) {
      console.warn('[ProfileScheduler] No active tenants found, skipping');
      return;
    }

    // Create scheduler (monorepo or distributed based on env)
    const scheduler = await createMonorepoScheduler();

    // Run scheduler
    await scheduler.run(tenantIds);

    console.log('[ProfileScheduler] Scheduled run completed ✅');
  } catch (error) {
    console.error('[ProfileScheduler] Scheduled run failed:', error);
    throw error;
  }
}

/**
 * Start the cron scheduler.
 *
 * Default: Every night at 2 AM UTC
 * Override: PROFILE_SCHEDULER_CRON env var
 */
async function startCron(): Promise<void> {
  const cronExpression = process.env.PROFILE_SCHEDULER_CRON ?? '0 2 * * *';

  console.log(`[ProfileScheduler] Starting cron: ${cronExpression}`);

  const job = new CronJob(
    cronExpression,
    async () => {
      await runScheduler();
    },
    null, // onComplete
    true, // start immediately
    'UTC' // timezone
  );

  console.log('[ProfileScheduler] Cron started ✅');
  console.log(`[ProfileScheduler] Next run: ${job.nextDate().toString()}`);

  // Keep process alive
  process.on('SIGTERM', () => {
    console.log('[ProfileScheduler] Received SIGTERM, stopping cron...');
    job.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('[ProfileScheduler] Received SIGINT, stopping cron...');
    job.stop();
    process.exit(0);
  });
}

/**
 * Main entry point.
 *
 * Modes:
 * - SCHEDULER_MODE=cron → Start cron scheduler (default)
 * - SCHEDULER_MODE=once → Run once and exit
 */
async function main(): Promise<void> {
  const mode = process.env.SCHEDULER_MODE ?? 'cron';

  console.log(`[ProfileScheduler] Mode: ${mode}`);

  if (mode === 'once') {
    // Run once and exit
    await runScheduler();
    process.exit(0);
  } else if (mode === 'cron') {
    // Start cron scheduler
    await startCron();
  } else {
    throw new Error(`Unknown SCHEDULER_MODE: ${mode}`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('[ProfileScheduler] Fatal error:', error);
    process.exit(1);
  });
}

export { runScheduler, startCron };


/**
 * Bootstrap Loader
 * Orchestrates all bootstrap operations
 */

import { loadStandardPacks } from './01-load-standard-packs';
import { loadGlossary } from './02-load-glossary';
import { verifyGovernanceTiers } from './03-verify-governance-tiers';

export async function bootstrap() {
  console.log('🚀 Starting Metadata Studio bootstrap...');

  try {
    // Step 1: Load standard packs
    console.log('📦 Loading standard packs...');
    await loadStandardPacks();

    // Step 2: Load glossary
    console.log('📚 Loading glossary...');
    await loadGlossary();

    // Step 3: Verify governance tiers
    console.log('🔒 Verifying governance tiers...');
    await verifyGovernanceTiers();

    console.log('✅ Bootstrap completed successfully');
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    throw error;
  }
}

// Allow running bootstrap directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch(console.error);
}


/**
 * Bootstrap Step 1: Load Standard Packs
 * Loads predefined standard metadata packs (SOT Packs)
 */

import { standardPackRepo } from '../db/standard-pack.repo';
import { StandardPack } from '../schemas/standard-pack.schema';

const STANDARD_PACKS: StandardPack[] = [
  // TODO: Define standard packs for different domains
  // Example structure shown below
];

export async function loadStandardPacks() {
  console.log(`Loading ${STANDARD_PACKS.length} standard packs...`);

  for (const pack of STANDARD_PACKS) {
    try {
      const existing = await standardPackRepo.getPackById(pack.packId);
      
      if (existing) {
        console.log(`  ⏭️  Pack ${pack.packName} already exists, skipping`);
        continue;
      }

      await standardPackRepo.createPack(pack);
      console.log(`  ✅ Loaded pack: ${pack.packName}`);
    } catch (error) {
      console.error(`  ❌ Failed to load pack ${pack.packName}:`, error);
      throw error;
    }
  }

  console.log('Standard packs loaded successfully');
}


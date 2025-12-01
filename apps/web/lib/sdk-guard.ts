/**
 * SDK Version Guard
 * 
 * Prevents deployment with mismatched SDK versions
 * Checks version compatibility at app startup
 */

import { SDK_VERSION, assertVersionCompatibility, initializeControlledVocabularySDK } from "@aibos/metadata-studio";

/**
 * Client SDK Version
 * 
 * ⚠️ IMPORTANT: This MUST match metadata-studio SDK version
 * Update this when upgrading @aibos/types package
 */
export const CLIENT_SDK_VERSION = "1.0.0";

/**
 * Initialize and validate SDK on app startup
 * 
 * This runs once when the app starts
 * Deployment will fail if SDK versions are incompatible
 */
export function initializeSDK() {
  try {
    // Check version compatibility
    assertVersionCompatibility(CLIENT_SDK_VERSION);
    
    // Initialize controlled vocabulary
    const vocabulary = initializeControlledVocabularySDK(CLIENT_SDK_VERSION);
    
    console.log(`✅ SDK Initialized Successfully`);
    console.log(`   Client Version: v${CLIENT_SDK_VERSION}`);
    console.log(`   Server Version: v${SDK_VERSION.full}`);
    console.log(`   Approved Terms: ${vocabulary.metadata.totalApprovedTerms}`);
    
    return vocabulary;
  } catch (error) {
    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ SDK VERSION MISMATCH - DEPLOYMENT BLOCKED`);
    console.error(`${'='.repeat(60)}\n`);
    console.error(error);
    console.error(`\n${'='.repeat(60)}`);
    console.error(`REQUIRED ACTION:`);
    console.error(`  1. Update @aibos/types to v${SDK_VERSION.compatible}`);
    console.error(`     Run: pnpm update @aibos/types`);
    console.error(`  2. Update CLIENT_SDK_VERSION in lib/sdk-guard.ts`);
    console.error(`  3. Rebuild and redeploy`);
    console.error(`${'='.repeat(60)}\n`);
    
    // Throw error to prevent app from starting
    throw error;
  }
}

/**
 * Get SDK health status
 * 
 * Useful for health checks and monitoring
 */
export function getSDKHealth() {
  return {
    clientVersion: CLIENT_SDK_VERSION,
    serverVersion: SDK_VERSION.full,
    compatible: CLIENT_SDK_VERSION === SDK_VERSION.full,
    status: CLIENT_SDK_VERSION === SDK_VERSION.full ? 'healthy' : 'version-mismatch',
  };
}


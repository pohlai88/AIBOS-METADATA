/**
 * Controlled Vocabulary SDK Version
 * 
 * This SDK version MUST match between:
 * - metadata-studio (server)
 * - @aibos/types (shared types)
 * - apps/web (frontend)
 * - apps/api (backend)
 * 
 * Deployment with mismatched versions will be BLOCKED!
 */

export const SDK_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get compatible() {
    // Compatible with same major version
    return `^${this.major}.0.0`;
  },
} as const;

/**
 * OpenMetadata Compatibility
 * 
 * This SDK follows OpenMetadata schema patterns
 * https://open-metadata.org/
 */
export const OPENMETADATA_SCHEMA_VERSION = "1.4.0";

/**
 * SDK Metadata
 */
export const SDK_METADATA = {
  name: "@aibos/controlled-vocabulary-sdk",
  version: SDK_VERSION.full,
  description: "Controlled Vocabulary SDK - Central Nervous System for Business Terminology",
  openMetadataCompatible: OPENMETADATA_SCHEMA_VERSION,
  author: "AIBOS Platform Team",
  license: "UNLICENSED",
} as const;

/**
 * Check if SDK versions are compatible
 * 
 * @param clientVersion - Version from client app (e.g., "1.0.0")
 * @param serverVersion - Version from metadata-studio (e.g., "1.0.0")
 * @returns true if compatible, false otherwise
 */
export function isVersionCompatible(
  clientVersion: string,
  serverVersion: string = SDK_VERSION.full
): boolean {
  const [clientMajor] = clientVersion.split('.').map(Number);
  const [serverMajor] = serverVersion.split('.').map(Number);
  
  // Major versions must match
  return clientMajor === serverMajor;
}

/**
 * Assert version compatibility (throws error if incompatible)
 * 
 * @param clientVersion - Version from client app
 * @throws Error if versions are incompatible
 */
export function assertVersionCompatibility(clientVersion: string): void {
  if (!isVersionCompatible(clientVersion)) {
    throw new Error(
      `❌ SDK Version Mismatch!\n` +
      `Client SDK: v${clientVersion}\n` +
      `Server SDK: v${SDK_VERSION.full}\n\n` +
      `Please update your SDK to v${SDK_VERSION.compatible}\n` +
      `Run: pnpm update @aibos/types`
    );
  }
}

/**
 * Get SDK version info
 */
export function getSDKInfo() {
  return {
    ...SDK_METADATA,
    buildDate: new Date().toISOString(),
    compatibleWith: SDK_VERSION.compatible,
  };
}


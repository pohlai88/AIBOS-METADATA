// packages/metadata-sdk/src/config.ts

/**
 * Metadata SDK Configuration
 */

export interface MetadataSdkConfig {
  baseUrl: string;           // e.g. "http://localhost:8787"
  apiKey?: string;           // Optional API key for authentication
  defaultTenantId?: string;  // Optional default tenant ID
}

/**
 * Create default configuration from environment variables
 * 
 * Required env vars:
 * - METADATA_BASE_URL: Base URL for metadata service
 * 
 * Optional env vars:
 * - METADATA_API_KEY: API key for authentication
 * - METADATA_DEFAULT_TENANT_ID: Default tenant ID
 */
export const createDefaultConfig = (): MetadataSdkConfig => {
  const baseUrl = process.env.METADATA_BASE_URL;

  if (!baseUrl) {
    throw new Error('METADATA_BASE_URL environment variable is required for Metadata SDK');
  }

  return {
    baseUrl,
    apiKey: process.env.METADATA_API_KEY,
    defaultTenantId: process.env.METADATA_DEFAULT_TENANT_ID,
  };
};

/**
 * Create custom configuration
 * 
 * @param config Custom configuration options
 * @returns MetadataSdkConfig
 */
export const createConfig = (config: MetadataSdkConfig): MetadataSdkConfig => {
  return {
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    defaultTenantId: config.defaultTenantId,
  };
};


import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { getConfig } from "./env";

/**
 * Database Connection
 *
 * Configuration is LOCAL to this service (bff-admin-config).
 * - Connection string from environment variables
 * - Pool settings from environment variables
 * - No shared config pillar dependency
 *
 * Pattern: Centralized Management, Local Access
 * - Secrets stored in secure vault (Vault, AWS Secrets, K8s Secrets)
 * - Injected as env vars at deployment time
 * - Accessed locally via getConfig()
 */

let connectionInstance: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection
 * Lazy initialization - only connects when first used
 */
export function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const config = getConfig();

  // Create postgres connection with pool settings from config
  connectionInstance = postgres(config.database.url, {
    max: config.database.poolSize,
    idle_timeout: config.database.idleTimeout,
    connect_timeout: config.database.connectTimeout,
    // Disable prepared statements for Supavisor compatibility
    prepare: false,
    // SSL for Supabase
    ssl: "require",
  });

  // Create Drizzle instance with schema
  dbInstance = drizzle(connectionInstance, { schema });

  return dbInstance;
}

/**
 * Get raw postgres connection (for transactions)
 */
export function getConnection() {
  if (!connectionInstance) {
    getDatabase(); // Initialize if not yet done
  }
  return connectionInstance!;
}

/**
 * Close database connection
 * Call this on graceful shutdown
 */
export async function closeDatabase() {
  if (connectionInstance) {
    await connectionInstance.end();
    connectionInstance = null;
    dbInstance = null;
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    const conn = getConnection();
    await conn`SELECT 1`;
    const latency = Date.now() - start;

    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Legacy exports for backward compatibility
// TODO: Migrate all usages to getDatabase()
export const db = {
  get instance() {
    return getDatabase();
  },
};

export const connection = {
  get instance() {
    return getConnection();
  },
};

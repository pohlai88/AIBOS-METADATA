import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { getConfig } from "./env";

/**
 * Database Connection for Supabase
 *
 * Key settings for Supabase connection pooler:
 * - prepare: false (required for Transaction pool mode)
 * - ssl: "require" (required for Supabase)
 */

let connectionInstance: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection
 */
export function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const config = getConfig();

  // Create postgres connection optimized for Supabase
  // prepare: false is REQUIRED for Supabase Transaction pooler
  connectionInstance = postgres(config.database.url, {
    max: config.database.poolSize,
    idle_timeout: config.database.idleTimeout,
    connect_timeout: config.database.connectTimeout,
    prepare: false, // REQUIRED for Supabase pooler
    ssl: "require", // Required for Supabase
  });

  // Create Drizzle instance
  dbInstance = drizzle(connectionInstance, { schema });

  return dbInstance;
}

/**
 * Get raw postgres connection
 */
export function getConnection() {
  if (!connectionInstance) {
    getDatabase();
  }
  return connectionInstance!;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (connectionInstance) {
    await connectionInstance.end();
    connectionInstance = null;
    dbInstance = null;
  }
}

/**
 * Health check for database
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    const conn = getConnection();
    await conn`SELECT 1 as ok`;
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

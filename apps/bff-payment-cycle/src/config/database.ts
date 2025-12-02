/**
 * Database Connection
 *
 * Configuration is LOCAL to this service (bff-payment-cycle).
 * Uses Supabase client for auth/storage and Drizzle for queries.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as schema from "../db/schema";
import { getEnv, getConfig } from "./env";

let connectionInstance: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Get or create Drizzle database connection
 */
export function getDatabase() {
  if (dbInstance) return dbInstance;

  const config = getConfig();

  connectionInstance = postgres(config.database.url, {
    max: config.database.poolSize,
    idle_timeout: config.database.idleTimeout,
    connect_timeout: config.database.connectTimeout,
    prepare: false, // Supabase transaction mode compatibility
    ssl: config.isProduction ? { rejectUnauthorized: true } : false,
  });

  dbInstance = drizzle(connectionInstance, { schema });
  return dbInstance;
}

/**
 * Get raw postgres connection
 */
export function getConnection() {
  if (!connectionInstance) getDatabase();
  return connectionInstance!;
}

/**
 * Get or create Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClientInstance) return supabaseClientInstance;

  const config = getConfig();
  supabaseClientInstance = createClient(config.supabase.url, config.supabase.anonKey);
  return supabaseClientInstance;
}

/**
 * Get Supabase admin client (with service role key)
 */
export function getSupabaseAdmin(): SupabaseClient {
  const config = getConfig();
  if (!config.supabase.serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Close database connections
 */
export async function closeDatabase() {
  if (connectionInstance) {
    await connectionInstance.end();
    connectionInstance = null;
    dbInstance = null;
  }
  supabaseClientInstance = null;
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

/**
 * Health check for Supabase
 */
export async function checkSupabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    const supabase = getSupabaseClient();
    // Simple auth check
    await supabase.auth.getSession();
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "./env";

/**
 * Supabase Client
 *
 * Used for:
 * - Health checks (bypasses pooler auth issues)
 * - Simple queries when Drizzle has connection issues
 * - Real-time subscriptions (future)
 */

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getConfig();

  if (!config.supabase) {
    console.warn("⚠️ Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY");
    return null;
  }

  supabaseInstance = createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      persistSession: false, // Server-side, no session persistence
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
}

/**
 * Health check via Supabase client
 */
export async function checkSupabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return { healthy: false, error: "Supabase not configured" };
    }

    const start = Date.now();
    const { data, error } = await supabase.from("iam_tenant").select("id").limit(1);
    const latency = Date.now() - start;

    if (error) {
      return { healthy: false, error: error.message };
    }

    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


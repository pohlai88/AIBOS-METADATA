/**
 * Configuration Module
 *
 * Central export for all configuration-related functionality.
 * Configuration is LOCAL to this service (bff-admin-config).
 *
 * Pattern: Centralized Management, Local Access
 * - Secrets stored in secure vault (Vault, AWS Secrets, K8s Secrets)
 * - Injected as env vars at deployment time
 * - Validated and accessed via this module
 */

export { loadEnv, getEnv, getConfig, type Env } from "./env";
export {
  getDatabase,
  getConnection,
  closeDatabase,
  checkDatabaseHealth,
} from "./database";
export { getSupabase, checkSupabaseHealth } from "./supabase";

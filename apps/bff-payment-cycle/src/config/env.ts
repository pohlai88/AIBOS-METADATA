/**
 * Environment Configuration
 *
 * Zod-validated environment variables for bff-payment-cycle.
 * Configuration is LOCAL to this service.
 */

import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

// Load .env file
dotenvConfig();

// ===========================================
// SCHEMA DEFINITION
// ===========================================

const envSchema = z.object({
  // ─────────────────────────────────────────
  // DATABASE
  // ─────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .url()
    .describe("PostgreSQL connection string"),

  DB_POOL_SIZE: z.coerce.number().default(10),
  DB_IDLE_TIMEOUT: z.coerce.number().default(20),
  DB_CONNECT_TIMEOUT: z.coerce.number().default(10),

  // ─────────────────────────────────────────
  // SUPABASE
  // ─────────────────────────────────────────
  SUPABASE_URL: z.string().url().describe("Supabase project URL"),
  SUPABASE_ANON_KEY: z.string().describe("Supabase anon public key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().describe("Supabase service role key"),

  // ─────────────────────────────────────────
  // SERVICE CONFIGURATION
  // ─────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(3002),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SERVICE_NAME: z.string().default("bff-payment-cycle"),
  SERVICE_VERSION: z.string().default("1.0.0"),

  // ─────────────────────────────────────────
  // CORS
  // ─────────────────────────────────────────
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((val) => val.split(",").map((s) => s.trim())),

  // ─────────────────────────────────────────
  // INTER-SERVICE
  // ─────────────────────────────────────────
  BFF_ADMIN_CONFIG_URL: z.string().url().optional().describe("Admin Config BFF URL"),
  EVENT_BUS_URL: z.string().url().optional().describe("Event bus connection URL"),

  // ─────────────────────────────────────────
  // FILE STORAGE
  // ─────────────────────────────────────────
  STORAGE_BUCKET: z.string().default("payment-slips"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
});

// ===========================================
// TYPE EXPORT
// ===========================================

export type Env = z.infer<typeof envSchema>;

// ===========================================
// CONFIGURATION LOADER
// ===========================================

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("❌ Environment validation failed:\n" + errors);
    console.error("\n📋 Required environment variables:");
    console.error("   DATABASE_URL=postgresql://...");
    console.error("   SUPABASE_URL=https://...");
    console.error("   SUPABASE_ANON_KEY=...");

    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  cachedEnv = result.data;

  if (cachedEnv.NODE_ENV === "development") {
    console.log("✅ Environment loaded:");
    console.log(`   Service: ${cachedEnv.SERVICE_NAME}@${cachedEnv.SERVICE_VERSION}`);
    console.log(`   Port: ${cachedEnv.PORT}`);
    console.log(`   Supabase: ${cachedEnv.SUPABASE_URL}`);
    console.log(`   CORS: ${cachedEnv.CORS_ORIGINS.join(", ")}`);
  }

  return cachedEnv;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    throw new Error("Environment not loaded. Call loadEnv() first.");
  }
  return cachedEnv;
}

// ===========================================
// TYPED CONFIG OBJECT
// ===========================================

export function getConfig() {
  const env = getEnv();

  return {
    service: {
      name: env.SERVICE_NAME,
      version: env.SERVICE_VERSION,
      environment: env.NODE_ENV,
      port: env.PORT,
      logLevel: env.LOG_LEVEL,
    },

    database: {
      url: env.DATABASE_URL,
      poolSize: env.DB_POOL_SIZE,
      idleTimeout: env.DB_IDLE_TIMEOUT,
      connectTimeout: env.DB_CONNECT_TIMEOUT,
    },

    supabase: {
      url: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },

    cors: {
      origins: env.CORS_ORIGINS,
    },

    services: {
      adminConfigUrl: env.BFF_ADMIN_CONFIG_URL,
      eventBusUrl: env.EVENT_BUS_URL,
    },

    storage: {
      bucket: env.STORAGE_BUCKET,
      maxFileSizeMB: env.MAX_FILE_SIZE_MB,
    },

    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  };
}


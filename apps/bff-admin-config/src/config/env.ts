import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

// Load .env file
dotenvConfig();

/**
 * Environment Configuration Schema
 *
 * This defines ALL environment variables required by bff-admin-config.
 * Values are loaded from process.env and validated at startup.
 *
 * Principle: Configuration stays LOCAL to this package.
 * - Each service owns its own DB credentials
 * - Secrets injected at deployment time
 * - No shared config pillar for runtime values
 */

// ===========================================
// SCHEMA DEFINITION
// ===========================================

const envSchema = z.object({
  // ─────────────────────────────────────────
  // DATABASE (Local to this service)
  // ─────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .url()
    .describe("PostgreSQL connection string for admin-config database"),

  DB_POOL_SIZE: z.coerce.number().default(10).describe("Max connections in pool"),
  DB_IDLE_TIMEOUT: z.coerce.number().default(20).describe("Idle timeout in seconds"),
  DB_CONNECT_TIMEOUT: z.coerce.number().default(10).describe("Connect timeout in seconds"),

  // ─────────────────────────────────────────
  // AUTHENTICATION (Local to this service)
  // ─────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .describe("Secret key for signing JWT tokens"),

  JWT_EXPIRES_IN: z.coerce
    .number()
    .default(3600)
    .describe("Access token expiry in seconds (default: 1 hour)"),

  JWT_REFRESH_EXPIRES_IN: z.coerce
    .number()
    .default(604800)
    .describe("Refresh token expiry in seconds (default: 7 days)"),

  // ─────────────────────────────────────────
  // SERVICE CONFIGURATION
  // ─────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development")
    .describe("Runtime environment"),

  PORT: z.coerce.number().default(3001).describe("HTTP server port"),

  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info")
    .describe("Logging verbosity"),

  SERVICE_NAME: z
    .string()
    .default("bff-admin-config")
    .describe("Service identifier for tracing"),

  SERVICE_VERSION: z.string().default("1.0.0").describe("Service version"),

  // ─────────────────────────────────────────
  // CORS
  // ─────────────────────────────────────────
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((val) => val.split(",").map((s) => s.trim()))
    .describe("Comma-separated list of allowed origins"),

  // ─────────────────────────────────────────
  // EMAIL SERVICE (Optional)
  // ─────────────────────────────────────────
  SMTP_HOST: z.string().optional().describe("SMTP server host"),
  SMTP_PORT: z.coerce.number().optional().describe("SMTP server port"),
  SMTP_USER: z.string().optional().describe("SMTP username"),
  SMTP_PASSWORD: z.string().optional().describe("SMTP password"),
  SMTP_FROM: z.string().email().optional().describe("Default from address"),

  // ─────────────────────────────────────────
  // INTER-SERVICE (Optional)
  // ─────────────────────────────────────────
  EVENT_BUS_URL: z.string().url().optional().describe("Event bus connection URL"),
  BFF_PAYMENT_CYCLE_URL: z.string().url().optional().describe("Payment cycle BFF URL"),
  BFF_METADATA_URL: z.string().url().optional().describe("Metadata BFF URL"),
});

// ===========================================
// TYPE EXPORT
// ===========================================

export type Env = z.infer<typeof envSchema>;

// ===========================================
// CONFIGURATION LOADER
// ===========================================

let cachedEnv: Env | null = null;

/**
 * Load and validate environment configuration
 *
 * - Validates all required env vars at startup
 * - Provides defaults for optional values
 * - Caches result for performance
 * - Fails fast with clear error messages
 */
export function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("❌ Environment validation failed:\n" + errors);
    console.error("\n📋 Required environment variables:");
    console.error("   DATABASE_URL=postgresql://user:pass@host:5432/db");
    console.error("   JWT_SECRET=your-32-char-minimum-secret-key");

    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  cachedEnv = result.data;

  // Log loaded config (without secrets) in development
  if (cachedEnv.NODE_ENV === "development") {
    console.log("✅ Environment loaded:");
    console.log(`   Service: ${cachedEnv.SERVICE_NAME}@${cachedEnv.SERVICE_VERSION}`);
    console.log(`   Port: ${cachedEnv.PORT}`);
    console.log(`   Database: ${maskConnectionString(cachedEnv.DATABASE_URL)}`);
    console.log(`   CORS: ${cachedEnv.CORS_ORIGINS.join(", ")}`);
  }

  return cachedEnv;
}

/**
 * Get cached environment (throws if not loaded)
 */
export function getEnv(): Env {
  if (!cachedEnv) {
    throw new Error("Environment not loaded. Call loadEnv() first.");
  }
  return cachedEnv;
}

// ===========================================
// HELPERS
// ===========================================

/**
 * Mask sensitive parts of connection string for logging
 */
function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.password = "****";
    return parsed.toString();
  } catch {
    return "****";
  }
}

// ===========================================
// CONFIGURATION OBJECT (typed access)
// ===========================================

/**
 * Typed configuration object
 * Use this for clean access to config values throughout the app
 */
export function getConfig() {
  const env = getEnv();

  return {
    // Service
    service: {
      name: env.SERVICE_NAME,
      version: env.SERVICE_VERSION,
      environment: env.NODE_ENV,
      port: env.PORT,
      logLevel: env.LOG_LEVEL,
    },

    // Database
    database: {
      url: env.DATABASE_URL,
      poolSize: env.DB_POOL_SIZE,
      idleTimeout: env.DB_IDLE_TIMEOUT,
      connectTimeout: env.DB_CONNECT_TIMEOUT,
    },

    // Auth
    auth: {
      jwtSecret: env.JWT_SECRET,
      accessTokenExpiry: env.JWT_EXPIRES_IN,
      refreshTokenExpiry: env.JWT_REFRESH_EXPIRES_IN,
    },

    // CORS
    cors: {
      origins: env.CORS_ORIGINS,
    },

    // Email (optional)
    email: env.SMTP_HOST
      ? {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT || 587,
          user: env.SMTP_USER,
          password: env.SMTP_PASSWORD,
          from: env.SMTP_FROM,
        }
      : null,

    // Inter-service
    services: {
      eventBusUrl: env.EVENT_BUS_URL,
      paymentCycleUrl: env.BFF_PAYMENT_CYCLE_URL,
      metadataUrl: env.BFF_METADATA_URL,
    },

    // Helpers
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  };
}


// tests/setup.ts
/**
 * Test Setup
 * 
 * Loads environment variables for integration tests.
 * Looks for .env in multiple locations.
 */

import { config as dotenvConfig } from "dotenv";
import path from "path";

// Load .env from multiple potential locations
// 1. Local to bff-admin-config
dotenvConfig({ path: path.resolve(__dirname, "../.env") });
// 2. Root workspace level (apps/bff-admin-config/tests -> root is 3 levels up)
dotenvConfig({ path: path.resolve(__dirname, "../../../.env") });

// Set test defaults for optional vars
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-minimum-32-characters-long";

// Import and initialize after env is set
import { loadEnv } from "../src/config/env";

// Validate required env vars early
if (!process.env.DATABASE_URL) {
  console.error(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  ⚠️  DATABASE_URL not set - Integration tests cannot run                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Please ensure DATABASE_URL is set in your .env file                      ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

try {
  // Load and validate the environment
  loadEnv();
  console.log("✅ Test environment loaded successfully");
} catch (error) {
  console.error("❌ Failed to load test environment:", error);
  process.exit(1);
}

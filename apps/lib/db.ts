/**
 * Neon Database Connection Utility
 * 
 * This file provides database connection utilities for Neon Postgres
 */

import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon for better performance
neonConfig.fetchConnectionCache = true;

// Get database URL from environment variable
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
}

// Create Neon client for serverless functions
// This works in both Edge Runtime and Node.js runtime
export const sql = neon(databaseUrl);

// Helper function to test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}


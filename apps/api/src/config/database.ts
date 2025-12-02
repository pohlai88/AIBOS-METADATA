import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../../business-engine/admin-config/infrastructure/persistence/drizzle/schema";

/**
 * Database Connection
 *
 * Uses postgres-js for connection pooling
 * Drizzle ORM for type-safe queries
 */

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres connection
export const connection = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(connection, { schema });

/**
 * Close database connection
 */
export async function closeDatabase() {
  await connection.end();
}

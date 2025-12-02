import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config();

export default {
  schema:
    "../../business-engine/admin-config/infrastructure/persistence/drizzle/schema/*.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;

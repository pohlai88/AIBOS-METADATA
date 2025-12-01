// Verify Accounting Knowledge Base setup
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
function loadEnv() {
  const envPath = path.join(__dirname, "../../.env");
  try {
    const envFile = readFileSync(envPath, "utf-8");
    const lines = envFile.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.error("Error loading .env:", error);
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in .env file");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function verify() {
  try {
    console.log("🔍 Verifying Accounting Knowledge Base setup...\n");

    // Check categories
    const categories = await sql`
      SELECT name, description FROM accounting_knowledge_category ORDER BY name
    `;

    console.log("📋 Categories:");
    for (const cat of categories) {
      console.log(`  ✅ ${cat.name}: ${cat.description}`);
    }

    // Check table exists
    const tableCheck = await sql`
      SELECT COUNT(*) as count FROM accounting_knowledge
    `;
    console.log(`\n📊 Knowledge entries: ${tableCheck[0]?.count || 0}`);

    // Check indexes
    const indexes = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'accounting_knowledge'
      ORDER BY indexname
    `;
    console.log(`\n🔍 Indexes (${indexes.length}):`);
    for (const idx of indexes) {
      console.log(`  ✅ ${idx.indexname}`);
    }

    console.log("\n✅ Verification complete!");
  } catch (error) {
    console.error("❌ Error during verification:", error);
    process.exit(1);
  }
}

verify();


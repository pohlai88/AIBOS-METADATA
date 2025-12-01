// Setup script for Accounting Knowledge Base schema
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

async function setup() {
  try {
    console.log("📦 Setting up Accounting Knowledge Base schema...\n");

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS accounting_knowledge_category (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log("   ✅ Created accounting_knowledge_category table");

    // Create knowledge table
    await sql`
      CREATE TABLE IF NOT EXISTS accounting_knowledge (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID NOT NULL REFERENCES accounting_knowledge_category(id) ON DELETE RESTRICT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        related_concept_id UUID REFERENCES mdm_concept(id) ON DELETE SET NULL,
        related_standard_pack_id UUID REFERENCES mdm_standard_pack(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'ARCHIVED')),
        priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        version TEXT DEFAULT '1.0.0',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        metadata JSONB DEFAULT '{}'
      )
    `;
    console.log("   ✅ Created accounting_knowledge table");

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_category ON accounting_knowledge(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_status ON accounting_knowledge(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_tags ON accounting_knowledge USING GIN(tags)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_concept ON accounting_knowledge(related_concept_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_pack ON accounting_knowledge(related_standard_pack_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_accounting_knowledge_metadata ON accounting_knowledge USING GIN(metadata)`;
    console.log("   ✅ Created indexes");

    // Create trigger (if function exists)
    try {
      const hasFunction = await sql`
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' LIMIT 1
      `;
      if (hasFunction && hasFunction.length > 0) {
        await sql`
          DROP TRIGGER IF EXISTS update_accounting_knowledge_updated_at ON accounting_knowledge
        `;
        await sql`
          CREATE TRIGGER update_accounting_knowledge_updated_at BEFORE UPDATE ON accounting_knowledge
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `;
        console.log("   ✅ Created trigger");
      } else {
        console.log("   ⚠️  Skipped trigger (function not found)");
      }
    } catch (error) {
      console.log("   ⚠️  Could not create trigger:", error instanceof Error ? error.message : String(error));
    }

    // Seed categories
    await sql`
      INSERT INTO accounting_knowledge_category (name, description) VALUES
        ('SOLUTION', 'Accounting solutions, workflows, and problem-solving guides'),
        ('TRAINING', 'Training materials, tutorials, and educational content'),
        ('UI_UX', 'UI/UX improvements, design patterns, and user experience notes'),
        ('UPGRADE', 'Upgrade notes, migration guides, and version changes'),
        ('BUG', 'Bug reports, fixes, and workarounds')
      ON CONFLICT (name) DO NOTHING
    `;
    console.log("   ✅ Seeded categories");

    console.log("\n✅ Accounting Knowledge Base schema created successfully!");

    // Verify categories
    const categories = await sql`
      SELECT name, description FROM accounting_knowledge_category ORDER BY name
    `;

    console.log("\n📋 Categories:");
    for (const cat of categories) {
      console.log(`   - ${cat.name}: ${cat.description}`);
    }

    console.log("\n🎉 Setup complete!");
  } catch (error) {
    console.error("❌ Error setting up schema:", error);
    process.exit(1);
  }
}

setup();


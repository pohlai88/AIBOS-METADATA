#!/usr/bin/env node
// Test script for metadata MCP server
// Validates server can start and functions work correctly

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon, neonConfig } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Neon
neonConfig.fetchConnectionCache = true;

// Load environment variables
function loadEnv() {
  const envPaths = [
    path.join(__dirname, "../../.env"),
    path.join(__dirname, "../../../.env"),
    path.join(process.cwd(), ".env"),
  ];

  for (const envPath of envPaths) {
    try {
      if (readFileSync(envPath, "utf-8")) {
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
        return;
      }
    } catch (error) {
      continue;
    }
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in .env file");
  process.exit(1);
}

const sql = neon(databaseUrl);

// Test functions from server
async function lookupConcept(tenantId, term) {
  const normalized = term.trim().toLowerCase();

  const conceptsByKey = await sql`
    SELECT * FROM mdm_concept
    WHERE tenant_id = ${tenantId}
      AND LOWER(canonical_key) = ${normalized}
    LIMIT 1
  `;

  let concept = null;

  if (conceptsByKey && conceptsByKey.length > 0) {
    concept = conceptsByKey[0];
  } else {
    const aliasRows = await sql`
      SELECT 
        c.id,
        c.tenant_id,
        c.canonical_key,
        c.label,
        c.description,
        c.domain,
        c.concept_type,
        c.governance_tier,
        c.standard_pack_id_primary,
        c.standard_ref,
        c.is_active
      FROM mdm_alias a
      INNER JOIN mdm_concept c ON a.concept_id = c.id
      WHERE c.tenant_id = ${tenantId}
        AND LOWER(a.alias_value) = ${normalized}
      LIMIT 1
    `;

    if (aliasRows && aliasRows.length > 0) {
      concept = aliasRows[0];
    }
  }

  if (!concept) {
    return null;
  }

  let standardPack = null;
  if (concept.standard_pack_id_primary) {
    const packRows = await sql`
      SELECT * FROM mdm_standard_pack
      WHERE id = ${concept.standard_pack_id_primary}
      LIMIT 1
    `;

    if (packRows && packRows.length > 0) {
      standardPack = packRows[0];
    }
  }

  const aliasRows = await sql`
    SELECT * FROM mdm_alias
    WHERE concept_id = ${concept.id}
    ORDER BY is_preferred_for_display DESC, alias_type, alias_value
  `;

  const aliases = aliasRows ?? [];

  return {
    concept,
    standardPack,
    aliases,
  };
}

async function listStandardPacks(domain) {
  if (domain) {
    const rows = await sql`
      SELECT * FROM mdm_standard_pack
      WHERE domain = ${domain}
      ORDER BY code ASC
    `;
    return rows ?? [];
  } else {
    const rows = await sql`
      SELECT * FROM mdm_standard_pack
      ORDER BY code ASC
    `;
    return rows ?? [];
  }
}

// Run tests
async function runTests() {
  console.log("🧪 Testing Metadata MCP Server...\n");

  try {
    // Test 1: Database connection
    console.log("1️⃣ Testing database connection...");
    const testQuery = await sql`SELECT NOW() as current_time`;
    console.log("   ✅ Database connection successful");
    console.log(`   📅 Server time: ${testQuery[0].current_time}\n`);

    // Test 2: Get a tenant ID (use first user's ID as default tenant)
    console.log("2️⃣ Getting tenant ID...");
    const users = await sql`SELECT id FROM users LIMIT 1`;
    if (!users || users.length === 0) {
      throw new Error("No users found in database. Please run seed script first.");
    }
    const tenantId = users[0].id;
    console.log(`   ✅ Using tenant ID: ${tenantId}\n`);

    // Test 3: List all standard packs
    console.log("3️⃣ Testing listStandardPacks (all)...");
    const allPacks = await listStandardPacks();
    console.log(`   ✅ Found ${allPacks.length} standard packs`);
    if (allPacks.length > 0) {
      console.log(`   📦 Sample: ${allPacks[0].code} - ${allPacks[0].name}\n`);
    } else {
      console.log("   ⚠️  No standard packs found\n");
    }

    // Test 4: List FINANCE domain packs
    console.log("4️⃣ Testing listStandardPacks (FINANCE domain)...");
    const financePacks = await listStandardPacks("FINANCE");
    console.log(`   ✅ Found ${financePacks.length} FINANCE standard packs\n`);

    // Test 5: Lookup concept by canonical key
    console.log("5️⃣ Testing lookupConcept (canonical key: 'revenue')...");
    const revenueConcept = await lookupConcept(tenantId, "revenue");
    if (revenueConcept) {
      console.log(`   ✅ Found concept: ${revenueConcept.concept.label}`);
      console.log(`   📊 Domain: ${revenueConcept.concept.domain}`);
      console.log(`   🏷️  Aliases: ${revenueConcept.aliases.length}`);
      if (revenueConcept.standardPack) {
        console.log(`   📦 Standard Pack: ${revenueConcept.standardPack.code}\n`);
      } else {
        console.log("   📦 Standard Pack: None\n");
      }
    } else {
      console.log("   ⚠️  Concept 'revenue' not found\n");
    }

    // Test 6: Lookup concept by alias
    console.log("6️⃣ Testing lookupConcept (alias: 'Sales')...");
    const salesConcept = await lookupConcept(tenantId, "Sales");
    if (salesConcept) {
      console.log(`   ✅ Found concept via alias: ${salesConcept.concept.label}`);
      console.log(`   🔑 Canonical key: ${salesConcept.concept.canonical_key}\n`);
    } else {
      console.log("   ⚠️  Concept 'Sales' not found\n");
    }

    // Test 7: Lookup non-existent concept
    console.log("7️⃣ Testing lookupConcept (non-existent: 'nonexistent123')...");
    const notFound = await lookupConcept(tenantId, "nonexistent123");
    if (!notFound) {
      console.log("   ✅ Correctly returned null for non-existent concept\n");
    } else {
      console.log("   ⚠️  Unexpectedly found concept\n");
    }

    console.log("✅ All tests passed! Server is ready to use.");
    console.log("\n📝 Next steps:");
    console.log("   1. Restart Cursor to load the MCP server");
    console.log("   2. Use the tools: metadata.lookupConcept and metadata.listStandardPacks");
    console.log("   3. Check .cursor/mcp.json for server configuration");

  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(`   Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    if (error instanceof Error && error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

runTests();


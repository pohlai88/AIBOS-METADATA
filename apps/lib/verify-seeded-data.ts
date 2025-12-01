/**
 * Verify Seeded Data
 * Quick verification script to check concepts and aliases
 */

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../../.env'),
    path.join(process.cwd(), '.env'),
  ];

  for (const envPath of envPaths) {
    try {
      if (readFileSync(envPath, 'utf-8')) {
        const envFile = readFileSync(envPath, 'utf-8');
        const lines = envFile.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=').trim();
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
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function verify() {
  console.log('🔍 Verifying seeded data...\n');

  try {
    // Get tenant ID
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1`;
    const tenantId = adminUser[0]?.id;

    if (!tenantId) {
      throw new Error('Admin user not found');
    }

    // Count concepts
    const conceptCount = await sql`
      SELECT COUNT(*) as count FROM mdm_concept WHERE tenant_id = ${tenantId}
    `;
    console.log(`📊 Concepts: ${conceptCount[0]?.count || 0}`);

    // Count aliases
    const aliasCount = await sql`
      SELECT COUNT(*) as count 
      FROM mdm_alias a
      JOIN mdm_concept c ON a.concept_id = c.id
      WHERE c.tenant_id = ${tenantId}
    `;
    console.log(`🏷️  Aliases: ${aliasCount[0]?.count || 0}`);

    // Show revenue aliases
    console.log('\n💰 Revenue aliases:');
    const revenueAliases = await sql`
      SELECT a.alias_value, a.alias_type, a.is_preferred_for_display
      FROM mdm_concept c
      JOIN mdm_alias a ON c.id = a.concept_id
      WHERE c.canonical_key = 'revenue' AND c.tenant_id = ${tenantId}
      ORDER BY a.is_preferred_for_display DESC, a.alias_value
    `;
    revenueAliases.forEach((a: any) => {
      const pref = a.is_preferred_for_display ? '⭐' : '  ';
      console.log(`   ${pref} ${a.alias_value} (${a.alias_type})`);
    });

    // Show deferred revenue aliases
    console.log('\n📦 Deferred Revenue aliases:');
    const deferredAliases = await sql`
      SELECT a.alias_value, a.alias_type, a.is_preferred_for_display
      FROM mdm_concept c
      JOIN mdm_alias a ON c.id = a.concept_id
      WHERE c.canonical_key = 'deferred_revenue' AND c.tenant_id = ${tenantId}
      ORDER BY a.is_preferred_for_display DESC, a.alias_value
    `;
    deferredAliases.forEach((a: any) => {
      const pref = a.is_preferred_for_display ? '⭐' : '  ';
      console.log(`   ${pref} ${a.alias_value} (${a.alias_type})`);
    });

    // Show tax liability aliases
    console.log('\n💳 Tax Liability aliases:');
    const taxAliases = await sql`
      SELECT a.alias_value, a.alias_type, a.is_preferred_for_display
      FROM mdm_concept c
      JOIN mdm_alias a ON c.id = a.concept_id
      WHERE c.canonical_key = 'tax_liability' AND c.tenant_id = ${tenantId}
      ORDER BY a.is_preferred_for_display DESC, a.alias_value
    `;
    taxAliases.forEach((a: any) => {
      const pref = a.is_preferred_for_display ? '⭐' : '  ';
      console.log(`   ${pref} ${a.alias_value} (${a.alias_type})`);
    });

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

verify();


/**
 * Seed Aliases
 * 
 * Seeds aliases for core concepts so AI can map terms like "Sales" → Revenue
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

async function seedAliases() {
  console.log('🏷️  Seeding aliases...\n');

  try {
    // Get tenant ID (admin user)
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1`;
    const tenantId = adminUser[0]?.id;

    if (!tenantId) {
      throw new Error('Admin user not found. Please run the main seed script first.');
    }

    console.log(`✅ Using tenant ID: ${tenantId}\n`);

    // Get concept IDs
    const revenueConcept = await sql`
      SELECT id FROM mdm_concept 
      WHERE canonical_key = 'revenue' AND tenant_id = ${tenantId} 
      LIMIT 1
    `;
    
    const deferredRevenueConcept = await sql`
      SELECT id FROM mdm_concept 
      WHERE canonical_key = 'deferred_revenue' AND tenant_id = ${tenantId} 
      LIMIT 1
    `;
    
    const taxLiabilityConcept = await sql`
      SELECT id FROM mdm_concept 
      WHERE canonical_key = 'tax_liability' AND tenant_id = ${tenantId} 
      LIMIT 1
    `;

    if (!revenueConcept || revenueConcept.length === 0) {
      throw new Error('Revenue concept not found. Please run seed-core-concepts first.');
    }

    if (!deferredRevenueConcept || deferredRevenueConcept.length === 0) {
      throw new Error('Deferred Revenue concept not found. Please run seed-core-concepts first.');
    }

    if (!taxLiabilityConcept || taxLiabilityConcept.length === 0) {
      throw new Error('Tax Liability concept not found. Please run seed-core-concepts first.');
    }

    const revenueId = revenueConcept[0].id;
    const deferredRevenueId = deferredRevenueConcept[0].id;
    const taxLiabilityId = taxLiabilityConcept[0].id;

    // Revenue aliases
    console.log('📝 Adding Revenue aliases...');
    const revenueAliases = await sql`
      INSERT INTO mdm_alias (
        concept_id, 
        alias_value, 
        alias_type, 
        source_system, 
        is_preferred_for_display, 
        notes
      ) VALUES
        (
          ${revenueId},
          'Revenue',
          'SEMANTIC',
          NULL,
          true,
          'Primary display label for revenue in most UIs.'
        ),
        (
          ${revenueId},
          'Sales',
          'SEMANTIC',
          NULL,
          false,
          'Common synonym for revenue in trading companies.'
        ),
        (
          ${revenueId},
          'Turnover',
          'SEMANTIC',
          NULL,
          false,
          'UK/European synonym for revenue.'
        ),
        (
          ${revenueId},
          'REV',
          'LEXICAL',
          NULL,
          false,
          'Abbreviated form used in reports.'
        )
      ON CONFLICT (concept_id, alias_value) DO NOTHING
      RETURNING alias_value, alias_type;
    `;
    console.log(`   ✅ Added ${revenueAliases.length} revenue aliases`);

    // Deferred revenue aliases
    console.log('📝 Adding Deferred Revenue aliases...');
    const deferredRevenueAliases = await sql`
      INSERT INTO mdm_alias (
        concept_id, 
        alias_value, 
        alias_type, 
        source_system, 
        is_preferred_for_display, 
        notes
      ) VALUES
        (
          ${deferredRevenueId},
          'Unearned Revenue',
          'SEMANTIC',
          NULL,
          false,
          'Common term for revenue invoiced but not yet earned.'
        ),
        (
          ${deferredRevenueId},
          'Contract Liability',
          'SEMANTIC',
          NULL,
          true,
          'IFRS term emphasising liability nature of deferred revenue.'
        )
      ON CONFLICT (concept_id, alias_value) DO NOTHING
      RETURNING alias_value, alias_type;
    `;
    console.log(`   ✅ Added ${deferredRevenueAliases.length} deferred revenue aliases`);

    // Tax liability aliases
    console.log('📝 Adding Tax Liability aliases...');
    const taxLiabilityAliases = await sql`
      INSERT INTO mdm_alias (
        concept_id, 
        alias_value, 
        alias_type, 
        source_system, 
        is_preferred_for_display, 
        notes
      ) VALUES
        (
          ${taxLiabilityId},
          'VAT Payable',
          'SEMANTIC',
          NULL,
          true,
          'VAT collected from customers not yet remitted.'
        ),
        (
          ${taxLiabilityId},
          'GST Payable',
          'SEMANTIC',
          NULL,
          false,
          'GST variant of indirect tax liability.'
        ),
        (
          ${taxLiabilityId},
          'Sales Tax Payable',
          'SEMANTIC',
          NULL,
          false,
          'Sales tax liability.'
        )
      ON CONFLICT (concept_id, alias_value) DO NOTHING
      RETURNING alias_value, alias_type;
    `;
    console.log(`   ✅ Added ${taxLiabilityAliases.length} tax liability aliases`);

    const totalAliases = revenueAliases.length + deferredRevenueAliases.length + taxLiabilityAliases.length;
    console.log(`\n✅ Total: ${totalAliases} aliases seeded successfully!`);

    // Show summary
    console.log('\n📊 Summary:');
    console.log(`   Revenue aliases: ${revenueAliases.length}`);
    revenueAliases.forEach((a: any) => {
      const pref = a.is_preferred_for_display ? '⭐' : '  ';
      console.log(`     ${pref} ${a.alias_value} (${a.alias_type})`);
    });
    console.log(`   Deferred Revenue aliases: ${deferredRevenueAliases.length}`);
    deferredRevenueAliases.forEach((a: any) => {
      const pref = a.is_preferred_for_display ? '⭐' : '  ';
      console.log(`     ${pref} ${a.alias_value} (${a.alias_type})`);
    });
    console.log(`   Tax Liability aliases: ${taxLiabilityAliases.length}`);
    taxLiabilityAliases.forEach((a: any) => {
      const pref = a.is_preferred_for_display ? '⭐' : '  ';
      console.log(`     ${pref} ${a.alias_value} (${a.alias_type})`);
    });

  } catch (error) {
    console.error('❌ Error seeding aliases:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

seedAliases();


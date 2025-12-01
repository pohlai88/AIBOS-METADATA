/**
 * Seed Core Concepts
 * 
 * Seeds the 12 core concepts (GL, FX, Inventory, Assets, AP/AR, Tax)
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

// Import validator
async function validateConceptBeforeInsert(
  domain: string,
  governanceTier: number,
  standardPackId: string | null,
  sql: any
): Promise<{ valid: boolean; errors: string[] }> {
  if (domain === 'FINANCE' && (governanceTier === 1 || governanceTier === 2)) {
    if (!standardPackId) {
      return {
        valid: false,
        errors: [`FINANCE concepts with tier ${governanceTier} must have a LAW-level standard pack`],
      };
    }

    const pack = await sql`
      SELECT authority_level FROM mdm_standard_pack WHERE id = ${standardPackId} LIMIT 1
    `;

    if (!pack || pack.length === 0) {
      return {
        valid: false,
        errors: [`Standard pack ${standardPackId} does not exist`],
      };
    }

    if (pack[0].authority_level !== 'LAW') {
      return {
        valid: false,
        errors: [`Standard pack must be LAW-level, got ${pack[0].authority_level}`],
      };
    }
  }

  return { valid: true, errors: [] };
}

async function seedCoreConcepts() {
  console.log('🌱 Seeding core concepts...\n');

  try {
    // Get tenant ID (admin user)
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1`;
    const tenantId = adminUser[0]?.id;

    if (!tenantId) {
      throw new Error('Admin user not found. Please run the main seed script first.');
    }

    console.log(`✅ Using tenant ID: ${tenantId}\n`);

    // Get standard pack IDs
    const ifrsCore = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IFRS_CORE' LIMIT 1`;
    const ias21Fx = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_21_FX' LIMIT 1`;
    const ias2Inv = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_2_INV' LIMIT 1`;
    const ias16Ppe = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_16_PPE' LIMIT 1`;
    const globalTax = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'GLOBAL_TAX' LIMIT 1`;

    // Create IAS_21_FX if it doesn't exist
    if (!ias21Fx || ias21Fx.length === 0) {
      console.log('📦 Creating IAS_21_FX standard pack...');
      await sql`
        INSERT INTO mdm_standard_pack (code, name, domain, authority_level, version, status, notes, created_by)
        VALUES (
          'IAS_21_FX',
          'IAS 21 - The Effects of Changes in Foreign Exchange Rates',
          'FINANCE',
          'LAW',
          '1.0.0',
          'ACTIVE',
          'International Accounting Standard 21: Foreign Exchange Rates',
          ${tenantId}
        )
        ON CONFLICT (code) DO NOTHING
      `;
      const newIas21Fx = await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_21_FX' LIMIT 1`;
      console.log('✅ Created IAS_21_FX pack\n');
    }

    // Re-fetch pack IDs
    const packs = {
      ifrsCore: (await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IFRS_CORE' LIMIT 1`)[0]?.id,
      ias21Fx: (await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_21_FX' LIMIT 1`)[0]?.id,
      ias2Inv: (await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_2_INV' LIMIT 1`)[0]?.id,
      ias16Ppe: (await sql`SELECT id FROM mdm_standard_pack WHERE code = 'IAS_16_PPE' LIMIT 1`)[0]?.id,
      globalTax: (await sql`SELECT id FROM mdm_standard_pack WHERE code = 'GLOBAL_TAX' LIMIT 1`)[0]?.id,
    };

    // Validate and insert concepts
    // First, validate all Tier 1/2 FINANCE concepts
    const conceptsToInsert = [
      { domain: 'FINANCE', tier: 1, packId: packs.ifrsCore, key: 'revenue' },
      { domain: 'FINANCE', tier: 1, packId: packs.ifrsCore, key: 'deferred_revenue' },
      { domain: 'FINANCE', tier: 1, packId: packs.ifrsCore, key: 'gl_journal_entry' },
      { domain: 'FINANCE', tier: 1, packId: packs.ifrsCore, key: 'gl_journal_line' },
      { domain: 'FINANCE', tier: 2, packId: packs.ias21Fx, key: 'fx_rate' },
      { domain: 'FINANCE', tier: 2, packId: packs.ias21Fx, key: 'fx_revaluation' },
      { domain: 'FINANCE', tier: 1, packId: packs.ias2Inv, key: 'inventory_cost' },
      { domain: 'FINANCE', tier: 2, packId: packs.ias2Inv, key: 'stock_ledger_entry' },
      { domain: 'FINANCE', tier: 1, packId: packs.ias16Ppe, key: 'asset' },
      { domain: 'FINANCE', tier: 2, packId: packs.ias16Ppe, key: 'depreciation_expense' },
      { domain: 'FINANCE', tier: 1, packId: packs.globalTax, key: 'tax_liability' },
      { domain: 'FINANCE', tier: 2, packId: packs.ifrsCore, key: 'party' },
    ];

    // Validate all concepts before insert
    console.log('🔍 Validating Tier 1/2 FINANCE concepts...');
    for (const concept of conceptsToInsert) {
      if (concept.domain === 'FINANCE' && (concept.tier === 1 || concept.tier === 2)) {
        const validation = await validateConceptBeforeInsert(
          concept.domain,
          concept.tier,
          concept.packId,
          sql
        );
        if (!validation.valid) {
          throw new Error(`Validation failed for ${concept.key}: ${validation.errors.join('; ')}`);
        }
      }
    }
    console.log('   ✅ All Tier 1/2 concepts validated\n');

    const concepts = await sql`
      INSERT INTO mdm_concept (
        tenant_id,
        canonical_key,
        label,
        description,
        domain,
        concept_type,
        governance_tier,
        standard_pack_id_primary,
        standard_ref,
        is_active
      ) VALUES
        -- 1. Revenue (IFRS 15, Tier 1)
        (
          ${tenantId},
          'revenue',
          'Revenue',
          'Income arising in the course of ordinary activities, recognised when performance obligations are satisfied (IFRS 15).',
          'FINANCE',
          'FIELD',
          1,
          ${packs.ifrsCore},
          'IFRS 15:31',
          true
        ),
        -- 2. Deferred Revenue (Contract Liability)
        (
          ${tenantId},
          'deferred_revenue',
          'Deferred Revenue (Contract Liability)',
          'Liability representing consideration received for which performance obligations are not yet satisfied.',
          'FINANCE',
          'FIELD',
          1,
          ${packs.ifrsCore},
          'IFRS 15:22-30',
          true
        ),
        -- 3. GL Journal Entry (Entity)
        (
          ${tenantId},
          'gl_journal_entry',
          'GL Journal Entry',
          'Immutable record of debits and credits forming the general ledger spine.',
          'FINANCE',
          'ENTITY',
          1,
          ${packs.ifrsCore},
          'IAS 1:54-79',
          true
        ),
        -- 4. GL Journal Line (Entity detail)
        (
          ${tenantId},
          'gl_journal_line',
          'GL Journal Line',
          'Line-level record within a journal, carrying account, debit/credit, segment, cost center and other tags.',
          'FINANCE',
          'ENTITY',
          1,
          ${packs.ifrsCore},
          'IAS 1 + internal chart of accounts guidance',
          true
        ),
        -- 5. FX Rate (IAS 21)
        (
          ${tenantId},
          'fx_rate',
          'Foreign Exchange Rate',
          'Rate used to translate one currency into another (spot, closing or average) per IAS 21.',
          'FINANCE',
          'ENTITY',
          2,
          ${packs.ias21Fx},
          'IAS 21:23-28',
          true
        ),
        -- 6. FX Revaluation (Service Rule)
        (
          ${tenantId},
          'fx_revaluation',
          'FX Revaluation Engine',
          'Service that revalues monetary assets and liabilities at closing rates, posting unrealised FX gains/losses.',
          'FINANCE',
          'SERVICE_RULE',
          2,
          ${packs.ias21Fx},
          'IAS 21:28-30',
          true
        ),
        -- 7. Inventory Cost (IAS 2)
        (
          ${tenantId},
          'inventory_cost',
          'Inventory Cost',
          'Cost of inventories including purchase price, import duties, transport and other costs to bring inventory to its present location and condition.',
          'FINANCE',
          'FIELD',
          1,
          ${packs.ias2Inv},
          'IAS 2:10-15',
          true
        ),
        -- 8. Stock Ledger Entry (Entity for valuation)
        (
          ${tenantId},
          'stock_ledger_entry',
          'Stock Ledger Entry',
          'Record of quantity and value movements for inventory, used to derive valuation (FIFO / Moving Average).',
          'FINANCE',
          'ENTITY',
          2,
          ${packs.ias2Inv},
          'IAS 2 + internal costing guidance',
          true
        ),
        -- 9. Asset (PPE)
        (
          ${tenantId},
          'asset',
          'Property, Plant and Equipment Asset',
          'Tangible asset held for use in production or supply of goods or services, expected to be used more than one period.',
          'FINANCE',
          'ENTITY',
          1,
          ${packs.ias16Ppe},
          'IAS 16:6-7',
          true
        ),
        -- 10. Depreciation Expense
        (
          ${tenantId},
          'depreciation_expense',
          'Depreciation Expense',
          'Systematic allocation of the depreciable amount of an asset over its useful life.',
          'FINANCE',
          'FIELD',
          2,
          ${packs.ias16Ppe},
          'IAS 16:50-53',
          true
        ),
        -- 11. Tax Liability
        (
          ${tenantId},
          'tax_liability',
          'Tax Liability',
          'Amount of tax collected or owed to the tax authority (VAT/GST/Sales Tax payable).',
          'FINANCE',
          'FIELD',
          1,
          ${packs.globalTax},
          'Local tax law / VAT act',
          true
        ),
        -- 12. Party (AP/AR Sub-ledger)
        (
          ${tenantId},
          'party',
          'Trade Party (Customer / Supplier)',
          'Counterparty for receivables and payables, carrying tax ID, payment terms and default currency.',
          'FINANCE',
          'ENTITY',
          2,
          ${packs.ifrsCore},
          'IFRS 9:5.1.1 and related',
          true
        )
      ON CONFLICT (tenant_id, canonical_key) DO NOTHING
      RETURNING canonical_key, label;
    `;

    console.log(`✅ Created ${concepts.length} core concepts:`);
    concepts.forEach((c: any) => {
      console.log(`   • ${c.canonical_key} - ${c.label}`);
    });

    console.log('\n✅ Core concepts seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding concepts:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

seedCoreConcepts();


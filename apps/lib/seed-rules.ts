/**
 * Seed Rules
 * 
 * Seeds a minimal rule set so the "lawbook" is explicit
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

async function seedRules() {
  console.log('📜 Seeding rules...\n');

  try {
    // Get admin user ID
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1`;
    const adminUserId = adminUser[0]?.id;

    if (!adminUserId) {
      throw new Error('Admin user not found. Please run the main seed script first.');
    }

    console.log(`✅ Using created_by: ${adminUserId}\n`);

    // Insert rules
    const rules = await sql`
      INSERT INTO mdm_rule (
        rule_code,
        scope,
        target_id,
        severity,
        description,
        expression,
        is_enforced_in_code,
        created_by
      ) VALUES
        -- 1. Tier 1/2 finance concepts must have a LAW-level standard pack
        (
          'FIN_IFRS_TIER1_MUST_HAVE_PACK',
          'SYSTEM',
          NULL,
          'BLOCKING',
          'Any FINANCE concept with governance_tier in (1,2) must have standard_pack_id_primary pointing to a LAW-level pack (e.g., IFRS/MFRS).',
          jsonb_build_object(
            'domain', 'FINANCE',
            'tiers', jsonb_build_array(1,2),
            'required_authority_level', 'LAW'
          ),
          false,
          ${adminUserId}
        ),
        -- 2. Canonical key uniqueness per tenant (documented, already enforced by unique constraint)
        (
          'CANONICAL_UNIQUENESS',
          'SYSTEM',
          NULL,
          'BLOCKING',
          'For any tenant, canonical_key must be unique in mdm_concept (no duplicate canonical definitions).',
          jsonb_build_object(
            'target', 'mdm_concept',
            'unique', jsonb_build_array('tenant_id', 'canonical_key')
          ),
          true,
          ${adminUserId}
        ),
        -- 3. Alias must link to a valid concept
        (
          'ALIAS_MUST_LINK_CANONICAL',
          'SYSTEM',
          NULL,
          'BLOCKING',
          'Every mdm_alias row must reference a valid mdm_concept.id; no orphan aliases.',
          jsonb_build_object(
            'target', 'mdm_alias',
            'fk', 'concept_id -> mdm_concept.id'
          ),
          true,
          ${adminUserId}
        ),
        -- 4. GAAP is alias for finance (not primary SoT in this tenant)
        (
          'GAAP_IS_ALIAS_FOR_FINANCE',
          'PACK',
          NULL,
          'INFO',
          'Finance concepts should be anchored to IFRS/MFRS as primary standard packs; GAAP-based definitions are treated as secondary or alias packs.',
          jsonb_build_object(
            'preferred_primary_packs', jsonb_build_array('IFRS_CORE','IAS_2_INV','IAS_16_PPE','IAS_21_FX')
          ),
          false,
          ${adminUserId}
        ),
        -- 5. AI must lookup metadata before inventing new finance concepts (philosophical rule for agents)
        (
          'AI_MUST_LOOKUP_BEFORE_CREATE',
          'SYSTEM',
          NULL,
          'WARNING',
          'AI agents should call metadata.lookupConcept before proposing new FINANCE concepts; Tier 1/2 concepts may not be auto-created.',
          jsonb_build_object(
            'required_tool', 'metadata.lookupConcept',
            'restricted_domain', 'FINANCE'
          ),
          false,
          ${adminUserId}
        )
      ON CONFLICT (rule_code) DO NOTHING
      RETURNING rule_code, scope, severity, is_enforced_in_code;
    `;

    console.log(`✅ Created ${rules.length} rules:\n`);

    // Group by severity
    const bySeverity = rules.reduce((acc: any, rule: any) => {
      if (!acc[rule.severity]) {
        acc[rule.severity] = [];
      }
      acc[rule.severity].push(rule);
      return acc;
    }, {});

    for (const [severity, severityRules] of Object.entries(bySeverity)) {
      const icon = severity === 'BLOCKING' ? '🚫' : severity === 'WARNING' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${severity} (${(severityRules as any[]).length} rules):`);
      (severityRules as any[]).forEach((rule: any) => {
        const enforced = rule.is_enforced_in_code ? '✅ ENFORCED' : '';
        console.log(`   • ${rule.rule_code} ${enforced}`);
      });
      console.log('');
    }

    console.log('✅ Rules seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding rules:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

seedRules();


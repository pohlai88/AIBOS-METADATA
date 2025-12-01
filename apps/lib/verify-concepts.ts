/**
 * Verification script for mdm_concept table
 * Run: npx tsx apps/lib/verify-concepts.ts
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

async function verifyConcepts() {
  console.log('🔍 Verifying concepts in database...\n');

  try {
    // Get all concepts with standard pack info
    const concepts = await sql`
      SELECT 
        c.canonical_key,
        c.label,
        c.description,
        c.domain,
        c.concept_type,
        c.governance_tier,
        c.standard_ref,
        c.is_active,
        sp.code as standard_pack_code,
        sp.name as standard_pack_name
      FROM mdm_concept c
      LEFT JOIN mdm_standard_pack sp ON c.standard_pack_id_primary = sp.id
      ORDER BY c.domain, c.governance_tier, c.canonical_key
    `;

    console.log(`📊 Found ${concepts.length} concepts:\n`);

    // Group by domain
    const byDomain = concepts.reduce((acc, concept) => {
      if (!acc[concept.domain]) {
        acc[concept.domain] = [];
      }
      acc[concept.domain].push(concept);
      return acc;
    }, {} as Record<string, typeof concepts>);

    for (const [domain, domainConcepts] of Object.entries(byDomain)) {
      console.log(`\n📁 ${domain} Domain (${domainConcepts.length} concepts):`);
      console.log('─'.repeat(80));
      
      for (const concept of domainConcepts) {
        const tier = '⭐'.repeat(concept.governance_tier);
        const packRef = concept.standard_pack_code 
          ? `[${concept.standard_pack_code}]` 
          : '';
        const standardRef = concept.standard_ref 
          ? `(${concept.standard_ref})` 
          : '';
        
        console.log(`  ${tier} ${concept.canonical_key}`);
        console.log(`     Label: ${concept.label}`);
        if (concept.description) {
          console.log(`     Description: ${concept.description}`);
        }
        console.log(`     Type: ${concept.concept_type} | Tier: ${concept.governance_tier} | Active: ${concept.is_active}`);
        if (packRef || standardRef) {
          console.log(`     Reference: ${packRef} ${standardRef}`.trim());
        }
        console.log('');
      }
    }

    // Summary by type
    console.log('\n📈 Summary by Concept Type:');
    console.log('─'.repeat(80));
    const byType = concepts.reduce((acc, concept) => {
      acc[concept.concept_type] = (acc[concept.concept_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  ${type}: ${count}`);
    }

    // Summary by governance tier
    console.log('\n📊 Summary by Governance Tier:');
    console.log('─'.repeat(80));
    const byTier = concepts.reduce((acc, concept) => {
      acc[concept.governance_tier] = (acc[concept.governance_tier] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    for (const [tier, count] of Object.entries(byTier).sort()) {
      const stars = '⭐'.repeat(Number(tier));
      console.log(`  Tier ${tier} ${stars}: ${count} concepts`);
    }

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error verifying concepts:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

verifyConcepts();


/**
 * GL Playground Script
 * 
 * Demonstrates the GL-to-lawbook wiring by:
 * 1. Listing all Tier 1 finance concepts
 * 2. Showing account-to-concept mappings
 * 3. Creating sample journals and testing PostingGuard
 * 
 * Usage:
 *   cd apps
 *   tsx lib/gl-playground.ts
 */

import { sql } from './db';
import { metadataService } from './metadataService';
import { validateJournalBeforePost, postJournal, type JournalEntry } from './postingGuard';
import { getTenantId } from './get-tenant-id';
import { randomUUID } from 'crypto';

/**
 * Print section header
 */
function printSection(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Print subsection header
 */
function printSubsection(title: string) {
  console.log(`\n--- ${title} ---\n`);
}

/**
 * 1. List all Tier 1 finance concepts
 */
async function listTier1FinanceConcepts(tenantId: string) {
  printSection('Tier 1 Finance Concepts');

  const concepts = await sql`
    SELECT 
      c.id,
      c.canonical_key,
      c.label,
      c.description,
      c.governance_tier,
      c.standard_ref,
      p.code AS standard_pack_code,
      p.name AS standard_pack_name,
      p.authority_level
    FROM mdm_concept c
    LEFT JOIN mdm_standard_pack p ON c.standard_pack_id_primary = p.id
    WHERE c.tenant_id = ${tenantId}::uuid
      AND c.domain = 'FINANCE'
      AND c.governance_tier = 1
      AND c.is_active = true
    ORDER BY c.canonical_key
  `;

  if (!concepts || concepts.length === 0) {
    console.log('⚠️  No Tier 1 finance concepts found.');
    console.log('   Run seed scripts to create concepts first.\n');
    return;
  }

  console.log(`Found ${concepts.length} Tier 1 finance concepts:\n`);

  for (const concept of concepts) {
    console.log(`  📌 ${concept.canonical_key}`);
    console.log(`     Label: ${concept.label}`);
    if (concept.description) {
      console.log(`     Description: ${concept.description}`);
    }
    console.log(`     Standard Pack: ${concept.standard_pack_code} (${concept.authority_level})`);
    if (concept.standard_ref) {
      console.log(`     Standard Ref: ${concept.standard_ref}`);
    }
    console.log('');
  }
}

/**
 * 2. Show account-to-concept mappings
 */
async function showAccountMappings(tenantId: string) {
  printSection('Account-to-Concept Mappings');

  const mappings = await sql`
    SELECT 
      a.code,
      a.name,
      a.account_type,
      a.governance_tier,
      c.canonical_key,
      c.label AS concept_label,
      p.code AS standard_pack_code,
      p.authority_level
    FROM accounts a
    LEFT JOIN mdm_concept c ON a.mdm_concept_id = c.id
    LEFT JOIN mdm_standard_pack p ON c.standard_pack_id_primary = p.id
    WHERE a.tenant_id = ${tenantId}::uuid
    ORDER BY 
      a.governance_tier NULLS LAST,
      a.code
  `;

  if (!mappings || mappings.length === 0) {
    console.log('⚠️  No accounts found.');
    console.log('   Create accounts first, then run seed-account-concept-mapping.ts\n');
    return;
  }

  console.log(`Found ${mappings.length} accounts:\n`);

  // Group by governance tier
  const byTier = new Map<number | null, typeof mappings>();
  for (const mapping of mappings) {
    const tier = mapping.governance_tier;
    if (!byTier.has(tier)) {
      byTier.set(tier, []);
    }
    byTier.get(tier)!.push(mapping);
  }

  for (const [tier, accounts] of Array.from(byTier.entries()).sort((a, b) => {
    if (a[0] === null) return 1;
    if (b[0] === null) return -1;
    return a[0] - b[0];
  })) {
    const tierLabel = tier === null ? 'Unassigned' : `Tier ${tier}`;
    console.log(`\n${tierLabel}:`);
    console.log('  Code | Name                    | Concept              | Pack');
    console.log('  -----|--------------------------|----------------------|------------');

    for (const acc of accounts) {
      const code = acc.code.padEnd(5);
      const name = (acc.name || '').padEnd(24).substring(0, 24);
      const concept = (acc.canonical_key || 'N/A').padEnd(20).substring(0, 20);
      const pack = acc.standard_pack_code || 'N/A';

      console.log(`  ${code} | ${name} | ${concept} | ${pack}`);
    }
  }

  // Summary
  const tier1Count = mappings.filter((m) => m.governance_tier === 1).length;
  const tier2Count = mappings.filter((m) => m.governance_tier === 2).length;
  const mappedCount = mappings.filter((m) => m.canonical_key !== null).length;

  console.log('\n📊 Summary:');
  console.log(`   Tier 1 accounts: ${tier1Count}`);
  console.log(`   Tier 2 accounts: ${tier2Count}`);
  console.log(`   Accounts mapped to concepts: ${mappedCount}/${mappings.length}`);
}

/**
 * 3. Test PostingGuard with sample journals
 */
async function testPostingGuard(tenantId: string) {
  printSection('PostingGuard Tests');

  // Get IFRS_CORE pack
  const packs = await metadataService.listStandardPacks('FINANCE');
  const ifrsCorePack = packs.find((p) => p.code === 'IFRS_CORE');

  if (!ifrsCorePack) {
    console.log('⚠️  IFRS_CORE pack not found.');
    console.log('   Run seed scripts to create standard packs first.\n');
    return;
  }

  // Get sample accounts
  const accounts = await sql`
    SELECT id, code, name, governance_tier, mdm_concept_id
    FROM accounts
    WHERE tenant_id = ${tenantId}::uuid
    ORDER BY code
    LIMIT 10
  `;

  if (!accounts || accounts.length < 2) {
    console.log('⚠️  Need at least 2 accounts to test journals.');
    console.log('   Create accounts first.\n');
    return;
  }

  const revenueAccount = accounts.find((a: any) => a.code === '4000') || accounts[0];
  const otherAccount = accounts.find((a: any) => a.code !== revenueAccount.code) || accounts[1];

  // ===========================================
  // Test 1: Valid journal (should pass)
  // ===========================================

  printSubsection('Test 1: Valid Journal (Should Pass)');

  const validJournal: JournalEntry = {
    id: randomUUID(),
    tenantId: tenantId,
    postingDate: '2025-01-31',
    soTPackId: ifrsCorePack.id,
    description: 'Test: Valid revenue journal',
    lines: [
      {
        id: randomUUID(),
        accountId: revenueAccount.id,
        debit: 0,
        credit: 1000.0,
        description: 'Revenue',
        lineNumber: 1,
      },
      {
        id: randomUUID(),
        accountId: otherAccount.id,
        debit: 1000.0,
        credit: 0,
        description: 'Other account',
        lineNumber: 2,
      },
    ],
  };

  console.log('Journal:');
  console.log(`  Pack: ${ifrsCorePack.code}`);
  console.log(`  Lines: ${validJournal.lines.length}`);
  console.log(`  Total Debit: ${validJournal.lines.reduce((s, l) => s + l.debit, 0)}`);
  console.log(`  Total Credit: ${validJournal.lines.reduce((s, l) => s + l.credit, 0)}`);

  const validation1 = await validateJournalBeforePost(validJournal);

  if (validation1.valid) {
    console.log('\n✅ Validation PASSED');
    console.log(`   Snapshots created: ${Object.keys(validation1.snapshots).length}`);
  } else {
    console.log('\n❌ Validation FAILED');
    console.log('   Errors:');
    for (const error of validation1.errors) {
      console.log(`     - ${error}`);
    }
  }

  // ===========================================
  // Test 2: Unbalanced journal (should fail)
  // ===========================================

  printSubsection('Test 2: Unbalanced Journal (Should Fail)');

  const unbalancedJournal: JournalEntry = {
    id: randomUUID(),
    tenantId: tenantId,
    postingDate: '2025-01-31',
    soTPackId: ifrsCorePack.id,
    description: 'Test: Unbalanced journal',
    lines: [
      {
        id: randomUUID(),
        accountId: revenueAccount.id,
        debit: 0,
        credit: 1000.0,
        description: 'Revenue',
        lineNumber: 1,
      },
      {
        id: randomUUID(),
        accountId: otherAccount.id,
        debit: 999.99, // Doesn't match credit
        credit: 0,
        description: 'Other account',
        lineNumber: 2,
      },
    ],
  };

  console.log('Journal:');
  console.log(`  Total Debit: ${unbalancedJournal.lines.reduce((s, l) => s + l.debit, 0)}`);
  console.log(`  Total Credit: ${unbalancedJournal.lines.reduce((s, l) => s + l.credit, 0)}`);

  const validation2 = await validateJournalBeforePost(unbalancedJournal);

  if (!validation2.valid) {
    console.log('\n✅ Validation correctly REJECTED');
    console.log('   Errors:');
    for (const error of validation2.errors) {
      console.log(`     - ${error}`);
    }
  } else {
    console.log('\n❌ Validation incorrectly PASSED (should have failed)');
  }

  // ===========================================
  // Test 3: Journal without pack (should fail)
  // ===========================================

  printSubsection('Test 3: Journal Without Pack (Should Fail)');

  const noPackJournal: JournalEntry = {
    id: randomUUID(),
    tenantId: tenantId,
    postingDate: '2025-01-31',
    soTPackId: null, // Missing pack
    description: 'Test: Journal without pack',
    lines: [
      {
        id: randomUUID(),
        accountId: revenueAccount.id,
        debit: 0,
        credit: 1000.0,
        description: 'Revenue',
        lineNumber: 1,
      },
      {
        id: randomUUID(),
        accountId: otherAccount.id,
        debit: 1000.0,
        credit: 0,
        description: 'Other account',
        lineNumber: 2,
      },
    ],
  };

  const validation3 = await validateJournalBeforePost(noPackJournal);

  if (!validation3.valid) {
    console.log('✅ Validation correctly REJECTED');
    console.log('   Errors:');
    for (const error of validation3.errors) {
      console.log(`     - ${error}`);
    }
  } else {
    console.log('❌ Validation incorrectly PASSED (should have failed)');
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('\n🎭 GL Playground - Demonstrating GL-to-Lawbook Wiring\n');

    const tenantId = await getTenantId();
    console.log(`Using tenant ID: ${tenantId}\n`);

    // 1. List Tier 1 finance concepts
    await listTier1FinanceConcepts(tenantId);

    // 2. Show account mappings
    await showAccountMappings(tenantId);

    // 3. Test PostingGuard
    await testPostingGuard(tenantId);

    printSection('Playground Complete');
    console.log('✅ All tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { main as runGLPlayground };


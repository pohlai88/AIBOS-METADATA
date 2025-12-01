/**
 * GL Playground Script
 * 
 * Demonstrates GL-to-lawbook wiring by showing:
 * - Tier 1/2 finance concepts from metadata
 * - Account-to-concept mappings
 * - Good journal that passes PostingGuard
 * - Bad journal that fails PostingGuard
 * 
 * Usage:
 *   npx tsx scripts/glPlayground.ts
 * 
 * Prerequisites:
 *   - DATABASE_URL environment variable set
 *   - Helper views created (run apps/lib/gl-views.sql)
 *   - Metadata seeded (concepts, packs, accounts)
 */

import { sql } from '../apps/lib/db';
import { validateJournalBeforePost, type JournalEntry, type JournalLine } from '../apps/lib/postingGuard';
import { getTenantId } from '../apps/lib/get-tenant-id';
import { randomUUID } from 'crypto';

type ConceptRow = {
  id: string;
  tenant_id: string;
  canonical_key: string;
  label: string;
  governance_tier: number;
  standard_pack_code: string | null;
  authority_level: string | null;
  standard_ref: string | null;
};

type AccountConceptRow = {
  account_id: string;
  tenant_id: string;
  account_code: string;
  account_name: string;
  governance_tier: number | null;
  concept_key: string | null;
  concept_label: string | null;
  pack_code: string | null;
  authority_level: string | null;
};

/**
 * Helper: Pretty log sections
 */
function section(title: string) {
  console.log('');
  console.log('===========================================');
  console.log(`  ${title}`);
  console.log('===========================================');
  console.log('');
}

/**
 * Helper: Resolve standard pack by code
 */
async function getStandardPackByCode(code: string) {
  const rows = await sql<{ id: string; code: string; status: string }[]>`
    SELECT id, code, status
    FROM mdm_standard_pack
    WHERE code = ${code}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Helper: Resolve account by code
 */
async function getAccountByCode(tenantId: string, code: string) {
  const rows = await sql<{
    id: string;
    code: string;
    name: string;
    tenant_id: string;
    mdm_concept_id: string | null;
    governance_tier: number | null;
  }[]>`
    SELECT id, code, name, tenant_id, mdm_concept_id, governance_tier
    FROM accounts
    WHERE tenant_id = ${tenantId}::uuid
      AND code = ${code}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * 1. Show Tier 1/2 Finance Concepts
 */
async function showTier12Concepts(tenantId: string) {
  section('Tier 1/2 Finance Concepts (from metadata)');

  try {
    // Try using the view first
    const rows = await sql<ConceptRow[]>`
      SELECT
        id,
        tenant_id,
        canonical_key,
        label,
        governance_tier,
        standard_pack_code,
        authority_level,
        standard_ref
      FROM v_finance_tier12_concepts
      WHERE tenant_id = ${tenantId}::uuid
      ORDER BY canonical_key
    `;

    if (rows.length === 0) {
      // Fallback: query directly if view doesn't exist
      const fallbackRows = await sql<ConceptRow[]>`
        SELECT
          c.id,
          c.tenant_id,
          c.canonical_key,
          c.label,
          c.governance_tier,
          p.code AS standard_pack_code,
          p.authority_level,
          c.standard_ref
        FROM mdm_concept c
        LEFT JOIN mdm_standard_pack p
          ON c.standard_pack_id_primary = p.id
        WHERE c.tenant_id = ${tenantId}::uuid
          AND c.domain = 'FINANCE'
          AND c.governance_tier <= 2
          AND c.is_active = true
        ORDER BY c.canonical_key
      `;

      if (fallbackRows.length === 0) {
        console.log('⚠️  No Tier 1/2 finance concepts found for this tenant.');
        console.log('   Run seed scripts to create concepts first.\n');
        return;
      }

      for (const r of fallbackRows) {
        console.log(
          `  • ${r.canonical_key} (${r.label}) [Tier ${r.governance_tier}] — Pack: ${r.standard_pack_code ?? 'N/A'} (${r.authority_level ?? '?'}), Ref: ${r.standard_ref ?? 'n/a'}`
        );
      }
      return;
    }

    if (rows.length === 0) {
      console.log('⚠️  No Tier 1/2 finance concepts found for this tenant.');
      console.log('   Run seed scripts to create concepts first.\n');
      return;
    }

    for (const r of rows) {
      console.log(
        `  • ${r.canonical_key} (${r.label}) [Tier ${r.governance_tier}] — Pack: ${r.standard_pack_code ?? 'N/A'} (${r.authority_level ?? '?'}), Ref: ${r.standard_ref ?? 'n/a'}`
      );
    }
  } catch (error: any) {
    console.log('⚠️  Error querying concepts (view may not exist):', error.message);
    console.log('   Run apps/lib/gl-views.sql to create helper views.\n');
  }
}

/**
 * 2. Show Account → Concept Mappings
 */
async function showAccountConceptMappings(tenantId: string) {
  section('Account → Concept Mapping (Tier 1/2 focus)');

  try {
    // Try using the view first
    const rows = await sql<AccountConceptRow[]>`
      SELECT
        account_id,
        tenant_id,
        account_code,
        account_name,
        governance_tier,
        concept_key,
        concept_label,
        pack_code,
        authority_level
      FROM v_accounts_with_concepts
      WHERE tenant_id = ${tenantId}::uuid
      ORDER BY account_code
    `;

    if (rows.length === 0) {
      // Fallback: query directly if view doesn't exist
      const fallbackRows = await sql<AccountConceptRow[]>`
        SELECT
          a.id AS account_id,
          a.tenant_id,
          a.code AS account_code,
          a.name AS account_name,
          a.governance_tier,
          c.canonical_key AS concept_key,
          c.label AS concept_label,
          p.code AS pack_code,
          p.authority_level
        FROM accounts a
        LEFT JOIN mdm_concept c
          ON a.mdm_concept_id = c.id
        LEFT JOIN mdm_standard_pack p
          ON c.standard_pack_id_primary = p.id
        WHERE a.tenant_id = ${tenantId}::uuid
        ORDER BY a.code
      `;

      if (fallbackRows.length === 0) {
        console.log('⚠️  No accounts found for this tenant.');
        console.log('   Create accounts first, then run seed-account-concept-mapping.ts\n');
        return;
      }

      for (const r of fallbackRows) {
        const tier = r.governance_tier ?? 3;
        const tierMark = tier <= 2 ? '🔥' : '·';
        console.log(
          `${tierMark} ${r.account_code.padEnd(6)} ${(r.account_name || '').padEnd(30).substring(0, 30)} — Tier ${tier} | concept=${r.concept_key ?? 'NONE'} | pack=${r.pack_code ?? 'NONE'} (${r.authority_level ?? '-'})`
        );
      }
      return;
    }

    if (rows.length === 0) {
      console.log('⚠️  No accounts found for this tenant.');
      console.log('   Create accounts first, then run seed-account-concept-mapping.ts\n');
      return;
    }

    for (const r of rows) {
      const tier = r.governance_tier ?? 3;
      const tierMark = tier <= 2 ? '🔥' : '·';
      console.log(
        `${tierMark} ${r.account_code.padEnd(6)} ${(r.account_name || '').padEnd(30).substring(0, 30)} — Tier ${tier} | concept=${r.concept_key ?? 'NONE'} | pack=${r.pack_code ?? 'NONE'} (${r.authority_level ?? '-'})`
      );
    }
  } catch (error: any) {
    console.log('⚠️  Error querying accounts (view may not exist):', error.message);
    console.log('   Run apps/lib/gl-views.sql to create helper views.\n');
  }
}

/**
 * 3. Demo: Good Journal (should PASS)
 */
async function demoGoodJournal(tenantId: string) {
  section('Demo 1: GOOD Journal (should PASS)');

  const pack = await getStandardPackByCode('IFRS_CORE');
  if (!pack) {
    console.log('❌ Pack IFRS_CORE not found. Seed packs first.');
    return;
  }

  if (pack.status !== 'ACTIVE') {
    console.log(`❌ Pack IFRS_CORE is not ACTIVE (status=${pack.status})`);
    return;
  }

  // Try to find revenue and inventory accounts
  const revenueAcc = await getAccountByCode(tenantId, '4000');
  const inventoryAcc = await getAccountByCode(tenantId, '1300');

  // If not found, try any Tier 1 accounts
  let account1 = revenueAcc;
  let account2 = inventoryAcc;

  if (!account1 || !account2) {
    // Fallback: get any two accounts
    const allAccounts = await sql<{
      id: string;
      code: string;
      name: string;
      mdm_concept_id: string | null;
      governance_tier: number | null;
    }[]>`
      SELECT id, code, name, mdm_concept_id, governance_tier
      FROM accounts
      WHERE tenant_id = ${tenantId}::uuid
      ORDER BY code
      LIMIT 2
    `;

    if (allAccounts.length < 2) {
      console.log('❌ Need at least 2 accounts to test journals.');
      console.log('   Create accounts first.\n');
      return;
    }

    account1 = allAccounts[0];
    account2 = allAccounts[1];
    console.log(`   Using accounts: ${account1.code} and ${account2.code}\n`);
  } else {
    console.log(`   Using accounts: ${account1.code} (${account1.name}) and ${account2.code} (${account2.name})\n`);
  }

  const journalId = randomUUID();
  const line1Id = randomUUID();
  const line2Id = randomUUID();

  const lines: JournalLine[] = [
    {
      id: line1Id,
      accountId: account1.id,
      debit: 0,
      credit: 1000,
      description: 'Revenue line',
      lineNumber: 1,
    },
    {
      id: line2Id,
      accountId: account2.id,
      debit: 1000,
      credit: 0,
      description: 'Offsetting line',
      lineNumber: 2,
    },
  ];

  const journal: JournalEntry = {
    id: journalId,
    tenantId: tenantId,
    postingDate: new Date().toISOString().slice(0, 10),
    soTPackId: pack.id,
    description: 'Test: Valid revenue journal',
    lines,
  };

  try {
    const validation = await validateJournalBeforePost(journal);
    
    if (validation.valid) {
      console.log('✅ PostingGuard PASSED for GOOD journal.');
      console.log('\n   Metadata Snapshots:');
      for (const [lineId, snapshot] of Object.entries(validation.snapshots)) {
        console.log(`     Line ${lineId.substring(0, 8)}...:`);
        console.log(`       concept_key: ${snapshot.concept_key ?? 'null'}`);
        console.log(`       standard_pack: ${snapshot.standard_pack ?? 'null'}`);
        console.log(`       governance_tier: ${snapshot.governance_tier}`);
        console.log(`       validated_at: ${snapshot.validated_at}`);
      }
    } else {
      console.log('❌ PostingGuard FAILED for GOOD journal:');
      for (const error of validation.errors) {
        console.log(`     - ${error}`);
      }
    }
  } catch (err: any) {
    console.log('❌ PostingGuard threw an error for GOOD journal:');
    console.error(`     ${err.message ?? err}`);
  }
}

/**
 * 4. Demo: Bad Journal (should FAIL)
 */
async function demoBadJournal_Unbalanced(tenantId: string) {
  section('Demo 2: BAD Journal (unbalanced, should FAIL)');

  const pack = await getStandardPackByCode('IFRS_CORE');
  if (!pack || pack.status !== 'ACTIVE') {
    console.log('❌ Pack IFRS_CORE not found or not ACTIVE.');
    return;
  }

  // Get any two accounts
  const allAccounts = await sql<{
    id: string;
    code: string;
    name: string;
  }[]>`
    SELECT id, code, name
    FROM accounts
    WHERE tenant_id = ${tenantId}::uuid
    ORDER BY code
    LIMIT 2
  `;

  if (allAccounts.length < 2) {
    console.log('❌ Need at least 2 accounts to test journals.');
    return;
  }

  const account1 = allAccounts[0];
  const account2 = allAccounts[1];

  console.log(`   Using accounts: ${account1.code} and ${account2.code}`);
  console.log('   Creating unbalanced journal (debits ≠ credits)\n');

  const journalId = randomUUID();
  const line1Id = randomUUID();
  const line2Id = randomUUID();

  const lines: JournalLine[] = [
    {
      id: line1Id,
      accountId: account1.id,
      debit: 0,
      credit: 1000,
      description: 'Credit line',
      lineNumber: 1,
    },
    {
      id: line2Id,
      accountId: account2.id,
      debit: 999.99, // Doesn't match credit!
      credit: 0,
      description: 'Debit line (unbalanced)',
      lineNumber: 2,
    },
  ];

  const journal: JournalEntry = {
    id: journalId,
    tenantId: tenantId,
    postingDate: new Date().toISOString().slice(0, 10),
    soTPackId: pack.id,
    description: 'Test: Unbalanced journal (should fail)',
    lines,
  };

  try {
    const validation = await validateJournalBeforePost(journal);
    
    if (!validation.valid) {
      console.log('✅ PostingGuard correctly REJECTED unbalanced journal:');
      for (const error of validation.errors) {
        console.log(`     - ${error}`);
      }
    } else {
      console.log('❌ PostingGuard unexpectedly PASSED for unbalanced journal!');
      console.log('   This should not happen - check validation logic.');
    }
  } catch (err: any) {
    console.log('✅ PostingGuard correctly threw error for unbalanced journal:');
    console.error(`     ${err.message ?? err}`);
  }
}

/**
 * 5. Demo: Bad Journal (no pack, should FAIL)
 */
async function demoBadJournal_NoPack(tenantId: string) {
  section('Demo 3: BAD Journal (no standard pack, should FAIL)');

  // Get any two accounts
  const allAccounts = await sql<{
    id: string;
    code: string;
    name: string;
  }[]>`
    SELECT id, code, name
    FROM accounts
    WHERE tenant_id = ${tenantId}::uuid
    ORDER BY code
    LIMIT 2
  `;

  if (allAccounts.length < 2) {
    console.log('❌ Need at least 2 accounts to test journals.');
    return;
  }

  const account1 = allAccounts[0];
  const account2 = allAccounts[1];

  console.log(`   Using accounts: ${account1.code} and ${account2.code}`);
  console.log('   Creating journal WITHOUT standard pack (soTPackId = null)\n');

  const journalId = randomUUID();
  const line1Id = randomUUID();
  const line2Id = randomUUID();

  const lines: JournalLine[] = [
    {
      id: line1Id,
      accountId: account1.id,
      debit: 0,
      credit: 1000,
      description: 'Credit line',
      lineNumber: 1,
    },
    {
      id: line2Id,
      accountId: account2.id,
      debit: 1000,
      credit: 0,
      description: 'Debit line',
      lineNumber: 2,
    },
  ];

  const journal: JournalEntry = {
    id: journalId,
    tenantId: tenantId,
    postingDate: new Date().toISOString().slice(0, 10),
    soTPackId: null, // Missing pack!
    description: 'Test: Journal without pack (should fail)',
    lines,
  };

  try {
    const validation = await validateJournalBeforePost(journal);
    
    if (!validation.valid) {
      console.log('✅ PostingGuard correctly REJECTED journal without pack:');
      for (const error of validation.errors) {
        console.log(`     - ${error}`);
      }
    } else {
      console.log('❌ PostingGuard unexpectedly PASSED for journal without pack!');
      console.log('   This should not happen - check validation logic.');
    }
  } catch (err: any) {
    console.log('✅ PostingGuard correctly threw error for journal without pack:');
    console.error(`     ${err.message ?? err}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🎭 GL Playground — Metadata-Governed Journals\n');

  try {
    // Get tenant ID
    const tenantId = await getTenantId();
    console.log(`Using tenant: ${tenantId}\n`);

    // Show concepts and mappings
    await showTier12Concepts(tenantId);
    await showAccountConceptMappings(tenantId);

    // Demo journals
    await demoGoodJournal(tenantId);
    await demoBadJournal_Unbalanced(tenantId);
    await demoBadJournal_NoPack(tenantId);

    section('Playground Complete');
    console.log('✅ All tests completed!\n');
  } catch (error: any) {
    console.error('\n❌ Fatal error in GL playground:', error.message || error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as runGLPlayground };


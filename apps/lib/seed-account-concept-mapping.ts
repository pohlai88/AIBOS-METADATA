/**
 * Seed Account-to-Concept Mapping
 * 
 * Maps Chart of Accounts to canonical metadata concepts.
 * This connects your CoA to the IFRS lawbook.
 * 
 * Usage:
 *   tsx lib/seed-account-concept-mapping.ts
 */

import { sql } from './db';
import { getTenantId } from './get-tenant-id';

/**
 * Account Mapping Configuration
 * 
 * Maps account codes to canonical concept keys.
 * Adjust these to match your actual Chart of Accounts.
 */
const ACCOUNT_MAPPINGS = [
  // Revenue accounts (Tier 1)
  {
    accountCodes: ['4000', '4100', '4200'], // Adjust to your revenue account codes
    conceptKey: 'revenue',
    governanceTier: 1,
  },
  
  // Tax Liability accounts (Tier 1)
  {
    accountCodes: ['2100', '2101'], // VAT/GST Payable
    conceptKey: 'tax_liability',
    governanceTier: 1,
  },
  
  // Inventory accounts (Tier 1)
  {
    accountCodes: ['1300', '1310'], // Inventory
    conceptKey: 'inventory_cost',
    governanceTier: 1,
  },
  
  // Deferred Revenue (Tier 1)
  {
    accountCodes: ['2200', '2201'], // Deferred Revenue / Contract Liability
    conceptKey: 'deferred_revenue',
    governanceTier: 1,
  },
  
  // COGS accounts (Tier 1)
  {
    accountCodes: ['5000', '5100'], // Cost of Goods Sold
    conceptKey: 'cogs', // You may need to create this concept
    governanceTier: 1,
  },
];

async function seedAccountConceptMapping() {
  console.log('📊 Seeding Account-to-Concept Mapping...\n');

  try {
    const tenantId = await getTenantId();
    console.log(`   Using tenant ID: ${tenantId}\n`);

    let totalMapped = 0;

    for (const mapping of ACCOUNT_MAPPINGS) {
      // Lookup concept
      const conceptRows = await sql`
        SELECT id, canonical_key, label
        FROM mdm_concept
        WHERE tenant_id = ${tenantId}::uuid
          AND canonical_key = ${mapping.conceptKey}
          AND is_active = true
        LIMIT 1
      `;

      if (conceptRows.length === 0) {
        console.log(
          `   ⚠️  Concept '${mapping.conceptKey}' not found. Skipping account codes: ${mapping.accountCodes.join(', ')}`
        );
        continue;
      }

      const concept = conceptRows[0];
      console.log(
        `   Mapping accounts [${mapping.accountCodes.join(', ')}] → ${concept.canonical_key} (${concept.label})`
      );

      // Update accounts
      const result = await sql`
        UPDATE accounts a
        SET
          mdm_concept_id = ${concept.id}::uuid,
          governance_tier = ${mapping.governanceTier}
        FROM mdm_concept c
        WHERE
          a.code = ANY(${mapping.accountCodes}::text[])
          AND a.tenant_id = ${tenantId}::uuid
          AND c.id = ${concept.id}::uuid
          AND c.tenant_id = ${tenantId}::uuid
      `;

      const count = result.count || 0;
      totalMapped += count;
      console.log(`      ✅ Mapped ${count} account(s)\n`);
    }

    console.log(`✅ Total accounts mapped: ${totalMapped}`);

    // Show summary
    const summary = await sql`
      SELECT 
        governance_tier,
        COUNT(*) as account_count,
        COUNT(mdm_concept_id) as concept_mapped_count
      FROM accounts
      WHERE tenant_id = ${tenantId}::uuid
      GROUP BY governance_tier
      ORDER BY governance_tier
    `;

    console.log('\n📊 Account Mapping Summary:');
    console.log('   Tier | Total Accounts | Mapped to Concepts');
    console.log('   -----|----------------|-------------------');
    for (const row of summary) {
      console.log(
        `   ${row.governance_tier || 'NULL'}    | ${row.account_count}              | ${row.concept_mapped_count}`
      );
    }
  } catch (error) {
    console.error('❌ Error seeding account-concept mapping:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAccountConceptMapping()
    .then(() => {
      console.log('\n✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { seedAccountConceptMapping };


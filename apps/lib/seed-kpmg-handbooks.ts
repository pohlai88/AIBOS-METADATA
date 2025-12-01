/**
 * Seed KPMG Handbook Standard Packs
 * 
 * Adds KPMG Financial Reporting Handbooks as INDUSTRY-level standard packs.
 * These provide authoritative interpretive guidance on IFRS/GAAP standards.
 * 
 * Usage:
 *   cd apps
 *   tsx lib/seed-kpmg-handbooks.ts
 */

import { sql } from './db';
import { getTenantId } from './get-tenant-id';

/**
 * KPMG Handbook Definitions
 * 
 * These are INDUSTRY-level packs that provide interpretive guidance
 * on LAW-level standards (IFRS, IAS, GAAP).
 */
const KPMG_HANDBOOKS = [
    {
        code: 'KPMG_ACCOUNTING_CHANGES',
        name: 'KPMG: Accounting Changes and Error Corrections',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on ASC 250 requirements for accounting changes and error corrections. Provides interpretive guidance on restatements, changes in accounting principles, and error corrections.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/accounting-changes-error-corrections.html',
    },
    {
        code: 'KPMG_INCOME_TAXES',
        name: 'KPMG: Accounting for Income Taxes',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on income tax accounting with detailed explanations and examples. Covers deferred taxes, tax provisions, and tax-related disclosures.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/accounting-income-taxes.html',
    },
    {
        code: 'KPMG_BUSINESS_COMBINATIONS',
        name: 'KPMG: Business Combinations',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on acquisition accounting and application issues. Covers purchase price allocation, goodwill, and business combination accounting.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/business-combinations.html',
    },
    {
        code: 'KPMG_CONSOLIDATION',
        name: 'KPMG: Consolidation',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on consolidation accounting. Explains variable interest entities (VIEs), voting interest entities, and non-controlling interests.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/consolidation.html',
    },
    {
        code: 'KPMG_ASSET_ACQUISITIONS',
        name: 'KPMG: Asset Acquisitions',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on accounting for asset purchases. Guidance on distinguishing asset acquisitions from business combinations.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/asset-acquisitions.html',
    },
    {
        code: 'KPMG_BANKRUPTCY',
        name: 'KPMG: Accounting for Bankruptcies',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on interpretive guidance for accounting before, during, and after Chapter 11 bankruptcy proceedings.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/accounting-bankruptcies.html',
    },
    {
        code: 'KPMG_ECONOMIC_DISRUPTION',
        name: 'KPMG: Accounting for Economic Disruption',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on impact of macroeconomic shocks on financial reporting. Covers impairment, going concern, and disruption-related disclosures.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/accounting-economic-disruption.html',
    },
    {
        code: 'KPMG_CLIMATE_RISK',
        name: 'KPMG: Climate Risk in Financial Statements',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on how climate risk affects financial statement disclosures. Guidance on climate-related accounting and reporting.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/climate-risk-financial-statements.html',
    },
    {
        code: 'KPMG_AI_FINANCIAL_REPORTING',
        name: 'KPMG: AI and Automation in Financial Reporting',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook on governance and internal control considerations for AI adoption in financial reporting. Covers AI governance, controls, and audit considerations.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/ai-automation-financial-reporting.html',
    },
    {
        code: 'KPMG_IFRS_USGAAP',
        name: 'KPMG: IFRS vs US GAAP Comparisons',
        domain: 'FINANCE',
        authority_level: 'INDUSTRY',
        version: '2024',
        notes: 'KPMG handbook bridging differences between IFRS and US GAAP for multinational reporting. Comparative analysis of key accounting differences.',
        handbookUrl: 'https://kpmg.com/us/en/frv/reference-library/handbooks/ifrs-us-gaap-comparisons.html',
    },
];

/**
 * Mapping: KPMG Handbooks → Related LAW-level Standard Packs
 * 
 * This helps agents understand which KPMG handbooks provide guidance
 * on which IFRS/IAS standards.
 */
const HANDBOOK_TO_STANDARD_MAPPING: Record<string, string[]> = {
    KPMG_ACCOUNTING_CHANGES: ['IFRS_CORE'], // ASC 250 / IAS 8
    KPMG_INCOME_TAXES: ['IFRS_CORE', 'GLOBAL_TAX'], // IAS 12 / ASC 740
    KPMG_BUSINESS_COMBINATIONS: ['IFRS_CORE'], // IFRS 3 / ASC 805
    KPMG_CONSOLIDATION: ['IFRS_CORE'], // IFRS 10 / ASC 810
    KPMG_ASSET_ACQUISITIONS: ['IFRS_CORE', 'IAS_16_PPE'], // ASC 805 / IAS 16
    KPMG_BANKRUPTCY: ['IFRS_CORE'], // General guidance
    KPMG_ECONOMIC_DISRUPTION: ['IFRS_CORE'], // IAS 36, IAS 1
    KPMG_CLIMATE_RISK: ['IFRS_CORE'], // IFRS S2 / General disclosures
    KPMG_AI_FINANCIAL_REPORTING: ['IFRS_CORE'], // Governance / Controls
    KPMG_IFRS_USGAAP: ['IFRS_CORE'], // Cross-standard comparison
};

async function seedKPMGHandbooks() {
    console.log('📚 Seeding KPMG Financial Reporting Handbooks...\n');

    try {
        const tenantId = await getTenantId();
        console.log(`   Using tenant ID: ${tenantId}\n`);

        let created = 0;
        let skipped = 0;

        for (const handbook of KPMG_HANDBOOKS) {
            // Check if already exists
            const existing = await sql`
        SELECT id, code FROM mdm_standard_pack
        WHERE code = ${handbook.code}
        LIMIT 1
      `;

            if (existing && existing.length > 0) {
                console.log(`   ⏭️  ${handbook.code} already exists, skipping...`);
                skipped++;
                continue;
            }

            // Insert handbook
            const notesWithUrl = `${handbook.notes}\n\nHandbook URL: ${handbook.handbookUrl}`;

            const result = await sql`
        INSERT INTO mdm_standard_pack (
          code,
          name,
          domain,
          authority_level,
          version,
          status,
          notes,
          created_by
        )
        VALUES (
          ${handbook.code},
          ${handbook.name},
          ${handbook.domain},
          ${handbook.authority_level},
          ${handbook.version},
          'ACTIVE',
          ${notesWithUrl},
          ${tenantId}::uuid
        )
        RETURNING code, name
      `;

            if (result && result.length > 0) {
                console.log(`   ✅ Created: ${result[0].code} - ${result[0].name}`);
                created++;

                // Show related LAW-level packs
                const relatedPacks = HANDBOOK_TO_STANDARD_MAPPING[handbook.code] || [];
                if (relatedPacks.length > 0) {
                    console.log(`      📌 Provides guidance on: ${relatedPacks.join(', ')}`);
                }
            }
        }

        console.log(`\n✅ Summary:`);
        console.log(`   Created: ${created} handbooks`);
        console.log(`   Skipped: ${skipped} handbooks (already exist)`);
        console.log(`   Total: ${KPMG_HANDBOOKS.length} handbooks\n`);

        // Show mapping summary
        console.log('📋 Handbook → Standard Pack Mapping:');
        for (const [handbookCode, standardPacks] of Object.entries(HANDBOOK_TO_STANDARD_MAPPING)) {
            const handbook = KPMG_HANDBOOKS.find((h) => h.code === handbookCode);
            if (handbook) {
                console.log(`   ${handbookCode}:`);
                console.log(`     → ${standardPacks.join(', ')}`);
            }
        }
    } catch (error) {
        console.error('❌ Error seeding KPMG handbooks:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedKPMGHandbooks()
        .then(() => {
            console.log('\n✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export { seedKPMGHandbooks, KPMG_HANDBOOKS, HANDBOOK_TO_STANDARD_MAPPING };


/**
 * Add IAS 21 FX standard pack
 * This pack is needed for the core concepts seed
 */

import { sql } from './db';

async function addIAS21Pack() {
  try {
    // Get admin user ID
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1`;
    const adminUserId = adminUser[0]?.id || null;

    if (!adminUserId) {
      throw new Error('Admin user not found. Please run the main seed script first.');
    }

    console.log('📦 Adding IAS 21 FX standard pack...');

    const result = await sql`
      INSERT INTO mdm_standard_pack (code, name, domain, authority_level, version, status, notes, created_by)
      VALUES (
        'IAS_21_FX',
        'IAS 21 - The Effects of Changes in Foreign Exchange Rates',
        'FINANCE',
        'LAW',
        '1.0.0',
        'ACTIVE',
        'International Accounting Standard 21: Foreign Exchange Rates - Translation of foreign currency transactions and financial statements',
        ${adminUserId}
      )
      ON CONFLICT (code) DO NOTHING
      RETURNING code, name;
    `;

    if (result && result.length > 0) {
      console.log(`✅ Created standard pack: ${result[0].code} - ${result[0].name}`);
    } else {
      console.log('ℹ️  Standard pack IAS_21_FX already exists');
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

addIAS21Pack();


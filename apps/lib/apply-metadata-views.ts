/**
 * Apply Metadata Views
 * 
 * Creates the visual "lawbook" views for the metadata kernel.
 * Run this after schema creation to enable the playground queries.
 */

import { sql } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function applyMetadataViews() {
  console.log('📊 Applying metadata views...');
  
  try {
    const viewsSql = readFileSync(
      join(__dirname, 'metadata-views.sql'),
      'utf-8'
    );
    
    // Split by semicolon and execute each statement
    const statements = viewsSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        await sql.unsafe(statement);
      }
    }
    
    console.log('   ✅ Created v_finance_tier1_concepts view');
    console.log('   ✅ Created v_concepts_by_pack view');
    console.log('   ✅ Created v_concept_usage_summary view');
    console.log('   ✅ Created v_tier1_concepts_missing_law_pack view');
    console.log('✅ Metadata views applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply metadata views:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  applyMetadataViews()
    .then(() => {
      console.log('✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}


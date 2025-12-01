/**
 * Verification script for mdm_rule table
 * Run: npx tsx apps/lib/verify-rules.ts
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

async function verifyRules() {
  console.log('🔍 Verifying rules in database...\n');

  try {
    // Get all rules
    const rules = await sql`
      SELECT 
        r.id,
        r.rule_code,
        r.scope,
        r.target_id,
        r.severity,
        r.description,
        r.expression,
        r.is_enforced_in_code,
        u.name as created_by_name
      FROM mdm_rule r
      LEFT JOIN users u ON r.created_by = u.id
      ORDER BY r.scope, r.severity DESC, r.rule_code
    `;

    console.log(`📊 Found ${rules.length} rules:\n`);

    // Group by scope
    const byScope = rules.reduce((acc, rule) => {
      if (!acc[rule.scope]) {
        acc[rule.scope] = [];
      }
      acc[rule.scope].push(rule);
      return acc;
    }, {} as Record<string, typeof rules>);

    for (const [scope, scopeRules] of Object.entries(byScope)) {
      console.log(`\n📁 ${scope} Scope (${scopeRules.length} rules):`);
      console.log('─'.repeat(80));
      
      for (const rule of scopeRules) {
        const severityIcon = 
          rule.severity === 'BLOCKING' ? '🚫' :
          rule.severity === 'WARNING' ? '⚠️' :
          'ℹ️';
        const enforced = rule.is_enforced_in_code ? '✅ ENFORCED' : '';
        
        console.log(`  ${severityIcon} ${rule.rule_code}`);
        console.log(`     Description: ${rule.description}`);
        console.log(`     Severity: ${rule.severity} | Enforced: ${rule.is_enforced_in_code ? 'Yes' : 'No'} ${enforced}`);
        if (rule.target_id) {
          console.log(`     Target ID: ${rule.target_id}`);
        }
        if (rule.expression) {
          console.log(`     Expression: ${JSON.stringify(rule.expression)}`);
        }
        console.log('');
      }
    }

    // Summary by severity
    console.log('\n📈 Summary by Severity:');
    console.log('─'.repeat(80));
    const bySeverity = rules.reduce((acc, rule) => {
      acc[rule.severity] = (acc[rule.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [severity, count] of Object.entries(bySeverity)) {
      const icon = severity === 'BLOCKING' ? '🚫' : severity === 'WARNING' ? '⚠️' : 'ℹ️';
      console.log(`  ${icon} ${severity}: ${count}`);
    }

    // Summary by scope
    console.log('\n📊 Summary by Scope:');
    console.log('─'.repeat(80));
    const scopeCounts = rules.reduce((acc, rule) => {
      acc[rule.scope] = (acc[rule.scope] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [scope, count] of Object.entries(scopeCounts).sort()) {
      console.log(`  ${scope}: ${count}`);
    }

    // Enforced rules
    const enforced = rules.filter(r => r.is_enforced_in_code);
    console.log(`\n✅ Enforced Rules: ${enforced.length}`);
    console.log('─'.repeat(80));
    for (const rule of enforced) {
      console.log(`  • ${rule.rule_code} (${rule.severity})`);
    }

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error verifying rules:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

verifyRules();


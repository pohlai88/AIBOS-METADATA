/**
 * Verification script for mdm_alias table
 * Run: npx tsx apps/lib/verify-aliases.ts
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

async function verifyAliases() {
    console.log('🔍 Verifying aliases in database...\n');

    try {
        // Get all aliases with concept info
        const aliases = await sql`
      SELECT 
        a.id,
        a.alias_value,
        a.alias_type,
        a.source_system,
        a.is_preferred_for_display,
        a.notes,
        c.canonical_key,
        c.label as concept_label,
        c.domain
      FROM mdm_alias a
      JOIN mdm_concept c ON a.concept_id = c.id
      ORDER BY c.domain, c.canonical_key, a.is_preferred_for_display DESC, a.alias_type, a.alias_value
    `;

        console.log(`📊 Found ${aliases.length} aliases:\n`);

        // Group by concept
        const byConcept = aliases.reduce((acc, alias) => {
            const key = alias.canonical_key;
            if (!acc[key]) {
                acc[key] = {
                    label: alias.concept_label,
                    domain: alias.domain,
                    aliases: []
                };
            }
            acc[key].aliases.push(alias);
            return acc;
        }, {} as Record<string, { label: string; domain: string; aliases: typeof aliases }>);

        for (const [canonicalKey, conceptData] of Object.entries(byConcept)) {
            console.log(`\n💡 Concept: ${canonicalKey} (${conceptData.label})`);
            console.log(`   Domain: ${conceptData.domain}`);
            console.log('─'.repeat(80));

            for (const alias of conceptData.aliases) {
                const preferred = alias.is_preferred_for_display ? '⭐ PREFERRED' : '';
                const source = alias.source_system ? `[${alias.source_system}]` : '';
                const type = alias.alias_type.padEnd(15);

                console.log(`  • ${alias.alias_value.padEnd(30)} ${type} ${source} ${preferred}`.trim());
                if (alias.notes) {
                    console.log(`    └─ ${alias.notes}`);
                }
            }
        }

        // Summary by type
        console.log('\n📈 Summary by Alias Type:');
        console.log('─'.repeat(80));
        const byType = aliases.reduce((acc, alias) => {
            acc[alias.alias_type] = (acc[alias.alias_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        for (const [type, count] of Object.entries(byType)) {
            console.log(`  ${type}: ${count}`);
        }

        // Summary by source system
        console.log('\n📊 Summary by Source System:');
        console.log('─'.repeat(80));
        const bySource = aliases.reduce((acc, alias) => {
            const source = alias.source_system || 'NONE';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        for (const [source, count] of Object.entries(bySource).sort()) {
            console.log(`  ${source}: ${count}`);
        }

        // Preferred aliases
        const preferred = aliases.filter(a => a.is_preferred_for_display);
        console.log(`\n⭐ Preferred Aliases: ${preferred.length}`);
        console.log('─'.repeat(80));
        for (const alias of preferred) {
            console.log(`  ${alias.concept_label} → ${alias.alias_value}`);
        }

        console.log('\n✅ Verification complete!');

    } catch (error) {
        console.error('❌ Error verifying aliases:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

verifyAliases();


/**
 * Prepare Metadata Seed SQL
 * 
 * This script takes seed SQL and replaces the placeholder tenant_id
 * with the actual tenant_id from your database.
 * 
 * Usage:
 *   pnpm tsx lib/prepare-metadata-seed.ts <input-file> [output-file]
 * 
 * If no output file is specified, it will print to stdout.
 */

import { readFileSync, writeFileSync } from 'fs';
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

async function getTenantId(): Promise<string> {
  // Try to get admin user ID
  const adminUsers = await sql`
    SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1
  `;
  
  if (adminUsers && adminUsers.length > 0) {
    return adminUsers[0].id;
  }
  
  // Fallback to first user
  const users = await sql`SELECT id FROM users LIMIT 1`;
  if (users && users.length > 0) {
    return users[0].id;
  }
  
  throw new Error('No users found in database. Please run the main seed script first.');
}

async function main() {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];
  
  if (!inputFile) {
    console.error('❌ Usage: pnpm tsx lib/prepare-metadata-seed.ts <input-file> [output-file]');
    process.exit(1);
  }
  
  try {
    console.log('🔍 Getting tenant ID...');
    const tenantId = await getTenantId();
    console.log(`✅ Using tenant ID: ${tenantId}\n`);
    
    console.log(`📄 Reading SQL from: ${inputFile}`);
    const seedSQL = readFileSync(inputFile, 'utf-8');
    
    // Replace placeholder tenant_id
    const processedSQL = seedSQL.replace(
      /00000000-0000-0000-0000-000000000001/g,
      tenantId
    );
    
    if (outputFile) {
      writeFileSync(outputFile, processedSQL, 'utf-8');
      console.log(`✅ Processed SQL written to: ${outputFile}`);
      console.log(`\n📝 Next step: Execute the SQL in your database:`);
      console.log(`   - Via Neon Console: https://console.neon.tech`);
      console.log(`   - Via psql: psql "${databaseUrl.replace(/:[^:@]+@/, ':****@')}" -f ${outputFile}`);
    } else {
      console.log('\n📝 Processed SQL (ready to execute):\n');
      console.log('─'.repeat(80));
      console.log(processedSQL);
      console.log('─'.repeat(80));
      console.log(`\n💡 Tip: Save to file with: pnpm tsx lib/prepare-metadata-seed.ts ${inputFile} output.sql`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();


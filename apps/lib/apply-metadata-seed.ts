/**
 * Apply metadata seed SQL
 * 
 * This script applies the seed SQL provided by the user.
 * It will replace the placeholder tenant_id with the actual tenant_id from the database.
 * 
 * Usage:
 *   pnpm tsx lib/apply-metadata-seed.ts <path-to-seed.sql>
 * 
 * Or paste the SQL directly and it will be processed.
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

async function applySeedSQL(seedSQL: string) {
  console.log('🔍 Getting tenant ID...');
  const tenantId = await getTenantId();
  console.log(`✅ Using tenant ID: ${tenantId}\n`);
  
  // Replace placeholder tenant_id
  const processedSQL = seedSQL.replace(
    /00000000-0000-0000-0000-000000000001/g,
    tenantId
  );
  
  console.log('📝 Applying seed SQL...');
  console.log('─'.repeat(80));
  
  // For Neon, we need to execute SQL statements properly
  // Since Neon's sql template tag requires template literals, we'll use a workaround
  // by executing the SQL through a simple query execution
  
  // Split SQL into individual statements (handling DO blocks and functions)
  const statements: string[] = [];
  let currentStatement = '';
  let inDoBlock = false;
  let inFunction = false;
  
  const lines = processedSQL.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments
    if (trimmed.startsWith('--') && !inDoBlock && !inFunction) {
      continue;
    }
    
    currentStatement += line + '\n';
    
    // Detect DO blocks
    if (trimmed.toUpperCase().startsWith('DO $$')) {
      inDoBlock = true;
    }
    if (inDoBlock && trimmed === '$$;') {
      inDoBlock = false;
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }
    
    // Detect function definitions
    if (trimmed.toUpperCase().includes('CREATE FUNCTION') || trimmed.toUpperCase().includes('CREATE OR REPLACE FUNCTION')) {
      inFunction = true;
    }
    if (inFunction && trimmed.toUpperCase().includes('$$ LANGUAGE')) {
      inFunction = false;
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }
    
    // Regular statement end
    if (!inDoBlock && !inFunction && trimmed.endsWith(';')) {
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim());
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Execute each statement
  for (const statement of statements) {
    if (!statement || statement.trim().length === 0) continue;
    
    try {
      // Use template literal - Neon requires this format
      // We'll construct a template literal from the raw SQL
      const query = statement.endsWith(';') ? statement.slice(0, -1) : statement;
      await sql([query] as any);
      successCount++;
    } catch (error) {
      console.error(`❌ Error executing statement:`);
      console.error(`   ${statement.substring(0, 150).replace(/\n/g, ' ')}...`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. Please review the errors above.');
    process.exit(1);
  }
  
  console.log('\n✅ Seed SQL applied successfully!');
}

async function main() {
  const seedSQLPath = process.argv[2];
  
  let seedSQL: string;
  
  if (seedSQLPath) {
    // Read from file
    try {
      seedSQL = readFileSync(seedSQLPath, 'utf-8');
      console.log(`📄 Reading seed SQL from: ${seedSQLPath}\n`);
    } catch (error) {
      console.error(`❌ Error reading file: ${seedSQLPath}`);
      console.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  } else {
    // Read from stdin or prompt
    console.log('📝 Please paste your seed SQL below (end with Ctrl+D or Ctrl+Z):\n');
    const chunks: string[] = [];
    
    for await (const chunk of process.stdin) {
      chunks.push(chunk.toString());
    }
    
    seedSQL = chunks.join('');
    
    if (!seedSQL.trim()) {
      console.error('❌ No SQL provided');
      process.exit(1);
    }
  }
  
  await applySeedSQL(seedSQL);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


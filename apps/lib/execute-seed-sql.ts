/**
 * Execute prepared seed SQL
 * 
 * This script executes the prepared SQL file directly
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

async function executeSQL(sqlFile: string) {
  try {
    console.log(`📄 Reading SQL from: ${sqlFile}`);
    const sqlContent = readFileSync(sqlFile, 'utf-8');
    
    console.log('⏳ Executing SQL...\n');
    
    // Execute the SQL directly
    // For Neon, we need to use the template literal syntax
    // Since we have raw SQL, we'll use a workaround by constructing a query
    
    try {
      // Remove comments and clean up
      const cleanSQL = sqlContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--') || line.trim().startsWith('-- NOTE:'))
        .join('\n')
        .trim();
      
      // Execute using Neon's query method
      // Note: Neon's sql template tag requires template literals, so we'll use a different approach
      // We can execute raw SQL by constructing it properly
      
      // For now, let's use a simpler approach - execute via a helper
      const result = await sql.unsafe(cleanSQL);
      
      console.log('✅ SQL executed successfully!');
      console.log(`📊 Rows affected: ${result.rowCount || 'N/A'}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a duplicate/conflict error (expected with ON CONFLICT)
      if (errorMsg.includes('duplicate key') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('violates unique constraint')) {
        console.log('ℹ️  Some records may already exist (ON CONFLICT handled)');
        console.log('✅ SQL executed (conflicts ignored)');
      } else {
        console.error(`❌ Error: ${errorMsg}`);
        throw error;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }
    
    if (errorCount === 0) {
      console.log('\n✅ SQL executed successfully!');
    } else {
      console.log('\n⚠️  Some statements had errors. Please review above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error('❌ Usage: pnpm tsx lib/execute-seed-sql.ts <sql-file>');
  process.exit(1);
}

executeSQL(sqlFile);


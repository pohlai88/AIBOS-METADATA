/**
 * Get Tenant ID
 * Quick script to get the tenant ID for seed SQL replacement
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

export async function getTenantId(): Promise<string> {
  try {
    // Try admin user first
    const adminUsers = await sql`
      SELECT id FROM users WHERE email = 'admin@aibos.com' LIMIT 1
    `;
    
    if (adminUsers && adminUsers.length > 0) {
      return adminUsers[0].id as string;
    }
    
    // Fallback to first user
    const users = await sql`SELECT id FROM users LIMIT 1`;
    if (users && users.length > 0) {
      return users[0].id as string;
    }
    
    throw new Error('No users found in database. Please run the main seed script first.');
  } catch (error) {
    throw new Error(`Error getting tenant ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// If called directly, print tenant ID (for CLI usage)
if (require.main === module) {
  getTenantId()
    .then((id) => {
      console.log(id);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}


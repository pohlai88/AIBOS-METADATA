/**
 * Verify Standard Packs Data
 * 
 * Run: npx tsx apps/lib/verify-standard-packs.ts
 */

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import path from 'path';

// Load .env
function loadEnv() {
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '../.env'),
  ];

  for (const envPath of envPaths) {
    try {
      const envFile = readFileSync(envPath, 'utf-8');
      const lines = envFile.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
      return;
    } catch {
      continue;
    }
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL!);

async function verify() {
  console.log('📦 Standard Packs in Database:\n');
  
  const packs = await sql`
    SELECT 
      code,
      name,
      domain,
      authority_level,
      version,
      status
    FROM mdm_standard_pack
    ORDER BY domain, code
  `;

  console.log(`Total: ${packs.length} standard packs\n`);

  const byDomain = packs.reduce((acc: any, pack: any) => {
    if (!acc[pack.domain]) acc[pack.domain] = [];
    acc[pack.domain].push(pack);
    return acc;
  }, {});

  for (const [domain, domainPacks] of Object.entries(byDomain)) {
    console.log(`📁 ${domain}:`);
    (domainPacks as any[]).forEach((pack: any) => {
      console.log(`   • ${pack.code} - ${pack.name}`);
      console.log(`     Version: ${pack.version} | Authority: ${pack.authority_level} | Status: ${pack.status}`);
    });
    console.log('');
  }
}

verify().catch(console.error);


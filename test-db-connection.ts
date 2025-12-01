/**
 * Test Neon Database Connection
 * 
 * Run this script to test your database connection:
 * npx tsx test-db-connection.ts
 * 
 * Or use Node.js directly:
 * node --loader tsx test-db-connection.ts
 */

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env file
function loadEnv() {
  try {
    const envFile = readFileSync('.env', 'utf-8');
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
  } catch (error) {
    console.warn('⚠️  Could not read .env file, using existing environment variables');
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('🔌 Testing Neon Database Connection...\n');
console.log('📍 Connection String:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('');

const sql = neon(databaseUrl);

async function testConnection() {
  try {
    console.log('⏳ Connecting to database...');
    
    // Test 1: Basic connection
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    console.log('✅ Connection successful!\n');
    console.log('📊 Database Info:');
    console.log('   Current Time:', result[0]?.current_time);
    console.log('   PostgreSQL Version:', result[0]?.pg_version?.split(' ')[0] + ' ' + result[0]?.pg_version?.split(' ')[1]);
    console.log('');
    
    // Test 2: Check database name
    const dbName = await sql`SELECT current_database() as db_name`;
    console.log('📁 Database Name:', dbName[0]?.db_name);
    console.log('');
    
    // Test 3: List tables (if any exist)
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      if (tables.length > 0) {
        console.log('📋 Tables in database:');
        tables.forEach((table: any) => {
          console.log('   -', table.table_name);
        });
      } else {
        console.log('📋 No tables found in database (empty database)');
      }
    } catch (error) {
      console.log('⚠️  Could not list tables:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('');
    console.log('✅ All tests passed! Database connection is working correctly.');
    
  } catch (error) {
    console.error('');
    console.error('❌ Connection failed!');
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL in .env file');
    console.error('   2. Verify your Neon project is active');
    console.error('   3. Check your network connection');
    console.error('   4. Ensure SSL is enabled (sslmode=require)');
    process.exit(1);
  }
}

testConnection();


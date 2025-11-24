#!/usr/bin/env node
/**
 * Configure MCP secrets from .env file
 * 
 * This script reads secrets from .env and configures mcp.json
 * WITHOUT exposing the actual secret values.
 * 
 * For Cursor MCP, we use environment variable references or
 * rely on environment variable inheritance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const ENV_FILE = path.join(WORKSPACE_ROOT, '.env');
const MCP_JSON = path.join(WORKSPACE_ROOT, '.cursor/mcp.json');

/**
 * Read .env file and extract OPENAI_API_KEY
 */
function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ .env file not found at:', ENV_FILE);
    return null;
  }

  const content = fs.readFileSync(ENV_FILE, 'utf8');
  
  // Try different formats
  const patterns = [
    /^OPENAI_API_KEY\s*=\s*(.+)$/m,
    /^OpenAI API Key\s*=\s*(.+)$/m,
    /^OPENAI_API_KEY\s*:\s*(.+)$/m,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  console.error('❌ OPENAI_API_KEY not found in .env file');
  return null;
}

/**
 * Update mcp.json to use environment variable reference
 * 
 * Option 1: Use ${VAR} syntax (if Cursor supports it)
 * Option 2: Remove env field entirely (rely on inheritance)
 */
function updateMCPConfig(useReference = false) {
  if (!fs.existsSync(MCP_JSON)) {
    console.error('❌ mcp.json not found at:', MCP_JSON);
    return false;
  }

  const config = JSON.parse(fs.readFileSync(MCP_JSON, 'utf8'));

  if (!config.mcpServers || !config.mcpServers['aibos-ui-generator']) {
    console.error('❌ aibos-ui-generator not found in mcp.json');
    return false;
  }

  const server = config.mcpServers['aibos-ui-generator'];

  if (useReference) {
    // Option 1: Use environment variable reference
    // Note: This may not be supported by all MCP clients
    if (!server.env) {
      server.env = {};
    }
    server.env.OPENAI_API_KEY = '${OPENAI_API_KEY}';
    console.log('✅ Configured mcp.json to use environment variable reference');
  } else {
    // Option 2: Remove env field (rely on environment inheritance)
    if (server.env) {
      delete server.env;
      console.log('✅ Removed env field from mcp.json (using environment inheritance)');
    } else {
      console.log('✅ mcp.json already configured correctly (no env field)');
    }
  }

  // Write updated config
  fs.writeFileSync(
    MCP_JSON,
    JSON.stringify(config, null, 2) + '\n',
    'utf8'
  );

  return true;
}

/**
 * Verify configuration
 */
function verifyConfig() {
  const config = JSON.parse(fs.readFileSync(MCP_JSON, 'utf8'));
  const server = config.mcpServers['aibos-ui-generator'];

  if (server.env && server.env.OPENAI_API_KEY) {
    const value = server.env.OPENAI_API_KEY;
    
    // Check if it's a hardcoded secret
    if (value.startsWith('sk-') && value.length > 20) {
      console.error('❌ SECURITY ISSUE: Hardcoded API key found in mcp.json!');
      console.error('   Value starts with:', value.substring(0, 10) + '...');
      return false;
    }
    
    // Check if it's a reference
    if (value === '${OPENAI_API_KEY}' || value === '$OPENAI_API_KEY') {
      console.log('✅ Using environment variable reference');
      return true;
    }
  }

  if (!server.env) {
    console.log('✅ Using environment variable inheritance (no env field)');
    return true;
  }

  return true;
}

/**
 * Main function
 */
function main() {
  console.log('🔐 MCP Secrets Configuration Script\n');

  // Read API key from .env
  const apiKey = readEnvFile();
  if (!apiKey) {
    console.error('\n❌ Failed to read OPENAI_API_KEY from .env');
    process.exit(1);
  }

  console.log('✅ Found OPENAI_API_KEY in .env file');
  console.log('   Key length:', apiKey.length, 'characters');
  console.log('   Key prefix:', apiKey.substring(0, 7) + '...\n');

  // Update mcp.json
  // Use environment inheritance (recommended)
  const updated = updateMCPConfig(false);
  if (!updated) {
    console.error('\n❌ Failed to update mcp.json');
    process.exit(1);
  }

  // Verify configuration
  console.log('\n🔍 Verifying configuration...');
  const isValid = verifyConfig();
  if (!isValid) {
    console.error('\n❌ Configuration verification failed');
    process.exit(1);
  }

  console.log('\n✅ Configuration complete!');
  console.log('\n📋 Summary:');
  console.log('  - API key is stored in .env (gitignored)');
  console.log('  - mcp.json uses environment variable inheritance');
  console.log('  - No secrets are committed to git');
  console.log('\n💡 Next steps:');
  console.log('  1. Ensure Cursor loads .env file');
  console.log('  2. Restart Cursor to apply changes');
  console.log('  3. Test MCP server functionality');
}

main();


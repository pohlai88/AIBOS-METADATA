#!/usr/bin/env node
// Test script for Documentation MCP Server
// Tests basic functionality without full MCP protocol

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const docsRoot = path.resolve(workspaceRoot, "docs");

async function testServer() {
  console.log("🧪 Testing Documentation MCP Server v2.0.0\n");

  // Test 1: Check if server file exists
  console.log("Test 1: Server file exists");
  try {
    const serverPath = path.join(__dirname, "server.mjs");
    await fs.access(serverPath);
    console.log("   ✅ server.mjs exists\n");
  } catch (error) {
    console.log("   ❌ server.mjs not found\n");
    return;
  }

  // Test 2: Check manifest exists
  console.log("Test 2: Manifest file exists");
  try {
    const manifestPath = path.join(docsRoot, "ui-docs.manifest.json");
    await fs.access(manifestPath);
    console.log("   ✅ ui-docs.manifest.json exists\n");
  } catch (error) {
    console.log("   ❌ ui-docs.manifest.json not found\n");
  }

  // Test 3: Check backup directory can be created
  console.log("Test 3: Backup directory creation");
  try {
    const backupDir = path.join(docsRoot, ".mcp-backups");
    await fs.mkdir(backupDir, { recursive: true });
    console.log("   ✅ Backup directory created/verified\n");
  } catch (error) {
    console.log("   ❌ Failed to create backup directory:", error.message, "\n");
  }

  // Test 4: Check lock file location
  console.log("Test 4: Lock file location");
  const lockFile = path.join(docsRoot, ".mcp-docs.lock");
  console.log(`   📍 Lock file: ${lockFile}\n`);

  // Test 5: Check required directories
  console.log("Test 5: Required directories");
  const requiredDirs = [
    "docs/09-reference/tokens/auto",
    "docs/09-reference/ui/auto",
  ];
  for (const dir of requiredDirs) {
    const dirPath = path.join(workspaceRoot, dir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`   ✅ ${dir} exists/created`);
    } catch (error) {
      console.log(`   ❌ Failed to create ${dir}:`, error.message);
    }
  }
  console.log("");

  // Test 6: Check globals.css exists
  console.log("Test 6: Source files");
  const globalsCss = path.join(workspaceRoot, "packages/ui/src/design/globals.css");
  try {
    await fs.access(globalsCss);
    console.log("   ✅ globals.css exists\n");
  } catch (error) {
    console.log("   ⚠️  globals.css not found (may be expected)\n");
  }

  // Test 7: Check sync script exists
  console.log("Test 7: Sync script");
  const syncScript = path.join(workspaceRoot, "apps/docs/scripts/sync-docs.ts");
  try {
    await fs.access(syncScript);
    console.log("   ✅ sync-docs.ts exists\n");
  } catch (error) {
    console.log("   ⚠️  sync-docs.ts not found (may be expected)\n");
  }

  console.log("✅ Basic tests completed!");
  console.log("\n📋 Next: Test server with MCP protocol");
}

testServer().catch(console.error);


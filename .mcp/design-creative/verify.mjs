#!/usr/bin/env node
// Quick verification script for the MCP server

import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, "../../");

console.log("🔍 Verifying Design Creative MCP Server...\n");

// Check 1: Server file exists
const serverPath = join(__dirname, "server.mjs");
if (existsSync(serverPath)) {
  console.log("✅ Server file exists:", serverPath);
} else {
  console.error("❌ Server file not found:", serverPath);
  process.exit(1);
}

// Check 2: Package.json exists
const packagePath = join(__dirname, "package.json");
if (existsSync(packagePath)) {
  console.log("✅ Package.json exists");
  const pkg = JSON.parse(readFileSync(packagePath, "utf-8"));
  console.log(`   Name: ${pkg.name}`);
  console.log(`   Version: ${pkg.version}`);
} else {
  console.error("❌ Package.json not found");
  process.exit(1);
}

// Check 3: Dependencies installed
const nodeModulesPath = join(workspaceRoot, "node_modules", "@modelcontextprotocol", "sdk");
if (existsSync(nodeModulesPath)) {
  console.log("✅ MCP SDK installed");
} else {
  console.error("❌ MCP SDK not found. Run: pnpm install");
  process.exit(1);
}

// Check 4: MCP config
const mcpConfigPath = join(workspaceRoot, ".cursor", "mcp.json");
if (existsSync(mcpConfigPath)) {
  console.log("✅ MCP config exists");
  const config = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
  if (config.mcpServers && config.mcpServers["aibos-design-creative"]) {
    console.log("✅ Server registered in mcp.json");
    console.log("   Config:", JSON.stringify(config.mcpServers["aibos-design-creative"], null, 2));
  } else {
    console.error("❌ Server not found in mcp.json");
    console.log("   Run: node .mcp/design-creative/update-mcp-config.mjs");
    process.exit(1);
  }
} else {
  console.error("❌ MCP config not found");
  process.exit(1);
}

// Check 5: Design system file
const designSystemPath = join(workspaceRoot, "packages", "ui", "design", "globals.css");
if (existsSync(designSystemPath)) {
  console.log("✅ Design system file exists");
} else {
  console.warn("⚠️  Design system file not found (optional)");
}

console.log("\n✅ All checks passed! Server should be ready.");
console.log("\n📝 Next steps:");
console.log("   1. Restart Cursor to load the MCP server");
console.log("   2. Check Cursor's MCP registry (Settings > MCP)");
console.log("   3. The server should appear as 'aibos-design-creative'");


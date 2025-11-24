#!/usr/bin/env node
// Script to update .cursor/mcp.json with Documentation MCP Server

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const mcpConfigPath = path.join(workspaceRoot, ".cursor", "mcp.json");

async function updateMCPConfig() {
  console.log("📝 Updating MCP Configuration...\n");

  try {
    // Read existing config
    let config = {};
    try {
      const content = await fs.readFile(mcpConfigPath, "utf-8");
      config = JSON.parse(content);
    } catch (error) {
      console.log("⚠️  mcp.json not found, creating new file...");
      config = { mcpServers: {} };
    }

    // Add Documentation MCP Server
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    const serverConfig = {
      command: "node",
      args: [".mcp/documentation/server.mjs"],
      cwd: workspaceRoot,
    };

    // Check if already exists
    if (config.mcpServers["aibos-documentation"]) {
      console.log("⚠️  aibos-documentation already exists in config");
      console.log("   Current config:", JSON.stringify(config.mcpServers["aibos-documentation"], null, 2));
      console.log("   New config:", JSON.stringify(serverConfig, null, 2));
      
      // Update it
      config.mcpServers["aibos-documentation"] = serverConfig;
      console.log("   ✅ Updated existing configuration\n");
    } else {
      config.mcpServers["aibos-documentation"] = serverConfig;
      console.log("✅ Added aibos-documentation to MCP configuration\n");
    }

    // Write updated config
    await fs.writeFile(mcpConfigPath, JSON.stringify(config, null, 2), "utf-8");
    console.log("✅ MCP configuration updated successfully!");
    console.log(`   Location: ${mcpConfigPath}\n`);

    // Show current servers
    console.log("📋 Current MCP Servers:");
    for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
      console.log(`   - ${name}`);
    }
    console.log("");

    console.log("📝 Next Steps:");
    console.log("   1. Restart Cursor to load the new MCP server");
    console.log("   2. Test tools via Cursor:");
    console.log("      - validate_docs");
    console.log("      - update_token_reference");
    console.log("      - sync_nextra");
    console.log("      - generate_from_template");

  } catch (error) {
    console.error("❌ Error updating MCP configuration:", error.message);
    console.error("\n📝 Manual Configuration:");
    console.log("Add this to .cursor/mcp.json:");
    console.log(JSON.stringify({
      "aibos-documentation": {
        "command": "node",
        "args": [".mcp/documentation/server.mjs"],
        "cwd": "."
      }
    }, null, 2));
  }
}

updateMCPConfig().catch(console.error);


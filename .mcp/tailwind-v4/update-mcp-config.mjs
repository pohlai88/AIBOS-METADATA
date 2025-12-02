#!/usr/bin/env node
// Script to update .cursor/mcp.json with Tailwind v4 MCP Server

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const mcpConfigPath = path.join(workspaceRoot, ".cursor", "mcp.json");

async function updateMCPConfig() {
  console.log("📝 Updating MCP Configuration for Tailwind v4...\n");

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

    // Add Tailwind v4 MCP Server
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    const serverConfig = {
      command: "node",
      args: [".mcp/tailwind-v4/server.mjs"],
      cwd: workspaceRoot,
    };

    // Check if already exists
    if (config.mcpServers["aibos-tailwind-v4"]) {
      console.log("⚠️  aibos-tailwind-v4 already exists in config");
      console.log("   Current config:", JSON.stringify(config.mcpServers["aibos-tailwind-v4"], null, 2));
      console.log("   New config:", JSON.stringify(serverConfig, null, 2));
      
      // Update it
      config.mcpServers["aibos-tailwind-v4"] = serverConfig;
      console.log("   ✅ Updated existing configuration\n");
    } else {
      config.mcpServers["aibos-tailwind-v4"] = serverConfig;
      console.log("✅ Added aibos-tailwind-v4 to MCP configuration\n");
    }

    // Write updated config
    await fs.writeFile(mcpConfigPath, JSON.stringify(config, null, 2), "utf-8");
    console.log("✅ MCP configuration updated successfully!");
    console.log(`   Location: ${mcpConfigPath}\n`);

    // Show current servers
    console.log("📋 Current MCP Servers:");
    Object.keys(config.mcpServers).forEach((name) => {
      console.log(`   - ${name}`);
    });
    console.log("");

    console.log("🚀 Next steps:");
    console.log("   1. Restart Cursor to load the new MCP server");
    console.log("   2. Test with: 'Validate Tailwind v4 syntax in my CSS file'");
    console.log("   3. Try: 'Get Tailwind v4 best practices for gradients'\n");

  } catch (error) {
    console.error("❌ Error updating MCP configuration:", error.message);
    process.exit(1);
  }
}

updateMCPConfig();


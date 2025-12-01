#!/usr/bin/env node
// .mcp/metadata/server.mjs
// AIBOS Metadata MCP Server
// Version: 1.0.0
// Provides concept lookup and standard pack listing

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { neon, neonConfig } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import {
  lookupConceptTool,
  listStandardPacksTool,
} from "./metadataTools.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Neon for better performance
neonConfig.fetchConnectionCache = true;

// Load environment variables
function loadEnv() {
  const envPaths = [
    path.join(__dirname, "../../.env"),
    path.join(__dirname, "../../../.env"),
    path.join(process.cwd(), ".env"),
  ];

  for (const envPath of envPaths) {
    try {
      if (readFileSync(envPath, "utf-8")) {
        const envFile = readFileSync(envPath, "utf-8");
        const lines = envFile.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const [key, ...valueParts] = trimmed.split("=");
            if (key && valueParts.length > 0) {
              const value = valueParts.join("=").trim();
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
  console.error("❌ DATABASE_URL not found in .env file");
  process.exit(1);
}

const sql = neon(databaseUrl);

// --- Governance / Metadata awareness ---------------------------------------

const GOVERNANCE_CONTEXT = {
  toolId: "aibos-metadata",
  domain: "metadata_governance",
  registryTable: "mdm_tool_registry",
};

function withGovernanceMetadata(payload, category, severity) {
  return {
    ...payload,
    governance: {
      ...GOVERNANCE_CONTEXT,
      category,
      severity,
    },
  };
}

// --- Tools Registry ---------------------------------------------------------

export const tools = {
  "metadata.lookupConcept": lookupConceptTool,
  "metadata.listStandardPacks": listStandardPacksTool,
};

// --- MCP Server Setup ------------------------------------------------------

const server = new Server(
  {
    name: "aibos-metadata",
    version: "1.0.0",
    description:
      "AIBOS Metadata MCP Server - Concept lookup and standard pack listing for governance",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "metadata.lookupConcept",
        description:
          "Lookup a canonical metadata concept (and its aliases) by term for a given tenant.",
        inputSchema: {
          type: "object",
          properties: {
            tenantId: {
              type: "string",
              description: "Tenant ID for multi-tenant isolation",
            },
            term: {
              type: "string",
              description:
                "Term to search for (canonical key like 'revenue' or alias like 'Sales', 'REV', etc.)",
            },
          },
          required: ["tenantId", "term"],
        },
      },
      {
        name: "metadata.listStandardPacks",
        description:
          "List metadata standard packs (e.g., IFRS, IAS 2, IAS 16) optionally filtered by domain.",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description:
                "Optional domain filter: FINANCE, HR, SCM, IT, or OTHER",
              enum: ["FINANCE", "HR", "SCM", "IT", "OTHER"],
            },
          },
          required: [],
        },
      },
    ],
  };
});

// Check tool registry before allowing execution
async function checkToolEnabled(toolId) {
  try {
    const registry = await sql`
      SELECT tool_id, tool_name, metadata
      FROM mdm_tool_registry
      WHERE tool_id = ${toolId}
      LIMIT 1
    `;

    if (!registry || registry.length === 0) {
      // Tool not in registry - allow by default for now
      console.error(`[METADATA] Tool ${toolId} not found in registry (allowing by default)`);
      return { enabled: true };
    }

    const tool = registry[0];
    const metadata = tool.metadata || {};
    const enabled = metadata.enabled !== false; // Default to enabled

    if (!enabled) {
      return {
        enabled: false,
        reason: metadata.reason || 'Tool is disabled in registry',
      };
    }

    return { enabled: true };
  } catch (error) {
    // On error, allow but log warning
    console.error(`[METADATA] Error checking registry for ${toolId}:`, error);
    return { enabled: true, reason: 'Registry check failed' };
  }
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Check tool registry first
    const toolStatus = await checkToolEnabled(GOVERNANCE_CONTEXT.toolId);
    if (!toolStatus.enabled) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: true,
                message: `Tool is disabled: ${toolStatus.reason}`,
                governance: {
                  ...GOVERNANCE_CONTEXT,
                  category: "access_control",
                  severity: "error",
                },
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    const tool = tools[name];
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Log tool usage
    console.error(`[METADATA] Tool call: ${name}`);

    const result = await tool(sql, args, withGovernanceMetadata);

    // Log success
    console.error(`[METADATA] Tool call: ${name} - SUCCESS`);

    return result;
  } catch (error) {
    // Log error
    console.error(`[METADATA] Tool call: ${name} - ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
console.error("🚀 AIBOS Metadata MCP Server started");



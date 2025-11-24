#!/usr/bin/env node
// .mcp/theme/server.mjs
// AIBOS Theme MCP Server
// Version: 2.0.0
// Enhanced with token validation, suggestions, and Tailwind class validation

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the workspace root
const workspaceRoot = path.resolve(__dirname, "../../");
const globalsCssPath = path.resolve(workspaceRoot, "packages/ui/src/design/globals.css");

// --- Governance / Metadata awareness ---------------------------------------

// Static governance context so upstream systems (e.g. mdm_tool_registry)
// can consistently identify this validator.
const GOVERNANCE_CONTEXT = {
  toolId: "aibos-theme",
  domain: "ui_theme_validation",
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

// --- CSS cache --------------------------------------------------------------

const cssCache = {
  content: null,
  variables: null,
  mtimeMs: null,
};

function getCssContext() {
  if (!fs.existsSync(globalsCssPath)) {
    throw new Error(`Tailwind CSS file not found at: ${globalsCssPath}`);
  }
  const stat = fs.statSync(globalsCssPath);
  if (!cssCache.content || cssCache.mtimeMs !== stat.mtimeMs) {
    const content = fs.readFileSync(globalsCssPath, "utf8");
    const variables = parseCSSVariables(content);
    cssCache.content = content;
    cssCache.variables = variables;
    cssCache.mtimeMs = stat.mtimeMs;
  }
  return { content: cssCache.content, variables: cssCache.variables };
}

/**
 * Get Tailwind tokens from globals.css
 */
async function getTailwindTokens() {
  const { content } = getCssContext();
  return {
    cssPath: globalsCssPath,
    content,
  };
}

/**
 * Parse CSS variables from globals.css
 */
function parseCSSVariables(cssContent) {
  const variables = {};
  const rootRegex = /:root\s*\{([^}]+)\}/g;
  const varRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;

  let rootMatch;
  while ((rootMatch = rootRegex.exec(cssContent)) !== null) {
    const rootContent = rootMatch[1];
    let varMatch;
    while ((varMatch = varRegex.exec(rootContent)) !== null) {
      const [, name, value] = varMatch;
      variables[name] = value.trim();
    }
  }

  return variables;
}

/**
 * Validate if a token exists in globals.css
 */
function validateTokenExists(tokenName, cssContent, variablesOverride) {
  // Check if token exists as CSS variable
  const tokenPattern = new RegExp(`--${tokenName.replace(/^--/, "")}:`, "g");
  const exists = tokenPattern.test(cssContent);

  // Also check parsed variables
  const variables = variablesOverride || parseCSSVariables(cssContent);
  const normalizedName = tokenName.replace(/^--/, "");
  const existsInParsed = variables.hasOwnProperty(normalizedName);

  return {
    exists: exists || existsInParsed,
    value: variables[normalizedName] || null,
    normalizedName,
  };
}

/**
 * Suggest appropriate token for a color/value
 */
function suggestToken(color, usage = "background") {
  const { variables } = getCssContext();

  // Normalize color format
  const normalizedColor = color.toLowerCase().trim();

  // Find matching tokens
  const suggestions = [];

  for (const [tokenName, tokenValue] of Object.entries(variables)) {
    const normalizedValue = tokenValue.toLowerCase().trim();

    // Exact match
    if (normalizedValue === normalizedColor) {
      suggestions.push({
        token: `--${tokenName}`,
        className: getClassNameFromToken(tokenName, usage),
        value: tokenValue,
        match: "exact",
      });
    }
    // Partial match (for hex colors)
    else if (
      normalizedColor.startsWith("#") &&
      normalizedValue.includes(normalizedColor)
    ) {
      suggestions.push({
        token: `--${tokenName}`,
        className: getClassNameFromToken(tokenName, usage),
        value: tokenValue,
        match: "partial",
      });
    }
  }

  // Sort by match quality
  suggestions.sort((a, b) => {
    if (a.match === "exact" && b.match !== "exact") return -1;
    if (a.match !== "exact" && b.match === "exact") return 1;
    return 0;
  });

  return {
    suggestions: suggestions.slice(0, 5), // Top 5 suggestions
    originalColor: color,
    usage,
  };
}

/**
 * Get Tailwind class name from token
 */
function getClassNameFromToken(tokenName, usage) {
  // Remove prefix if present
  const cleanName = tokenName.replace(/^(aibos-|color-)/, "");

  // Map usage to Tailwind utility
  const usageMap = {
    background: "bg",
    text: "text",
    border: "border",
    ring: "ring",
  };

  const utility = usageMap[usage] || "bg";

  // Convert token name to class name
  // e.g., "primary" -> "bg-primary", "bg-muted" -> "bg-bg-muted"
  if (cleanName.startsWith("bg-")) {
    return cleanName;
  }
  if (cleanName.startsWith("text-")) {
    return cleanName;
  }
  if (cleanName.startsWith("border-")) {
    return cleanName;
  }

  return `${utility}-${cleanName}`;
}

/**
 * Validate Tailwind class usage
 */
function validateTailwindClass(className) {
  const { variables } = getCssContext();

  // Check if class uses arbitrary values
  const arbitraryRegex = /\[#[0-9a-fA-F]{3,6}\]/;
  const hasArbitrary = arbitraryRegex.test(className);

  // Check if class uses palette colors
  const paletteRegex =
    /(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)/;
  const hasPalette = paletteRegex.test(className);

  // Extract token name from class
  const classParts = className.split("-");
  const possibleTokenNames = [];

  // Try different token name patterns
  for (let i = 1; i < classParts.length; i++) {
    const tokenName = classParts.slice(1, i + 1).join("-");
    possibleTokenNames.push(tokenName);
    possibleTokenNames.push(`aibos-${tokenName}`);
    possibleTokenNames.push(`color-${tokenName}`);
  }

  // Check if any token exists
  const matchingTokens = possibleTokenNames.filter((name) =>
    variables.hasOwnProperty(name)
  );

  const baseResult = {
    valid: !hasArbitrary && !hasPalette && matchingTokens.length > 0,
    hasArbitrary,
    hasPalette,
    matchingTokens: matchingTokens.map((name) => `--${name}`),
    suggestions: hasArbitrary || hasPalette ? matchingTokens : [],
  };

  let severity = "info";
  if (!baseResult.valid) {
    severity = "error";
  } else if (baseResult.hasArbitrary || baseResult.hasPalette) {
    severity = "warning";
  }

  return withGovernanceMetadata(baseResult, "design-tokens", severity);
}

/**
 * Get token value from globals.css
 */
function getTokenValue(tokenName) {
  const { variables } = getCssContext();

  const normalizedName = tokenName.replace(/^--/, "");
  const value = variables[normalizedName];

  if (!value) {
    return {
      exists: false,
      token: tokenName,
      value: null,
      error: `Token ${tokenName} not found in globals.css`,
    };
  }

  return withGovernanceMetadata(
    {
      exists: true,
      token: tokenName,
      value: value.trim(),
      className: getClassNameFromToken(normalizedName, "background"),
    },
    "design-tokens",
    "info"
  );
}

// Create MCP server
const server = new Server(
  {
    name: "aibos-theme",
    version: "2.0.0",
    description:
      "AIBOS Theme MCP Server - Token management, validation, and Tailwind class validation",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_tailwind_config",
        description:
          "Returns Tailwind v4 CSS tokens from globals.css for UI governance and token enforcement",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "validate_token_exists",
        description:
          "Check if a token exists in globals.css and validate token naming conventions",
        inputSchema: {
          type: "object",
          properties: {
            tokenName: {
              type: "string",
              description: "Token name (with or without -- prefix)",
            },
          },
          required: ["tokenName"],
        },
      },
      {
        name: "suggest_token",
        description:
          "Suggest appropriate token for a color/value, matching Figma tokens to Tailwind tokens",
        inputSchema: {
          type: "object",
          properties: {
            color: {
              type: "string",
              description: "Color value (hex, rgb, or named color)",
            },
            usage: {
              type: "string",
              description: "Usage context: background, text, border, or ring",
              enum: ["background", "text", "border", "ring"],
              default: "background",
            },
          },
          required: ["color"],
        },
      },
      {
        name: "validate_tailwind_class",
        description:
          "Validate Tailwind class usage - check if class uses tokens vs arbitrary values",
        inputSchema: {
          type: "object",
          properties: {
            className: {
              type: "string",
              description: "Tailwind class name to validate",
            },
          },
          required: ["className"],
        },
      },
      {
        name: "get_token_value",
        description:
          "Get actual CSS value for a token - useful for validation and comparison",
        inputSchema: {
          type: "object",
          properties: {
            tokenName: {
              type: "string",
              description: "Token name (with or without -- prefix)",
            },
          },
          required: ["tokenName"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "read_tailwind_config": {
        const result = await getTailwindTokens();
        const payload = { ...result, registryContext: GOVERNANCE_CONTEXT };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      }

      case "validate_token_exists": {
        const { tokenName } = args;
        const { content, variables } = getCssContext();
        const validation = validateTokenExists(tokenName, content, variables);

        const severity = validation.exists ? "info" : "error";
        const payload = withGovernanceMetadata(
          validation,
          "design-tokens",
          severity
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      }

      case "suggest_token": {
        const { color, usage = "background" } = args;
        const suggestions = suggestToken(color, usage);
        const payload = withGovernanceMetadata(
          suggestions,
          "design-tokens",
          "info"
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      }

      case "validate_tailwind_class": {
        const { className } = args;
        const validation = validateTailwindClass(className);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(validation, null, 2),
            },
          ],
        };
      }

      case "get_token_value": {
        const { tokenName } = args;
        const result = getTokenValue(tokenName);
        // getTokenValue already includes governance metadata for the "exists" case.
        // If token is missing, wrap with governance as error.
        const payload =
          result.exists === false
            ? withGovernanceMetadata(result, "design-tokens", "error")
            : result;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error in ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIBOS Theme MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

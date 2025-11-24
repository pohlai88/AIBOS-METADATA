#!/usr/bin/env node
// .mcp/ui-generator/server.mjs
// AIBOS UI Generator MCP Server
// Version: 1.0.0
// Generates UI layouts/components from natural language using OpenAI
// and enforces governance metadata for AI-BOS (mdm_tool_registry integration).

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// --- Governance / Metadata awareness ---------------------------------------

const GOVERNANCE_CONTEXT = {
  toolId: "aibos-ui-generator",
  domain: "ui_generation",
  registryTable: "mdm_tool_registry",
};

// Optional dependencies - may not be installed
// eslint-disable-next-line import/no-unresolved
import { createOpenAI } from "@ai-sdk/openai"; // or your preferred client

// Use generated prompt file (synced from .mcp/ui-generator/prompt.md)
import { UI_GENERATOR_SYSTEM_PROMPT } from "./prompt.generated.mjs";

// Fallback: load directly if generated file doesn't exist
export function loadUiGeneratorSystemPrompt() {
  try {
    return UI_GENERATOR_SYSTEM_PROMPT;
  } catch (err) {
    console.error(
      `[UI-GENERATOR] Failed to load system prompt. Run 'pnpm sync-mcp-prompt' first.`,
      err,
    );
    throw err;
  }
}

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL =
  process.env.AIBOS_UI_GENERATOR_MODEL || "gpt-5.1-thinking";

/**
 * Core UI generator agent
 * @param {Array<{role: string, content: string}>} userMessages - Chat-style messages from caller
 * @returns {Promise<string>} - Generated UI output (code, JSON, or markdown)
 */
export async function runUiGeneratorAgent(userMessages) {
  const systemPrompt = loadUiGeneratorSystemPrompt();

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...userMessages,
  ];

  // NOTE:
  // - This call assumes a chat-style client compatible with OpenAI's
  //   /v1/chat/completions API. If you wire this through a different client
  //   (e.g. Vercel AI SDK), adapt this block only.
  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content ?? "";
}

// --- MCP Server wiring ------------------------------------------------------

const server = new Server(
  {
    name: "aibos-ui-generator",
    version: "1.0.0",
    description:
      "Generate production-ready UI layouts/components from natural language with governance metadata.",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 *
 * We expose a single tool for now:
 * - generate_ui_layout: takes a prompt + optional mode/format/context and
 *   returns generated UI plus governance registryContext.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_ui_layout",
        description:
          "Generate UI layout/component code from a natural language prompt. Supports JSX/TSX/JSON/Markdown formats.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description:
                "Natural language description of the UI to generate (screens, components, layouts).",
            },
            format: {
              type: "string",
              description:
                "Preferred output format: jsx, tsx, json, or markdown. The agent will try to honor this.",
              enum: ["jsx", "tsx", "json", "markdown"],
              default: "tsx",
            },
            mode: {
              type: "string",
              description:
                "Optional mode: 'wireframe', 'production', or 'token-only' for design-token–focused output.",
              enum: ["wireframe", "production", "token-only"],
              default: "production",
            },
            context: {
              type: "object",
              description:
                "Optional context from AI-BOS (design tokens, theme info, component library, governance flags).",
            },
          },
          required: ["prompt"],
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
      case "generate_ui_layout": {
        const {
          prompt,
          format = "tsx",
          mode = "production",
          context = {},
        } = args;

        // Pack everything into a single user message so the system prompt
        // (UI_GENERATOR_SYSTEM_PROMPT) can steer the shape of the output.
        const userMessages = [
          {
            role: "user",
            content: JSON.stringify(
              {
                prompt,
                format,
                mode,
                context,
              },
              null,
              2
            ),
          },
        ];

        const uiOutput = await runUiGeneratorAgent(userMessages);

        const payload = {
          ok: true,
          result: uiOutput,
          format,
          mode,
          registryContext: GOVERNANCE_CONTEXT,
        };

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
          text: JSON.stringify(
            {
              ok: false,
              error: error.message,
              registryContext: GOVERNANCE_CONTEXT,
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

// Start the server on stdio (MCP)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIBOS UI Generator MCP server running on stdio");
}

main().catch((error) => {
  console.error("[UI-GENERATOR] Fatal error in main():", error);
  process.exit(1);
});


#!/usr/bin/env node
// .mcp/filesystem/server.mjs
// AIBOS Filesystem MCP Server
// Version: 1.0.0
// Optimized filesystem access with controlled allowedPaths

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

// Optimized allowed paths - only source code directories
const ALLOWED_PATHS = [
  // Apps
  path.resolve(workspaceRoot, "apps/web/app"),
  path.resolve(workspaceRoot, "apps/web/lib"),

  // UI Package - Source Code
  path.resolve(workspaceRoot, "packages/ui/src/components"),
  path.resolve(workspaceRoot, "packages/ui/src/design"),
  path.resolve(workspaceRoot, "packages/ui/src/hooks"),
  path.resolve(workspaceRoot, "packages/ui/src/layouts"),
  path.resolve(workspaceRoot, "packages/ui/src/lib"),

  // UI Package - Configuration
  path.resolve(workspaceRoot, "packages/ui/constitution"),

  // Other Packages
  path.resolve(workspaceRoot, "packages/types/src"),
  path.resolve(workspaceRoot, "packages/utils/src"),

  // MCP Servers
  path.resolve(workspaceRoot, ".mcp"),
];

// Excluded patterns (build artifacts, dependencies, etc.)
const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /\.turbo/,
  /\.git/,
  /\.vscode/,
  /\.idea/,
  /coverage/,
  /\.cache/,
];

/**
 * Check if a path is allowed
 */
function isPathAllowed(filePath) {
  const resolvedPath = path.resolve(workspaceRoot, filePath);

  // Check if path is within any allowed path
  const isAllowed = ALLOWED_PATHS.some((allowedPath) => {
    return resolvedPath.startsWith(allowedPath);
  });

  if (!isAllowed) {
    return false;
  }

  // Check excluded patterns
  const relativePath = path.relative(workspaceRoot, resolvedPath);
  const isExcluded = EXCLUDED_PATTERNS.some((pattern) => {
    return pattern.test(relativePath);
  });

  return !isExcluded;
}

/**
 * Read file content
 */
function readFile(filePath) {
  if (!isPathAllowed(filePath)) {
    throw new Error(`Access denied: ${filePath} is not in allowed paths`);
  }

  const resolvedPath = path.resolve(workspaceRoot, filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (!fs.statSync(resolvedPath).isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }

  return fs.readFileSync(resolvedPath, "utf8");
}

/**
 * List directory contents
 */
function listDirectory(dirPath) {
  if (!isPathAllowed(dirPath)) {
    throw new Error(`Access denied: ${dirPath} is not in allowed paths`);
  }

  const resolvedPath = path.resolve(workspaceRoot, dirPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${dirPath}`);
  }

  const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

  return entries
    .filter((entry) => {
      // Filter out excluded patterns
      const entryPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(
        workspaceRoot,
        path.resolve(workspaceRoot, entryPath)
      );
      return !EXCLUDED_PATTERNS.some((pattern) => pattern.test(relativePath));
    })
    .map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
      path: path.join(dirPath, entry.name),
    }));
}

/**
 * Write file content
 */
function writeFile(filePath, content) {
  if (!isPathAllowed(filePath)) {
    throw new Error(`Access denied: ${filePath} is not in allowed paths`);
  }

  const resolvedPath = path.resolve(workspaceRoot, filePath);
  const dir = path.dirname(resolvedPath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(resolvedPath, content, "utf8");
}

// Initialize MCP server
const server = new Server(
  {
    name: "aibos-filesystem",
    version: "1.0.0",
    description:
      "AIBOS Filesystem MCP Server - Optimized filesystem access with controlled allowedPaths",
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
        name: "read_file",
        description:
          "Read the contents of a file. Path must be within allowed paths.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the file from workspace root",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "list_directory",
        description:
          "List the contents of a directory. Path must be within allowed paths.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the directory from workspace root",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "write_file",
        description:
          "Write content to a file. Path must be within allowed paths.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the file from workspace root",
            },
            content: {
              type: "string",
              description: "Content to write to the file",
            },
          },
          required: ["path", "content"],
        },
      },
      {
        name: "get_allowed_paths",
        description: "Get the list of allowed paths for filesystem access",
        inputSchema: {
          type: "object",
          properties: {},
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
      case "read_file": {
        const content = readFile(args.path);
        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      }

      case "list_directory": {
        const entries = listDirectory(args.path);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(entries, null, 2),
            },
          ],
        };
      }

      case "write_file": {
        writeFile(args.path, args.content);
        return {
          content: [
            {
              type: "text",
              text: `File written successfully: ${args.path}`,
            },
          ],
        };
      }

      case "get_allowed_paths": {
        const allowedPaths = ALLOWED_PATHS.map((p) =>
          path.relative(workspaceRoot, p)
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(allowedPaths, null, 2),
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
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

console.error("AIBOS Filesystem MCP Server running");

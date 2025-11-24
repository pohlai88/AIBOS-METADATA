# AI-BOS MCP Servers

> **Model Context Protocol (MCP) Server Standards and Guidelines**  
> **Version:** 2.0.0  
> **Last Updated:** 2025-11-24

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [MCP Server Standards](#mcp-server-standards)
3. [Configuration Rules](#configuration-rules)
4. [Development Process](#development-process)
5. [Governance & Metadata](#governance--metadata)
6. [Server List](#server-list)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The AI-BOS platform uses **Model Context Protocol (MCP)** servers to provide AI agents with structured access to platform capabilities. All MCP servers follow enterprise-grade standards for security, governance, and maintainability.

### What is MCP?

**Model Context Protocol (MCP)** is a standardized protocol that enables AI assistants (like Cursor) to interact with external tools and data sources through a unified interface. MCP servers expose tools that AI agents can call to perform actions or retrieve information.

### Why MCP?

- ✅ **Standardized Interface** - All tools follow the same protocol
- ✅ **Type Safety** - Tools have defined input/output schemas
- ✅ **Governance** - All actions include metadata for audit and compliance
- ✅ **Extensibility** - Easy to add new capabilities
- ✅ **Security** - Controlled access with validation and rate limiting

---

## 📐 MCP Server Standards

### 1. **Package.json Requirements**

All MCP servers **MUST** have:

```json
{
  "name": "@aibos/mcp-{name}",
  "version": "X.Y.Z",
  "type": "module",
  "description": "...",
  "main": "server.mjs",
  "scripts": {
    "start": "node server.mjs"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0"
  },
  "keywords": ["mcp", "...", "aibos"],
  "author": "AIBOS Platform",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**Required Fields:**
- ✅ SDK version: `^1.22.0` (standardized)
- ✅ Engines: `node >=18.0.0`, `pnpm >=8.0.0`
- ✅ Package manager: `pnpm@8.15.0`
- ✅ Author: `"AIBOS Platform"`
- ✅ License: `"MIT"`
- ✅ Type: `"module"` (for ES modules)

### 2. **Server Structure**

All MCP servers **MUST** follow this structure:

```
.mcp/{server-name}/
├── server.mjs          # Main server implementation
├── package.json        # Dependencies and metadata
├── README.md          # Server-specific documentation
└── tools/             # Optional: CLI tools or utilities
    └── ...
```

### 3. **Server Implementation Standards**

#### **Required Imports**

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
```

#### **Required Server Setup**

```javascript
const server = new Server(
  {
    name: "aibos-{name}",
    version: "X.Y.Z",
    description: "...",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

#### **Required Tool Handlers**

```javascript
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "tool_name",
        description: "Tool description",
        inputSchema: {
          type: "object",
          properties: {
            // Define input schema
          },
          required: ["..."],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // Handle tool execution
});
```

### 4. **Governance Metadata**

All MCP servers **MUST** include governance metadata in responses:

```javascript
const GOVERNANCE_CONTEXT = {
  toolId: "aibos-{name}",
  domain: "{domain_name}",
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
```

**Required Fields:**
- ✅ `toolId` - Unique identifier for the tool
- ✅ `domain` - Domain/category (e.g., `ui_component_validation`)
- ✅ `registryTable` - Always `"mdm_tool_registry"`
- ✅ `category` - Issue category (e.g., `"accessibility"`, `"design-tokens"`)
- ✅ `severity` - `"error"` | `"warning"` | `"info"`

### 5. **Error Handling**

All tools **MUST** return structured error responses:

```javascript
try {
  // Tool logic
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
} catch (error) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: false,
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
```

### 6. **Security Standards**

#### **Path Validation**

All file operations **MUST** validate paths:

```javascript
function validatePath(filePath) {
  const resolved = path.resolve(workspaceRoot, filePath);
  
  // Must be within allowed directory
  if (!resolved.startsWith(allowedDir)) {
    throw new Error("Path outside allowed directory");
  }
  
  // Prevent path traversal
  if (filePath.includes("..")) {
    throw new Error("Path traversal not allowed");
  }
  
  return resolved;
}
```

#### **Input Sanitization**

All user inputs **MUST** be sanitized:

```javascript
function sanitizeInput(input) {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, MAX_LENGTH);
}
```

#### **Rate Limiting**

Tools that modify files **SHOULD** implement rate limiting:

```javascript
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(toolName) {
  // Implementation
}
```

#### **File Locking**

Tools that modify files **SHOULD** implement file locking:

```javascript
const LOCK_FILE = path.join(workspaceRoot, ".mcp-{name}.lock");

async function acquireLock(lockId) {
  // Check for existing lock
  // Acquire lock
  // Return success/failure
}

async function releaseLock(lockId) {
  // Release lock
}
```

### 7. **Performance Standards**

#### **Caching**

Servers **SHOULD** implement caching for expensive operations:

```javascript
const cache = new Map();

function getCached(key, computeFn) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const value = computeFn();
  cache.set(key, value);
  return value;
}
```

#### **AST Caching**

Servers that parse code **SHOULD** cache ASTs:

```javascript
const astCache = new Map();

function getParsedFile(filePath) {
  if (astCache.has(filePath)) {
    return astCache.get(filePath);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const ast = parse(content, PARSE_OPTIONS);
  astCache.set(filePath, { content, ast });
  return { content, ast };
}
```

---

## ⚙️ Configuration Rules

### 1. **MCP Configuration File**

All servers **MUST** be registered in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-{name}": {
      "command": "node",
      "args": [".mcp/{name}/server.mjs"],
      "cwd": "."
    }
  }
}
```

### 2. **Configuration Naming**

- ✅ Use `aibos-{name}` format for internal servers
- ✅ Use descriptive names for external servers
- ✅ Keep names consistent with server directory names

### 3. **Required Configuration**

All servers **MUST** have:
- ✅ `command` - Command to run (usually `"node"`)
- ✅ `args` - Array of arguments (server file path)
- ✅ `cwd` - Working directory (usually `"."`)

### 4. **Optional Configuration**

Servers **MAY** have:
- `env` - Environment variables
- `permissions` - Command permissions (for shell MCP)

---

## 🔄 Development Process

### 1. **Creating a New MCP Server**

1. **Create Directory Structure:**
   ```bash
   mkdir -p .mcp/{server-name}
   cd .mcp/{server-name}
   ```

2. **Initialize Package:**
   ```bash
   pnpm init
   # Update package.json with required fields
   ```

3. **Install Dependencies:**
   ```bash
   pnpm add @modelcontextprotocol/sdk@^1.22.0
   ```

4. **Create Server:**
   ```bash
   touch server.mjs
   # Implement server following standards
   ```

5. **Create README:**
   ```bash
   touch README.md
   # Document server purpose, tools, usage
   ```

6. **Register in mcp.json:**
   ```json
   {
     "mcpServers": {
       "aibos-{name}": {
         "command": "node",
         "args": [".mcp/{name}/server.mjs"]
       }
     }
   }
   ```

7. **Test Server:**
   ```bash
   node server.mjs
   # Test via Cursor MCP
   ```

### 2. **Updating an Existing Server**

1. **Update Code:**
   - Make changes to `server.mjs`
   - Update version in `package.json`
   - Update `README.md` if needed

2. **Test Changes:**
   ```bash
   node server.mjs
   # Test via Cursor MCP
   ```

3. **Update Documentation:**
   - Update `.mcp/MCP_COMPARISON_TABLE.md` if tools change
   - Update `.mcp/README.md` if standards change

### 3. **Versioning**

- **Major (X.0.0):** Breaking changes to tool schemas
- **Minor (0.X.0):** New tools or features
- **Patch (0.0.X):** Bug fixes or documentation updates

---

## 📊 Governance & Metadata

### Purpose

Governance metadata enables:
- ✅ **Audit Trails** - Track all tool usage
- ✅ **Compliance** - Meet regulatory requirements
- ✅ **Analytics** - Monitor tool performance
- ✅ **Policy Enforcement** - Apply governance rules

### Required Metadata

All tool responses **MUST** include:

```javascript
{
  governance: {
    toolId: "aibos-{name}",
    domain: "{domain_name}",
    registryTable: "mdm_tool_registry",
    category: "error" | "warning" | "info",
    severity: "error" | "warning" | "info"
  }
}
```

### Integration

Governance metadata integrates with:
- `mdm_tool_registry` database table
- AI-BOS observability platform
- Compliance dashboards
- Audit logs

---

## 📦 Server List

### Internal Servers

| Server | Status | Tools | Purpose |
|--------|--------|-------|---------|
| `aibos-filesystem` | ✅ Active | 4 | Optimized filesystem access |
| `react-validation` | ✅ Active | 4 | React component validation |
| `aibos-theme` | ✅ Active | 5 | Theme/token management |
| `aibos-documentation` | ✅ Active | 4 | Documentation automation |
| `aibos-ui-generator` | ✅ Active | 1 | UI generation from prompts |
| `aibos-component-generator` | ✅ Active | 1 | Component generation (86 rules) |
| `aibos-a11y-validation` | ✅ Active | 2 | Accessibility validation |

### External Servers

| Server | Status | Purpose |
|--------|--------|---------|
| `next-devtools` | ✅ Active | Next.js MCP integration |
| `supabase` | ✅ Active | Supabase database operations |
| `github` | ✅ Active | GitHub repository operations |
| `git` | ✅ Active | Git operations |
| `shell` | ✅ Active | Shell command execution |
| `playwright` | ✅ Active | Browser automation |

**See [MCP_COMPARISON_TABLE.md](./MCP_COMPARISON_TABLE.md) for detailed comparison.**

---

## 🔧 Troubleshooting

### Server Not Loading

1. **Check Configuration:**
   ```bash
   cat .cursor/mcp.json
   # Verify server is configured
   ```

2. **Check Dependencies:**
   ```bash
   cd .mcp/{server-name}
   pnpm install
   ```

3. **Test Server Directly:**
   ```bash
   node server.mjs
   # Should start without errors
   ```

4. **Check Logs:**
   - Check Cursor MCP logs
   - Check server console output

### Tool Not Available

1. **Verify Tool Registration:**
   - Check `ListToolsRequestSchema` handler
   - Verify tool name matches

2. **Check Tool Schema:**
   - Verify `inputSchema` is correct
   - Check required fields

3. **Test Tool Directly:**
   ```javascript
   // In server.mjs, add test call
   const result = await handleToolCall({
     name: "tool_name",
     arguments: { /* test args */ }
   });
   ```

### Performance Issues

1. **Enable Caching:**
   - Add AST caching for code parsing
   - Add file content caching

2. **Optimize Operations:**
   - Batch file operations
   - Use streaming for large files

3. **Monitor Resource Usage:**
   - Check memory usage
   - Check CPU usage

---

## 📚 Related Documentation

- [MCP Comparison Table](./MCP_COMPARISON_TABLE.md) - Detailed server comparison
- [MCP Workflow](./MCP_WORKFLOW.md) - Usage workflows
- [Package Standardization](./PACKAGE_STANDARDIZATION.md) - Package.json standards
- [Documentation MCP](../.mcp/documentation/README.md) - Documentation server
- [React MCP](../.mcp/react/README.md) - React validation server
- [Theme MCP](../.mcp/theme/README.md) - Theme server

---

## 🎯 Best Practices

### ✅ Do

- ✅ Follow all standards in this document
- ✅ Include governance metadata in all responses
- ✅ Implement proper error handling
- ✅ Validate all inputs
- ✅ Document all tools in README
- ✅ Test servers before committing
- ✅ Update comparison table when adding tools

### ❌ Don't

- ❌ Skip governance metadata
- ❌ Bypass input validation
- ❌ Use arbitrary SDK versions
- ❌ Create servers without README
- ❌ Skip error handling
- ❌ Hardcode paths or credentials

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS MCP Team  
**Version:** 2.0.0


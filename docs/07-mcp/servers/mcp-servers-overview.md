# MCP Servers Overview

> **Model Context Protocol (MCP) Servers for AI-BOS Platform**  
> **Last Updated:** 2025-11-24

---

## 📋 Overview

The AI-BOS platform uses **Model Context Protocol (MCP)** servers to provide AI agents with structured access to platform capabilities. All MCP servers follow enterprise-grade standards for security, governance, and maintainability.

**See:** [MCP README](../../../.mcp/README.md) for complete standards and guidelines.

---

## 🎯 Purpose

MCP servers enable:
- ✅ **Standardized Interface** - All tools follow the same protocol
- ✅ **Type Safety** - Tools have defined input/output schemas
- ✅ **Governance** - All actions include metadata for audit and compliance
- ✅ **Extensibility** - Easy to add new capabilities
- ✅ **Security** - Controlled access with validation and rate limiting

---

## 📦 Internal MCP Servers

### 1. **aibos-filesystem**

**Purpose:** Optimized filesystem access with controlled allowedPaths

**Tools:**
- `read_file` - Read file contents
- `list_directory` - List directory contents
- `write_file` - Write file contents
- `get_allowed_paths` - Get allowed paths list

**Status:** ✅ Active  
**Version:** 1.0.0  
**Docs:** [Filesystem MCP](../../../.mcp/filesystem/README.md)

---

### 2. **react-validation**

**Purpose:** React component validation and Next.js RSC boundary checking

**Tools:**
- `validate_react_component` - Validate React component for best practices
- `check_server_client_usage` - Check Server/Client component usage
- `validate_rsc_boundary` - Validate RSC boundary with enhanced checks
- `validate_imports` - Validate imports transitively

**Status:** ✅ Active  
**Version:** 1.1.0  
**Score:** 9.5/10 (World-Class, Enterprise-Grade)  
**Docs:** [React MCP](../../../.mcp/react/README.md)

---

### 3. **aibos-theme**

**Purpose:** Theme token management, validation, and Tailwind class validation

**Tools:**
- `read_tailwind_config` - Returns Tailwind v4 CSS tokens
- `validate_token_exists` - Check if token exists in globals.css
- `suggest_token` - Suggest appropriate token for color/value
- `validate_tailwind_class` - Validate Tailwind class usage
- `get_token_value` - Get actual CSS value for a token

**Status:** ✅ Active  
**Version:** 2.0.0  
**Docs:** [Theme MCP](../../../.mcp/theme/README.md)

---

### 4. **aibos-documentation**

**Purpose:** Auto-generate and maintain documentation via MCP tools

**Tools:**
- `validate_docs` - Validate documentation structure and compliance
- `update_token_reference` - Auto-generate token reference from globals.css
- `sync_nextra` - Sync documentation to Nextra
- `generate_from_template` - Generate documentation from templates

**Status:** ✅ Active  
**Version:** 2.0.0  
**Features:** File locking, rate limiting, backup/versioning, path validation  
**Docs:** [Documentation MCP](../../../.mcp/documentation/README.md)

---

### 5. **aibos-ui-generator**

**Purpose:** Generate UI layouts/components from natural language

**Tools:**
- `generate_ui_layout` - Generate UI layout/component code from prompt

**Status:** ✅ Active  
**Version:** 1.0.0  
**Requirements:** `OPENAI_API_KEY` environment variable  
**Docs:** [UI Generator MCP](../../../.mcp/ui-generator/README.md)  
**Reasoning:** [Why OpenAI API Key?](../../../.mcp/OPENAI_API_KEY_REASONING.md)

---

### 6. **aibos-component-generator**

**Purpose:** AI-driven component generation with complete constitution governance (86 rules)

**Tools:**
- `generate_component` - Generate React component with complete validation

**Status:** ✅ Active  
**Version:** 3.0.0  
**Features:** Design drift detection, token mapping, comprehensive validation  
**Docs:** [Component Generator MCP](../../../.mcp/component-generator/README.md)

---

### 7. **aibos-a11y-validation**

**Purpose:** Accessibility validation for React components with WCAG 2.1 compliance

**Tools:**
- `validate_component` - Validate React component accessibility
- `check_contrast` - Check WCAG 2.1 contrast ratio

**Status:** ✅ Active  
**Version:** 2.0.0  
**Docs:** [Accessibility MCP](../../../.mcp/a11y/README.md)

---

## 🌐 External MCP Servers

### 1. **next-devtools**

**Purpose:** Next.js 16+ MCP integration for runtime diagnostics

**Status:** ✅ Active  
**Requirements:** Next.js 16+

---

### 2. **supabase**

**Purpose:** Supabase database operations

**Status:** ✅ Active

---

### 3. **github**

**Purpose:** GitHub repository operations

**Status:** ✅ Active  
**Requirements:** `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable

---

### 4. **git**

**Purpose:** Git operations

**Status:** ✅ Active

---

### 5. **shell**

**Purpose:** Shell command execution with permissions

**Status:** ✅ Active  
**Permissions:** Controlled command whitelist

---

### 6. **playwright**

**Purpose:** Browser automation

**Status:** ✅ Active

---

## 📊 Comparison

**See:** [MCP Comparison Table](../../../.mcp/MCP_COMPARISON_TABLE.md) for detailed comparison of all servers.

---

## 🔧 Configuration

All MCP servers are configured in `.cursor/mcp.json`:

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

**See:** [MCP README](../../../.mcp/README.md) for configuration standards.

---

## 🎯 Usage

### **In Cursor**

MCP servers are automatically available when configured. Use them by:

1. **Asking Cursor to use a tool:**
   ```
   Validate the Button component using React MCP
   ```

2. **Direct tool calls:**
   ```
   Generate a dashboard layout using UI Generator MCP
   ```

### **Via Code**

```typescript
// Example: Validate component
const result = await mcp_react_validation_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button"
});
```

---

## 📚 Related Documentation

- [MCP README](../../../.mcp/README.md) - Standards and guidelines
- [MCP Comparison Table](../../../.mcp/MCP_COMPARISON_TABLE.md) - Detailed comparison
- [MCP Workflow](../../../.mcp/MCP_WORKFLOW.md) - Usage workflows
- [OpenAI API Key Reasoning](../../../.mcp/OPENAI_API_KEY_REASONING.md) - Why OpenAI API is required

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS MCP Team


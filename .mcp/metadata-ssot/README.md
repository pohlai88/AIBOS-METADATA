# Metadata SSOT MCP Server

**Guardian of Concepts, Aliases, and Naming Variants**

This MCP server exposes the AI-BOS Metadata Single Source of Truth (SSOT) to AI agents, providing governed access to:

- **Canonical concepts** (revenue_ifrs_core, sales_value_operational, etc.)
- **Context-aware aliases** ("Sales" → canonical concepts with strength)
- **Naming variants** (snake_case → camelCase, PascalCase, etc.)
- **Standard packs** (IFRS, MFRS, operational KPIs)

---

## 🎯 Purpose

This MCP server ensures AI agents (Cursor, Claude, etc.) always:

- ✅ Use canonical keys from the SSOT
- ✅ Respect context-aware alias governance
- ✅ Apply correct naming conventions per context
- ✅ Never invent new metadata concepts

**Rule:** AI agents MUST use this MCP server instead of guessing concept names or inventing aliases.

---

## 🔧 Tools Provided

### 1. `metadata-list-concepts`

List metadata concepts filtered by domain, pack, tier, or search term.

**Parameters:**
- `domain` (optional): Filter by domain (FINANCE, OPERATIONS, etc.)
- `standardPackKey` (optional): Filter by standard pack (MFRS15_REVENUE, etc.)
- `tier` (optional): Filter by tier (tier1-tier5)
- `search` (optional): Free-text search within concept label/description

**Returns:** Array of canonical concepts

**Example:**
```json
{
  "domain": "FINANCE",
  "tier": "tier1"
}
```

### 2. `metadata-get-concept`

Get a single canonical metadata concept by its canonicalKey.

**Parameters:**
- `canonicalKey` (required): Snake_case canonical key (e.g., revenue_ifrs_core)

**Returns:** Full concept details or null if not found

**Example:**
```json
{
  "canonicalKey": "revenue_ifrs_core"
}
```

### 3. `metadata-resolve-alias`

Resolve a human alias to canonical concept(s) with context awareness.

**Parameters:**
- `aliasText` (required): Human alias term (e.g., "Sales", "Revenue")
- `contextDomain` (optional): Business context (FINANCIAL_REPORTING, MANAGEMENT_REPORTING, etc.)
- `language` (optional): Language code (default: en)

**Returns:** Array of alias mappings with strength indicators

**Example:**
```json
{
  "aliasText": "Sales",
  "contextDomain": "MANAGEMENT_REPORTING"
}
```

**Result:**
```json
[
  {
    "aliasText": "Sales",
    "canonicalKey": "sales_value_operational",
    "contextDomain": "MANAGEMENT_REPORTING",
    "strength": "PRIMARY_LABEL",
    "concept": {
      "label": "Sales (Operational Gross Sales)",
      "tier": "tier2"
    }
  }
]
```

### 4. `metadata-resolve-name`

Resolve naming variant for a concept in a given context.

**Parameters:**
- `canonicalKey` (required): Canonical concept key (snake_case)
- `context` (required): Target naming context (db, typescript, graphql, api_path, const, bi, tax)

**Returns:** Name variant value for the specified context

**Example:**
```json
{
  "canonicalKey": "revenue_ifrs_core",
  "context": "typescript"
}
```

**Result:**
```json
{
  "canonicalKey": "revenue_ifrs_core",
  "context": "typescript",
  "value": "revenueIfrsCore"
}
```

### 5. `metadata-search-glossary`

Search metadata glossary by free-text query.

**Parameters:**
- `q` (required): Search query string

**Returns:** Array of matching alias results

**Example:**
```json
{
  "q": "revenue"
}
```

---

## 🚀 Setup

### 1. Install Dependencies

```bash
cd .mcp/metadata-ssot
pnpm install
```

### 2. Configure Environment

Create `.env` (or use workspace root `.env`):

```env
METADATA_BASE_URL=http://localhost:8787
METADATA_API_KEY=optional-api-key
METADATA_DEFAULT_TENANT_ID=550e8400-e29b-41d4-a716-446655440000
```

### 3. Add to MCP Configuration

In `.cursor/mcp.json` (or equivalent):

```json
{
  "mcpServers": {
    "metadata-ssot": {
      "command": "node",
      "args": [
        "--loader",
        "tsx",
        ".mcp/metadata-ssot/server.mts"
      ],
      "env": {
        "METADATA_BASE_URL": "http://localhost:8787"
      }
    }
  }
}
```

### 4. Test the Server

```bash
# Run server directly
pnpm dev

# Or via MCP (restart Cursor to load)
```

---

## 📊 Integration Flow

```
AI Agent (Cursor/Claude)
        ↓
Metadata SSOT MCP Server
        ↓
Metadata SDK (@aibos/metadata-sdk)
        ↓
Metadata Studio HTTP API
        ↓
Zod Contracts (validation)
        ↓
Supabase Database
```

---

## 🎯 Usage Examples

### Example 1: AI Resolving "Sales"

**AI Prompt:**
> "What does 'Sales' mean in the context of management reporting?"

**MCP Call:**
```json
{
  "tool": "metadata-resolve-alias",
  "arguments": {
    "aliasText": "Sales",
    "contextDomain": "MANAGEMENT_REPORTING"
  }
}
```

**Result:**
```json
[
  {
    "aliasText": "Sales",
    "canonicalKey": "sales_value_operational",
    "strength": "PRIMARY_LABEL",
    "concept": {
      "label": "Sales (Operational Gross Sales)",
      "tier": "tier2",
      "description": "Gross sales value used for operational KPIs"
    }
  }
]
```

**AI Response:**
> "In management reporting, 'Sales' refers to `sales_value_operational` (tier2), which is the gross sales value used for operational KPIs and dashboards."

### Example 2: AI Generating TypeScript Code

**AI Prompt:**
> "Generate a TypeScript interface for revenue_ifrs_core"

**MCP Call 1: Get concept**
```json
{
  "tool": "metadata-get-concept",
  "arguments": {
    "canonicalKey": "revenue_ifrs_core"
  }
}
```

**MCP Call 2: Get TypeScript name**
```json
{
  "tool": "metadata-resolve-name",
  "arguments": {
    "canonicalKey": "revenue_ifrs_core",
    "context": "typescript"
  }
}
```

**AI Response:**
```typescript
export interface Revenue {
  revenueIfrsCore: number; // Revenue (IFRS/MFRS Core) - tier1
}
```

### Example 3: AI Searching Glossary

**AI Prompt:**
> "Show me all metadata concepts related to income"

**MCP Call:**
```json
{
  "tool": "metadata-search-glossary",
  "arguments": {
    "q": "income"
  }
}
```

**Result:**
```json
[
  {
    "aliasText": "Income",
    "canonicalKey": "other_income_ifrs",
    "strength": "SECONDARY_LABEL",
    "concept": {
      "label": "Other Income (IFRS/MFRS)",
      "tier": "tier1"
    }
  }
]
```

---

## 🔒 Governance Rules

### For AI Agents

1. **ALWAYS use canonical keys** (snake_case) when referencing concepts
2. **NEVER invent aliases** - use `metadata-resolve-alias` to validate
3. **RESPECT strength indicators**:
   - PRIMARY_LABEL: Preferred term
   - SECONDARY_LABEL: Allowed, clarify meaning
   - DISCOURAGED: Avoid if possible
   - FORBIDDEN: Do NOT use
4. **Use naming variants** for code generation (typescript, graphql, etc.)
5. **Search first** if unsure about a concept

### For Developers

1. **Never bypass the MCP** - always use this server for metadata queries
2. **Don't hardcode concept names** - resolve them dynamically
3. **Respect tier governance** - tier1 is statutory, changes require approval
4. **Follow naming conventions** - use the naming variant system

---

## 📚 Related Documentation

- [Metadata SDK](../../packages/metadata-sdk/README.md)
- [Zod Contracts](../../packages/contracts/README.md)
- [Alias System](../../ALIAS-SYSTEM-COMPLETE.md)
- [Naming System](../../NAMING-SYSTEM-COMPLETE.md)
- [OpenAPI Spec](http://localhost:8787/openapi.json)

---

## 🎊 Status

**Metadata SSOT MCP:** ✅ COMPLETE

Tools:
- ✅ `metadata-list-concepts`
- ✅ `metadata-get-concept`
- ✅ `metadata-resolve-alias`
- ✅ `metadata-resolve-name`
- ✅ `metadata-search-glossary`

---

**Last Updated:** 2025-12-02  
**Owner:** AIBOS Team


# ✅ Metadata MCP Server Complete - AI Door to SSOT

## 🎯 What Was Implemented

The **Metadata SSOT MCP Server** is now complete. This is the **AI door** into your metadata governance system, providing governed access to canonical concepts, aliases, and naming variants.

**Purpose:** Ensure AI agents (Cursor, Claude, etc.) always use the SSOT instead of guessing or inventing metadata concepts.

---

## 📂 Package Structure

```
.mcp/metadata-ssot/
├── package.json               ✅ Package configuration
├── tsconfig.json             ✅ TypeScript configuration
├── server.mts                ✅ MCP server implementation
└── README.md                 ✅ Complete documentation
```

---

## 🔧 5 Tools Exposed

### 1. `metadata-list-concepts`

**Purpose:** List metadata concepts with filtering

**Parameters:**
- `domain` - Filter by domain (FINANCE, OPERATIONS, etc.)
- `standardPackKey` - Filter by pack (MFRS15_REVENUE, etc.)
- `tier` - Filter by tier (tier1-tier5)
- `search` - Free-text search

**Use Cases:**
- Browse concepts in a domain
- Find concepts in a standard pack
- List tier1 concepts for statutory reporting

### 2. `metadata-get-concept`

**Purpose:** Get single concept by canonical key

**Parameters:**
- `canonicalKey` - Snake_case canonical key (revenue_ifrs_core)

**Use Cases:**
- Verify a concept exists
- Get full concept details
- Check concept tier and governance

### 3. `metadata-resolve-alias`

**Purpose:** Resolve business terms to canonical concepts (context-aware)

**Parameters:**
- `aliasText` - Human alias ("Sales", "Revenue", "Income")
- `contextDomain` - Business context (FINANCIAL_REPORTING, MANAGEMENT_REPORTING, etc.)
- `language` - Language code (default: en)

**Use Cases:**
- User says "Sales" - which concept do they mean?
- Validate if a term is allowed in a context
- Get strength indicators (PRIMARY_LABEL, SECONDARY_LABEL, DISCOURAGED, FORBIDDEN)

**Example Result:**
```json
{
  "aliasText": "Sales",
  "canonicalKey": "sales_value_operational",
  "contextDomain": "MANAGEMENT_REPORTING",
  "strength": "PRIMARY_LABEL",
  "notes": "Default meaning of Sales in operational dashboards",
  "concept": {
    "label": "Sales (Operational Gross Sales)",
    "tier": "tier2",
    "description": "Gross sales value used for operational KPIs"
  }
}
```

### 4. `metadata-resolve-name`

**Purpose:** Convert canonical keys to context-specific naming formats

**Parameters:**
- `canonicalKey` - Canonical concept key (revenue_ifrs_core)
- `context` - Target naming context (typescript, graphql, api_path, const, db, bi, tax)

**Use Cases:**
- Generate TypeScript property names (camelCase)
- Generate GraphQL type names (PascalCase)
- Generate API paths (kebab-case)
- Generate constants (UPPER_SNAKE)

**Example Result:**
```json
{
  "canonicalKey": "revenue_ifrs_core",
  "context": "typescript",
  "value": "revenueIfrsCore"
}
```

### 5. `metadata-search-glossary`

**Purpose:** Free-text search across concepts and aliases

**Parameters:**
- `q` - Search query string

**Use Cases:**
- User searches for "revenue", "sales", "income"
- Building glossary UI
- Finding related concepts

---

## 🎯 Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│ AI Agent (Cursor / Claude)                                  │
│ "What does Sales mean in management reporting?"             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Metadata SSOT MCP Server                                    │
│ Tool: metadata-resolve-alias                                │
│ Args: { aliasText: "Sales", contextDomain: "MANAGEMENT..." }│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Metadata SDK (@aibos/metadata-sdk)                          │
│ metadataClient.resolveAlias(...)                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Metadata Studio HTTP API                                    │
│ GET /metadata/aliases/resolve?aliasText=Sales&context=...   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Zod Contracts (Validation)                                  │
│ ResolveAliasInputSchema.parse(...) ✅                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase Database                                           │
│ SELECT * FROM mdm_alias WHERE ...                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ AI Agent (Response)                                         │
│ "Sales in management reporting means sales_value_operational│
│  (tier2), the gross sales value for operational dashboards" │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd .mcp/metadata-ssot
pnpm install
```

### 2. Configure Environment

The MCP server reads from `.env` or environment variables:

```env
METADATA_BASE_URL=http://localhost:8787
METADATA_API_KEY=optional-api-key
METADATA_DEFAULT_TENANT_ID=550e8400-e29b-41d4-a716-446655440000
```

### 3. Add to Cursor

The `.cursor/mcp.json` file has been created:

```json
{
  "mcpServers": {
    "metadata-ssot": {
      "command": "node",
      "args": ["--loader", "tsx", ".mcp/metadata-ssot/server.mts"],
      "env": {
        "METADATA_BASE_URL": "http://localhost:8787",
        "METADATA_DEFAULT_TENANT_ID": "550e8400-e29b-41d4-a716-446655440000"
      }
    }
  }
}
```

### 4. Restart Cursor

Restart Cursor to load the new MCP server.

### 5. Test the MCP Server

In Cursor, try:

**Prompt:**
> "Use the metadata-resolve-alias tool to find what 'Sales' means in MANAGEMENT_REPORTING context"

**Expected:**
Cursor will call the MCP tool and show you the alias mappings!

---

## 📊 AI Agent Governance Rules

### ✅ What AI Agents MUST Do

1. **Always use canonical keys** (snake_case) when referencing concepts
2. **Use `metadata-resolve-alias`** before assuming what a business term means
3. **Respect strength indicators**:
   - PRIMARY_LABEL: Preferred term ✅
   - SECONDARY_LABEL: Allowed, clarify meaning ⚠️
   - DISCOURAGED: Avoid if possible 🟡
   - FORBIDDEN: Do NOT use 🚫
4. **Use naming variants** for code generation (typescript, graphql, etc.)
5. **Search first** if unsure (`metadata-search-glossary`)

### ❌ What AI Agents MUST NOT Do

1. **Never invent concept names** - always use the SSOT
2. **Never assume alias meanings** - always resolve via MCP
3. **Never bypass the MCP** for metadata queries
4. **Never use FORBIDDEN aliases** in their contexts
5. **Never create metadata** without going through approval workflow

---

## 🎯 Usage Examples

### Example 1: Resolving Ambiguous Terms

**AI Prompt:**
> "What does 'Income' mean?"

**MCP Tool:**
```json
{
  "tool": "metadata-resolve-alias",
  "arguments": {
    "aliasText": "Income"
  }
}
```

**Result:**
```json
[
  {
    "aliasText": "Income",
    "canonicalKey": "revenue_ifrs_core",
    "contextDomain": "GENERIC_SPEECH",
    "strength": "DISCOURAGED",
    "notes": "Too broad in everyday speech; clarify if you mean Revenue or total income"
  },
  {
    "aliasText": "Income",
    "canonicalKey": "other_income_ifrs",
    "contextDomain": "FINANCIAL_REPORTING",
    "strength": "SECONDARY_LABEL",
    "notes": "Allowed as a section label 'Other income' in P&L"
  }
]
```

**AI Response:**
> "'Income' is ambiguous. In everyday speech, it's **DISCOURAGED** - clarify if you mean Revenue (`revenue_ifrs_core`) or Other Income (`other_income_ifrs`). In financial reporting, 'Other Income' is allowed as a section label."

### Example 2: Generating TypeScript Code

**AI Prompt:**
> "Generate a TypeScript interface for revenue_ifrs_core"

**MCP Tool 1: Get Concept**
```json
{
  "tool": "metadata-get-concept",
  "arguments": {
    "canonicalKey": "revenue_ifrs_core"
  }
}
```

**MCP Tool 2: Get TypeScript Name**
```json
{
  "tool": "metadata-resolve-name",
  "arguments": {
    "canonicalKey": "revenue_ifrs_core",
    "context": "typescript"
  }
}
```

**AI Generated Code:**
```typescript
/**
 * Revenue (IFRS/MFRS Core)
 * 
 * Income from ordinary activities with customers under MFRS/IFRS.
 * 
 * Tier: tier1 (statutory)
 * Domain: FINANCE
 * Standard Pack: MFRS15_REVENUE
 */
export interface RevenueIfrsCore {
  revenueIfrsCore: number;
}
```

### Example 3: Validating User Input

**AI Prompt:**
> "User wants to use 'Sales' in their statutory financial report. Is this allowed?"

**MCP Tool:**
```json
{
  "tool": "metadata-resolve-alias",
  "arguments": {
    "aliasText": "Sales",
    "contextDomain": "STATUTORY_DISCLOSURE"
  }
}
```

**Result:**
```json
[]  // No results = not defined for this context
```

**AI Response:**
> "⚠️ 'Sales' is **not allowed** in statutory disclosure. In financial reporting, use 'Revenue' (`revenue_ifrs_core`) instead. 'Sales' is too ambiguous for statutory reports."

---

## 📚 Benefits

### ✅ For AI Agents

- **Always accurate** - concepts come from SSOT
- **Context-aware** - aliases resolve based on business context
- **Governed** - strength indicators prevent misuse
- **Consistent** - naming variants ensure uniform code generation

### ✅ For Developers

- **No manual lookups** - AI handles metadata queries
- **Type-safe** - Zod validation on all inputs/outputs
- **Auditable** - All MCP calls can be logged
- **Maintainable** - Single source of truth for metadata

### ✅ For Organization

- **Governance enforced** - AI can't bypass SSOT
- **Alias control** - Context-aware term usage
- **Naming consistency** - Automated across all contexts
- **Quality assurance** - Metadata always validated

---

## 🎊 Status

**Metadata MCP Server:** ✅ COMPLETE

You now have **8 complete governance layers**:

1. ✅ **Naming System** - mdm_naming_variant + resolvers
2. ✅ **Wiki Structure** - SSOT + Domain wikis
3. ✅ **Bootstrap System** - CSV → Database loader
4. ✅ **Alias System** - mdm_alias + context governance
5. ✅ **Metadata SDK** - Unified client
6. ✅ **Zod Contracts** - Single Source of Truth
7. ✅ **OpenAPI** - API introspection
8. ✅ **MCP Server** - AI door to SSOT ✨ **NEW**

---

## 🚀 Next Steps (Optional)

### Metadata Curation MCP (Future)

Create a second MCP server for **proposing** metadata changes (not direct writes):

**Tools:**
- `metadata-propose-concept` - Creates approval request (tier1 required)
- `metadata-propose-alias` - Suggests new alias mapping
- `metadata-propose-naming-variant` - Suggests naming override

All proposals go through `mdm_approval` workflow - AI can suggest, but never silently change SSOT.

---

**Zod is the Constitution. SDK is the gateway. MCP is the AI door. Zero drift. Fully governed.** 🎯

---

**Last Updated:** 2025-12-02  
**Owner:** AIBOS Team


# MCP Documentation Server Structure

> **MCP Documentation Server Architecture**  
> **Purpose:** Auto-generate and maintain documentation via MCP tools

---

## 📁 Server Structure

```
.mcp/documentation/
├── server.mjs                    # Main MCP server
├── README.md                     # Server documentation
├── package.json                  # Server dependencies
├── STRUCTURE.md                  # This file
└── tools/
    ├── generate-component-docs.mjs    # Generate component API docs
    ├── update-token-reference.mjs     # Update token reference
    ├── sync-figma-docs.mjs            # Sync Figma → Docs
    ├── db-introspect.mjs              # Introspect database schema
    ├── api-introspect.mjs             # Introspect API routes
    └── validate-docs.mjs              # Validate documentation
```

---

## 🛠️ MCP Tools

### 1. `generate_component_docs`

**Purpose:** Auto-generate component API documentation from TypeScript

**Input:**
```json
{
  "component": "Button",
  "outputPath": "docs/09-reference/ui/auto/button-api.md"
}
```

**Output:**
- Component props extracted from TypeScript
- Type definitions
- Usage examples
- Validation rules

**Target Location:** `docs/09-reference/ui/auto/`

---

### 2. `update_token_reference`

**Purpose:** Auto-generate token reference from `globals.css`

**Input:**
```json
{
  "sourcePath": "packages/ui/src/design/globals.css",
  "outputPath": "docs/09-reference/tokens/auto/tokens-reference.md"
}
```

**Output:**
- Complete token list
- Token values (light/dark)
- Token categories
- Usage examples

**Target Location:** `docs/09-reference/tokens/auto/`

---

### 3. `sync_figma_docs`

**Purpose:** Sync Figma component specs to documentation

**Input:**
```json
{
  "figmaFileKey": "file-key",
  "nodeId": "node-id",
  "outputPath": "docs/09-reference/figma/auto/component-mapping.md"
}
```

**Output:**
- Figma component specs
- Design tokens
- Component mapping (Figma → Code)
- Design system sync status

**Target Location:** `docs/09-reference/figma/auto/`

---

### 4. `db_introspect`

**Purpose:** Introspect database schema and generate docs

**Input:**
```json
{
  "connectionString": "postgresql://...",
  "outputPath": "docs/09-reference/database/auto/schema.md"
}
```

**Output:**
- Database schema
- Table definitions
- Relationships
- Indexes and constraints

**Target Location:** `docs/09-reference/database/auto/`

---

### 5. `api_introspect`

**Purpose:** Introspect API routes and generate docs

**Input:**
```json
{
  "sourcePath": "apps/web/app/api",
  "outputPath": "docs/09-reference/api/auto/endpoints.md"
}
```

**Output:**
- API endpoint list
- Request/response schemas
- Authentication requirements
- Rate limiting info

**Target Location:** `docs/09-reference/api/auto/`

---

### 6. `validate_docs`

**Purpose:** Validate documentation structure and content

**Input:**
```json
{
  "checkLinks": true,
  "checkTemplates": true,
  "checkStructure": true
}
```

**Output:**
- Validation report
- Broken links
- Template compliance
- Structure integrity

---

## 🔄 Workflow

### Auto-Generation Workflow

1. **Trigger:** Code change, build, or scheduled job
2. **MCP Tool:** Called with appropriate parameters
3. **Generation:** Content generated from source
4. **Validation:** Content validated against schemas
5. **Review:** Documentation Steward reviews (if required)
6. **Write:** Content written to `09-reference/auto/`
7. **Sync:** Nextra sync picks up changes

### Manual Workflow

1. **Developer:** Makes code change
2. **MCP Tool:** Developer calls tool manually
3. **Generation:** Content generated
4. **Review:** Developer reviews generated content
5. **Commit:** Developer commits generated docs

---

## 📋 Rules

### 09-reference/ Rules

- ✅ **MCP-only writes:** Humans do NOT edit files in `09-reference/auto/`
- ✅ **Overwrite policy:** MCP tools can overwrite existing files
- ✅ **Validation required:** All generated content must validate
- ✅ **Review required:** Documentation Steward must review (configurable)

### Template Compliance

- ✅ All generated docs must follow templates (if applicable)
- ✅ Schema validation required
- ✅ Format validation required
- ✅ Link validation required

---

## 🔗 Integration

### Nextra Integration

- **Sync:** `apps/docs/scripts/sync-docs.ts` syncs `docs/` to `apps/docs/pages/`
- **Navigation:** `_meta.json` includes `09-reference/` section
- **Display:** Nextra displays auto-generated docs alongside manual docs

### CI/CD Integration

- **Pre-commit:** Validate structure and templates
- **Build:** Generate reference docs
- **Deploy:** Sync to Nextra site

---

## 📊 Status

**Status:** 🟡 In Development  
**Next Steps:**
1. Implement server.mjs
2. Implement tools
3. Set up CI/CD integration
4. Configure Documentation Steward review

---

**Last Updated:** 2025-11-24  
**Maintained By:** MCP Team


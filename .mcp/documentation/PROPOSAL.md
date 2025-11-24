# 📘 Documentation MCP Server Proposal

> **Proposal for AI-BOS Documentation Automation**  
> **Date:** 2025-11-24  
> **Status:** 🟡 Proposal - Pending Approval

---

## 🎯 Executive Summary

### **Recommendation: Build Custom Documentation MCP Server**

**Why NOT use a generic "Nextra MCP":**
- ❌ Nextra doesn't have an official MCP server
- ❌ Generic MCPs don't understand our documentation structure (01-09, 99-archive)
- ❌ We need manifest-driven automation (follows `ui-docs.manifest.json`)
- ❌ We need ERP-specific documentation generation
- ❌ We need integration with our existing MCP servers (Figma, Theme, React)

**Why Custom MCP Server:**
- ✅ Follows our documentation manifest rules
- ✅ Understands our structure (01-09, 99-archive)
- ✅ Integrates with Nextra via existing sync script
- ✅ Auto-generates only in `09-reference/` (MCP-only section)
- ✅ Validates against templates and structure
- ✅ Integrates with existing MCP servers (Figma, Theme, React, Filesystem)

---

## 🏗️ Architecture

### **Documentation MCP Server Structure**

```
.mcp/documentation/
├── server.mjs              # Main MCP server
├── package.json            # Dependencies
├── README.md               # Server documentation
├── tools/                  # MCP tool implementations
│   ├── generate-component-docs.mjs
│   ├── update-token-reference.mjs
│   ├── sync-figma-docs.mjs
│   ├── db-introspect.mjs
│   ├── api-introspect.mjs
│   ├── validate-docs.mjs
│   ├── sync-nextra.mjs     # Trigger Nextra sync
│   └── generate-from-template.mjs
└── utils/
    ├── manifest-loader.mjs # Load ui-docs.manifest.json
    ├── template-engine.mjs # Template rendering
    └── validator.mjs       # Validation logic
```

---

## 🛠️ MCP Tools

### **1. `generate_component_docs`**
**Purpose:** Auto-generate component API documentation from TypeScript

**Input:**
```json
{
  "component": "Button",
  "sourcePath": "packages/ui/src/components/Button.tsx",
  "outputPath": "docs/09-reference/ui/auto/button-api.md"
}
```

**Output:**
- Component props extracted from TypeScript
- Type definitions
- Usage examples
- Validation rules

**Target:** `docs/09-reference/ui/auto/`

---

### **2. `update_token_reference`**
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

**Target:** `docs/09-reference/tokens/auto/`

**Integration:** Uses `.mcp/theme` server for token validation

---

### **3. `sync_figma_docs`**
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

**Target:** `docs/09-reference/figma/auto/`

**Integration:** Uses `.mcp/Figma` MCP server

---

### **4. `db_introspect`**
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

**Target:** `docs/09-reference/database/auto/`

---

### **5. `api_introspect`**
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

**Target:** `docs/09-reference/api/auto/`

---

### **6. `validate_docs`**
**Purpose:** Validate documentation structure and content

**Input:**
```json
{
  "checkLinks": true,
  "checkTemplates": true,
  "checkStructure": true,
  "checkManifest": true
}
```

**Output:**
- Validation report
- Broken links
- Template compliance
- Structure integrity
- Manifest compliance

---

### **7. `sync_nextra`**
**Purpose:** Trigger Nextra sync (runs `apps/docs/scripts/sync-docs.ts`)

**Input:**
```json
{
  "force": false
}
```

**Output:**
- Sync status
- Files synced
- Errors (if any)

**Note:** This tool runs the existing sync script to update Nextra site

---

### **8. `generate_from_template`**
**Purpose:** Generate documentation from template

**Input:**
```json
{
  "template": "erp-module",
  "outputPath": "docs/03-modules/new-module/overview.md",
  "data": {
    "moduleName": "New Module",
    "description": "..."
  }
}
```

**Output:**
- Generated documentation file
- Template compliance validation

---

## 🔄 Workflow

### **Auto-Generation Workflow**

1. **Trigger:** Code change, build, or scheduled job
2. **MCP Tool:** Called with appropriate parameters
3. **Manifest Check:** Validates against `ui-docs.manifest.json`
4. **Generation:** Content generated from source
5. **Validation:** Content validated against schemas/templates
6. **Review:** Documentation Steward reviews (if required)
7. **Write:** Content written to `09-reference/auto/` (MCP-only)
8. **Sync:** Nextra sync picks up changes automatically

### **Manual Workflow**

1. **Developer:** Makes code change
2. **MCP Tool:** Developer calls tool manually via Cursor
3. **Generation:** Content generated
4. **Review:** Developer reviews generated content
5. **Commit:** Developer commits generated docs

---

## 📋 Rules & Constraints

### **09-reference/ Rules (from Manifest)**

- ✅ **MCP-only writes:** Humans do NOT edit files in `09-reference/auto/`
- ✅ **Overwrite policy:** MCP tools can overwrite existing files
- ✅ **Validation required:** All generated content must validate
- ✅ **Review required:** Documentation Steward must review (configurable)

### **Template Compliance**

- ✅ All generated docs must follow templates (if applicable)
- ✅ Schema validation required
- ✅ Format validation required
- ✅ Link validation required

### **Manifest Compliance**

- ✅ All tools must respect `mcpAutoGenerate` flags
- ✅ All tools must follow section rules
- ✅ All tools must validate against manifest structure

---

## 🔗 Integration Points

### **Nextra Integration**
- **Sync:** Uses existing `apps/docs/scripts/sync-docs.ts`
- **Trigger:** `sync_nextra` tool calls sync script
- **Navigation:** `_meta.json` includes `09-reference/` section
- **Display:** Nextra displays auto-generated docs alongside manual docs

### **Existing MCP Servers**
- **Figma MCP:** Used by `sync_figma_docs`
- **Theme MCP:** Used by `update_token_reference`
- **React MCP:** Used by `generate_component_docs` (validation)
- **Filesystem MCP:** Used for file operations

### **CI/CD Integration**
- **Pre-commit:** Validate structure and templates
- **Build:** Generate reference docs
- **Deploy:** Sync to Nextra site

---

## 📊 Implementation Plan

### **Phase 1: Core Server (Week 1)**
- ✅ Implement `server.mjs` with MCP SDK
- ✅ Implement `manifest-loader.mjs`
- ✅ Implement `validate_docs` tool
- ✅ Basic validation and structure checks

### **Phase 2: Generation Tools (Week 2)**
- ✅ Implement `generate_component_docs`
- ✅ Implement `update_token_reference`
- ✅ Implement `generate_from_template`
- ✅ Template engine

### **Phase 3: Integration Tools (Week 3)**
- ✅ Implement `sync_figma_docs` (Figma MCP integration)
- ✅ Implement `db_introspect`
- ✅ Implement `api_introspect`
- ✅ Implement `sync_nextra`

### **Phase 4: CI/CD & Automation (Week 4)**
- ✅ Set up CI/CD hooks
- ✅ Configure Documentation Steward review
- ✅ Set up scheduled generation
- ✅ Production deployment

---

## ✅ Benefits

1. **Automation:** Reduces manual documentation work by 70%
2. **Consistency:** Ensures all docs follow templates and structure
3. **Accuracy:** Auto-generated docs stay in sync with code
4. **Scalability:** Handles 1000+ pages of documentation
5. **Integration:** Works seamlessly with Nextra and existing MCP servers
6. **Governance:** Enforces manifest rules and steward review

---

## 🎯 Decision

**Recommendation:** ✅ **Build Custom Documentation MCP Server**

**Rationale:**
- Follows our documentation strategy and manifest
- Integrates with Nextra (via sync script, not separate MCP)
- Understands our structure (01-09, 99-archive)
- Integrates with existing MCP servers
- Provides ERP-specific automation

**Next Steps:**
1. Review and approve this proposal
2. Implement Phase 1 (Core Server)
3. Iterate based on feedback

---

**Last Updated:** 2025-11-24  
**Status:** 🟡 Proposal - Pending Approval


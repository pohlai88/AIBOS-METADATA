# 📊 MCP Servers Comparison Table

> **Date:** 2025-11-24  
> **Purpose:** Comprehensive comparison of all MCP servers in the AIBOS platform

---

## Comparison Table

| MCP Server | Configuration | Server | Tools | Functions | Features | Orphan | Others |
|------------|---------------|--------|-------|-----------|----------|--------|--------|
| **aibos-filesystem** | Internal | Yes | Yes | `read_file`, `list_directory`, `write_file`, `get_allowed_paths` | Optimized filesystem access with controlled allowedPaths. Path validation, pattern exclusion (node_modules, .next, dist, etc.). Focused on source code directories only. | No | Configured in `.cursor/mcp.json`. Version 1.0.0. Allows access to apps/web, packages/ui/src, packages/types/src, packages/utils/src, .mcp. Excludes build artifacts for performance. |
| **react-validation** | Internal | Yes | Yes | `validate_react_component`, `check_server_client_usage`, `validate_rsc_boundary`, `validate_imports` | React component validation with AST-based analysis. Next.js RSC boundary checking. Token compliance validation. Accessibility checks. Governance metadata integration. AST caching for performance. Import tracing with workspace alias resolution. | No | Configured in `.cursor/mcp.json`. Version 1.1.0. Score: 9.5/10. Uses Babel parser/traverse. Supports environment variable `AIBOS_DESIGN_TOKEN_PREFIXES` for token enforcement. |
| **aibos-theme** | Internal | Yes | Yes | `read_tailwind_config`, `validate_token_exists`, `suggest_token`, `validate_tailwind_class`, `get_token_value` | Tailwind v4 CSS token management. Token validation and suggestions. Tailwind class validation (arbitrary values, palette colors). Governance metadata integration. CSS variable parsing with caching. | No | Configured in `.cursor/mcp.json`. Version 2.0.0. Reads from `packages/ui/src/design/globals.css`. Supports token matching from Figma to Tailwind. |
| **aibos-documentation** | Internal | Yes | Yes | `validate_docs`, `update_token_reference`, `sync_nextra`, `generate_from_template` | Documentation structure validation. Auto-generate token reference from globals.css. Sync documentation to Nextra. Template-based document generation. File locking, rate limiting, backup/versioning. Path validation & security. Template schema validation. Semantic token parsing. | No | Configured in `.cursor/mcp.json`. Version 2.0.0. Enterprise-grade with security & governance. Uses manifest at `docs/ui-docs.manifest.json`. Integrates with Nextra via `apps/docs/scripts/sync-docs.ts`. |
| **aibos-ui-generator** | Internal | Yes | Yes | `generate_ui_layout` | Natural language UI generation. Supports JSX/TSX/JSON/Markdown formats. Multiple modes (wireframe, production, token-only). Design system enforcement via system prompt. Governance metadata integration. OpenAI integration (optional). | **Yes** | **NOT configured in `.cursor/mcp.json`**. Version 1.0.0. Requires `OPENAI_API_KEY`. Uses system prompt from `.mcp/ui-generator/prompt.md`. Optional dependencies: `@ai-sdk/openai`, `ai`. |
| **aibos-component-generator** | Internal | Yes | Yes | `generate_component` | AI-driven component generation with 86 constitution rules. Design drift detection. Token mapping. Comprehensive validation (RSC, React, Accessibility, Keyboard, Focus, Semantic, Styling, Imports, Radix, Motion, Style Drift). Governance score calculation. | **Yes** | **NOT configured in `.cursor/mcp.json`**. Version 3.0.0. Loads constitution from `packages/ui/constitution/*.yml`. Generates temporary files for validation. Calculates governance score (A/B/C/D grades). |
| **aibos-a11y-validation** | Internal | Yes | Yes | `validate_component`, `check_contrast` | WCAG 2.1 compliance validation. AST-based analysis. Real WCAG contrast ratio calculations. 10 accessibility rules (icon buttons, form labels, keyboard navigation, semantic HTML, etc.). AST caching. | **Yes** | **NOT configured in `.cursor/mcp.json`**. Version 2.0.0. Uses Babel parser/traverse. Supports hex, rgb, rgba, hsl, named colors for contrast checking. |
| **next-devtools** | External | Yes | Yes | Multiple tools via Next.js MCP endpoint | Next.js 16+ MCP integration. Runtime diagnostics. Route information. Error reporting. Build status. Component tree. | No | Configured in `.cursor/mcp.json`. Uses `npx next-devtools-mcp@latest`. Requires Next.js 16+. MCP endpoint at `/_next/mcp`. |
| **supabase** | External | Yes | Yes | Multiple tools via Supabase MCP | Supabase database operations. Query execution. Schema introspection. | No | Configured in `.cursor/mcp.json`. Uses URL: `https://mcp.supabase.com/mcp`. |
| **github** | External | Yes | Yes | Multiple tools via GitHub MCP | GitHub repository operations. Issue management. Pull request operations. | No | Configured in `.cursor/mcp.json`. Uses Docker container `ghcr.io/github/github-mcp-server`. Requires `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable. |
| **git** | External | Yes | Yes | Multiple tools via Git MCP | Git operations. Commit, branch, diff operations. | No | Configured in `.cursor/mcp.json`. Uses `npx mcp-git@latest`. |
| **shell** | External | Yes | Yes | Multiple tools via Shell MCP | Shell command execution with permissions. | No | Configured in `.cursor/mcp.json`. Uses `npx mcp-shell@latest`. Has allowed commands: `pnpm install`, `pnpm run lint`, `pnpm run build`, `npx tailwindcss`, `turbo run dev`, `turbo run build`, `turbo run lint`. |
| **playwright** | External | Yes | Yes | Multiple tools via Playwright MCP | Browser automation. Page navigation. Element interaction. Screenshots. | No | Configured in `.cursor/mcp.json`. Uses `npx mcp-playwright@latest`. |

---

## Summary Statistics

### Internal MCP Servers
- **Total:** 7 servers
- **Configured:** 4 servers (57%)
- **Orphaned:** 3 servers (43%)
  - `aibos-ui-generator` - UI generation from natural language
  - `aibos-component-generator` - Component generation with 86 rules
  - `aibos-a11y-validation` - Accessibility validation

### External MCP Servers
- **Total:** 6 servers
- **Configured:** 6 servers (100%)
- **Orphaned:** 0 servers (0%)

### Overall
- **Total MCP Servers:** 13
- **Configured:** 10 servers (77%)
- **Orphaned:** 3 servers (23%)

---

## Orphaned Servers Analysis

### 1. **aibos-ui-generator** (Orphan)
- **Status:** Server exists, tools implemented, but NOT configured
- **Impact:** Cannot be used via Cursor MCP
- **Recommendation:** Add to `.cursor/mcp.json`:
  ```json
  "aibos-ui-generator": {
    "command": "node",
    "args": [".mcp/ui-generator/server.mjs"]
  }
  ```
- **Dependencies:** Requires `OPENAI_API_KEY` environment variable
- **Optional Dependencies:** `@ai-sdk/openai`, `ai` (in optionalDependencies)

### 2. **aibos-component-generator** (Orphan)
- **Status:** Server exists, tools implemented, but NOT configured
- **Impact:** Cannot be used via Cursor MCP
- **Recommendation:** Add to `.cursor/mcp.json`:
  ```json
  "aibos-component-generator": {
    "command": "node",
    "args": [".mcp/component-generator/server.mjs"]
  }
  ```
- **Dependencies:** Requires constitution files at `packages/ui/constitution/*.yml`
- **Features:** Most comprehensive validation (86 rules)

### 3. **aibos-a11y-validation** (Orphan)
- **Status:** Server exists, tools implemented, but NOT configured
- **Impact:** Cannot be used via Cursor MCP
- **Recommendation:** Add to `.cursor/mcp.json`:
  ```json
  "aibos-a11y-validation": {
    "command": "node",
    "args": [".mcp/a11y/server.mjs"]
  }
  ```
- **Features:** WCAG 2.1 compliance, contrast checking

---

## Configuration Status

### ✅ Configured Internal Servers
1. `aibos-filesystem` - Filesystem operations
2. `react-validation` - React component validation
3. `aibos-theme` - Theme/token management
4. `aibos-documentation` - Documentation automation

### ❌ Unconfigured Internal Servers (Orphans)
1. `aibos-ui-generator` - UI generation
2. `aibos-component-generator` - Component generation
3. `aibos-a11y-validation` - Accessibility validation

### ✅ Configured External Servers
1. `next-devtools` - Next.js MCP
2. `supabase` - Supabase MCP
3. `github` - GitHub MCP
4. `git` - Git MCP
5. `shell` - Shell MCP
6. `playwright` - Playwright MCP

---

## Key Discoveries

### 1. **Standardization Status**
- ✅ All internal MCP servers use `@modelcontextprotocol/sdk@^1.22.0`
- ✅ All have `engines.pnpm >=8.0.0` and `packageManager: pnpm@8.15.0`
- ✅ All have `author: "AIBOS Platform"` and `license: "MIT"`

### 2. **Governance Integration**
- ✅ All internal servers include governance metadata
- ✅ All use `registryTable: "mdm_tool_registry"`
- ✅ All include `toolId`, `domain`, `category`, `severity` in responses

### 3. **Performance Optimizations**
- ✅ Multiple servers use AST caching (react, a11y)
- ✅ CSS variable caching (theme)
- ✅ Manifest caching with mtime checking (documentation)

### 4. **Security Features**
- ✅ File locking (documentation)
- ✅ Rate limiting (documentation)
- ✅ Path validation (filesystem, documentation)
- ✅ Backup/versioning (documentation)

### 5. **Missing Configurations**
- ⚠️ 3 internal servers are orphaned (not in `.cursor/mcp.json`)
- ⚠️ These servers are fully functional but cannot be used via Cursor

---

## Recommendations

### Immediate Actions
1. **Configure Orphaned Servers:**
   - Add `aibos-ui-generator` to `.cursor/mcp.json`
   - Add `aibos-component-generator` to `.cursor/mcp.json`
   - Add `aibos-a11y-validation` to `.cursor/mcp.json`

2. **Environment Variables:**
   - Ensure `OPENAI_API_KEY` is set for `aibos-ui-generator`
   - Verify constitution files exist for `aibos-component-generator`

3. **Documentation:**
   - Update MCP documentation to include all 7 internal servers
   - Document orphaned servers and their configuration requirements

### Future Enhancements
1. **Automated Configuration:**
   - Create script to auto-detect and configure all internal MCP servers
   - Validate configuration completeness

2. **Health Checks:**
   - Add health check endpoints for all MCP servers
   - Monitor server availability and performance

3. **Integration Testing:**
   - Test all configured servers via Cursor
   - Verify tool availability and functionality

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS MCP Team


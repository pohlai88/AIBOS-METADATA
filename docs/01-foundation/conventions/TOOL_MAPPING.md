# Convention Validation Tool Mapping

> **Last Updated:** 2025-11-24  
> **Purpose:** Document mapping relationships between MCP server tools and manifest-defined tools

---

## Overview

The `aibos-convention-validation` MCP server implements high-level validation tools that cover multiple granular tools defined in convention manifests. This document maps the relationships between these tools.

**Note:** For status information, see [STATUS.md](./STATUS.md).

---

## Tool Mapping Strategy

### High-Level Tools (MCP Server)

The MCP server implements 4 high-level tools that aggregate multiple validations:

1. `validate_naming` - Covers all naming-related validations
2. `validate_folder_structure` - Covers all structure-related validations
3. `validate_documentation_format` - Covers all documentation-related validations
4. `validate_all_conventions` - Comprehensive validation of all conventions

---

## Detailed Mapping

### Naming Conventions

**MCP Tool:** `validate_naming`

**Covers Manifest Tools:**
- `validate_filenames` - Validated via `filePath` parameter
- `validate_component_names` - Validated via `componentName` parameter
- `validate_package_names` - Validated via `packageName` parameter
- `validate_imports` - Validated via dedicated `validate_imports` tool

**Usage:**
```typescript
// Validate filename
await validate_naming({ filePath: "button.tsx" });

// Validate component name
await validate_naming({ componentName: "Button" });

// Validate package name
await validate_naming({ packageName: "@aibos/ui" });
```

---

### Folder Structure

**MCP Tool:** `validate_folder_structure`

**Covers Manifest Tools:**
- `validate_directory_structure` - Validated via `structureType: "monorepo"`
- `validate_package_structure` - Validated via `structureType: "package"` (partial implementation)
- `validate_app_structure` - Validated via `structureType: "app"` (partial implementation)
- `validate_mcp_structure` - Validated via `structureType: "mcpServer"` (partial implementation)
- `validate_docs_structure` - Validated via dedicated `validate_docs_structure` tool

**Usage:**
```typescript
// Validate monorepo structure
await validate_folder_structure({
  directoryPath: ".",
  structureType: "monorepo"
});

// Validate package structure
await validate_folder_structure({
  directoryPath: "packages/ui",
  structureType: "package"
});
```

**Note:** Structure-specific validations are partially implemented. Full validation requires structure-specific rules in manifests.

---

### Documentation Format

**MCP Tool:** `validate_documentation_format`

**Covers Manifest Tools:**
- `validate_markdown_format` - Validates markdown structure
- `validate_code_examples` - Validated via dedicated `validate_code_examples` tool
- `validate_cross_references` - Validated via dedicated `validate_cross_references` tool
- `validate_file_naming` - Covered by `validate_naming` tool

**Usage:**
```typescript
// Validate markdown format
await validate_documentation_format({
  filePath: "docs/01-foundation/conventions/naming.md"
});
```

---

### Comprehensive Validation

**MCP Tool:** `validate_all_conventions`

**Covers:**
- All naming validations
- All structure validations
- All documentation validations

**Usage:**
```typescript
// Validate all conventions for a path
await validate_all_conventions({
  path: "packages/ui/src/components"
});
```

---

## Additional Validation Tools

The following tools are now implemented as dedicated validation tools:

1. **`validate_imports`** - Import naming validation
   - **Status:** ✅ Implemented
   - **Usage:** `await validate_imports({ filePath: "file.ts" })`
   - **Validates:** Import statement naming, package naming, component imports

2. **`validate_code_examples`** - Code example format validation
   - **Status:** ✅ Implemented
   - **Usage:** `await validate_code_examples({ filePath: "docs/file.md" })`
   - **Validates:** Code block format, language tags, example completeness

3. **`validate_cross_references`** - Cross-reference validation
   - **Status:** ✅ Implemented
   - **Usage:** `await validate_cross_references({ filePath: "docs/file.md" })`
   - **Validates:** Internal links, broken references, link text

4. **`validate_docs_structure`** - Documentation structure validation
   - **Status:** ✅ Implemented
   - **Usage:** `await validate_docs_structure({ directoryPath: "docs/" })`
   - **Validates:** Documentation directory structure, README presence, markdown files

---

## Integration with Other MCP Servers

### Coding Standards Tools

**Not in `aibos-convention-validation`:**

These tools are handled by other MCP servers:

- `validate_typescript_rules` → `react-validation`
- `validate_rsc_boundary` → `react-validation`
- `validate_server_actions` → `react-validation`
- `validate_styling_rules` → `aibos-component-generator`
- `validate_accessibility` → `aibos-a11y-validation`

**Rationale:** Coding standards require AST parsing and component analysis, which are better handled by specialized servers.

---

## Tool Discovery

### Via Registry

The `conventions.registry.json` lists granular tools for discovery:

```json
{
  "validation": {
    "tools": ["validate_filenames", "validate_component_names", ...],
    "mcpServers": ["aibos-convention-validation", ...]
  }
}
```

**Discovery Flow:**
1. Tool lookup finds granular tool name (e.g., `validate_filenames`)
2. Registry indicates `aibos-convention-validation` handles it
3. Call `validate_naming` with appropriate parameters

---

## Best Practices

### When to Use High-Level Tools

**Use `validate_naming` when:**
- Validating a single file or component
- Need quick validation
- Don't need granular error details

**Use `validate_all_conventions` when:**
- Validating entire directories
- Need comprehensive validation
- Pre-commit or CI/CD checks

### When to Use Granular Tools (Future)

**Use granular tools when:**
- Need specific validation only
- Want detailed error reporting
- Integrating with other systems

---

## Related Documentation

- [Status](./STATUS.md) - Current status, implementation history, and future enhancements overview
- [MCP Governance Guide](./MCP_GOVERNANCE_GUIDE.md) - Complete governance framework
- [Enforcement Rules](./enforcement-rules.md) - Enforcement mechanisms
- [MCP Configuration Guide](./MCP_CONFIGURATION_GUIDE.md) - Server configuration
- [Convention Validation MCP README](../../../.mcp/convention-validation/README.md)

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team  
**Purpose:** Tool mapping documentation only (see STATUS.md for status information)


# AIBOS Convention Validation MCP Server

> **Version:** 1.1.0  
> **Domain:** `convention_validation`  
> **Tool ID:** `aibos-convention-validation`

Validates code and documentation against convention manifests, enabling machine-enforceable governance.

---

## Features

- ✅ **Naming Validation** - Filenames, components, packages, imports
- ✅ **Folder Structure Validation** - Monorepo, package, app, docs structure
- ✅ **Documentation Format Validation** - Markdown structure, code examples, cross-references
- ✅ **Comprehensive Validation** - All conventions for a path
- ✅ **Import Validation** - Import naming and package conventions
- ✅ **Code Example Validation** - Code block format and completeness
- ✅ **Cross-Reference Validation** - Link validation and broken reference detection
- ✅ **Documentation Structure Validation** - Docs directory organization
- ✅ **Governance Metadata** - All responses include governance context
- ✅ **Manifest-Based** - Loads rules from convention manifests

---

## Tools

### `validate_naming`

Validates naming conventions (filenames, components, packages).

**Parameters:**
- `filePath` (optional): Path to file to validate
- `componentName` (optional): Component name to validate
- `packageName` (optional): Package name to validate

**Returns:**
- `valid`: Boolean indicating if all validations passed
- `errors`: Array of validation errors
- `warnings`: Array of validation warnings
- `governance`: Governance metadata

---

### `validate_folder_structure`

Validates folder structure against conventions.

**Parameters:**
- `directoryPath` (required): Path to directory to validate
- `structureType` (required): Type of structure (`monorepo`, `package`, `app`, `mcpServer`)

**Returns:**
- `valid`: Boolean indicating if structure is valid
- `errors`: Array of structure errors
- `warnings`: Array of structure warnings
- `governance`: Governance metadata

---

### `validate_documentation_format`

Validates markdown documentation format.

**Parameters:**
- `filePath` (required): Path to markdown file to validate

**Returns:**
- `valid`: Boolean indicating if format is valid
- `errors`: Array of format errors
- `warnings`: Array of format warnings
- `governance`: Governance metadata

---

### `validate_all_conventions`

Validates all conventions for a file or directory.

**Parameters:**
- `path` (required): Path to file or directory to validate

**Returns:**
- `valid`: Boolean indicating if all validations passed
- `errors`: Array of all validation errors
- `warnings`: Array of all validation warnings
- `conventions`: Object with per-convention results
- `governance`: Governance metadata

---

### `validate_imports`

Validates import naming conventions in TypeScript/JavaScript files.

**Parameters:**
- `filePath` (required): Path to file to validate imports

**Returns:**
- `valid`: Boolean indicating if all imports are valid
- `errors`: Array of import validation errors
- `warnings`: Array of import validation warnings
- `governance`: Governance metadata

---

### `validate_code_examples`

Validates code example format in markdown files.

**Parameters:**
- `filePath` (required): Path to markdown file to validate

**Returns:**
- `valid`: Boolean indicating if code examples are valid
- `errors`: Array of code example errors
- `warnings`: Array of code example warnings
- `governance`: Governance metadata

---

### `validate_cross_references`

Validates cross-references and links in markdown files.

**Parameters:**
- `filePath` (required): Path to markdown file to validate

**Returns:**
- `valid`: Boolean indicating if all links are valid
- `errors`: Array of broken link errors
- `warnings`: Array of link warnings
- `governance`: Governance metadata

---

### `validate_docs_structure`

Validates documentation directory structure.

**Parameters:**
- `directoryPath` (required): Path to documentation directory to validate

**Returns:**
- `valid`: Boolean indicating if structure is valid
- `errors`: Array of structure errors
- `warnings`: Array of structure warnings
- `governance`: Governance metadata

---

## Integration

### With Existing MCP Servers

This server complements:
- `react-validation` - Component validation
- `aibos-component-generator` - Component generation
- `aibos-documentation` - Documentation automation

### Convention Manifests

Loads manifests from:
- `docs/01-foundation/conventions/naming.manifest.json`
- `docs/01-foundation/conventions/folder-structure.manifest.json`
- `docs/01-foundation/conventions/documentation-standard.manifest.json`
- `docs/01-foundation/conventions/coding-standards.manifest.json`

---

## Usage Examples

### Validate File Naming

```typescript
await mcp_aibos-convention-validation_validate_naming({
  filePath: "packages/ui/src/components/button.tsx"
});
```

### Validate Component Name

```typescript
await mcp_aibos-convention-validation_validate_naming({
  componentName: "Button"
});
```

### Validate Folder Structure

```typescript
await mcp_aibos-convention-validation_validate_folder_structure({
  directoryPath: "packages/ui",
  structureType: "package"
});
```

### Validate All Conventions

```typescript
await mcp_aibos-convention-validation_validate_all_conventions({
  path: "packages/ui/src/components"
});
```

---

## Governance

All responses include governance metadata:

```json
{
  "governance": {
    "toolId": "aibos-convention-validation",
    "domain": "convention_validation",
    "registryTable": "mdm_tool_registry",
    "category": "naming",
    "severity": "error",
    "timestamp": "2025-11-24T..."
  }
}
```

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team


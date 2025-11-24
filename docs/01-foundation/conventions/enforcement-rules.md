# Convention Enforcement Rules

> **Last Updated:** 2025-11-24  
> **Status:** Active  
> **Purpose:** Define enforcement mechanisms for convention compliance

---

## Overview

This document defines enforcement rules and mechanisms for ensuring convention compliance across the AI-BOS Platform.

---

## Enforcement Levels

### Strict (Blocking)

**Applies To:**
- All naming conventions
- All folder structure rules
- All coding standards
- All documentation standards

**Mechanisms:**
- Pre-commit hooks block non-compliant code
- CI/CD fails on validation errors
- MCP tools reject invalid patterns

**Examples:**
- Filename not kebab-case → Block commit
- Component not PascalCase → Block commit
- Missing required directory → Block commit

---

### Advisory (Warning)

**Applies To:**
- Best practices
- Recommendations
- Optional patterns

**Mechanisms:**
- Warnings in validation output
- Documentation only
- No automated blocking

**Examples:**
- Suggest better naming
- Recommend folder organization
- Suggest documentation improvements

---

## Pre-Commit Hooks

### Hook Configuration

**Location:** `.husky/pre-commit` or `.git/hooks/pre-commit`

**Script:**
```bash
#!/bin/sh
# Pre-commit hook for convention validation

# Validate naming conventions
pnpm mcp:validate-naming --staged

# Validate folder structure
pnpm mcp:validate-structure --staged

# Validate coding standards
pnpm mcp:validate-coding --staged

# Exit with error if validation fails
if [ $? -ne 0 ]; then
  echo "❌ Convention validation failed. Please fix errors before committing."
  exit 1
fi
```

### Validation Commands

**Naming Validation:**
```bash
# Validate staged files
node .mcp/convention-validation/scripts/validate-staged.js --naming

# Validate specific file
node .mcp/convention-validation/scripts/validate-file.js packages/ui/src/components/button.tsx
```

**Structure Validation:**
```bash
# Validate package structure
node .mcp/convention-validation/scripts/validate-structure.js packages/ui --type package

# Validate app structure
node .mcp/convention-validation/scripts/validate-structure.js apps/web --type app
```

---

## CI/CD Integration

### GitHub Actions Workflow

**Location:** `.github/workflows/convention-validation.yml`

```yaml
name: Convention Validation

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate-conventions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Validate Naming Conventions
        run: pnpm mcp:validate-naming
      
      - name: Validate Folder Structure
        run: pnpm mcp:validate-structure
      
      - name: Validate Coding Standards
        run: pnpm mcp:validate-coding
      
      - name: Validate Documentation Format
        run: pnpm mcp:validate-docs
```

### Validation Scripts

**Package.json Scripts:**
```json
{
  "scripts": {
    "mcp:validate-naming": "node .mcp/convention-validation/scripts/validate-all.js --naming",
    "mcp:validate-structure": "node .mcp/convention-validation/scripts/validate-all.js --structure",
    "mcp:validate-coding": "node .mcp/convention-validation/scripts/validate-all.js --coding",
    "mcp:validate-docs": "node .mcp/convention-validation/scripts/validate-all.js --docs",
    "mcp:validate-all": "node .mcp/convention-validation/scripts/validate-all.js"
  }
}
```

---

## MCP Tool Integration

### Convention Validation MCP

**Server:** `aibos-convention-validation`

**Tools:**
- `validate_naming` - Naming conventions
- `validate_folder_structure` - Folder structure
- `validate_documentation_format` - Documentation format
- `validate_all_conventions` - All conventions

**Usage:**
```typescript
// Validate naming
await mcp_aibos-convention-validation_validate_naming({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button"
});

// Validate structure
await mcp_aibos-convention-validation_validate_folder_structure({
  directoryPath: "packages/ui",
  structureType: "package"
});
```

### Integration with Existing MCPs

**React Validation MCP:**
- Extends with naming validation
- Validates component names
- Validates file naming

**Component Generator MCP:**
- Validates generated component names
- Validates file structure
- Validates coding standards

**Documentation MCP:**
- Validates documentation format
- Validates file naming
- Validates structure

---

## Enforcement Rules by Convention

### Naming Conventions

**Strict Rules:**
- ✅ Filenames must be kebab-case
- ✅ Components must be PascalCase
- ✅ Functions must be camelCase
- ✅ Packages must be @aibos/[name]

**Enforcement:**
- Pre-commit: Block non-compliant files
- CI/CD: Fail on naming errors
- MCP: Reject invalid names

---

### Folder Structure

**Strict Rules:**
- ✅ Required directories must exist
- ✅ Package structure must match convention
- ✅ App structure must match convention
- ✅ MCP server structure must match convention

**Enforcement:**
- Pre-commit: Block missing directories
- CI/CD: Fail on structure errors
- MCP: Reject invalid structures

---

### Coding Standards

**Strict Rules:**
- ✅ TypeScript types required
- ✅ RSC boundaries enforced
- ✅ Server Actions validated
- ✅ Styling token-based only
- ✅ Accessibility required

**Enforcement:**
- Pre-commit: Block non-compliant code
- CI/CD: Fail on standard violations
- MCP: Reject invalid code

**Integration:**
- React Validation MCP validates RSC boundaries
- Component Generator MCP validates coding standards
- A11Y Validation MCP validates accessibility

---

### Documentation Standards

**Strict Rules:**
- ✅ Required markdown elements
- ✅ Code example format
- ✅ Cross-reference format
- ✅ File naming kebab-case

**Enforcement:**
- Pre-commit: Block invalid format
- CI/CD: Fail on format errors
- MCP: Reject invalid documentation

**Integration:**
- Documentation MCP validates format
- Convention Validation MCP validates structure

---

## Drift Detection

### Automated Checks

**Frequency:**
- Pre-commit: On every commit
- CI/CD: On every PR
- Scheduled: Daily validation runs

**Detection:**
- Compare current state with manifests
- Identify violations
- Report drift

**Response:**
- Block commits with violations
- Fail CI/CD on drift
- Alert on new violations

---

## Exception Handling

### Override Process

**When Allowed:**
- Legacy code migration
- Third-party dependencies
- Temporary workarounds

**Process:**
1. Document exception in code
2. Add to exception list
3. Set expiration date
4. Review quarterly

**Format:**
```typescript
// CONVENTION-EXCEPTION: [reason]
// Expires: YYYY-MM-DD
// Issue: #[issue-number]
const legacyComponent = // ...
```

---

## Monitoring & Reporting

### Validation Metrics

**Track:**
- Validation pass rate
- Error frequency by type
- Convention compliance rate
- Drift detection rate

**Reporting:**
- Weekly validation reports
- Monthly compliance dashboard
- Quarterly review

---

## Related Documentation

- [Naming Conventions](./naming.md)
- [Folder Structure](./folder-structure.md)
- [Coding Standards](./coding-standards.md)
- [Documentation Standards](./documentation-standard.md)
- [MCP Governance Guide](./MCP_GOVERNANCE_GUIDE.md)

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team


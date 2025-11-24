# MCP Governance Guide for Conventions

> **Last Updated:** 2025-11-24  
> **Status:** Active  
> **Purpose:** Machine-enforceable governance for conventions documentation

---

## Overview

This guide defines how conventions documentation is governed through MCP (Model Context Protocol) architecture, enabling machine-readable, validatable, and enforceable convention rules.

---

## Architecture

### Human Layer → Machine Layer

```
Human-Written Documentation (Markdown)
    ↓
Manifest (JSON) - Machine-readable rules
    ↓
Registry (JSON) - Discovery and indexing
    ↓
Validation Tools (MCP) - Enforcement
    ↓
Automation (MCP) - Continuous validation
```

---

## Components

### 1. Convention Documents (Human Layer)

**Location:** `docs/01-foundation/conventions/*.md`

**Purpose:** Human-readable documentation

**Files:**
- `naming.md` - Naming conventions
- `folder-structure.md` - Folder structure conventions
- `coding-standards.md` - Coding standards
- `documentation-standard.md` - Documentation standards

**Status:** ✅ Complete

---

### 2. Manifests (Machine Layer)

**Location:** `docs/01-foundation/conventions/*.manifest.json`

**Purpose:** Machine-readable rule definitions

**Structure:**
```json
{
  "id": "convention.[name]",
  "type": "convention",
  "version": "1.0.0",
  "governanceLevel": "strict",
  "rules": [...],
  "validation": {...},
  "related": {...}
}
```

**Files:**
- `naming.manifest.json` ✅
- `folder-structure.manifest.json` ✅
- `coding-standards.manifest.json` ✅
- `documentation-standard.manifest.json` ✅

**Status:** ✅ Complete

---

### 3. Registry (Discovery Layer)

**Location:** `docs/01-foundation/conventions/conventions.registry.json`

**Purpose:** MCP tool discovery and indexing

**Structure:**
```json
{
  "registry": {
    "type": "convention-registry",
    "entries": [
      {
        "id": "convention.naming",
        "path": "...",
        "manifest": "...",
        "validation": {...}
      }
    ]
  }
}
```

**Status:** ✅ Complete

---

## Governance Levels

### Strict (Enforcement Required)

**Applies To:**
- All convention documents
- All naming rules
- All coding standards
- All folder structure rules

**Enforcement:**
- Pre-commit validation
- CI/CD checks
- MCP tool validation
- Automated drift detection

---

### Advisory (Guidelines)

**Applies To:**
- Best practices
- Recommendations
- Optional patterns

**Enforcement:**
- Documentation only
- No automated blocking
- Manual review recommended

---

## Validation Tools

### Available MCP Tools

#### Naming Conventions
- `validate_filenames` - Check file naming patterns
- `validate_component_names` - Check component naming
- `validate_imports` - Check import naming
- `validate_package_names` - Check package naming

**MCP Servers:**
- `aibos-component-generator`
- `react-validation`

#### Folder Structure
- `validate_directory_structure` - Check root structure
- `validate_package_structure` - Check package structure
- `validate_app_structure` - Check app structure
- `validate_mcp_structure` - Check MCP server structure
- `validate_docs_structure` - Check documentation structure

**MCP Servers:**
- `aibos-filesystem`
- `aibos-documentation`

#### Coding Standards
- `validate_typescript_rules` - Check TypeScript compliance
- `validate_rsc_boundary` - Check RSC boundaries
- `validate_server_actions` - Check Server Action validation
- `validate_styling_rules` - Check styling compliance
- `validate_accessibility` - Check accessibility compliance

**MCP Servers:**
- `react-validation`
- `aibos-component-generator`
- `aibos-a11y-validation`

#### Documentation Standards
- `validate_markdown_format` - Check markdown structure
- `validate_code_examples` - Check code example format
- `validate_cross_references` - Check link validity
- `validate_file_naming` - Check documentation file naming

**MCP Servers:**
- `aibos-documentation`

---

## Integration Points

### Constitution Files

**Linkage:**
- `coding-standards.manifest.json` → `packages/ui/constitution/components.yml`
- `coding-standards.manifest.json` → `packages/ui/constitution/rsc.yml`
- `coding-standards.manifest.json` → `packages/ui/constitution/tokens.yml`

**Purpose:** Ensure conventions align with component constitution rules

---

### MCP Servers

**Integration:**
- Component Generator MCP uses naming conventions
- React Validation MCP uses coding standards
- Documentation MCP uses documentation standards
- Filesystem MCP uses folder structure conventions

**Purpose:** Automated enforcement during development

---

## Versioning

### Version Format

**Pattern:** `MAJOR.MINOR.PATCH`

**Examples:**
- `1.0.0` - Initial version
- `1.1.0` - Minor updates
- `2.0.0` - Breaking changes

### Version Tracking

**Location:** Manifest files (`version` field)

**Update Process:**
1. Update version in manifest
2. Update `lastUpdated` date
3. Document changes in CHANGELOG
4. Update registry entry

---

## Change Management

### Update Process

1. **Propose Change**
   - Create PR with documentation update
   - Update manifest if rules change
   - Update registry if new convention added

2. **Validate**
   - Run MCP validation tools
   - Check constitution alignment
   - Verify no breaking changes

3. **Review**
   - Documentation steward review
   - Team approval
   - Governance sign-off

4. **Merge**
   - Merge to main branch
   - Update version
   - Update registry
   - Sync to Nextra

---

## Drift Detection

### Automated Checks

**Pre-Commit:**
- Validate file naming
- Validate folder structure
- Validate code examples

**CI/CD:**
- Full convention validation
- Manifest compliance
- Registry integrity
- Constitution alignment

**MCP Tools:**
- Continuous validation
- Drift alerts
- Auto-correction suggestions

---

## Enforcement

### Strict Enforcement

**Blocking:**
- Pre-commit hooks block non-compliant code
- CI/CD fails on validation errors
- MCP tools reject invalid patterns

**Non-Blocking:**
- Warnings for advisory rules
- Suggestions for improvements
- Documentation updates

---

## Registry Integration

### Database Registry

**Table:** `mdm_convention_registry`

**Fields:**
- `id` - Convention identifier
- `type` - Convention type
- `version` - Version number
- `path` - Document path
- `manifest` - Manifest path
- `governanceLevel` - Enforcement level
- `status` - Active/Deprecated
- `lastUpdated` - Last update date

**Purpose:** Centralized discovery and governance

---

## MCP Tool Discovery

### How MCP Tools Find Conventions

1. **Registry Lookup**
   ```typescript
   const convention = await registry.get("convention.naming");
   const manifest = await loadManifest(convention.manifest);
   const rules = manifest.rules;
   ```

2. **Direct Manifest Access**
   ```typescript
   const manifest = await loadManifest("docs/01-foundation/conventions/naming.manifest.json");
   ```

3. **Constitution Linkage**
   ```typescript
   const codingStandards = await loadManifest("coding-standards.manifest.json");
   const constitution = await loadConstitution(codingStandards.constitution.components);
   ```

---

## Best Practices

### 1. Keep Manifests in Sync

- ✅ Update manifest when document changes
- ✅ Update version when rules change
- ✅ Update registry when new convention added

### 2. Validate Regularly

- ✅ Run validation tools before commit
- ✅ Check CI/CD validation results
- ✅ Review drift detection reports

### 3. Document Changes

- ✅ Update CHANGELOG
- ✅ Update version numbers
- ✅ Update lastUpdated dates

### 4. Link Related Resources

- ✅ Link to constitution files
- ✅ Link to related conventions
- ✅ Link to MCP servers

---

## Troubleshooting

### Manifest Not Found

**Issue:** MCP tool cannot find manifest

**Solution:**
1. Check manifest file exists
2. Verify path in registry
3. Check file permissions

### Validation Failing

**Issue:** Validation tool reports errors

**Solution:**
1. Check rule definitions in manifest
2. Verify constitution alignment
3. Review validation tool logs

### Registry Out of Sync

**Issue:** Registry doesn't match manifests

**Solution:**
1. Rebuild registry from manifests
2. Verify all conventions registered
3. Check registry integrity

---

## Related Documentation

- [Naming Conventions](./naming.md)
- [Folder Structure](./folder-structure.md)
- [Coding Standards](./coding-standards.md)
- [Documentation Standards](./documentation-standard.md)
- [Documentation Governance](../../08-governance/documentation-governance.md)
- [MCP Architecture](../../07-mcp/servers/architecture.md)

---

## Status

| Component | Status | Version |
|-----------|--------|---------|
| Convention Documents | ✅ Complete | 1.0.0 |
| Manifests | ✅ Complete | 1.0.0 |
| Registry | ✅ Complete | 1.0.0 |
| Governance Guide | ✅ Complete | 1.0.0 |
| Validation Tools | ⏳ Next Phase | - |
| Enforcement Rules | ⏳ Next Phase | - |

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team  
**Next Review:** Quarterly


# Documentation Structure Guide

> **Next.js monorepo best practices** for documentation organization.

This document describes the documentation structure for the AIBOS Platform monorepo, following Next.js and industry best practices.

---

## 📐 Structure Principles

Following Next.js monorepo best practices:

1. **Co-location** - Documentation lives with the code it documents
2. **Single Source of Truth (SSOT)** - Each topic has one authoritative location
3. **High-level at Root** - Root docs provide overviews and links to detailed docs
4. **Package Autonomy** - Each package manages its own documentation

---

## 📁 Directory Structure

```
AIBOS-PLATFORM/
├── docs/                          # Root platform documentation
│   ├── README.md                  # Documentation index
│   ├── design-system-guide.md     # High-level design system overview
│   ├── DOCUMENTATION_STRUCTURE.md # This file - Structure guide
│   ├── RESTRUCTURING_SUMMARY.md  # Documentation restructuring summary
│   └── ui-design-system/         # Legacy directory (historical reference only)
│       ├── README.md              # Migration notice
│       └── VALIDATION_REPORT.md   # Historical validation report
│
├── packages/
│   ├── ui/
│   │   └── ui-docs/               # UI package documentation (SSOT)
│   │       ├── README.md          # UI docs index
│   │       ├── GOVERNANCE.md      # Document control rules
│   │       ├── 01-foundation/     # Design system foundation
│   │       ├── 02-components/    # Component documentation
│   │       ├── 04-integration/    # Integration guides
│   │       └── 05-guides/        # Developer guides
│   │
│   ├── utils/
│   │   └── README.md              # Utils package documentation
│   │
│   └── types/
│       └── README.md              # Types package documentation
│
└── apps/
    └── web/
        └── README.md              # Web app documentation
```

---

## 📚 Documentation Categories

### Root Documentation (`docs/`)

**Purpose:** High-level platform documentation and cross-cutting concerns.

**Contents:**
- Platform overviews
- Monorepo structure guides
- Cross-package integration docs
- Links to package-specific documentation

**Examples:**
- `docs/design-system-guide.md` - High-level overview linking to detailed UI docs
- `docs/README.md` - Documentation index

**Rule:** Root docs should link to detailed docs, not duplicate them.

---

### Package Documentation (`packages/*/`)

**Purpose:** Package-specific documentation co-located with code.

**Structure:**
- `README.md` - Package overview and quick start
- `docs/` or `*-docs/` - Detailed documentation (if needed)
- Inline code comments - API documentation

**Examples:**
- `packages/ui/ui-docs/` - Complete UI documentation
- `packages/utils/README.md` - Utils package docs

**Rule:** Each package owns its documentation.

---

### Application Documentation (`apps/*/`)

**Purpose:** Application-specific documentation.

**Contents:**
- Setup and configuration
- Deployment guides
- Application-specific patterns

**Examples:**
- `apps/web/README.md` - Next.js app documentation

---

## 🎯 Documentation Standards

### Markdown Format

All documentation uses Markdown for consistency and version control.

### File Naming

- Use kebab-case: `getting-started.md`, `design-tokens.md`
- Be descriptive: `figma-sync.md` not `sync.md`
- Use numbers for ordering: `01-foundation/`, `02-components/`

### Structure

Each documentation file should include:

1. **Title** - Clear, descriptive heading
2. **Overview** - Brief description and purpose
3. **Content** - Main documentation
4. **Related Links** - Cross-references to other docs
5. **Last Updated** - Maintenance metadata

---

## 🔗 Cross-Referencing

### Linking Between Docs

**Within Same Package:**
```markdown
[Component Documentation](./02-components/)
```

**To Another Package:**
```markdown
[UI Documentation](../../packages/ui/ui-docs/)
```

**To Root Docs:**
```markdown
[Design System Overview](../../docs/design-system-guide.md)
```

### Avoid Duplication

Instead of duplicating content, link to the SSOT:

```markdown
<!-- ❌ Bad: Duplicates content -->
See the token system documentation here...

<!-- ✅ Good: Links to SSOT -->
See [Token System Documentation](../packages/ui/ui-docs/01-foundation/tokens.md)
```

---

## 📋 Documentation Checklist

When creating new documentation:

- [ ] Place in appropriate location (root, package, or app)
- [ ] Use descriptive file names (kebab-case)
- [ ] Include title and overview
- [ ] Add cross-references to related docs
- [ ] Update documentation index (if applicable)
- [ ] Follow governance rules (for UI docs)
- [ ] Validate against MCP tools (for UI docs)

---

## 🚫 Anti-Patterns

### ❌ Don't: Duplicate Content

**Bad:**
- Root `docs/` contains detailed component documentation
- Multiple docs with overlapping content

**Good:**
- Root `docs/` contains overviews and links
- Detailed docs in package directories

### ❌ Don't: Mix Concerns

**Bad:**
- UI documentation in root `docs/`
- Platform docs in package directories

**Good:**
- UI docs in `packages/ui/ui-docs/`
- Platform docs in root `docs/`

### ❌ Don't: Create Orphaned Docs

**Bad:**
- Documentation not linked from any index
- No clear entry point

**Good:**
- All docs linked from appropriate index
- Clear navigation structure

---

## 📖 Next.js Best Practices

This structure follows Next.js monorepo best practices:

1. **Co-location** - Docs with code
2. **Package Autonomy** - Each package owns its docs
3. **Clear Hierarchy** - Root → Package → Component
4. **Single Source of Truth** - No duplication

---

## 🔄 Maintenance

### Regular Reviews

- **Weekly:** Check for broken links
- **Monthly:** Review for accuracy
- **Quarterly:** Comprehensive structure review

### Update Process

1. Create/update documentation in appropriate location
2. Update relevant indexes
3. Add cross-references
4. Validate (for UI docs)
5. Commit with descriptive message

---

## 📚 Related Documentation

- [UI Documentation Governance](../packages/ui/ui-docs/GOVERNANCE.md) - Document control rules
- [Design System Guide](./design-system-guide.md) - Design system overview
- [UI Documentation Index](../packages/ui/ui-docs/README.md) - Complete UI docs

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Platform Team


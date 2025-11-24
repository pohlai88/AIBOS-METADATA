# Design Package Consolidation Proposal

> **Proposed solution** for consolidating `packages/design` into `packages/ui` to eliminate duplication and confusion.

---

## 🎯 Executive Summary

**Problem:** `packages/design` and `packages/ui` have overlapping concerns, with `packages/design/tokens/` being empty/unused.

**Solution:** Consolidate `packages/ui/constitution/` into `packages/ui/constitution/` and remove the empty `tokens/` directory.

**Impact:** Internal reorganization only - no breaking changes to public APIs.

---

## 📊 Current State Analysis

### `packages/design/` Structure

```
packages/design/
├── constitution/          # ✅ Active - Design rules (YAML/JSON)
│   ├── components.yml     # Component validation rules (86 rules)
│   ├── rsc.yml           # React Server Component rules
│   └── tokens.json        # Token governance rules
└── tokens/                # ❌ Empty/Unused
```

**Usage:**
- Constitution files used by `tools/mcp-component-generator.mjs`
- Constitution files referenced in documentation
- `tokens/` directory is empty and unused

### `packages/ui/` Structure

```
packages/ui/
├── src/
│   ├── design/
│   │   └── tokens.ts      # ✅ Active - TypeScript token implementation
│   ├── components/         # ✅ Active - React components
│   └── ...
└── ui-docs/               # ✅ Active - Documentation
```

**Usage:**
- `tokens.ts` used by all components
- Components implement design system
- Documentation is SSOT for UI

---

## ⚠️ Issues Identified

### 1. Empty/Unused Directory
- `packages/design/tokens/` is empty
- No references found in codebase
- Creates confusion about purpose

### 2. Separation of Rules and Implementation
- Constitution rules in `packages/design/`
- Implementation in `packages/ui/`
- Rules are UI-specific, not general design rules

### 3. Discoverability
- Design rules not co-located with implementation
- Harder to find and maintain
- Violates Next.js co-location best practices

---

## ✅ Proposed Solution: Consolidate into `packages/ui`

### New Structure

```
packages/ui/
├── constitution/          # ✅ NEW - Moved from packages/design/
│   ├── components.yml
│   ├── rsc.yml
│   └── tokens.json
├── src/
│   ├── design/
│   │   └── tokens.ts      # ✅ Keep - Token implementation
│   └── ...
└── ui-docs/               # ✅ Keep - Documentation
```

**Removed:**
- ❌ `packages/design/` (entire directory)

---

## 🎯 Rationale

### 1. **Co-location Best Practice**
- Design rules belong with UI implementation
- Easier to maintain and discover
- Follows Next.js monorepo best practices

### 2. **Single Source of Truth**
- All design system code in one package
- Clear ownership (`@aibos/ui`)
- Reduces confusion

### 3. **Eliminates Duplication**
- Removes empty `tokens/` directory
- Consolidates related files
- Simplifies structure

### 4. **UI-Specific Rules**
- Constitution rules are UI-specific
- Not general design/architecture rules
- Belong with UI package

---

## 🔄 Migration Plan

### Step 1: Move Constitution Files

```bash
# Move constitution directory
mv packages/design/constitution packages/ui/constitution
```

### Step 2: Update File References

**Files to Update:**

1. **`tools/mcp-component-generator.mjs`**
   ```javascript
   // Before
   fs.readFileSync("packages/ui/constitution/tokens.json", "utf8")
   fs.readFileSync("packages/ui/constitution/rsc.yml", "utf8")
   fs.readFileSync("packages/ui/constitution/components.yml", "utf8")
   
   // After
   fs.readFileSync("packages/ui/constitution/tokens.json", "utf8")
   fs.readFileSync("packages/ui/constitution/rsc.yml", "utf8")
   fs.readFileSync("packages/ui/constitution/components.yml", "utf8")
   ```

2. **`scripts/validate-ui-constitution.ts`**
   - Update any references to `packages/ui/constitution/`

3. **`README.md`**
   - Update reference: `packages/ui/constitution/` → `packages/ui/constitution/`

4. **Documentation Files**
   - Update all references in docs

### Step 3: Remove Empty Directory

```bash
# Remove packages/design directory
rm -rf packages/design
```

### Step 4: Add README to Constitution

Create `packages/ui/constitution/README.md`:

```markdown
# UI Constitution

Design system rules and governance for the `@aibos/ui` package.

## Files

- `components.yml` - Component structure and validation rules (86 rules)
- `rsc.yml` - React Server Component boundary rules
- `tokens.json` - Token governance and hierarchy rules

## Usage

These rules are used by:
- `tools/mcp-component-generator.mjs` - Component validation
- `scripts/validate-ui-constitution.ts` - UI validation

## Related

- Implementation: `src/design/tokens.ts`
- Documentation: `ui-docs/`
```

---

## 📋 Impact Assessment

### Files Requiring Updates

| File | Changes Required |
|------|------------------|
| `tools/mcp-component-generator.mjs` | Update 3 file paths |
| `scripts/validate-ui-constitution.ts` | Update file paths (if any) |
| `README.md` | Update reference |
| Documentation files | Update references |

### Breaking Changes

**None** - This is an internal reorganization. No public API changes.

### Benefits

- ✅ Eliminates empty/unused directory
- ✅ Co-locates related files
- ✅ Follows Next.js best practices
- ✅ Improves discoverability
- ✅ Simplifies structure

---

## ✅ Approval Checklist

- [ ] Review proposal
- [ ] Approve consolidation
- [ ] Execute migration
- [ ] Update all references
- [ ] Test validation scripts
- [ ] Update documentation
- [ ] Remove `packages/design/`

---

## 📚 Related Documentation

- [Design Package Analysis](./DESIGN_PACKAGE_ANALYSIS.md) - Detailed analysis
- [Next.js Best Practices](./NEXTJS_BEST_PRACTICES.md) - Monorepo guidelines
- [Documentation Structure](./DOCUMENTATION_STRUCTURE.md) - Doc organization

---

**Proposed Date:** 2024  
**Status:** Awaiting Approval  
**Maintained By:** AIBOS Platform Team


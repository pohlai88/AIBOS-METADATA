# 📋 Content Mapping: Old → New Structure

> **Migration Guide: packages/ui/ui-docs/ → docs/**  
> **Date:** 2025-11-24

---

## 🗺️ Complete Mapping

### Foundation Documentation

| Old Location | New Location | Status | Notes |
|-------------|--------------|--------|-------|
| `packages/ui/ui-docs/01-foundation/philosophy.md` | `docs/01-foundation/philosophy/principles.md` | ✅ Migrate | Merge with design-language.md |
| `packages/ui/ui-docs/01-foundation/tokens.md` | `docs/01-foundation/ui-system/tokens.md` | ✅ Migrate | Direct move |
| `packages/ui/ui-docs/01-foundation/colors.md` | `docs/01-foundation/ui-system/colors.md` | ✅ Migrate | Direct move |
| `packages/ui/ui-docs/01-foundation/typography.md` | `docs/01-foundation/ui-system/typography.md` | ✅ Migrate | Direct move |
| `packages/ui/ui-docs/01-foundation/spacing.md` | `docs/01-foundation/ui-system/spacing.md` | ✅ Migrate | Direct move |
| `packages/ui/ui-docs/01-foundation/accessibility.md` | `docs/01-foundation/ui-system/a11y-guidelines.md` | ✅ Migrate | Rename to a11y-guidelines.md |

### Component Documentation

| Old Location | New Location | Status | Notes |
|-------------|--------------|--------|-------|
| `packages/ui/ui-docs/02-components/README.md` | `docs/04-developer/ui/components/README.md` | ✅ Migrate | Update for developer audience |
| `packages/ui/ui-docs/02-components/primitives/button.md` | `docs/04-developer/ui/components/button.md` | ✅ Migrate | Move to flat structure |
| `packages/ui/ui-docs/02-components/primitives/card.md` | `docs/04-developer/ui/components/card.md` | ✅ Migrate | Move to flat structure |
| `packages/ui/ui-docs/02-components/primitives/input.md` | `docs/04-developer/ui/components/input.md` | ✅ Migrate | Move to flat structure |
| `packages/ui/ui-docs/02-components/primitives/badge.md` | `docs/04-developer/ui/components/badge.md` | ✅ Migrate | Move to flat structure |
| `packages/ui/ui-docs/02-components/compositions/dialog.md` | `docs/04-developer/ui/components/dialog.md` | ✅ Migrate | Move to flat structure |
| `packages/ui/ui-docs/02-components/layouts/app-shell.md` | `docs/04-developer/ui/layouts/app-shell.md` | ✅ Migrate | Keep in layouts folder |

### Integration Documentation

| Old Location | New Location | Status | Notes |
|-------------|--------------|--------|-------|
| `packages/ui/ui-docs/04-integration/figma-sync.md` | `docs/07-mcp/tools/sync-figma.md` | ✅ Migrate | MCP tool documentation |
| `packages/ui/ui-docs/04-integration/tailwind.md` | `docs/04-developer/ui/tailwind.md` | ✅ Migrate | Developer guide |
| `packages/ui/ui-docs/04-integration/react-mcp-proposal.md` | `docs/99-archive/2025-11-24/proposals/react-mcp-proposal.md` | ✅ Archive | Decision made |
| `packages/ui/ui-docs/04-integration/react-mcp-decision.md` | `docs/99-archive/2025-11-24/decisions/react-mcp-decision.md` | ✅ Archive | Historical decision |
| `packages/ui/ui-docs/04-integration/ARCHITECTURE_SUMMARY.md` | `docs/99-archive/2025-11-24/summaries/ARCHITECTURE_SUMMARY.md` | ✅ Archive | Outdated |
| `packages/ui/ui-docs/04-integration/COMPLETE_IMPLEMENTATION.md` | `docs/99-archive/2025-11-24/outdated/COMPLETE_IMPLEMENTATION.md` | ✅ Archive | Outdated |
| `packages/ui/ui-docs/04-integration/IMPLEMENTATION_ROADMAP.md` | `docs/99-archive/2025-11-24/outdated/IMPLEMENTATION_ROADMAP.md` | ✅ Archive | Outdated |

### Guides

| Old Location | New Location | Status | Notes |
|-------------|--------------|--------|-------|
| `packages/ui/ui-docs/05-guides/getting-started.md` | `docs/06-users/staff/beginners-guide.md` | ✅ Migrate | Update for end-user audience |

### Meta Documentation

| Old Location | New Location | Status | Notes |
|-------------|--------------|--------|-------|
| `packages/ui/ui-docs/README.md` | `docs/README.md` | ✅ Migrate | Update for new structure |
| `packages/ui/ui-docs/GOVERNANCE.md` | `docs/08-governance/documentation-governance.md` | ✅ Migrate | Merge with governance docs |
| `packages/ui/ui-docs/CHANGELOG.md` | `docs/CHANGELOG.md` | ✅ Migrate | Keep as root changelog |
| `packages/ui/ui-docs/STRUCTURE.md` | `docs/STRUCTURE_COMPLETE.md` | ✅ Migrate | Update to new structure |
| `packages/ui/ui-docs/COMPONENT_DOCUMENTATION_STATUS.md` | `docs/99-archive/2025-11-24/summaries/COMPONENT_DOCUMENTATION_STATUS.md` | ✅ Archive | Outdated status |
| `packages/ui/ui-docs/VALIDATION_SUMMARY.md` | `docs/99-archive/2025-11-24/summaries/VALIDATION_SUMMARY.md` | ✅ Archive | Outdated validation |
| `packages/ui/ui-docs/SECTION_2_SUMMARY.md` | `docs/99-archive/2025-11-24/summaries/SECTION_2_SUMMARY.md` | ✅ Archive | Outdated summary |
| `packages/ui/ui-docs/02-components/TEMPLATE_PROPOSAL.md` | `docs/99-archive/2025-11-24/proposals/TEMPLATE_PROPOSAL.md` | ✅ Archive | Template finalized |

---

## 📊 Migration Summary

### Files to Migrate: 15
- Foundation: 6 files
- Components: 8 files
- Integration: 2 files (active)
- Guides: 1 file
- Meta: 4 files (active)

### Files to Archive: 8
- Proposals: 2 files
- Decisions: 1 file
- Summaries: 3 files
- Outdated: 2 files

### New Placeholders to Create: ~50
- Architecture: ~15 files
- Modules: ~36 files (12 modules × 3 files each)
- Operations: ~12 files
- Users: ~10 files
- MCP: ~8 files
- Governance: ~6 files

---

## 🚀 Migration Steps

1. **Create new structure** (all folders)
2. **Archive outdated files** (move to 99-archive)
3. **Migrate active content** (using mapping above)
4. **Create placeholders** (for missing sections)
5. **Update references** (links, imports, etc.)
6. **Validate structure** (against manifest)
7. **Update Nextra** (_meta.json, sync scripts)

---

**Last Updated:** 2025-11-24  
**Status:** ✅ Ready for Migration


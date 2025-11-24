# 📚 Single Source of Truth (SSOT) Clarification

> **Documentation Architecture - SSOT Definition**  
> **Date:** 2025-11-24

---

## 🎯 The Problem

You're absolutely right to question this! There are currently **two `docs` directories** which is confusing:

1. **`docs/`** - Comprehensive documentation structure (SSOT)
2. **`apps/docs/`** - Nextra documentation site (presentation layer)

---

## ✅ The Correct Architecture

### **SSOT: `docs/`** ✅

**`docs/` is the Single Source of Truth** for all documentation:
- ✅ Complete comprehensive structure (01-09, 99-archive)
- ✅ All migrated content
- ✅ All placeholders
- ✅ Templates
- ✅ Manifest
- ✅ Scripts

### **Presentation Layer: `apps/docs/`** 📄

**`apps/docs/` is the Nextra site** that displays the documentation:
- 📄 Next.js + Nextra application
- 📄 Syncs content FROM `docs/` TO `apps/docs/pages/`
- 📄 Generates the documentation website
- 📄 **NOT the SSOT** - just a presentation layer

---

## 🔄 The Relationship

```
docs/ (SSOT)
  ↓ (sync)
apps/docs/pages/ (Nextra site)
  ↓ (build)
Documentation Website
```

**Flow:**
1. **Edit** → Always edit in `docs/` (SSOT)
2. **Sync** → `apps/docs/scripts/sync-docs.ts` copies from `docs/` to `apps/docs/pages/`
3. **Build** → Nextra builds the site from `apps/docs/pages/`
4. **Deploy** → Documentation website is generated

---

## ❌ Current Issue

The sync script and README are **outdated**:
- ❌ `apps/docs/README.md` says SSOT is `packages/ui/ui-docs/` (WRONG - that's old)
- ❌ `apps/docs/scripts/sync-docs.ts` syncs from `../../docs` (CORRECT path, but comment is wrong)
- ❌ `apps/docs/pages/` contains old synced content from before migration

---

## ✅ Solution

1. **Update sync script** - Ensure it correctly syncs from `docs/` (already correct path)
2. **Update README** - Change SSOT reference from `packages/ui/ui-docs/` to `docs/`
3. **Re-sync** - Run sync to update `apps/docs/pages/` with new structure
4. **Clean up** - Remove old content from `apps/docs/pages/`

---

## 📋 Correct SSOT Definition

### **SSOT: `docs/`**
- Location: `D:\AIBOS-PLATFORM\docs\`
- Purpose: Single Source of Truth for all documentation
- Structure: Comprehensive 01-09 structure
- Content: All migrated files, placeholders, templates

### **Presentation: `apps/docs/`**
- Location: `D:\AIBOS-PLATFORM\apps\docs\`
- Purpose: Nextra documentation site
- Structure: Next.js app with Nextra
- Content: Synced from `docs/` (not edited directly)

---

## 🎯 Why Two Directories?

**This is actually correct architecture:**

1. **`docs/`** = Source files (markdown, editable)
2. **`apps/docs/`** = Next.js app (builds the website)

**Similar to:**
- `src/` = Source code
- `dist/` = Built output

**But for documentation:**
- `docs/` = Source documentation
- `apps/docs/pages/` = Synced content for Nextra

---

## ✅ Action Items

1. ✅ Update `apps/docs/README.md` - Fix SSOT reference
2. ✅ Update sync script comments - Clarify source is `docs/`
3. ✅ Re-sync documentation - Update `apps/docs/pages/` with new structure
4. ✅ Clean old content - Remove outdated files from `apps/docs/pages/`

---

**Last Updated:** 2025-11-24  
**Status:** ✅ SSOT Clarified - `docs/` is the Single Source of Truth


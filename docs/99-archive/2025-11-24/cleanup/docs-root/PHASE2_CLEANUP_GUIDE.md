# 🧹 Phase 2: Cleanup Guide

> **Ensuring Clean Repo After Migration**  
> **Date:** 2025-11-24

---

## ✅ Your Understanding is Correct!

**Yes, you are absolutely right!** After Phase 2 completion, the repo should be:

1. ✅ **Clean** - Old files removed from `packages/ui/ui-docs/`
2. ✅ **Functional** - All necessary documents in correct locations
3. ✅ **Schema Compliant** - Following `ui-docs.manifest.json` requirements

---

## 🎯 Current State

### What We Have Now:
- ✅ **New Structure:** `docs/` with all migrated content
- ⚠️ **Old Files:** Still exist in `packages/ui/ui-docs/` (29 files)
- ✅ **Migration:** Complete (20 files migrated)
- ⚠️ **Cleanup:** Not yet done (old files still present)

### What Should Happen:
- ✅ Remove migrated files from `packages/ui/ui-docs/`
- ✅ Remove archived files from `packages/ui/ui-docs/`
- ✅ Keep only what's needed (if anything)
- ✅ Validate against manifest schema

---

## 🧹 Cleanup Process

### Step 1: Verify Migration ✅

**Status:** ✅ Already verified
- All 20 files migrated correctly
- All files exist in new location
- Migration validated

### Step 2: Remove Old Files 🧹

**Script:** `docs/scripts/cleanup-old-files.ts`

**What it does:**
- Removes migrated files from `packages/ui/ui-docs/`
- Removes archived files from `packages/ui/ui-docs/`
- Keeps directory structure if needed
- Verifies migration before removal

**Files to Remove:**
- 20 migrated files
- 9 archived files
- Total: 29 files

### Step 3: Validate Clean State ✅

**Script:** `docs/scripts/validate-clean-repo.ts`

**What it validates:**
- ✅ All files exist in new location (`docs/`)
- ✅ Old files removed from `packages/ui/ui-docs/`
- ✅ Structure follows manifest schema
- ✅ No duplicates
- ✅ All required sections exist

---

## 📋 Cleanup Checklist

### Before Cleanup:
- [x] ✅ Phase 2 migration complete
- [x] ✅ All files migrated to `docs/`
- [x] ✅ Migration validated
- [x] ✅ Archive created

### Cleanup Steps:
- [ ] 🧹 Run cleanup script
- [ ] ✅ Verify old files removed
- [ ] ✅ Validate clean state
- [ ] ✅ Confirm schema compliance

### After Cleanup:
- [ ] ✅ Repo is clean
- [ ] ✅ All docs in `docs/`
- [ ] ✅ No duplicates
- [ ] ✅ Schema compliant

---

## 🚀 Running Cleanup

### Option 1: Automated Cleanup

```bash
# Run cleanup script
pnpm exec tsx docs/scripts/cleanup-old-files.ts

# Validate clean state
pnpm exec tsx docs/scripts/validate-clean-repo.ts
```

### Option 2: Manual Review

1. Review files in `packages/ui/ui-docs/`
2. Verify all are migrated to `docs/`
3. Remove files manually
4. Run validation script

---

## ✅ Expected Final State

### `docs/` Structure:
```
docs/
├── 01-foundation/     ✅ Complete
├── 02-architecture/   ✅ Complete
├── 03-modules/        ✅ Complete
├── 04-developer/      ✅ Complete
├── 05-operations/     ✅ Complete
├── 06-users/          ✅ Complete
├── 07-mcp/            ✅ Complete
├── 08-governance/     ✅ Complete
├── 09-reference/      ✅ Complete
└── 99-archive/        ✅ Complete
```

### `packages/ui/ui-docs/`:
```
packages/ui/ui-docs/
└── (empty or minimal - only if needed for package-specific docs)
```

---

## 📊 Validation Criteria

### Clean Repo Criteria:
1. ✅ All migrated files exist in `docs/`
2. ✅ Old files removed from `packages/ui/ui-docs/`
3. ✅ Structure matches manifest schema
4. ✅ No duplicate files
5. ✅ All required sections exist

### Schema Compliance:
- ✅ Follows `ui-docs.manifest.json` structure
- ✅ All sections defined in manifest exist
- ✅ File locations match manifest
- ✅ Templates available
- ✅ Governance rules followed

---

## 🎯 Next Steps

1. **Run Cleanup:**
   ```bash
   pnpm exec tsx docs/scripts/cleanup-old-files.ts
   ```

2. **Validate:**
   ```bash
   pnpm exec tsx docs/scripts/validate-clean-repo.ts
   ```

3. **Confirm:**
   - ✅ Repo is clean
   - ✅ All docs functional
   - ✅ Schema compliant

---

## ✅ Summary

**Your understanding is 100% correct!**

After Phase 2 completion:
- ✅ Repo will be **clean** (old files removed)
- ✅ Repo will be **functional** (all docs in correct locations)
- ✅ Repo will **follow schema** (manifest compliance)

**Current Status:** Migration complete, cleanup pending

**Next Action:** Run cleanup script to achieve clean state

---

**Last Updated:** 2025-11-24  
**Status:** ✅ Ready for Cleanup


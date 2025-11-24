# Filesystem MCP Optimization Plan

> **Performance optimization and documentation cleanup**

---

## Current State Analysis

### Filesystem MCP Configuration

**Current `allowedPaths`:**
```json
"allowedPaths": [
  "./apps/web/app",
  "./apps/web/lib",
  "./packages/ui/src/components",
  "./packages/ui/src"
]
```

**Issues:**
1. ⚠️ `./packages/ui/src` is redundant (includes `./packages/ui/src/components`)
2. ⚠️ Missing important directories:
   - `./packages/ui/src/design` (tokens)
   - `./packages/ui/src/hooks`
   - `./packages/ui/src/layouts`
   - `./packages/ui/src/lib`
   - `./packages/types/src`
   - `./packages/utils/src`
3. ⚠️ `./apps/web/lib` might not exist
4. ⚠️ No exclusion of build artifacts, node_modules, etc.

---

## Performance Optimization Strategy

### 1. Optimize Allowed Paths

**Principle:** Include only source code directories, exclude build artifacts

**Optimized Paths:**
```json
"allowedPaths": [
  // Apps
  "./apps/web/app",
  "./apps/web/lib",
  
  // UI Package - Source Code
  "./packages/ui/src/components",
  "./packages/ui/src/design",
  "./packages/ui/src/hooks",
  "./packages/ui/src/layouts",
  "./packages/ui/src/lib",
  
  // UI Package - Configuration
  "./packages/ui/constitution",
  
  // Other Packages
  "./packages/types/src",
  "./packages/utils/src",
  
  // MCP Servers
  "./.mcp"
]
```

**Exclusions (handled by MCP automatically):**
- `node_modules/` - Already excluded
- `.next/` - Build artifacts
- `dist/` - Build artifacts
- `.turbo/` - Build cache

---

### 2. Documentation Cleanup

**Root Documentation Files to Clean Up:**

**Temporary/Validation Reports (Move to `docs/archive/`):**
- `MCP_CONFIGURATION_UPDATE.md`
- `MCP_CROSS_VALIDATION_SUMMARY.md`
- `MCP_FILE_TYPE_VALIDATION_COMPLETE.md`
- `MCP_FILE_TYPE_VALIDATION_FINAL.md`
- `MCP_FILE_TYPE_VALIDATION.md`
- `MCP_INTEGRATION_GUIDE.md`
- `MCP_OVERLAP_ANALYSIS.md`
- `MCP_SETUP_COMPLETE.md`
- `MCP_UPGRADE_SUMMARY.md`
- `REACT_MCP_INSTALLATION_COMPLETE.md`
- `REACT_MCP_VALIDATION_REPORT.md`
- `TAILWIND_MCP_UPGRADE_COMPLETE.md`
- `UI_GENERATOR_MCP_CONVERSION_COMPLETE.md`
- `RESTRUCTURING_SUMMARY.md`

**Keep in Root (Important):**
- `README.md` - Main project README
- `WORKFLOW.md` - If actively used

**Move to `docs/`:**
- All validation/setup reports
- All MCP-related documentation
- All restructuring summaries

---

## Implementation Plan

### Phase 1: Optimize Filesystem MCP
1. Update `.cursor/mcp.json` with optimized paths
2. Verify paths exist
3. Test MCP access

### Phase 2: Clean Up Documentation
1. Create `docs/archive/` directory
2. Move temporary reports to archive
3. Consolidate MCP documentation
4. Update references if needed

### Phase 3: Verify
1. Test filesystem MCP performance
2. Verify documentation is accessible
3. Update any broken references

---

## Expected Performance Improvements

**Before:**
- Broad paths causing unnecessary file scanning
- Redundant path inclusions
- Missing important directories

**After:**
- Focused paths for faster access
- No redundant inclusions
- Complete coverage of source code
- Better performance with fewer files to scan

---

**Status:** Ready for implementation


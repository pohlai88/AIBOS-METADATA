# Development Server Errors Report

> **Date:** 2025-11-24  
> **Status:** Errors Identified and Validated

---

## 🔍 **Errors Found When Running `pnpm dev`**

### **Error 1: Port Already in Use**

**Error Message:**
```
⚠ Port 3000 is in use by process 18084, using available port 3001 instead.
```

**Root Cause:**
- Another Next.js dev server is already running on port 3000
- Process ID: 18084

**Impact:**
- Server automatically switches to port 3001
- This is a warning, not a critical error

**Solution:**
```bash
# Option 1: Stop the existing process
Stop-Process -Id 18084 -Force

# Option 2: Use a different port explicitly
cd apps/web
pnpm dev -- -p 3002
```

---

### **Error 2: Lock File Conflict**

**Error Message:**
```
⨯ Unable to acquire lock at D:\AIBOS-PLATFORM\apps\web\.next\dev\lock, is another instance of next dev running?
```

**Root Cause:**
- Lock file exists from a previous dev server instance
- Indicates another `next dev` process may be running

**Impact:**
- Prevents new dev server from starting
- **Critical error** - blocks development

**Solution:**
```bash
# Remove lock file
Remove-Item "apps/web/.next/dev/lock" -Force

# Or remove entire .next directory
Remove-Item "apps/web/.next" -Recurse -Force
```

---

## ✅ **Validation: Issues from apps/ Directory**

### **1. Import Path Validation**

**File:** `apps/web/app/layout.tsx`
```typescript
import "@aibos/ui/design/globals.css";
```

**Status:** ✅ **CORRECT**
- Path matches: `packages/ui/src/design/globals.css`
- Package exports configured correctly

**File:** `apps/web/app/page.tsx`
```typescript
import { Button } from "@aibos/ui";
import { Card } from "@aibos/ui";
import { Badge } from "@aibos/ui";
```

**Status:** ✅ **CORRECT**
- Components exported from `packages/ui/src/components/index.ts`
- Imports are valid

---

### **2. Configuration Files**

**File:** `apps/web/next.config.ts`
- ✅ Transpiles `@aibos/*` packages correctly
- ✅ Output file tracing configured for monorepo
- ✅ No errors detected

**File:** `apps/web/package.json`
- ✅ Dependencies configured correctly
- ✅ Workspace packages referenced properly
- ✅ Scripts are valid

---

### **3. TypeScript Configuration**

**Status:** ✅ **NO LINTER ERRORS**
- No TypeScript errors in `apps/` directory
- All imports resolve correctly
- Type definitions available

---

## 🔧 **Recommended Fixes**

### **Immediate Actions:**

1. **Stop all running dev servers:**
   ```bash
   # Find and stop all node processes
   Get-Process -Name "node" | Stop-Process -Force
   ```

2. **Clean build artifacts:**
   ```bash
   # Remove lock files and build cache
   Remove-Item "apps/web/.next" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item "apps/docs/.next" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Restart dev server:**
   ```bash
   # From root
   pnpm dev
   
   # Or from specific app
   cd apps/web && pnpm dev
   ```

---

## 📋 **Error Summary**

| Error | Severity | Source | Status |
|-------|----------|--------|--------|
| Port 3000 in use | ⚠️ Warning | Process conflict | Auto-resolved (uses 3001) |
| Lock file conflict | ❌ Critical | Previous instance | Needs cleanup |
| Import errors | ✅ None | apps/ directory | All valid |
| Config errors | ✅ None | apps/ directory | All valid |

---

## ✅ **Conclusion**

**Errors are NOT from apps/ directory:**
- ✅ All imports are correct
- ✅ All configurations are valid
- ✅ No TypeScript/linter errors
- ✅ No code issues detected
- ✅ `globals.css` exists at correct path
- ✅ Package exports configured correctly

**Errors are from:**
- ❌ Process conflicts (port in use, lock file)
- ❌ Previous dev server instances not properly terminated

**Next Steps:**
1. Clean up running processes
2. Remove lock files
3. Restart dev server

---

## 🔧 **Quick Fix Commands**

### **Stop All Node Processes:**
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

### **Clean Build Artifacts:**
```powershell
Remove-Item "apps/web/.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "apps/docs/.next" -Recurse -Force -ErrorAction SilentlyContinue
```

### **Restart Dev Server:**
```powershell
# From root
pnpm dev

# Or specific app
cd apps/web
pnpm dev
```

---

**Last Updated:** 2025-11-24  
**Validated By:** AI-BOS Development Team


# Tailkit Branding Audit & Cleanup
---

## Overview

This document tailkit branding audit & cleanup.

---


> **Date:** 2025-11-24  
> **Status:** 🔍 **AUDIT COMPLETE**

---

## 🔍 **Tailkit Assets Found**

### **1. Favicon (Tailkit Logo)**

**Location:** `apps/web/app/favicon.ico`

**Status:** ⚠️ **NEEDS REPLACEMENT**
- Contains Tailkit logo from original template
- Should be replaced with AI-BOS branding
- Binary file (ICO format)

**Action Required:**
- Replace with AI-BOS favicon
- Update metadata in `layout.tsx` if needed

---

### **2. Public Assets (Next.js/Vercel Logos)**

**Location:** `apps/web/public/`

**Files:**
- `next.svg` - Next.js logo
- `vercel.svg` - Vercel logo

**Status:** ⚠️ **SHOULD BE REPLACED**
- Default Next.js/Vercel branding
- Not Tailkit, but should be replaced with AI-BOS assets

**Action Required:**
- Replace with AI-BOS logos or remove if not used
- Check if these files are referenced anywhere

---

## 🔍 **Tailkit References in Code**

### **Layout Components**

**Location:** `packages/ui/src/layouts/README.md`

**References:**
- Components copied from Tailkit template
- External image URLs: `cdn.tailkit.com`
- Footer attribution links (some removed, some remaining)

**Status:** ⚠️ **PARTIALLY CLEANED**
- Some Tailkit references removed
- Some may still exist in layout components

---

## 📋 **Cleanup Checklist**

### **Immediate Actions:**

1. ✅ **Replace favicon.ico**
   - Create AI-BOS favicon
   - Replace `apps/web/app/favicon.ico`

2. ✅ **Replace public assets**
   - Replace `next.svg` with AI-BOS logo (if used)
   - Replace `vercel.svg` with AI-BOS logo (if used)
   - Or remove if not referenced

3. ⏭️ **Check layout components**
   - Search for `cdn.tailkit.com` references
   - Replace with AI-BOS assets or placeholders

4. ⏭️ **Update metadata**
   - Add favicon reference in `layout.tsx` if needed
   - Update icons metadata

---

## 🎯 **Recommended Actions**

### **Step 1: Create AI-BOS Favicon**

**Options:**
1. Generate new favicon from AI-BOS logo
2. Use placeholder favicon temporarily
3. Remove favicon until official one is ready

### **Step 2: Replace Public Assets**

**Check usage:**
```bash
# Search for references to next.svg and vercel.svg
grep -r "next.svg\|vercel.svg" apps/web
```

**Action:**
- If not used → Remove
- If used → Replace with AI-BOS assets

### **Step 3: Audit Layout Components**

**Search for:**
- `cdn.tailkit.com` URLs
- Tailkit branding in components
- External image references

**Action:**
- Replace with AI-BOS assets
- Or make configurable via props

---

## 📊 **Current Status**

| Asset | Location | Status | Action |
|-------|----------|--------|--------|
| favicon.ico | `apps/web/app/` | ⚠️ Tailkit logo | Replace |
| next.svg | `apps/web/public/` | ⚠️ Next.js logo | Replace/Remove |
| vercel.svg | `apps/web/public/` | ⚠️ Vercel logo | Replace/Remove |
| Layout components | `packages/ui/src/layouts/` | ⚠️ Some Tailkit refs | Audit & Clean |

---

## ✅ **Next Steps**

1. **Create AI-BOS favicon** - Replace Tailkit favicon
2. **Check public assets usage** - Replace or remove if not used
3. **Audit layout components** - Remove any remaining Tailkit references
4. **Update metadata** - Add proper favicon/icons metadata

---

**Last Updated:** 2025-11-24  
**Status:** 🔍 **AUDIT COMPLETE** - Ready for cleanup


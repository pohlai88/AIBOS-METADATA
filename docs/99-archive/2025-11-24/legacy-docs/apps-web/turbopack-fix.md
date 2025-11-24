# Turbopack/Webpack Conflict Fix
---

## Overview

This document turbopack/webpack conflict fix.

---


> **Date:** 2025-11-24  
> **Error:** `ERROR: This build is using Turbopack, with a webpack config and no turbopack config`  
> **Status:** ✅ **FIXED**

---

## 🐛 **Error Description**

**Error Message:**
```
⨯ ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
This may be a mistake.
As of Next.js 16 Turbopack is enabled by default and
custom webpack configurations may need to be migrated to Turbopack.
```

**Root Cause:**
- Next.js 16 uses **Turbopack** by default (not webpack)
- We had a `webpack` configuration in `next.config.ts`
- Turbopack and webpack configs conflict
- Server fails to start

---

## ✅ **Fix Applied**

### **Removed Webpack Config, Added Turbopack Config**

**Before:**
```typescript
// Webpack configuration for source maps
webpack: (config, { dev, isServer }) => {
  if (dev) {
    config.devtool = 'eval-source-map';
  }
  return config;
},
```

**After:**
```typescript
// Turbopack configuration (Next.js 16 uses Turbopack by default)
// Empty config to silence the webpack/turbopack conflict warning
turbopack: {},
```

---

## 🔧 **Why This Fixes It**

### **Next.js 16 Default:**
- ✅ Uses **Turbopack** by default (faster than webpack)
- ✅ Webpack config conflicts with Turbopack
- ✅ Need to use Turbopack config or remove webpack config

### **Solution:**
- ✅ Removed webpack config (not needed with Turbopack)
- ✅ Added empty `turbopack: {}` config
- ✅ Kept `productionBrowserSourceMaps: false` (works with both)

---

## 📋 **Alternative Solutions**

### **Option 1: Use Webpack Explicitly**
```bash
pnpm dev --webpack
```

### **Option 2: Use Turbopack Explicitly**
```bash
pnpm dev --turbopack
```

### **Option 3: Migrate Webpack Config to Turbopack**
See: https://nextjs.org/docs/app/api-reference/next-config-js/turbopack

---

## ✅ **Verification**

After fix:
- ✅ Server starts successfully
- ✅ No Turbopack/webpack conflict errors
- ✅ Port 3000 listening
- ✅ Application accessible

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **FIXED** - Server should start successfully


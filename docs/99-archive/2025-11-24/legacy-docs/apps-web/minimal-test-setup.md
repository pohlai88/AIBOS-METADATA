# Minimal Test Setup - Hydration Debug
---

## Overview

This document minimal test setup - hydration debug.

---


> **Date:** 2025-11-24  
> **Purpose:** Isolate hydration issues by using minimal hardcoded code

---

## ✅ **Simplified Files**

### **1. `apps/web/app/layout.tsx`**

**Simplified to:**
- ✅ Basic HTML structure
- ✅ No custom fonts
- ✅ No `suppressHydrationWarning`
- ✅ No head elements
- ✅ Only imports CSS

**Code:**
```typescript
import type { Metadata } from "next";
import "@aibos/ui/design/globals.css";

export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

### **2. `apps/web/app/page.tsx`**

**Simplified to:**
- ✅ No `"use client"` directive
- ✅ No React hooks
- ✅ No state management
- ✅ No browser APIs
- ✅ No UI components
- ✅ Pure server component with hardcoded HTML

**Code:**
```typescript
export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>AI-BOS Platform</h1>
      <p>Minimal test page - no client components, no state, no hooks</p>
    </div>
  );
}
```

---

## 🎯 **What This Tests**

### **If hydration errors persist:**
- ❌ Issue is NOT from app code
- ❌ Issue is likely from:
  - CSS imports (`globals.css`)
  - Next.js configuration
  - Build process
  - Browser extensions
  - Third-party scripts

### **If hydration errors disappear:**
- ✅ Issue WAS from app code
- ✅ We can add back features one by one to identify the culprit

---

## 📋 **Next Steps**

1. **Refresh browser** (Ctrl+Shift+R)
2. **Check console** for hydration errors
3. **Report results:**
   - ✅ Errors gone → Issue was in app code
   - ❌ Errors persist → Issue is elsewhere (CSS, config, etc.)

---

**Last Updated:** 2025-11-24  
**Status:** ✅ Minimal test setup complete


# Favicon Automatic Detection in Next.js
---

## Overview

This document favicon automatic detection in next.js.

---


> **Date:** 2025-11-24  
> **Question:** Where is favicon.ico referenced if not in layout.tsx or page.tsx?  
> **Answer:** Next.js automatically detects it!

---

## 🔍 **How Next.js Handles Favicon**

### **Automatic Detection (Next.js 13+ App Router)**

In Next.js 13+ with the App Router, **favicon.ico is automatically detected and used** without any explicit code references.

**Location:** `apps/web/app/favicon.ico`

**How it works:**
1. Next.js scans the `app/` directory for special file names
2. Files named `favicon.ico`, `icon.png`, `apple-icon.png`, etc. are automatically detected
3. Next.js automatically generates `<link>` tags in the HTML `<head>`
4. **No code needed** - it's convention-based!

---

## 📋 **Next.js File-Based Metadata**

Next.js automatically handles these files in the `app/` directory:

| File Name | Purpose | Auto-Generated Tag |
|-----------|---------|-------------------|
| `favicon.ico` | Browser tab icon | `<link rel="icon" href="/favicon.ico">` |
| `icon.png` | App icon | `<link rel="icon" href="/icon.png">` |
| `apple-icon.png` | Apple touch icon | `<link rel="apple-touch-icon" href="/apple-icon.png">` |
| `manifest.json` | Web app manifest | `<link rel="manifest" href="/manifest.json">` |

---

## 🔍 **Why You Don't See It in Code**

### **Current Files:**

**`apps/web/app/layout.tsx`:**
```typescript
export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
  // ❌ No favicon reference - not needed!
};
```

**`apps/web/app/page.tsx`:**
```typescript
export default function Home() {
  // ❌ No favicon reference - not needed!
  return <div>...</div>;
}
```

**Why it still works:**
- Next.js **automatically** scans `app/favicon.ico`
- Generates the `<link>` tag in the HTML `<head>` automatically
- No explicit import or reference needed!

---

## 🎯 **How to Verify**

### **1. Check Generated HTML**

When you view the page source, you'll see:
```html
<head>
  <!-- Other head tags -->
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  <!-- Generated automatically by Next.js -->
</head>
```

### **2. Check Browser Tab**

- The favicon appears in the browser tab
- Even though it's not explicitly referenced in code

### **3. Check Network Tab**

- Browser requests `/favicon.ico` automatically
- Next.js serves it from `app/favicon.ico`

---

## 🔧 **How to Replace Tailkit Favicon**

### **Option 1: Replace the File (Recommended)**

Simply replace `apps/web/app/favicon.ico` with your AI-BOS favicon:
```bash
# Replace the file
cp /path/to/aibos-favicon.ico apps/web/app/favicon.ico
```

**No code changes needed** - Next.js will automatically use the new file!

### **Option 2: Use Metadata API (Explicit)**

If you want to be explicit, you can add it to metadata:

```typescript
// apps/web/app/layout.tsx
export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
  icons: {
    icon: '/favicon.ico', // Explicit reference
  },
};
```

**But this is optional** - Next.js will use `app/favicon.ico` automatically even without this.

---

## 📊 **Current Status**

| Item | Status | Location |
|------|--------|----------|
| Favicon file | ⚠️ Tailkit logo | `apps/web/app/favicon.ico` |
| Code reference | ✅ Not needed | Next.js auto-detects |
| Browser display | ✅ Working | Shows Tailkit favicon |
| Action needed | ⚠️ Replace file | Replace with AI-BOS favicon |

---

## ✅ **Summary**

**Answer to your question:**
- **Where is it referenced?** Nowhere in code!
- **How does it work?** Next.js automatically detects `app/favicon.ico`
- **Why don't you see it?** It's convention-based, not code-based
- **What to do?** Just replace the file - no code changes needed!

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **EXPLAINED** - Next.js automatic favicon detection


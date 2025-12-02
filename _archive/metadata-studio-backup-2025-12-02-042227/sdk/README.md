# 📦 Controlled Vocabulary SDK

**Version: 1.0.0**  
**OpenMetadata Compatible: v1.4.0**

---

## 🎯 What Is This?

The **Controlled Vocabulary SDK** is a versioned SDK that enforces approved business terminology across all applications in your monorepo.

**Key Features:**
- ✅ **Versioned** - SDK version must match across all apps
- ✅ **OpenMetadata Compatible** - Follows OpenMetadata schema patterns
- ✅ **Type-Safe** - TypeScript enforces approved terms only
- ✅ **Runtime Validated** - Zod schemas catch unapproved terms
- ✅ **Deployment Protected** - Blocks deployments with version mismatches

---

## 🚀 Quick Start

### 1. Install SDK

```bash
pnpm add @aibos/types@^1.0.0
```

### 2. Initialize in Your App

```typescript
// app/layout.tsx
import { initializeSDK } from '../lib/sdk-guard';

// This runs on app startup
initializeSDK();
```

### 3. Use Approved Terms

```typescript
import { APPROVED_FINANCE_TERMS, type ApprovedFinanceTerm } from "@aibos/types";

// ✅ GOOD: Using approved term
const term: ApprovedFinanceTerm = APPROVED_FINANCE_TERMS.revenue;

// ❌ BAD: Using unapproved term
const term: ApprovedFinanceTerm = "sales";  // TypeScript error!
```

---

## 📊 Why Versioning?

### The Problem (Without Versioning)

```
App A (frontend): Uses SDK v1.0.0 (has "revenue" term)
App B (backend):  Uses SDK v1.1.0 (renamed "revenue" to "total_revenue")

Result: Runtime errors! Frontend sends "revenue", backend expects "total_revenue" ❌
```

### The Solution (With Versioning)

```
✅ Version checking on app startup
✅ Deployment blocked if versions don't match
✅ All apps guaranteed to use same terminology
✅ No runtime errors from term mismatches
```

---

## 🔒 Version Compatibility Rules

### Major Version (Breaking Changes)

```
v1.0.0 → v2.0.0  ❌ NOT Compatible
```

**Breaking changes include:**
- Removing approved terms
- Renaming approved terms  
- Changing term structure

**Action required:** All apps must upgrade simultaneously

### Minor Version (New Features)

```
v1.0.0 → v1.1.0  ✅ Compatible
```

**Non-breaking changes include:**
- Adding new approved terms
- Adding new domains
- Improving documentation

**Action:** Upgrade at your convenience

### Patch Version (Bug Fixes)

```
v1.0.0 → v1.0.1  ✅ Compatible
```

**Bug fixes only:**
- Documentation fixes
- Type fixes
- No term changes

**Action:** Auto-update

---

## 📋 Version Checking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  1. App Starts                                                │
│     ↓                                                         │
│  2. initializeSDK() called                                    │
│     ↓                                                         │
│  3. Check: Client SDK version === Server SDK version?        │
│     ├─ YES → ✅ Continue startup                             │
│     └─ NO  → ❌ Throw error, block deployment                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Update Client SDK Version

When you upgrade `@aibos/types`, update the client version:

```typescript
// apps/web/lib/sdk-guard.ts

export const CLIENT_SDK_VERSION = "1.0.0";  // ← Update this!
```

### Version Checking Logic

```typescript
// metadata-studio/sdk/version.ts

export function isVersionCompatible(
  clientVersion: string,
  serverVersion: string
): boolean {
  const [clientMajor] = clientVersion.split('.').map(Number);
  const [serverMajor] = serverVersion.split('.').map(Number);
  
  // Major versions must match
  return clientMajor === serverMajor;
}
```

---

## 🎨 OpenMetadata Integration

This SDK follows **OpenMetadata schema patterns** for compatibility with OpenMetadata tools.

**OpenMetadata Features Supported:**
- ✅ Glossary Terms (Business Glossary)
- ✅ Term Categorization (Domains)
- ✅ Term Relationships (Blocked terms = synonyms)
- ✅ Versioning (SDK versioning)

**OpenMetadata Schema Version:** v1.4.0

**Learn more:** https://open-metadata.org/

---

## 📊 SDK Metadata

```typescript
import { SDK_METADATA, getSDKInfo } from "@aibos/metadata-studio/sdk/version";

console.log(SDK_METADATA);
// {
//   name: "@aibos/controlled-vocabulary-sdk",
//   version: "1.0.0",
//   description: "Controlled Vocabulary SDK - Central Nervous System...",
//   openMetadataCompatible: "1.4.0",
//   author: "AIBOS Platform Team",
//   license: "UNLICENSED"
// }

console.log(getSDKInfo());
// {
//   ...SDK_METADATA,
//   buildDate: "2025-12-01T...",
//   compatibleWith: "^1.0.0"
// }
```

---

## 🚨 Error Handling

### Version Mismatch Error

```
❌ SDK Version Mismatch!
Client SDK: v1.0.0
Server SDK: v1.1.0

Please update your SDK to v^1.0.0
Run: pnpm update @aibos/types
```

**How to fix:**
1. Update `@aibos/types` package
2. Update `CLIENT_SDK_VERSION` in `lib/sdk-guard.ts`
3. Rebuild and redeploy

---

## 🎯 Deployment Checklist

Before deploying, ensure:

- [ ] ✅ All apps use same SDK major version
- [ ] ✅ `CLIENT_SDK_VERSION` matches `SERVER_SDK_VERSION`
- [ ] ✅ `pnpm install` runs successfully
- [ ] ✅ `pnpm build` runs successfully
- [ ] ✅ SDK initialization logs show ✅ success
- [ ] ✅ No version mismatch errors in logs

---

## 📚 Related Documentation

- **Controlled Vocabulary Guide:** `docs/guidelines/CONTROLLED-VOCABULARY-GUIDE.md`
- **Quick Reference:** `docs/guidelines/CONTROLLED-VOCABULARY-QUICK-REFERENCE.md`
- **Auto Type Generation:** `packages/types/AUTO-TYPE-GENERATION.md`
- **OpenMetadata:** https://open-metadata.org/

---

## 🔄 Upgrade Guide

### Upgrading from v1.0.0 to v1.1.0

```bash
# 1. Update package
pnpm update @aibos/types

# 2. Update client version
# Edit apps/web/lib/sdk-guard.ts
export const CLIENT_SDK_VERSION = "1.1.0";

# 3. Test
pnpm dev

# 4. Deploy
pnpm build && pnpm start
```

---

## ❓ FAQ

**Q: Why do I need to update CLIENT_SDK_VERSION manually?**  
A: This ensures intentional version upgrades and prevents accidental mismatches.

**Q: Can I use different SDK versions in different apps?**  
A: No! All apps must use the same major version for consistency.

**Q: What if I forget to update CLIENT_SDK_VERSION?**  
A: The app will throw an error on startup and deployment will fail. This is intentional!

**Q: How often should I upgrade the SDK?**  
A: Minor/patch versions: upgrade anytime. Major versions: coordinate team upgrade.

---

**Last Updated:** December 1, 2025  
**Maintained By:** AIBOS Platform Team  
**Version:** 1.0.0


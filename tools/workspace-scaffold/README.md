# 🚀 AIBOS Workspace Scaffold Generator

**Quick start tool for creating new packages/apps in the AIBOS monorepo**

All packages are pre-configured with:
- ✅ AIBOS Controlled Vocabulary SDK
- ✅ TypeScript configuration
- ✅ ESLint configuration
- ✅ Monorepo workspace setup
- ✅ Version checking (prevents deployment mismatches)
- ✅ Best practices built-in

---

## 🎯 What Can You Create?

### 1. 🌐 Next.js Application

Full-stack Next.js 16 app with:
- App Router
- AIBOS SDK integrated
- SDK version checking
- TypeScript + ESLint
- Hot reload

### 2. ⚡ Hono API Service

Lightweight API service with:
- Hono framework (fast!)
- Zod validation
- AIBOS SDK integrated
- TypeScript + ESLint
- Auto-restart on changes

### 3. 📦 Shared Library

Reusable TypeScript library:
- Type-safe
- Exportable to other packages
- Vitest for testing
- TypeScript + ESLint

---

## 🚀 Quick Start

### Option 1: Interactive Mode (Recommended)

```bash
cd tools/workspace-scaffold
pnpm install
node cli.mjs
```

**Then follow the prompts:**
1. Select package type (App / Service / Library)
2. Enter package name
3. Enter description
4. Confirm

**Done!** ✅ Your package is created with all configuration!

---

### Option 2: Direct Commands

```bash
# From root of monorepo:

# Create Next.js app
pnpm create:app

# Create Hono service
pnpm create:service

# Create shared library
pnpm create:package
```

---

## 📋 What Gets Created?

### For Next.js Application

```
apps/your-app/
├── app/
│   ├── layout.tsx          # Root layout with SDK initialization
│   └── page.tsx            # Home page with SDK example
├── lib/
│   └── sdk-guard.ts        # SDK version checking
├── package.json            # Dependencies + scripts
├── tsconfig.json           # TypeScript config
├── next.config.ts          # Next.js config
└── README.md               # Documentation
```

**Pre-configured dependencies:**
- `next@16.0.3`
- `react@19.2.0`
- `@aibos/types` (Controlled Vocabulary SDK)
- TypeScript, ESLint

**SDK integration:**
```typescript
// Automatically included in layout.tsx
import { initializeSDK } from "../lib/sdk-guard";
initializeSDK();  // Version checking on startup!
```

---

### For Hono API Service

```
apps/your-service/
├── src/
│   └── index.ts            # Main API entry point
├── package.json            # Dependencies + scripts
├── tsconfig.json           # TypeScript config
└── README.md               # Documentation
```

**Pre-configured dependencies:**
- `hono@^4.0.0` (lightweight API framework)
- `zod@^3.23.8` (schema validation)
- `@aibos/types` (Controlled Vocabulary SDK)
- TypeScript, ESLint, tsx (hot reload)

**SDK integration:**
```typescript
// Automatically included in index.ts
import { initializeControlledVocabularySDK } from '@aibos/types';
initializeControlledVocabularySDK("1.0.0");
```

---

### For Shared Library

```
packages/your-library/
├── src/
│   └── index.ts            # Main export
├── package.json            # Dependencies + scripts
├── tsconfig.json           # TypeScript config
└── README.md               # Documentation
```

**Pre-configured:**
- TypeScript with declaration files
- Vitest for testing
- ESLint

---

## 🎓 Examples

### Example 1: Create a New Marketing App

```bash
$ node cli.mjs

🚀 AIBOS Workspace Scaffold Generator 🚀

? What do you want to create? › Next.js Application
? Package name: › marketing-website
? Package description: › Customer-facing marketing website
? Create app "marketing-website" in apps/marketing-website? › Yes

🔨 Generating package...
   ✅ package.json
   ✅ tsconfig.json
   ✅ next.config.ts
   ✅ app/layout.tsx
   ✅ app/page.tsx
   ✅ lib/sdk-guard.ts
   ✅ README.md

✅ Package created successfully!

📋 Next steps:
   1. cd apps/marketing-website
   2. pnpm install
   3. pnpm dev
```

---

### Example 2: Create an Analytics Service

```bash
$ node cli.mjs

? What do you want to create? › Hono API Service
? Package name: › analytics-api
? Package description: › Analytics data collection API
? Create service "analytics-api" in apps/analytics-api? › Yes

✅ Package created successfully!
```

---

### Example 3: Create a Utility Library

```bash
$ node cli.mjs

? What do you want to create? › Shared Library
? Package name: › date-utils
? Package description: › Date manipulation utilities
? Create package "date-utils" in packages/date-utils? › Yes

✅ Package created successfully!
```

---

## ✅ Built-in Features

### 1. SDK Version Checking

All generated packages automatically check SDK version on startup:

```typescript
// Prevents deployment with wrong SDK version!
export const CLIENT_SDK_VERSION = "1.0.0";

export function initializeSDK() {
  assertVersionCompatibility(CLIENT_SDK_VERSION);
  // ↑ Throws error if mismatch!
}
```

**Benefit:** Prevents runtime errors from SDK version mismatches

---

### 2. Controlled Vocabulary Integration

All packages can use approved terms:

```typescript
import { APPROVED_FINANCE_TERMS } from "@aibos/types";

// ✅ Type-safe, only approved terms
const accountType = APPROVED_FINANCE_TERMS.revenue;
```

**Benefit:** Consistent terminology across all packages

---

### 3. TypeScript Configuration

All packages inherit from root `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

**Benefit:** Consistent TypeScript settings across monorepo

---

### 4. ESLint Configuration

All packages use shared ESLint config:

```json
{
  "scripts": {
    "lint": "eslint . --config ../../eslint.config.mjs"
  }
}
```

**Benefit:** Consistent code quality standards

---

## 🎨 Customization

### Modify Templates

Edit `cli.mjs` functions:
- `generateNextApp()` - Next.js app template
- `generateHonoService()` - Hono service template
- `generateLibraryPackage()` - Library template

### Add New Package Types

Add to `PACKAGE_TYPES` object:

```javascript
const PACKAGE_TYPES = {
  // ... existing types
  
  custom: {
    name: 'Custom Package Type',
    description: 'Your custom template',
    directory: 'apps',
  },
};
```

Then implement `generateCustom()` function.

---

## 🔧 Troubleshooting

### Error: "Name must be lowercase..."

**Problem:** Package name contains uppercase or special characters

**Fix:** Use lowercase letters, numbers, and hyphens only
- ✅ `my-app`, `analytics-api`, `date-utils`
- ❌ `MyApp`, `analytics_api`, `date.utils`

---

### Error: "Directory already exists"

**Problem:** Package with that name already exists

**Fix:** Choose a different name or delete existing package

---

### SDK Version Mismatch Error

**Problem:** Generated package has wrong SDK version

**Fix:** Update `CLIENT_SDK_VERSION` in generated `lib/sdk-guard.ts`

```typescript
export const CLIENT_SDK_VERSION = "1.0.0";  // Update this!
```

---

## 📚 After Creating a Package

### 1. Install Dependencies

```bash
cd apps/your-new-package
pnpm install
```

### 2. Start Development

```bash
# For Next.js apps:
pnpm dev          # http://localhost:3000

# For Hono services:
pnpm dev          # http://localhost:3001

# For libraries:
pnpm type-check
pnpm test
```

### 3. Add to Workspace

The package is automatically added to the workspace because it's in `apps/*` or `packages/*` (configured in `pnpm-workspace.yaml`).

---

## 🎯 Best Practices

### 1. Naming Conventions

- **Apps:** `{purpose}-{type}` (e.g., `marketing-website`, `admin-dashboard`)
- **Services:** `{domain}-api` (e.g., `analytics-api`, `auth-api`)
- **Libraries:** `{purpose}-utils` (e.g., `date-utils`, `validation-utils`)

### 2. Dependencies

- **Only add what you need**
- Use `workspace:*` for internal packages
- Keep versions aligned (use `pnpm syncpack`)

### 3. Documentation

- Keep README.md up to date
- Document environment variables
- Add usage examples

---

## 🚀 Advanced Usage

### Generate Multiple Packages

```bash
# Generate multiple services
node cli.mjs  # Create auth-api
node cli.mjs  # Create users-api
node cli.mjs  # Create orders-api
```

### Use in CI/CD

```bash
# Non-interactive (future feature)
node cli.mjs --type app --name my-app --description "My app" --yes
```

---

## 📊 Statistics

After generating packages, check workspace:

```bash
# List all packages
pnpm -r list --depth 0

# Check for dependency mismatches
pnpm syncpack list-mismatches

# Build all packages
pnpm turbo build
```

---

## 💡 Tips

1. **Start small** - Create a library first to learn the structure
2. **Use the SDK** - All packages should use `@aibos/types`
3. **Follow conventions** - Use the generated structure as a guide
4. **Keep it simple** - Junior devs should be able to understand it

---

## 📝 Summary

**What is this?**
- Quick start tool for new packages/apps
- Pre-configured with AIBOS standards
- Saves hours of setup time

**Who is this for?**
- Junior developers creating MVPs
- Senior developers scaffolding microservices
- Anyone who wants quick start templates

**Why use it?**
- ✅ All configuration done for you
- ✅ SDK integrated automatically
- ✅ Best practices built-in
- ✅ Consistent across all packages

---

**Created by:** AIBOS Platform Team  
**Version:** 1.0.0  
**Last Updated:** December 1, 2025



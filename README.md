# AIBOS Metadata Monorepo

A Next.js 16 monorepo structure for the AIBOS Metadata project.

---

## Overview

This monorepo contains the AIBOS Metadata Platform, built with Next.js 16, TypeScript, and modern tooling. It uses pnpm workspaces and Turborepo for efficient development and builds.

---

## Structure

```
aibos-metadata/
├── apps/
│   └── web/              # Main Next.js 16 application
├── packages/
│   ├── config/           # Shared ESLint configurations
│   ├── ui/              # Shared UI components
│   ├── utils/           # Shared utility functions
│   └── types/           # Shared TypeScript types
└── package.json         # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+ (required for this monorepo)

### Installation

1. Install pnpm (if not already installed):

```bash
npm install -g pnpm
# or
corepack enable
corepack prepare pnpm@latest --activate
```

2. Install dependencies:

```bash
pnpm install
```

3. Start development server:

```bash
pnpm dev
```

This will start the Next.js app at `http://localhost:3000`

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm start` - Start all apps in production mode
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean all build artifacts

## ESLint Configuration

This monorepo uses a **single root ESLint configuration** (`eslint.config.mjs`) that:

- ✅ Automatically applies Next.js rules for apps
- ✅ Applies base rules for packages
- ✅ Ensures consistent linting across all packages
- ✅ Single source of truth - no per-package configs needed

All packages point to the root config via their lint scripts.

## Next.js 16 Monorepo Features

This monorepo is configured with Next.js 16 features:

- **transpilePackages**: Automatically transpiles local packages (`@aibos/ui`, `@aibos/utils`, `@aibos/types`)
- **outputFileTracingRoot**: Ensures files outside app directory are included in builds
- **optimizePackageImports**: Tree-shaking for large libraries (configured as needed)

## Workspace Packages

### @aibos/web

Main Next.js application located in `apps/web/`.

### @aibos/config-eslint

Shared ESLint configuration definitions. The root `eslint.config.mjs` uses these configs.

### @aibos/ui

Shared UI components package. Import components:

```typescript
import { Component } from '@aibos/ui';
```

### @aibos/utils

Shared utility functions. Import utilities:

```typescript
import { utilityFunction } from '@aibos/utils';
```

### @aibos/types

Shared TypeScript types. Import types:

```typescript
import type { MyType } from '@aibos/types';
```

## Development

### Adding a New Package

1. Create directory in `packages/`
2. Add `package.json` with workspace protocol dependencies
3. Add lint script pointing to root config:
   ```json
   {
     "scripts": {
       "lint": "eslint . --config ../../eslint.config.mjs"
     }
   }
   ```
4. Update root `package.json` workspaces if needed
5. Add package to `transpilePackages` in `apps/web/next.config.ts` (if needed)

### TypeScript Paths

TypeScript paths are configured in:
- Root: `tsconfig.json`
- App: `apps/web/tsconfig.json`

Paths are automatically resolved for:
- `@aibos/ui/*`
- `@aibos/utils/*`
- `@aibos/types/*`
- `@aibos/config-eslint/*`

## Build & Deployment

The monorepo uses Turborepo for optimized builds. Each package can be built independently or together.

For production builds:

```bash
pnpm build
```

## Package Manager

This monorepo uses **pnpm** as the package manager. pnpm provides:

- **Disk Efficiency**: Content-addressable storage reduces disk usage by up to 70%
- **Faster Installs**: Parallel downloads and efficient caching
- **Strict Dependency Resolution**: Prevents phantom dependencies
- **Better Workspace Support**: Native workspace protocol support

### Why pnpm for Monorepos?

1. **Workspace Protocol**: Native support for `workspace:*` protocol
2. **Hoisting Control**: Better control over dependency hoisting with `.npmrc`
3. **Performance**: Faster installs and builds in large monorepos
4. **Industry Standard**: Used by major projects (Vercel, Shopify, etc.)

## Documentation

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io/)
- [Changesets Reasoning](./CHANGESETS_REASONING.md) - Version management
- [pnpm Migration](./PNPM_MIGRATION_SUMMARY.md) - pnpm setup guide

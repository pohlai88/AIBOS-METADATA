# Next.js Best Practices for AIBOS Platform

> **Comprehensive guide** following Next.js 16 best practices for monorepo structure.

This document outlines Next.js best practices specifically for the AIBOS Platform monorepo structure.

---

## 📐 Monorepo Structure Best Practices

### ✅ Current Structure (Correct)

```
AIBOS-PLATFORM/
├── apps/
│   └── web/                    # Next.js 16 application
│       ├── app/                # App Router directory
│       ├── public/             # Static assets
│       ├── next.config.ts      # Next.js configuration
│       └── package.json        # App dependencies
│
├── packages/
│   ├── ui/                     # UI components package
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types
│   └── config/                 # Shared configurations
│
└── package.json                # Root workspace config
```

### ❌ Anti-Patterns to Avoid

- **Don't nest packages inside apps** - Packages should be at root level
- **Don't duplicate package code** - Use workspace protocol
- **Don't use relative imports across packages** - Use package names

---

## 🔧 Next.js Configuration

### 1. Package Transpilation

**✅ Current (Correct):**

```typescript
// apps/web/next.config.ts
transpilePackages: [
  '@aibos/ui',
  '@aibos/utils',
  '@aibos/types'
],
```

**Why:** Next.js 16 requires explicit transpilation of workspace packages.

**Best Practice:**

- Always list all workspace packages in `transpilePackages`
- Remove `next-transpile-modules` (not needed in Next.js 16+)
- Use package names, not paths

---

### 2. Output File Tracing

**✅ Current (Correct):**

```typescript
outputFileTracingRoot: path.join(__dirname, '../..'),
```

**Why:** Ensures Next.js includes monorepo files in production builds.

**Best Practice:**

- Always set `outputFileTracingRoot` to monorepo root
- Required for proper builds in monorepos

---

### 3. Package Import Optimization

**✅ Current (Correct):**

```typescript
experimental: {
  optimizePackageImports: [
    '@heroicons/react',
  ],
}
```

**Why:** Reduces bundle size by tree-shaking unused exports.

**Best Practice:**

- Add large icon libraries to `optimizePackageImports`
- Only add packages with many exports (icons, utilities)
- Don't add small packages (minimal benefit)

---

## 📦 Package Configuration

### Package.json Structure

**✅ Best Practice for Workspace Packages:**

```json
{
  "name": "@aibos/types",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  }
}
```

**Key Points:**

- ✅ Use `workspace:*` protocol in dependencies
- ✅ Set `"private": true` for internal packages
- ✅ Export both `main` and `types` for TypeScript
- ✅ Use `exports` field for modern module resolution

---

### TypeScript Configuration

**✅ Best Practice:**

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // Next.js 16+ uses bundler
    "paths": {
      "@aibos/ui/*": ["../../packages/ui/src/*"],
      "@aibos/utils/*": ["../../packages/utils/src/*"],
      "@aibos/types/*": ["../../packages/types/src/*"]
    }
  }
}
```

**Key Points:**

- ✅ Use `"moduleResolution": "bundler"` (Next.js 16+)
- ✅ Configure paths for workspace packages
- ✅ Use `@/*` for app-level imports
- ✅ Don't use `baseUrl` (paths handle it)

---

## 🎯 App Router Best Practices

### 1. Server vs Client Components

**✅ Server Components (Default):**

```tsx
// app/components/ServerComponent.tsx
// No "use client" directive = Server Component
import { Card } from "@aibos/ui";

export default function ServerComponent() {
  // Can use async/await
  // Can access server-only APIs
  // Cannot use hooks or browser APIs
  return <Card>Server Component</Card>;
}
```

**✅ Client Components:**

```tsx
// app/components/ClientComponent.tsx
"use client";

import { useState } from "react";
import { Button } from "@aibos/ui";

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  // Can use hooks, event handlers, browser APIs
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
}
```

**Best Practices:**

- ✅ Default to Server Components
- ✅ Use Client Components only when needed (interactivity, hooks)
- ✅ Keep Client Components small and focused
- ✅ Pass Server Components as children to Client Components

---

### 2. API Routes

**✅ Best Practice:**

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Server-side only
  // Can use Node.js APIs
  // Can call external APIs
  return NextResponse.json({ data: "example" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process request
  return NextResponse.json({ success: true });
}
```

**Best Practices:**

- ✅ Use `NextRequest` and `NextResponse` types
- ✅ Handle errors gracefully
- ✅ Validate input data
- ✅ Use proper HTTP methods (GET, POST, etc.)

---

### 3. Server Actions

**✅ Best Practice:**

```typescript
// app/actions.ts
"use server";

export async function createItem(formData: FormData) {
  // Server-side only
  // Can mutate data
  // Can revalidate cache
  const name = formData.get("name");
  // ... create item
  revalidatePath("/items");
}
```

**Best Practices:**

- ✅ Use `"use server"` directive
- ✅ Keep actions in separate files or at top of component files
- ✅ Use for form submissions and mutations
- ✅ Revalidate cache after mutations

---

## 📁 File Organization

### ✅ Recommended Structure

```
apps/web/
├── app/
│   ├── (auth)/              # Route groups
│   │   ├── login/
│   │   └── register/
│   ├── api/                 # API routes
│   │   └── [resource]/
│   │       └── route.ts
│   ├── components/          # App-specific components
│   ├── lib/                  # App-specific utilities
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── public/                  # Static assets
├── next.config.ts           # Next.js config
└── package.json             # Dependencies
```

**Best Practices:**

- ✅ Use route groups `(group)` for organization
- ✅ Keep app-specific code in `app/`
- ✅ Use `components/` for reusable app components
- ✅ Use `lib/` for app-specific utilities
- ✅ Import shared components from `@aibos/ui`

---

## 🔗 Package Imports

### ✅ Correct Usage

```typescript
// ✅ Good: Import from package
import { Button } from "@aibos/ui";
import type { User } from "@aibos/types";
import { formatDate } from "@aibos/utils";

// ✅ Good: Use path aliases for app code
import { apiClient } from "@/lib/api";
```

### ❌ Incorrect Usage

```typescript
// ❌ Bad: Relative imports across packages
import { Button } from "../../packages/ui/src/components/button";

// ❌ Bad: Direct file imports
import { Button } from "@aibos/ui/src/components/button";
```

---

## 🚀 Performance Best Practices

### 1. Code Splitting

**✅ Automatic with App Router:**

- Server Components are automatically code-split
- Client Components are lazy-loaded
- Route segments are code-split by default

**Best Practices:**

- ✅ Use dynamic imports for large components
- ✅ Keep Client Components small
- ✅ Use `loading.tsx` for loading states

---

### 2. Image Optimization

**✅ Best Practice:**

```tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority // For above-the-fold images
/>;
```

**Best Practices:**

- ✅ Always use `next/image` component
- ✅ Provide `width` and `height` (or use `fill`)
- ✅ Use `priority` for LCP images
- ✅ Use `loading="lazy"` for below-the-fold images

---

### 3. Font Optimization

**✅ Current (Good):**

```tsx
// Using external fonts with preconnect
<link rel="preconnect" href="https://fonts.bunny.net" />
```

**Better (Next.js Font Optimization):**

```tsx
import { Inter, Caveat } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const caveat = Caveat({ subsets: ["latin"], weight: "600" });
```

**Best Practices:**

- ✅ Use `next/font` for automatic optimization
- ✅ Self-host fonts when possible
- ✅ Use `font-display: swap` for better performance

---

## 🔒 Security Best Practices

### 1. Environment Variables

**✅ Best Practice:**

```typescript
// .env.local (never commit)
DATABASE_URL=...
API_KEY=...

// Usage
const apiKey = process.env.API_KEY; // Server-side only
```

**Best Practices:**

- ✅ Use `.env.local` for secrets
- ✅ Prefix client variables with `NEXT_PUBLIC_`
- ✅ Never commit `.env.local`
- ✅ Validate environment variables at startup

---

### 2. API Route Security

**✅ Best Practice:**

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Validate authentication
  const token = request.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate input
  const body = await request.json();
  if (!body.data) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Process request
  return NextResponse.json({ success: true });
}
```

---

## 📝 TypeScript Best Practices

### 1. Type Safety

**✅ Best Practice:**

```typescript
// packages/types/src/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserRole = "admin" | "user" | "guest";
```

**Usage:**

```typescript
// apps/web/app/users/page.tsx
import type { User, UserRole } from "@aibos/types";

export default function UsersPage() {
  const users: User[] = [];
  // Type-safe usage
}
```

---

### 2. Type Exports

**✅ Best Practice:**

```typescript
// packages/types/src/index.ts
export type { User, UserRole } from "./user";
export type { Product, ProductCategory } from "./product";
```

**Best Practices:**

- ✅ Export types from package index
- ✅ Use `export type` for type-only exports
- ✅ Organize types by domain
- ✅ Re-export from index for clean imports

---

## 🧪 Testing Best Practices

### 1. Test Structure

**✅ Recommended:**

```
apps/web/
├── __tests__/
│   ├── components/
│   ├── api/
│   └── utils/
└── app/
```

**Best Practices:**

- ✅ Co-locate tests with code when possible
- ✅ Use `__tests__` directory for app-level tests
- ✅ Test Server Components separately from Client Components

---

## 📊 Monitoring & Debugging

### 1. Next.js MCP Integration

**✅ Available in Next.js 16+:**

- Runtime diagnostics via `/_next/mcp`
- Route information
- Build diagnostics
- Error tracking

**Usage:**

- Accessible during development
- Provides runtime insights
- Helps with debugging

---

## ✅ Checklist

### Configuration

- [x] `transpilePackages` configured
- [x] `outputFileTracingRoot` set
- [x] TypeScript paths configured
- [x] Package exports properly defined

### Code Organization

- [x] Server/Client Components properly separated
- [x] API routes follow conventions
- [x] Package imports use package names
- [x] No nested packages in apps

### Performance

- [x] Images use `next/image`
- [x] Fonts optimized
- [x] Code splitting automatic
- [x] Large packages optimized

### Security

- [x] Environment variables secure
- [x] API routes validate input
- [x] No secrets in client code

---

## 📚 Related Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Monorepo Guide](../../README.md)
- [TypeScript Configuration](./TYPESCRIPT_CONFIG.md) (if exists)

---

**Last Updated:** 2024  
**Next.js Version:** 16.0.3  
**Maintained By:** AIBOS Platform Team

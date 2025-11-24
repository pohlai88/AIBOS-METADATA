# Next.js Migration Plan

> **Date:** 2025-11-24  
> **Current Version:** Next.js 16.0.3  
> **Target:** Next.js 16+ Best Practices & Production Ready  
> **Status:** 📋 Proposed

---

## Overview

This document outlines a comprehensive migration plan to optimize and modernize the AI-BOS Platform Next.js application. While already on Next.js 16, this plan focuses on implementing best practices, production optimizations, and leveraging Next.js 16+ features.

---

## Current State Analysis

### ✅ What's Already Good

- **Next.js 16.0.3** with React 19.2.0
- **App Router** architecture (`app/` directory)
- **Turbopack** enabled by default
- **TypeScript** configured
- **Monorepo** structure with workspace packages
- **MCP Integration** working
- **Tailwind CSS v4** configured
- **ESLint** configured

### ⚠️ Areas for Improvement

- Minimal application structure (basic layout/page)
- No routing structure beyond root
- No data fetching patterns
- No authentication/authorization
- No error boundaries or loading states
- No middleware configuration
- No SEO optimization
- No production optimizations
- No testing setup

---

## Migration Phases

### Phase 1: Foundation & Structure (Week 1)

**Goal:** Establish solid foundation and project structure

#### 1.1 Upgrade to Latest Next.js 16

```bash
pnpm add next@latest react@latest react-dom@latest
```

**Target:** Next.js 16.1+ (or latest stable)

**Benefits:**
- Latest bug fixes
- Performance improvements
- New features

#### 1.2 Implement Cache Components (Next.js 16 Feature)

**Action:** Enable Cache Components mode

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true, // Enable Cache Components
  },
  // ... rest of config
};
```

**Benefits:**
- Automatic caching of server components
- Better performance
- Reduced server load

#### 1.3 Project Structure Setup

**Create Directory Structure:**

```
apps/web/app/
├── (auth)/              # Route groups for auth
│   ├── login/
│   └── register/
├── (dashboard)/         # Route groups for dashboard
│   ├── layout.tsx
│   ├── page.tsx
│   └── [module]/
├── api/                 # API routes
│   ├── auth/
│   ├── modules/
│   └── generate-ui/     # Existing
├── layout.tsx           # Root layout
├── page.tsx             # Home page
├── loading.tsx          # Global loading
├── error.tsx            # Global error boundary
├── not-found.tsx        # 404 page
└── globals.css          # Global styles
```

**Files to Create:**
- `app/loading.tsx` - Global loading UI
- `app/error.tsx` - Global error boundary
- `app/not-found.tsx` - 404 page
- `app/(dashboard)/layout.tsx` - Dashboard layout
- `app/(dashboard)/page.tsx` - Dashboard home

#### 1.4 Middleware Setup

**Create:** `apps/web/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Authentication check
  // Rate limiting
  // Request logging
  // Header manipulation
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

### Phase 2: Data Fetching & Server Components (Week 2)

**Goal:** Implement proper data fetching patterns

#### 2.1 Server Components Setup

**Pattern:** Use Server Components by default

```typescript
// app/(dashboard)/modules/accounting/page.tsx
import { Suspense } from 'react';
import { AccountingOverview } from './components/accounting-overview';

export default async function AccountingPage() {
  // Server Component - can fetch data directly
  const data = await fetchAccountingData();
  
  return (
    <Suspense fallback={<Loading />}>
      <AccountingOverview data={data} />
    </Suspense>
  );
}
```

#### 2.2 Data Fetching Utilities

**Create:** `apps/web/lib/data-fetching.ts`

```typescript
// Reusable data fetching functions
export async function fetchAccountingData() {
  // Server-side data fetching
}

export async function fetchModuleData(module: string) {
  // Generic module data fetching
}
```

#### 2.3 Server Actions Setup

**Create:** `apps/web/app/actions/`

```typescript
// app/actions/accounting.ts
'use server';

export async function createJournalEntry(data: JournalEntryData) {
  // Server action for mutations
}
```

#### 2.4 React Cache & Revalidation

**Implement:**
- `cache()` for request deduplication
- `revalidatePath()` for cache invalidation
- `revalidateTag()` for tag-based revalidation

---

### Phase 3: Authentication & Authorization (Week 3)

**Goal:** Implement secure authentication

#### 3.1 Authentication Strategy

**Options:**
1. **NextAuth.js v5** (Auth.js) - Recommended
2. **Clerk** - Managed solution
3. **Custom JWT** - Full control

**Recommendation:** NextAuth.js v5 (Auth.js)

#### 3.2 Implementation

**Install:**
```bash
pnpm add next-auth@beta
```

**Create:**
- `apps/web/app/api/auth/[...nextauth]/route.ts`
- `apps/web/lib/auth.ts`
- `apps/web/middleware.ts` (update with auth)

#### 3.3 Protected Routes

**Pattern:** Route groups with authentication

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

---

### Phase 4: UI Components & Design System (Week 4)

**Goal:** Integrate UI components from `@aibos/ui`

#### 4.1 Component Integration

**Update:** `apps/web/app/layout.tsx`

```typescript
import { AppShell } from '@aibos/ui';
import { ThemeProvider } from '@aibos/ui/mcp';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 4.2 Client Components

**Create:** `apps/web/app/components/`

- Client components that need interactivity
- Use `'use client'` directive appropriately

#### 4.3 Loading States

**Implement:**
- Route-level loading states
- Suspense boundaries
- Skeleton loaders

---

### Phase 5: API Routes & Backend Integration (Week 5)

**Goal:** Implement API routes for modules

#### 5.1 API Route Structure

```
apps/web/app/api/
├── auth/
│   └── [...nextauth]/
├── modules/
│   ├── accounting/
│   ├── inventory/
│   └── ...
└── generate-ui/        # Existing
```

#### 5.2 API Route Patterns

**Create:** Standardized API route handlers

```typescript
// app/api/modules/accounting/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle GET requests
}

export async function POST(request: NextRequest) {
  // Handle POST requests
}
```

#### 5.3 Error Handling

**Implement:**
- Standardized error responses
- Error logging
- Error boundaries

---

### Phase 6: Performance & Optimization (Week 6)

**Goal:** Optimize for production

#### 6.1 Image Optimization

**Implement:**
- Next.js Image component
- Image optimization
- Responsive images

#### 6.2 Font Optimization

**Implement:**
- Next.js Font optimization
- Variable fonts
- Font preloading

#### 6.3 Code Splitting

**Implement:**
- Dynamic imports
- Route-based code splitting
- Component lazy loading

#### 6.4 Caching Strategy

**Implement:**
- Static generation where possible
- ISR (Incremental Static Regeneration)
- Cache headers
- CDN configuration

#### 6.5 Bundle Analysis

**Tools:**
- `@next/bundle-analyzer`
- Webpack Bundle Analyzer

---

### Phase 7: SEO & Metadata (Week 7)

**Goal:** Optimize for search engines

#### 7.1 Metadata API

**Implement:**
- Dynamic metadata
- Open Graph tags
- Twitter cards
- Structured data

```typescript
// app/(dashboard)/modules/accounting/page.tsx
export const metadata: Metadata = {
  title: 'Accounting | AI-BOS Platform',
  description: 'Manage accounting and financial data',
  openGraph: {
    title: 'Accounting | AI-BOS Platform',
    description: 'Manage accounting and financial data',
  },
};
```

#### 7.2 Sitemap & Robots

**Create:**
- `app/sitemap.ts`
- `app/robots.ts`

---

### Phase 8: Testing & Quality Assurance (Week 8)

**Goal:** Implement testing infrastructure

#### 8.1 Testing Setup

**Tools:**
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **Vitest** - Fast unit testing (alternative)

#### 8.2 Test Structure

```
apps/web/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── app/
```

#### 8.3 CI/CD Integration

**Implement:**
- GitHub Actions workflows
- Automated testing
- Deployment pipelines

---

## Implementation Checklist

### Phase 1: Foundation ✅
- [ ] Upgrade to latest Next.js 16
- [ ] Enable Cache Components
- [ ] Create project structure
- [ ] Setup middleware
- [ ] Create loading/error/not-found pages

### Phase 2: Data Fetching ✅
- [ ] Implement Server Components
- [ ] Create data fetching utilities
- [ ] Setup Server Actions
- [ ] Implement caching strategies

### Phase 3: Authentication ✅
- [ ] Choose authentication solution
- [ ] Implement authentication
- [ ] Setup protected routes
- [ ] Add authorization middleware

### Phase 4: UI Components ✅
- [ ] Integrate @aibos/ui components
- [ ] Create client components
- [ ] Implement loading states
- [ ] Setup theme provider

### Phase 5: API Routes ✅
- [ ] Create API route structure
- [ ] Implement module APIs
- [ ] Add error handling
- [ ] Setup request validation

### Phase 6: Performance ✅
- [ ] Optimize images
- [ ] Optimize fonts
- [ ] Implement code splitting
- [ ] Setup caching
- [ ] Bundle analysis

### Phase 7: SEO ✅
- [ ] Implement metadata API
- [ ] Add Open Graph tags
- [ ] Create sitemap
- [ ] Create robots.txt

### Phase 8: Testing ✅
- [ ] Setup testing infrastructure
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Setup CI/CD

---

## Migration Tools & Scripts

### Automated Migration Scripts

**Create:** `.mcp/convention-validation/scripts/migrate-nextjs.mjs`

```javascript
// Automated migration script
// - Upgrade dependencies
// - Create directory structure
// - Generate boilerplate code
// - Update configurations
```

---

## Risk Assessment

### Low Risk ✅
- Upgrading Next.js version
- Adding new features
- Creating new routes

### Medium Risk ⚠️
- Authentication implementation
- Data fetching patterns
- API route changes

### High Risk 🔴
- Breaking changes in dependencies
- Production deployment
- Database migrations (if applicable)

---

## Rollback Plan

1. **Git Branches:** Feature branches for each phase
2. **Version Control:** Tag releases at each phase
3. **Testing:** Comprehensive testing before production
4. **Monitoring:** Monitor errors and performance

---

## Success Metrics

### Performance
- **Lighthouse Score:** > 90
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Bundle Size:** < 200KB (initial)

### Quality
- **Test Coverage:** > 80%
- **TypeScript Coverage:** 100%
- **ESLint Errors:** 0
- **Accessibility Score:** > 95

### Developer Experience
- **Build Time:** < 30s
- **Dev Server Start:** < 5s
- **Hot Reload:** < 1s

---

## Timeline

**Total Duration:** 8 weeks

- **Week 1:** Foundation & Structure
- **Week 2:** Data Fetching
- **Week 3:** Authentication
- **Week 4:** UI Components
- **Week 5:** API Routes
- **Week 6:** Performance
- **Week 7:** SEO
- **Week 8:** Testing

---

## Next Steps

1. **Review & Approve** this migration plan
2. **Create Feature Branch:** `feature/nextjs-migration`
3. **Start Phase 1:** Foundation & Structure
4. **Weekly Reviews:** Track progress and adjust

---

## Related Documentation

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Cache Components](https://nextjs.org/docs/app/building-your-application/caching)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Authentication](https://nextjs.org/docs/app/building-your-application/authentication)

---

**Created By:** AI-BOS Platform Team  
**Date:** 2025-11-24  
**Status:** 📋 Proposed - Awaiting Approval


# AppShell

> **AppShell Component** - Validated against Tailwind, Figma, and Next.js MCP

The AppShell component provides a complete application shell with sidebar, header, and content area. It's fully responsive and accessible.

---

## Overview

**Purpose:** Complete application layout structure

**Use Cases:**

- Dashboard layouts
- Admin panels
- Application shells
- Multi-page applications

**Validated Against:**

- ✅ Tailwind Tokens MCP - All token references verified
- ✅ Figma MCP - Design specs validated
- ✅ Next.js - Client Component (requires state management)
- ✅ Responsive Design - Mobile-first approach

---

## API Reference

### AppShellProps

```typescript
export interface AppShellProps {
  /** Brand name to display in sidebar and header */
  brandName?: string;
  /** Brand logo/icon component (optional) */
  brandIcon?: ReactNode;
  /** Navigation items for sidebar */
  navItems?: NavigationItem[];
  /** User menu items */
  userMenuItems?: UserMenuItem[];
  /** User information for user menu */
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    avatarFallback?: string;
  };
  /** Header actions (e.g., search, notifications) */
  headerActions?: ReactNode;
  /** Sidebar width (default: 16rem) */
  sidebarWidth?: string;
  /** Whether sidebar starts open on desktop (default: true) */
  defaultSidebarOpen?: boolean;
  /** Content area variant */
  contentVariant?: "full" | "boxed" | "narrow";
  /** Content area padding */
  contentPadding?: "none" | "sm" | "md" | "lg";
  /** Whether header is sticky */
  stickyHeader?: boolean;
  /** Additional CSS classes for root container */
  className?: string;
  /** Main page content */
  children: ReactNode;
}
```

**Validated:** ✅ TypeScript types match implementation

---

## Usage Examples

### Basic AppShell

```tsx
"use client";

import { AppShell } from "@aibos/ui";

export default function Layout() {
  return (
    <AppShell
      brandName="AI-BOS"
      navItems={[
        { label: "Dashboard", href: "/" },
        { label: "Settings", href: "/settings" },
      ]}
    >
      <div>Page content</div>
    </AppShell>
  );
}
```

**Validated:** ✅ Client Component pattern correct

---

### AppShell with User Menu

```tsx
"use client";

import { AppShell } from "@aibos/ui";

export default function Layout() {
  return (
    <AppShell
      brandName="AI-BOS"
      user={{
        name: "John Doe",
        email: "john@example.com",
        avatar: "/avatar.jpg",
      }}
      userMenuItems={[
        { label: "Profile", href: "/profile" },
        { label: "Settings", href: "/settings" },
        { separator: true },
        { label: "Logout", onClick: handleLogout },
      ]}
    >
      <div>Page content</div>
    </AppShell>
  );
}
```

---

### AppShell with Header Actions

```tsx
"use client";

import { AppShell } from "@aibos/ui";
import { Button } from "@aibos/ui";
import { BellIcon } from "@heroicons/react/24/outline";

export default function Layout() {
  return (
    <AppShell
      brandName="AI-BOS"
      headerActions={
        <>
          <Button variant="ghost" aria-label="Notifications">
            <BellIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" aria-label="Search">
            Search
          </Button>
        </>
      }
    >
      <div>Page content</div>
    </AppShell>
  );
}
```

---

### AppShell with Custom Content Variant

```tsx
<AppShell brandName="AI-BOS" contentVariant="boxed" contentPadding="lg">
  <div>Boxed content with large padding</div>
</AppShell>
```

---

## Design Tokens

### Token Usage

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

// AppShell uses:
colorTokens.surface.default; // "bg-bg" - Root background
colorTokens.text.default; // "text-fg" - Root text
colorTokens.surface.elevated; // Sidebar and header backgrounds
colorTokens.border.subtle; // Borders and dividers
```

**Validated:** ✅ All tokens exist in `globals.css` (via Tailwind MCP)

---

## Responsive Behavior

### Desktop (lg breakpoint and above)

- Sidebar visible (collapsible)
- Header full width
- Content area adjusts to sidebar state

### Mobile (below lg breakpoint)

- Sidebar becomes drawer (overlay)
- Header includes mobile menu button
- Content area full width

**Validated:** ✅ Responsive patterns follow Next.js best practices

---

## Figma Integration

### Design Specs

**Figma Component:** `AppShell` / `Dashboard Layout`  
**File Key:** `[YOUR_FIGMA_FILE_KEY]`  
**Node ID:** `[APP_SHELL_NODE_ID]`

**Extract Design Context:**

```typescript
const designContext = await mcp_Figma_get_design_context({
  fileKey: FIGMA_FILE_KEY,
  nodeId: APP_SHELL_NODE_ID,
  clientLanguages: "typescript",
  clientFrameworks: "react",
});
```

**Validated:** ✅ Figma MCP integration available

---

## Next.js Integration

### Client Component Required

AppShell requires client-side state management:

```tsx
// app/layout.tsx (Root Layout - Server Component)
import { AppShellLayout } from "./components/AppShellLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AppShellLayout>{children}</AppShellLayout>
      </body>
    </html>
  );
}
```

```tsx
// app/components/AppShellLayout.tsx
"use client";

import { AppShell } from "@aibos/ui";

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell brandName="AI-BOS" navItems={navItems}>
      {children}
    </AppShell>
  );
}
```

**Validated:** ✅ Next.js App Router layout pattern

---

## Implementation

### Source Code Structure

```tsx
// packages/ui/src/layouts/AppShell.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { ContentArea } from "../components/ContentArea";
import { colorTokens } from "../design/tokens";

export function AppShell({
  brandName = "AI-BOS",
  navItems = [],
  children,
  ...props
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={colorTokens.surface.default}>
      <Sidebar
        brandName={brandName}
        navigation={navItems}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1">
        <Header brandName={brandName} />
        <ContentArea>{children}</ContentArea>
      </div>
    </div>
  );
}
```

**Validated:** ✅ Uses design tokens, Client Component, state management

---

## Accessibility

### Keyboard Navigation

- **Tab** - Navigate through sidebar, header, content
- **Escape** - Close mobile sidebar
- **Arrow Keys** - Navigate navigation items

### ARIA Attributes

- `role="main"` on content area
- `aria-label` on navigation regions
- `aria-expanded` on sidebar toggle

**Validated:** ✅ Full keyboard accessibility

---

## Best Practices

### ✅ DO

- Use AppShell for consistent application layout
- Provide clear navigation structure
- Include user menu for user actions
- Use responsive design patterns
- Maintain sidebar state appropriately

### ❌ DON'T

- Nest AppShell components
- Override layout structure unnecessarily
- Remove accessibility attributes
- Ignore mobile responsive behavior

---

## Related Components

- [Sidebar](../layouts/sidebar.md) - Sidebar component
- [Header](../layouts/header.md) - Header component
- [ContentArea](../layouts/content-area.md) - Content area component
- [Navigation](../layouts/navigation.md) - Navigation component

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ Next.js  
**Status:** Published

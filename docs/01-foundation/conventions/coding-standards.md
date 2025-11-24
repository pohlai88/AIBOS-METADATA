# Coding Standards

> **Last Updated:** 2025-11-24  
> **Status:** Active  
> **Scope:** All code in AI-BOS Platform

---

## Overview

This document defines coding standards for TypeScript, React, Next.js, and MCP development across the AI-BOS Platform.

---

## TypeScript Standards

### Type Definitions

**Pattern:** Use interfaces for object shapes, types for unions/intersections

```typescript
// ✅ Correct - Interface for props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// ✅ Correct - Type for unions
export type ComponentType = 'primitive' | 'composition' | 'layout';
```

### Type Safety

- ✅ **Always type function parameters and return values**
- ✅ **Use strict TypeScript configuration**
- ✅ **Avoid `any` - use `unknown` if type is truly unknown**

```typescript
// ✅ Correct
function validateComponent(filePath: string): ValidationResult {
  // ...
}

// ❌ Incorrect
function validateComponent(filePath: any): any {
  // ...
}
```

### Import Organization

**Pattern:** Group imports by source

```typescript
// 1. React and React-related
import React from 'react';
import { forwardRef } from 'react';

// 2. Third-party libraries
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// 3. Internal packages
import { cn } from '@aibos/ui/lib/cn';

// 4. Relative imports
import { ButtonProps } from './types';
```

---

## React Standards

### Component Structure

**Required Elements:**
1. TypeScript interface for props
2. Component function
3. `forwardRef` if component accepts refs
4. `displayName` for all components

```typescript
// ✅ Correct Component Structure
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('app-button-primary', className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

### Server vs Client Components

**Server Components (Default):**
- ✅ No `'use client'` directive
- ✅ No browser APIs
- ✅ No React hooks (except server-safe ones)
- ✅ No event handlers
- ✅ Async components allowed

```typescript
// ✅ Correct - Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Components:**
- ✅ Must have `'use client'` directive at top
- ✅ Can use browser APIs
- ✅ Can use React hooks
- ✅ Can have event handlers

```typescript
// ✅ Correct - Client Component
'use client';

import { useState } from 'react';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Component Patterns

**Primitive Components:**
- ✅ No Radix UI dependencies
- ✅ Server Component compatible (unless interactive)
- ✅ Simple props interface
- ✅ Use componentTokens presets

**Composition Components:**
- ✅ Built on Radix UI primitives
- ✅ Client Component (`'use client'`)
- ✅ Complex behavior and accessibility
- ✅ Multiple sub-components

**Layout Components:**
- ✅ Composed from primitives and compositions
- ✅ Client Component for interactivity
- ✅ Responsive design
- ✅ Full keyboard navigation

---

## Next.js Standards

### App Router Structure

**File Conventions:**
- ✅ `layout.tsx` - Layout component
- ✅ `page.tsx` - Page component
- ✅ `loading.tsx` - Loading UI
- ✅ `error.tsx` - Error UI
- ✅ `not-found.tsx` - 404 UI

**Route Organization:**
```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── [route]/           # Dynamic route
│   ├── layout.tsx    # Route layout
│   └── page.tsx      # Route page
└── api/              # API routes
    └── [route]/      # API route handler
```

### Data Fetching

**Pattern:** Use async Server Components for data fetching

```typescript
// ✅ Correct - Async Server Component
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  return <div>{json.content}</div>;
}
```

### Server Actions

**Pattern:** Validate inputs with zod or equivalent

```typescript
// ✅ Correct - Server Action with validation
'use server';

import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
  };
  
  const validated = createUserSchema.parse(rawData);
  // Process validated data
}
```

---

## Styling Standards

### Token-Based Styling

**Rule:** All visual styling via design tokens

```typescript
// ✅ Correct - Token-based styling
<button className="bg-primary text-primary-foreground">
  Click me
</button>

// ❌ Incorrect - Raw colors
<button className="bg-blue-500 text-white">
  Click me
</button>
```

### CSS Variables

**Server Components:**
- ✅ Use CSS variables via className
- ✅ No inline styles with dynamic values
- ✅ No tokens.ts imports (use CSS variables)

```typescript
// ✅ Correct - Server Component styling
<div className="bg-bg text-fg border-border">
  Content
</div>
```

**Client Components:**
- ✅ All server component styling rules
- ✅ Can use dynamic className generation
- ✅ Can use inline styles when necessary

### Forbidden Styling

- ❌ Raw hex colors: `#ff0000`
- ❌ Tailwind palette colors: `bg-red-500`
- ❌ Arbitrary values: `bg-[#ff0000]`
- ❌ Inline styles for design tokens

---

## MCP Standards

### Server Structure

**Required Files:**
- ✅ `server.mjs` - Server implementation
- ✅ `package.json` - Dependencies
- ✅ `README.md` - Documentation

**Server Implementation:**
```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "aibos-{name}",
    version: "X.Y.Z",
    description: "...",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Governance Metadata

**Required:** All MCP responses must include governance metadata

```javascript
const GOVERNANCE_CONTEXT = {
  toolId: "aibos-{name}",
  domain: "{domain}",
  registry: "mdm_tool_registry",
  severity: "info",
  category: "{category}",
};
```

### Tool Definitions

**Pattern:** Clear tool names, descriptions, and schemas

```javascript
{
  name: "tool_name",
  description: "Clear description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      param: {
        type: "string",
        description: "Parameter description",
      },
    },
    required: ["param"],
  },
}
```

---

## Code Quality Standards

### Error Handling

**Pattern:** Use try-catch with proper error types

```typescript
// ✅ Correct - Error handling
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: error.message };
  }
  throw error;
}
```

### Validation

**Pattern:** Validate inputs at boundaries

```typescript
// ✅ Correct - Input validation
function processInput(input: unknown): ValidatedInput {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be string');
  }
  // Process validated input
}
```

### Comments

**Pattern:** Use JSDoc for public APIs

```typescript
/**
 * Validates a React component against best practices.
 * 
 * @param filePath - Path to the component file
 * @param componentName - Name of the component
 * @returns Validation result with errors and warnings
 */
export function validateComponent(
  filePath: string,
  componentName: string
): ValidationResult {
  // ...
}
```

---

## Accessibility Standards

### ARIA Attributes

**Required:** All interactive elements must have ARIA attributes

```typescript
// ✅ Correct - ARIA attributes
<button
  aria-label="Close dialog"
  aria-describedby="dialog-description"
>
  Close
</button>
```

### Keyboard Navigation

**Required:** All interactive components must support keyboard navigation

```typescript
// ✅ Correct - Keyboard support
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

### Color Contrast

**Required:** All text must meet WCAG 2.1 AA contrast ratio (4.5:1)

---

## Related Documentation

- [Naming Conventions](./naming.md) - Naming standards
- [Folder Structure](./folder-structure.md) - Directory organization
- [Component Constitution](../../../packages/ui/constitution/components.yml) - Component rules
- [RSC Constitution](../../../packages/ui/constitution/rsc.yml) - RSC boundary rules

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team

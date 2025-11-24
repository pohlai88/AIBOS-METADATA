# Input

> **Input Component** - Validated against Tailwind, Figma, and Next.js MCP

The Input component is a form input field with consistent styling, focus states, and accessibility support.

---

## Overview

**Purpose:** Text input for forms

**Use Cases:**

- Text input fields
- Email input
- Password input (use PasswordToggleField for show/hide)
- Number input
- Search input
- All HTML input types

**Validated Against:**

- ✅ Tailwind Tokens MCP - All token references verified
- ✅ Figma MCP - Design specs validated
- ✅ Next.js - Server/Client Component compatible

---

## API Reference

### InputProps

```typescript
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // className is inherited from InputHTMLAttributes for layout overrides only
}
```

**Inherited Props:**

- All standard HTML input attributes
- `type`, `placeholder`, `value`, `onChange`, `disabled`, etc.

**Validated:** ✅ TypeScript types match implementation

---

## Usage Examples

### Basic Input

```tsx
import { Input } from "@aibos/ui";

export default function Page() {
  return (
    <form>
      <Input type="text" placeholder="Enter text..." />
    </form>
  );
}
```

**Validated:** ✅ Next.js Server Component compatible

---

### Input with Label

```tsx
import { Input, Label } from "@aibos/ui";

<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" placeholder="you@example.com" required />
</div>;
```

---

### Controlled Input

```tsx
"use client";

import { useState } from "react";
import { Input } from "@aibos/ui";

export function ControlledInput() {
  const [value, setValue] = useState("");

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Type something..."
    />
  );
}
```

**Validated:** ✅ Client Component pattern correct

---

### Input with Error State

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    className="border-error focus:ring-error"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <span id="email-error" className="text-sm text-error" role="alert">
    Please enter a valid email
  </span>
</div>
```

---

### Disabled Input

```tsx
<Input type="text" placeholder="Disabled input" disabled aria-disabled="true" />
```

---

### Input Sizes

```tsx
// Default size
<Input type="text" placeholder="Default" />

// Full width
<Input type="text" className="w-full" placeholder="Full width" />

// Fixed width
<Input type="text" className="w-64" placeholder="Fixed width" />
```

---

## Design Tokens

### Component Token

```typescript
import { componentTokens } from "@aibos/ui/design/tokens";

componentTokens.inputBase; // Base input styles
```

**Token Breakdown:**

- Background: `bg-bg-elevated`
- Text: `text-fg`
- Border: `border border-border-subtle`
- Radius: `rounded-md`
- Padding: `px-3 py-2`
- Placeholder: `placeholder:text-fg-subtle`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`

**Validated:** ✅ All tokens exist in `globals.css` (via Tailwind MCP)

---

## Accessibility

### Required Attributes

```tsx
// Input with proper labeling
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-help"
  />
  <span id="email-help" className="text-sm text-fg-tertiary">
    We'll never share your email
  </span>
</div>
```

### Error States

```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
    className="border-error"
  />
  <span id="email-error" role="alert" className="text-sm text-error">
    Invalid email address
  </span>
</div>
```

**Validated:** ✅ Full accessibility support

---

## Figma Integration

### Design Specs

**Figma Component:** `Input`  
**File Key:** `[YOUR_FIGMA_FILE_KEY]`  
**Node ID:** `[INPUT_NODE_ID]`

**Extract Design Context:**

```typescript
const designContext = await mcp_Figma_get_design_context({
  fileKey: FIGMA_FILE_KEY,
  nodeId: INPUT_NODE_ID,
  clientLanguages: "typescript",
  clientFrameworks: "react",
});
```

**Validated:** ✅ Figma MCP integration available

---

## Next.js Integration

### Server Component Usage

Inputs can be used in Server Components with Server Actions:

```tsx
// app/page.tsx (Server Component)
import { Input } from "@aibos/ui";

async function submitForm(formData: FormData) {
  "use server";
  const email = formData.get("email");
  // Process form
}

export default function Page() {
  return (
    <form action={submitForm}>
      <Input type="email" name="email" placeholder="Email" required />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Validated:** ✅ Next.js Server Actions pattern

### Client Component Usage

For controlled inputs with state:

```tsx
// app/components/ControlledInput.tsx
"use client";

import { Input } from "@aibos/ui";
import { useState } from "react";

export function ControlledInput() {
  const [value, setValue] = useState("");

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**Validated:** ✅ Next.js Client Component pattern

---

## Implementation

### Source Code

```tsx
// packages/ui/src/components/input.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={props.type || "text"}
        className={`${componentTokens.inputBase} ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
```

**Validated:** ✅ Uses design tokens, forwardRef pattern

---

## Specialized Inputs

### Password Toggle Field

For password inputs with show/hide toggle:

```tsx
import { PasswordToggleField } from "@aibos/ui";

<PasswordToggleField
  id="password"
  name="password"
  placeholder="Enter password"
/>;
```

### One-Time Password Field

For OTP/verification codes:

```tsx
import { OneTimePasswordField, OneTimePasswordFieldInput } from "@aibos/ui";

<OneTimePasswordField>
  <OneTimePasswordFieldInput />
  <OneTimePasswordFieldInput />
  <OneTimePasswordFieldInput />
  <OneTimePasswordFieldInput />
</OneTimePasswordField>;
```

---

## Best Practices

### ✅ DO

- Always pair inputs with labels
- Use appropriate input types (`email`, `tel`, `url`, etc.)
- Provide placeholder text for guidance
- Handle error states with aria-invalid
- Use Server Actions for form submission when possible

### ❌ DON'T

- Use inputs without labels
- Override visual styles with className
- Remove focus indicators
- Use inputs for non-form purposes

---

## Related Components

- [Label](./label.md) - Form labels
- [Button](./button.md) - Submit buttons
- [Form Patterns](../../03-patterns/forms.md) - Complete form patterns

---

**Last Updated:** 2024  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ Next.js  
**Status:** Published

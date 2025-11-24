# [Component Name]

> **UI Component Documentation**  
> **Component:** [Component Name]  
> **Category:** [Primitive | Composition | Layout]  
> **Version:** 1.0.0

---

## Overview

[Brief description of the component and its purpose]

### When to Use
- [Use case 1]
- [Use case 2]

### When Not to Use
- [Anti-pattern 1]
- [Anti-pattern 2]

---

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `prop1` | `string` | - | ✅ | [Description] |
| `prop2` | `number` | `0` | ❌ | [Description] |
| `prop3` | `boolean` | `false` | ❌ | [Description] |

### Type Definition
```typescript
interface ComponentProps {
  prop1: string;
  prop2?: number;
  prop3?: boolean;
}
```

---

## Usage

### Basic Example
```tsx
import { ComponentName } from '@aibos/ui';

export function Example() {
  return <ComponentName prop1="value" />;
}
```

### Advanced Example
```tsx
import { ComponentName } from '@aibos/ui';

export function AdvancedExample() {
  return (
    <ComponentName
      prop1="value"
      prop2={42}
      prop3={true}
    />
  );
}
```

---

## Variants

### Variant 1: [Name]
[Description and example]

### Variant 2: [Name]
[Description and example]

---

## Accessibility

### ARIA Attributes
- `role`: [Role]
- `aria-label`: [Label]
- `aria-describedby`: [Description]

### Keyboard Navigation
- `Tab`: [Behavior]
- `Enter`: [Behavior]
- `Escape`: [Behavior]

### Screen Reader Support
[How screen readers interpret this component]

---

## Figma

**Design File:** [Link to Figma file]  
**Component:** [Figma component name]  
**Last Synced:** [Date]

---

## Related Components
- [Related Component 1]
- [Related Component 2]

---

**Maintained By:** [Component Owner]  
**Last Updated:** [Date]  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ Next.js


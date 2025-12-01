# ColoredMDIIcon Component

## Overview

The `ColoredMDIIcon` component provides **adaptive luminance** icon coloring that automatically adjusts between light and dark modes. Icons use semantic color tokens that are optimized for readability in each mode.

## Features

✅ **Adaptive Luminance** - Automatically uses darker, richer colors in light mode and brighter, neon colors in dark mode  
✅ **Semantic Variants** - Tech stack colors (JavaScript, TypeScript, Python, etc.) and system status colors  
✅ **Glassy Background** - Optional translucent background matching the icon color (Cursor/Linear aesthetic)  
✅ **Type-Safe** - Full TypeScript support with variant types

## Usage

### Basic Usage (Clean)

```tsx
import { ColoredMDIIcon } from "@aibos/ui";
import { mdiLanguageJavascript } from "@mdi/js";

// Just the icon, perfectly colored for Light or Dark mode automatically
<ColoredMDIIcon path={mdiLanguageJavascript} variant="javascript" />;
```

### With Glassy Background (Pro/Dashboard Style)

```tsx
import { ColoredMDIIcon } from "@aibos/ui";
import {
  mdiLanguageJavascript,
  mdiLanguageTypescript,
  mdiAlertCircle,
} from "@mdi/js";

// High-end dashboard look with matching soft tint backgrounds
<div className="flex gap-4">
  <ColoredMDIIcon
    path={mdiLanguageJavascript}
    variant="javascript"
    withBackground
  />
  <ColoredMDIIcon
    path={mdiLanguageTypescript}
    variant="typescript"
    withBackground
  />
  <ColoredMDIIcon path={mdiAlertCircle} variant="error" withBackground />
</div>;
```

## Available Variants

### Tech Stack Identity

- `javascript` - Amber (Light: #D97706, Dark: #FCD34D)
- `typescript` - Blue (Light: #2563EB, Dark: #60A5FA)
- `python` - Sky (Light: #0284C7, Dark: #38BDF8)
- `html` - Orange (Light: #EA580C, Dark: #FB923C)
- `css` - Cyan (Light: #0891B2, Dark: #22D3EE)
- `react` - Emerald (Light: #059669, Dark: #34D399)
- `vue` - Green (Light: #16A34A, Dark: #4ADE80)
- `node` - Lime (Light: #4D7C0F, Dark: #A3E635)
- `git` - Red (Light: #DC2626, Dark: #F87171)

### System Status

- `success` - Green (Light: #16A34A, Dark: #4ADE80)
- `warning` - Amber (Light: #D97706, Dark: #FBBF24)
- `error` - Red (Light: #DC2626, Dark: #F87171)
- `info` - Blue (Light: #2563EB, Dark: #60A5FA)

### Base UI

- `primary` - Indigo (Light: #4F46E5, Dark: #818CF8)
- `secondary` - Slate (Light: #64748B, Dark: #94A3B8)
- `muted` - Slate (Light: #94A3B8, Dark: #475569)

## Props

```typescript
interface ColoredMDIIconProps {
  path: string; // MDI icon path (from @mdi/js)
  size?: number | string; // Icon size (default: 1)
  className?: string; // Additional CSS classes
  variant?: IconColorVariant; // Color variant (default: 'secondary')
  withBackground?: boolean; // Add glassy background (default: false)
}
```

## Design Philosophy

### Light Mode

- **Focus:** Readability and Contrast
- **Colors:** Darker, richer colors optimized for white backgrounds
- **Example:** JavaScript uses Amber-600 (#D97706) for high contrast

### Dark Mode

- **Focus:** "Pop" and Glow
- **Colors:** Brighter, pastel/neon colors optimized for dark backgrounds
- **Example:** JavaScript uses Amber-300 (#FCD34D) for neon glow effect

## Installation

The component requires `@mdi/react` which is already included in `@aibos/ui`:

```bash
# Already installed in @aibos/ui
pnpm add @mdi/react  # ✅ Already included
```

## Examples

### Tech Stack Badge

```tsx
<div className="flex items-center gap-2">
  <ColoredMDIIcon
    path={mdiLanguageTypescript}
    variant="typescript"
    size={20}
    withBackground
  />
  <span>TypeScript Project</span>
</div>
```

### Status Indicator

```tsx
<ColoredMDIIcon
  path={mdiCheckCircle}
  variant="success"
  size={24}
  withBackground
/>
```

### Icon Grid

```tsx
<div className="grid grid-cols-4 gap-4">
  {[
    { path: mdiLanguageJavascript, variant: "javascript" },
    { path: mdiLanguageTypescript, variant: "typescript" },
    { path: mdiLanguagePython, variant: "python" },
    { path: mdiLanguageHtml5, variant: "html" },
  ].map(({ path, variant }) => (
    <ColoredMDIIcon
      key={variant}
      path={path}
      variant={variant as IconColorVariant}
      size={32}
      withBackground
    />
  ))}
</div>
```

---

**Design System:** AI-BOS v1.0.0  
**Component:** ColoredMDIIcon  
**Theme:** Adaptive Luminance (Nano Banana Pro)

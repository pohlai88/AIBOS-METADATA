# 🎨 AI-BOS Visual Style Guide

## Quick Reference for Designers & Developers

**Version:** 1.0.0  
**Status:** Quick Reference  
**Last Updated:** 2025-01-27

---

## 🎯 Core Brand Values

**Trust | Precision | Agility | Intelligence | Elegance**

---

## 🎨 Color Palette

### Primary Brand Colors

| Token          | Light Mode                | Dark Mode                  | Usage                          |
| -------------- | ------------------------- | -------------------------- | ------------------------------ |
| `primary`      | `#2563eb` (blue-600)      | `#60a5fa` (blue-400)       | CTAs, active states, brand     |
| `primary-soft` | `rgba(37, 99, 235, 0.12)` | `rgba(96, 165, 250, 0.18)` | Backgrounds, subtle highlights |
| `secondary`    | `#1d4ed8` (blue-700)      | `#38bdf8` (sky-400)        | Secondary actions, depth       |

### Status Colors

| Status    | Light                 | Dark                  | Usage                       |
| --------- | --------------------- | --------------------- | --------------------------- |
| `success` | `#16a34a` (green-600) | `#22c55e` (green-500) | Success, completed, valid   |
| `warning` | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) | Warning, pending, attention |
| `danger`  | `#dc2626` (red-600)   | `#f87171` (red-400)   | Error, critical, blocked    |

### Neutral Palette

| Token         | Light Mode           | Dark Mode             | Usage                    |
| ------------- | -------------------- | --------------------- | ------------------------ |
| `bg`          | `#f9fafb` (gray-50)  | `#020617` (slate-950) | Main background          |
| `bg-muted`    | `#f3f4f6` (gray-100) | `#020617`             | Muted background         |
| `bg-elevated` | `#ffffff`            | `#020617`             | Cards, elevated surfaces |
| `fg`          | `#111827` (gray-900) | `#e5e7eb` (gray-200)  | Primary text             |
| `fg-muted`    | `#6b7280` (gray-500) | `#9ca3af` (gray-400)  | Secondary text           |
| `fg-subtle`   | `#9ca3af` (gray-400) | `#6b7280` (gray-500)  | Tertiary text            |
| `border`      | `#e5e7eb` (gray-200) | `#1f2937` (gray-800)  | Borders, dividers        |

---

## 📝 Typography

### Font Families

- **Primary:** Inter (UI, body, headings)
- **Monospace:** System Mono (code, technical data)

### Type Scale

| Style       | Size | Weight         | Line Height | Usage                    |
| ----------- | ---- | -------------- | ----------- | ------------------------ |
| `headingLg` | 18px | 600 (Semibold) | 1.5         | Page titles              |
| `headingMd` | 16px | 600 (Semibold) | 1.5         | Section headers          |
| `headingSm` | 14px | 600 (Semibold) | 1.5         | Subsection headers       |
| `bodyMd`    | 15px | 400 (Regular)  | 1.6         | Body text                |
| `bodySm`    | 14px | 400 (Regular)  | 1.6         | Small body text          |
| `labelSm`   | 11px | 500 (Medium)   | 1.4         | Labels, tags (uppercase) |

---

## 📐 Spacing Scale

| Token | Value    | Pixels | Usage               |
| ----- | -------- | ------ | ------------------- |
| `xs`  | 0.25rem  | 4px    | Tight spacing       |
| `sm`  | 0.375rem | 6px    | Small spacing       |
| `md`  | 0.5rem   | 8px    | Medium spacing      |
| `lg`  | 0.75rem  | 12px   | Large spacing       |
| `xl`  | 1rem     | 16px   | Extra large spacing |

**Component Spacing:**

- Button padding: `px-3 py-1.5` (sm)
- Card padding: `p-4`
- Input padding: `px-3 py-1.5` (sm)

---

## 🔲 Border Radius

| Token  | Value          | Usage                  |
| ------ | -------------- | ---------------------- |
| `xs`   | 0.25rem (4px)  | Small elements         |
| `sm`   | 0.375rem (6px) | Buttons, inputs        |
| `md`   | 0.5rem (8px)   | Cards, containers      |
| `lg`   | 0.5rem (8px)   | Large cards            |
| `xl`   | 0.75rem (12px) | Extra large containers |
| `2xl`  | 1rem (16px)    | Modals, dialogs        |
| `full` | 9999px         | Pills, badges          |

---

## 🌑 Shadows

| Token | Value                                | Usage            |
| ----- | ------------------------------------ | ---------------- |
| `xs`  | `0 1px 2px 0 rgb(0 0 0 / 0.05)`      | Subtle elevation |
| `sm`  | `0 1px 3px 0 rgb(0 0 0 / 0.10)`      | Small elevation  |
| `md`  | `0 6px 16px 0 rgb(15 23 42 / 0.08)`  | Medium elevation |
| `lg`  | `0 14px 32px 0 rgb(15 23 42 / 0.16)` | Large elevation  |

**Dark Mode:** Shadows are more pronounced (higher opacity).

---

## 🎭 Component Tokens

### Button Styles

**Primary Button:**

```css
bg-primary text-primary-foreground
px-3 py-1.5 rounded-lg shadow-xs
hover:opacity-95 active:scale-[0.98]
```

**Secondary Button:**

```css
bg-secondary-soft text-secondary-foreground
px-3 py-1.5 rounded-lg shadow-xs border border-border
hover:bg-secondary-soft/80 active:scale-[0.98]
```

**Ghost Button:**

```css
bg-bg-elevated text-fg
px-3 py-1.5 rounded-lg
border border-transparent hover:border-border hover:bg-bg-muted
active:scale-[0.98]
```

### Card Style

```css
bg-bg-elevated text-fg
border border-border rounded-lg shadow-xs p-4
```

### Input Style

```css
bg-bg-elevated text-fg
border border-border rounded-md px-3 py-1.5
text-sm leading-relaxed
focus-visible:ring-2 focus-visible:ring-ring
focus-visible:border-ring
```

---

## 🎬 Animation Guidelines

### Durations

- **Micro-interactions:** 100-200ms
- **Transitions:** 200-300ms
- **Complex animations:** 300-500ms

### Easing

- **Default:** `ease-in-out`
- **Enter:** `ease-out`
- **Exit:** `ease-in`

### Patterns

| Interaction  | Animation    | Duration |
| ------------ | ------------ | -------- |
| Button press | Scale 0.98   | 120ms    |
| Hover        | Opacity 0.95 | 80ms     |
| Focus        | Ring outline | 150ms    |
| Mode switch  | Fade + slide | 300ms    |
| Drawer open  | Slide in     | 250ms    |
| Modal        | Fade + scale | 200ms    |

**⚠️ Always respect `prefers-reduced-motion`**

---

## 🖼️ Icon Guidelines

### Style

- **Weight:** 1.5px stroke
- **Sizes:** 16px, 20px, 24px (standard)
- **Style:** Outlined, rounded corners
- **Color:** Semantic (fg, primary, status)

### Usage

- Always provide text labels for accessibility
- Use consistent icon families
- Match icon style to context
- Don't mix icon styles

---

## 🎨 Dual-Mode Design

### The Ledger (Stability)

- **Density:** Compact (`density.compact`)
- **Layout:** Grid-based, keyboard-first
- **Visual:** Minimal chrome, maximum data
- **Typography:** Smaller, tighter spacing

### The Cockpit (Agility)

- **Density:** Comfortable (`density.comfortable`)
- **Layout:** Card-based, intent-driven
- **Visual:** Clear hierarchy, narrative flow
- **Typography:** Larger, more breathing room

---

## ✅ Design Checklist

### Before Implementation

- [ ] All colors use design tokens (no hardcoded values)
- [ ] Typography uses semantic tokens
- [ ] Spacing follows scale (xs, sm, md, lg, xl)
- [ ] Border radius uses tokens
- [ ] Shadows use elevation system
- [ ] Accessibility: WCAG 2.1 AA contrast
- [ ] Keyboard navigation supported
- [ ] Screen reader labels provided
- [ ] Reduced motion respected

### Component Review

- [ ] Uses component tokens where available
- [ ] Follows dual-mode patterns (if applicable)
- [ ] Responsive design tested
- [ ] Dark mode tested
- [ ] Animation performance checked
- [ ] Error states defined
- [ ] Loading states defined
- [ ] Empty states defined

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't

- Hardcode colors, spacing, or typography
- Mix color meanings (e.g., red for non-error)
- Use pure black/white (use semantic tokens)
- Create new colors outside the palette
- Ignore accessibility requirements
- Animate everything
- Mix icon styles
- Override tokens arbitrarily

### ✅ Do

- Use design tokens for all styling
- Maintain semantic color usage
- Test accessibility (contrast, keyboard, screen readers)
- Use purposeful animations only
- Keep icon styles consistent
- Document token usage
- Test in both light and dark modes

---

## 📚 Quick Links

- **Full Moodboard:** [AI-BOS_MOODBOARD.md](./AI-BOS_MOODBOARD.md)
- **UX Strategy:** [grcd_ux_ui_strategy_v_1_1.md](./grcd_ux_ui_strategy_v_1_1.md)
- **Design Tokens:** `packages/ui/src/design/tokens.ts`
- **Global Styles:** `packages/ui/src/design/globals.css`

---

## 🎯 Brand Tagline

**"Governed Agility: Where Precision Meets Possibility"**

---

_Last Updated: 2025-01-27_

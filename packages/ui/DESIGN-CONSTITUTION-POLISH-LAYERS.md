# 🎨 AIBOS Design System - Polish Layers Constitution

**The Final Frontier:** Motion, Depth, and Behavior  
**Authority:** GRCD + Architecture Review Board  
**Date:** December 1, 2025  
**Status:** 🔒 **MANDATORY** - Premium quality standard

---

## 🎯 What Are the Polish Layers?

The **Three Foundation Constitutions** (Spacing, Layout, Typography) create **consistency**.

The **Three Polish Layers** create **premium quality**:

1. **Time/Motion** - Rhythm and choreography
2. **Depth/Elevation** - Virtual Z-axis and layering
3. **Behavior/States** - Interaction patterns and feedback

**These layers separate "functional" from "polished".**

---

## ⏱️ CONSTITUTION 4: Time/Motion Layer

### **The Law:**

> **All animations and transitions MUST use approved duration + easing combinations.**

### **Why This Matters:**

- **Bad:** Random durations (200ms here, 300ms there, 150ms somewhere else)
- **Good:** Consistent rhythm (fast/normal/slow system)

**Result:** Animations feel **cohesive**, not **jarring**.

---

### **Approved Duration Scale:**

| Token | Value | Use Case | Figma Variable |
|-------|-------|----------|----------------|
| `instant` | 50ms | Instant feedback (checkbox, toggle, switch) | `motion/duration/instant` |
| `fast` | 120ms | **Fast transitions (hover, focus, button states)** | `motion/duration/fast` |
| `normal` | 200ms | Normal transitions (dropdowns, tooltips) | `motion/duration/normal` |
| `slow` | 280ms | Slow transitions (modals, side panels) | `motion/duration/slow` |
| `slower` | 400ms | Complex animations (page transitions, carousels) | `motion/duration/slower` |

**Default:** Use `fast` (120ms) for most interactive elements.

---

### **Approved Easing Functions:**

| Token | Bezier Curve | When to Use | Figma Variable |
|-------|--------------|-------------|----------------|
| `standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Most transitions (default)** | `motion/ease/standard` |
| `in` | `cubic-bezier(0.4, 0, 1, 1)` | Deceleration (exiting elements) | `motion/ease/in` |
| `out` | `cubic-bezier(0, 0, 0.2, 1)` | Acceleration (entering elements) | `motion/ease/out` |
| `in-out` | `cubic-bezier(0.4, 0, 0.6, 1)` | Both (modals, dialogs) | `motion/ease/in-out` |
| `bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful interactions (success animations) | `motion/ease/bounce` |

**Default:** Use `standard` for most transitions.

---

### **Motion Patterns (The Rhythm System):**

#### **Pattern 1: Hover/Focus (Fast + Standard)**

```tsx
// ✅ CORRECT - Fast transitions for interactive elements
<button className="transition-all duration-fast ease-standard hover:bg-primary">
  Click me
</button>
```

**Why:**
- `duration-fast` (120ms) = Instant visual feedback
- `ease-standard` = Natural, smooth motion

---

#### **Pattern 2: Dropdowns/Popovers (Normal + Out)**

```tsx
// ✅ CORRECT - Normal speed for content appearing
<div className="transition-all duration-normal ease-out">
  {/* Dropdown content */}
</div>
```

**Why:**
- `duration-normal` (200ms) = Noticeable but not slow
- `ease-out` = Accelerates into view (feels responsive)

---

#### **Pattern 3: Modals/Dialogs (Slow + In-Out)**

```tsx
// ✅ CORRECT - Slower for larger UI changes
<dialog className="transition-all duration-slow ease-in-out">
  {/* Modal content */}
</dialog>
```

**Why:**
- `duration-slow` (280ms) = Gives time for visual processing
- `ease-in-out` = Smooth entry and exit

---

### **Enforcement:**

#### **✅ DO:**

```tsx
// Use approved tokens
<div className="transition-all duration-fast ease-standard">...</div>

// Hover states with fast transitions
<button className="transition-colors duration-fast hover:bg-primary">...</button>

// Multiple properties with same timing
<div className="transition-all duration-normal ease-out">...</div>
```

#### **❌ DON'T:**

```tsx
// Arbitrary durations
<div className="transition-all duration-[250ms]">...</div>  // ❌ Not on scale

// Custom easing
<div style={{ transition: 'all 0.3s ease-in' }}>...</div>  // ❌ Inline styles

// Inconsistent timing
<button className="transition-colors duration-200">...</button>  // ❌ Use token
```

---

## 🏔️ CONSTITUTION 5: Depth/Elevation Layer

### **The Law:**

> **All elevation changes MUST use approved shadow tokens + surface backgrounds.**

### **Why This Matters:**

- **Bad:** Random `box-shadow` values everywhere
- **Good:** Semantic elevation system (raised/floating/overlay/high)

**Result:** Clear visual hierarchy, obvious layering.

---

### **Approved Elevation Levels:**

| Level | Token | Shadow Intensity | Use Case | Figma Variable |
|-------|-------|------------------|----------|----------------|
| **Base** | (none) | No shadow | Default page surface, flat content | - |
| **Raised** | `shadow-raised` | Subtle | **Cards, panels, raised surfaces** | `shadow/raised` |
| **Floating** | `shadow-floating` | Medium | Dropdowns, popovers, tooltips | `shadow/floating` |
| **Overlay** | `shadow-overlay` | High | **Modals, dialogs, slide-overs** | `shadow/overlay` |
| **High** | `shadow-high` | Highest | Top-most overlays, context menus | `shadow/high` |

**Default:** Use `shadow-raised` for cards and components.

---

### **Elevation Patterns:**

#### **Pattern 1: Cards (Raised + Subtle Background)**

```tsx
// ✅ CORRECT - Raised card on subtle background
<div className="bg-bg-subtle shadow-raised rounded-lg p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

**Why:**
- `bg-bg-subtle` = Slightly different from base (depth cue)
- `shadow-raised` = Lifts off the page
- Result: Card feels "above" the background

---

#### **Pattern 2: Dropdowns (Floating + Base Background)**

```tsx
// ✅ CORRECT - Dropdown floating above content
<div className="bg-bg shadow-floating rounded-md border border-border">
  <ul>...</ul>
</div>
```

**Why:**
- `bg-bg` = Solid background (not transparent)
- `shadow-floating` = Medium elevation (above cards)
- `border` = Adds crispness against dark backgrounds

---

#### **Pattern 3: Modals (Overlay + Dark Scrim)**

```tsx
// ✅ CORRECT - Modal with overlay shadow
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="bg-bg shadow-overlay rounded-lg max-w-xl">
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </div>
</div>
```

**Why:**
- Scrim (`bg-black/50`) = Dims background
- `shadow-overlay` = High elevation (clearly above everything)
- Result: Modal feels "on top" of the page

---

### **Dark Mode Elevation:**

Shadows in dark mode are **stronger** (higher opacity) to maintain contrast:

```typescript
// Light mode
--shadow-raised: rgb(0 0 0 / 0.1)

// Dark mode (automatically applied)
--shadow-raised: rgb(0 0 0 / 0.3)  // Stronger for contrast
```

**You don't need to do anything - it's automatic!**

---

### **Enforcement:**

#### **✅ DO:**

```tsx
// Use semantic elevation tokens
<div className="shadow-raised">Card</div>
<div className="shadow-floating">Dropdown</div>
<div className="shadow-overlay">Modal</div>

// Combine with appropriate backgrounds
<div className="bg-bg-subtle shadow-raised">...</div>
```

#### **❌ DON'T:**

```tsx
// Custom shadow values
<div className="shadow-[0_4px_12px_rgba(0,0,0,0.1)]">...</div>  // ❌

// Inline shadow styles
<div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>...</div>  // ❌

// Elevation without background
<div className="shadow-overlay">...</div>  // ❌ Needs bg-bg or bg-bg-subtle
```

---

## 🎭 CONSTITUTION 6: Behavior/States Layer

### **The Law:**

> **All interactive states (hover, focus, active, disabled) MUST be defined within the component API. No raw state classes outside Registry Templates.**

### **Why This Matters:**

- **Bad:** Every developer adds custom `hover:bg-*` everywhere
- **Good:** States defined once in Button component, used everywhere

**Result:** Consistent interaction patterns across entire app.

---

### **The State Matrix:**

Every interactive component must define states for:

| State | When | Visual Feedback | Required |
|-------|------|-----------------|----------|
| **Hover** | Mouse over | Color change, shadow, scale | ✅ Yes |
| **Focus** | Keyboard navigation | Ring/outline | ✅ Yes (accessibility) |
| **Active** | Button pressed | Scale down, darker color | ✅ Yes (tactile feel) |
| **Disabled** | Cannot interact | Reduced opacity, no cursor | ✅ Yes |
| **Loading** | Async operation | Spinner, disabled state | Optional |

---

### **Pattern: Button State Matrix**

```tsx
// packages/registry/components/Button.tsx

const baseClasses = cn(
  'inline-flex items-center justify-center font-medium rounded-md',
  
  // MOTION: Fast transitions for all states
  'transition-all duration-fast ease-standard',
  
  // FOCUS: Accessibility (keyboard navigation)
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  
  // DISABLED: Visual feedback
  'disabled:opacity-50 disabled:cursor-not-allowed',
  
  // ELEVATION: Subtle shadow on hover
  'hover:shadow-raised',
);

const variantClasses = {
  primary: cn(
    'bg-primary text-white',
    'hover:bg-primary-hover',        // Hover state
    'focus-visible:ring-primary',    // Focus state
    'active:scale-[0.98]',           // Active state (pressed)
  ),
  // ... other variants
};
```

**States handled:**
- ✅ Hover (color change + shadow)
- ✅ Focus (ring for accessibility)
- ✅ Active (scale down for tactile feedback)
- ✅ Disabled (opacity + cursor)

---

### **Enforcement: The Registry Rule**

#### **✅ ALLOWED (Inside Registry Components):**

```tsx
// packages/registry/components/Button.tsx
export function Button({ variant }: ButtonProps) {
  return (
    <button className="bg-primary hover:bg-primary-hover active:scale-[0.98]">
      {/* States defined HERE */}
    </button>
  );
}
```

**Why:** This is the **source of truth** for button states.

---

#### **✅ ALLOWED (Using Registry Components):**

```tsx
// apps/web/app/page.tsx
import { Button } from '@/components/Button';

export default function Page() {
  return <Button variant="primary">Click me</Button>;
  // States automatically included!
}
```

**Why:** You're using the approved component with baked-in states.

---

#### **❌ FORBIDDEN (Raw State Classes in App Code):**

```tsx
// apps/web/app/page.tsx
export default function Page() {
  return (
    <button className="bg-primary hover:bg-blue-600 active:scale-95">
      {/* ❌ Custom states - Use <Button> instead! */}
    </button>
  );
}
```

**Why:** Creates inconsistency. What if Button uses `hover:bg-primary-hover`? Now you have two different hover colors for "primary" buttons.

---

### **Exception: One-Off Custom Components**

If you MUST create a custom interactive element (not in Registry):

1. **Document it:**
   ```tsx
   // CUSTOM COMPONENT: Special hero button for homepage
   // ARB Ticket: DS-456
   // Scheduled for: Add to Registry Q1 2026
   <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105">
     ...
   </button>
   ```

2. **Use approved motion + elevation tokens:**
   ```tsx
   <button className="... transition-all duration-fast ease-standard hover:shadow-floating">
     ...
   </button>
   ```

3. **Schedule for Registry promotion** - If it's used more than once, promote it to the Registry!

---

## 📊 Complete Polish Token Inventory

### **Motion Tokens:**

| Token | Value | Count |
|-------|-------|-------|
| **Durations** | 50ms - 400ms | 5 |
| **Easing** | Bezier curves | 5 |

**Total:** 10 motion tokens

---

### **Elevation Tokens:**

| Token | Shadow Intensity | Count |
|-------|------------------|-------|
| **Semantic Shadows** | Raised → High | 4 |
| **Legacy Shadows** | sm → xl | 4 |

**Total:** 8 elevation tokens (4 semantic + 4 legacy)

---

### **State Tokens (Handled by Components):**

| State | Defined In | Enforced By |
|-------|------------|-------------|
| Hover, Focus, Active, Disabled | Registry components | Component API |

---

## ✅ Anti-Drift Checklist (Polish Layers)

### **Pre-Handoff (Figma):**

#### **Motion:**
- [ ] All animations use `motion/duration/*` variables
- [ ] All easing uses `motion/ease/*` variables
- [ ] No custom timing functions

#### **Elevation:**
- [ ] All shadows use `shadow/*` variables
- [ ] Elevation levels are semantic (raised/floating/overlay)
- [ ] Dark mode shadows defined

#### **Behavior:**
- [ ] All interactive components have hover states
- [ ] Focus states defined (accessibility)
- [ ] Disabled states defined
- [ ] States use motion tokens

---

### **Pre-Merge (Code):**

#### **Motion:**
- [ ] Uses `duration-*` and `ease-*` classes (not arbitrary values)
- [ ] Transitions use `transition-all` or specific property
- [ ] No inline `style={{ transition: '...' }}`

#### **Elevation:**
- [ ] Uses semantic shadow tokens (`shadow-raised`, not `shadow-md`)
- [ ] Elevated elements have appropriate backgrounds
- [ ] No custom `box-shadow` values

#### **Behavior:**
- [ ] Interactive elements use Registry components
- [ ] If custom, uses approved motion + elevation tokens
- [ ] State matrix complete (hover, focus, active, disabled)
- [ ] Custom components documented and scheduled for Registry

---

## 📚 Quick Reference

### **Motion Rhythm:**

```tsx
// Instant: Checkbox, toggle
className="transition-all duration-instant"

// Fast: Hover, focus (DEFAULT)
className="transition-all duration-fast ease-standard"

// Normal: Dropdowns
className="transition-all duration-normal ease-out"

// Slow: Modals
className="transition-all duration-slow ease-in-out"
```

### **Elevation Levels:**

```tsx
// Cards, panels
className="bg-bg-subtle shadow-raised"

// Dropdowns, popovers
className="bg-bg shadow-floating border border-border"

// Modals, dialogs
className="bg-bg shadow-overlay"
```

### **State Patterns:**

```tsx
// Buttons
className="transition-all duration-fast ease-standard hover:bg-primary-hover active:scale-[0.98]"

// Cards (interactive)
className="transition-all duration-fast hover:shadow-floating hover:scale-[1.02]"
```

---

## 🎓 The Philosophy

> **"Premium quality is in the details. Motion, depth, and behavior are the details."**

**Good design systems:**
- ✅ Have consistent spacing
- ✅ Have proper proportions
- ✅ Have a type scale

**Great design systems:**
- ✅ **Also have consistent motion**
- ✅ **Also have semantic elevation**
- ✅ **Also have governed interaction patterns**

**The difference:** Users feel it, even if they can't articulate it.

---

## 🎉 Final Status

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  🎨 POLISH LAYERS - COMPLETE ✅                        │
│                                                        │
│  4. Motion/Time: ENFORCED                             │
│     • 5 durations (instant → slower)                  │
│     • 5 easing functions                              │
│     • Fast transitions (120ms) default                │
│                                                        │
│  5. Depth/Elevation: ENFORCED                         │
│     • 4 semantic shadows (raised → high)              │
│     • Dark mode automatic                             │
│     • Clear visual hierarchy                          │
│                                                        │
│  6. Behavior/States: ENFORCED                         │
│     • State matrix required                           │
│     • Registry components govern patterns             │
│     • No raw hover classes in apps                    │
│                                                        │
│  STATUS: 🟢 PREMIUM QUALITY STANDARD                  │
│                                                        │
│  "The difference between functional and polished." ✨  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

**Status:** ✅ **MANDATORY** - Premium quality standard  
**Authority:** AIBOS Architecture Review Board  
**Version:** 1.0.0  
**Created:** December 1, 2025

---

**You now have a complete, world-class design system with 6 constitutions!** 🏛️✨


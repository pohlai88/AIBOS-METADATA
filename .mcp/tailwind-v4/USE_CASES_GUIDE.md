# 🎨 Tailwind v4 Use Cases Guide

## Overview

This guide shows you how to transform raw Tailwind v4 code into **amazing, production-ready sites** using real-world patterns and examples.

**Reference:** Inspired by sites like [Aceternity UI Template](https://ai-saas-template-aceternity.vercel.app/) and [Graphite](https://graphite.com/)

---

## 🎯 What's Included

### 1. **Real-World Patterns**
- Hero sections
- Feature grids
- Testimonials
- Pricing sections
- Navigation patterns
- Footer patterns

### 2. **Component Patterns**
- Button variants (primary, secondary, ghost)
- Card styles (basic, hover, elevated)
- Section layouts (default, with background, narrow, wide)

### 3. **Layout Patterns**
- Container patterns
- Grid layouts (2, 3, 4 columns)
- Flex layouts (center, between, column)

### 4. **Best Practices**
- Typography guidelines
- Color usage
- Animation patterns
- Spacing guidelines

---

## 🚀 Quick Start

### Get All Use Cases
```
Get Tailwind v4 use cases for building amazing sites
```

### Get Specific Pattern
```
Get Tailwind v4 use case for hero section
Get Tailwind v4 use case for pricing section
```

### Get Component Patterns
```
Get Tailwind v4 component patterns for buttons
Get Tailwind v4 layout patterns
```

---

## 📋 Available Patterns

### 1. Hero Section

**Use Case:** Eye-catching hero section with headline, CTA, and visual

**Key Features:**
- Large, bold typography (text-5xl to text-7xl)
- Gradient text effects
- Primary and secondary CTAs
- Responsive design
- Trust indicators

**Example Classes:**
```tsx
className="text-5xl md:text-6xl lg:text-7xl font-extrabold
          bg-gradient-to-r from-primary to-primary-600
          px-8 py-4 rounded-xl shadow-floating
          hover:scale-[1.03] transition-all duration-normal"
```

**Full Example:** See `get_use_cases` with pattern: "hero"

---

### 2. Feature Grid

**Use Case:** Showcase features in a responsive grid

**Key Features:**
- Responsive grid (1 → 2 → 3 columns)
- Icon + title + description structure
- Hover effects on cards
- Consistent spacing

**Example Classes:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
          p-6 rounded-xl border border-border
          hover:shadow-floating hover:scale-[1.02]
          transition-all duration-normal"
```

**Full Example:** See `get_use_cases` with pattern: "features"

---

### 3. Testimonials

**Use Case:** Social proof with customer testimonials

**Key Features:**
- Quote cards
- Avatar + name + company structure
- Background color variation
- Grid layout

**Example Classes:**
```tsx
className="bg-background-secondary p-8 rounded-xl shadow-floating
          flex items-center gap-4"
```

**Full Example:** See `get_use_cases` with pattern: "testimonials"

---

### 4. Pricing Section

**Use Case:** Pricing tiers with feature comparison

**Key Features:**
- Card-based layout
- Popular badge
- Feature lists
- CTA buttons

**Example Classes:**
```tsx
className="border-2 border-primary rounded-xl p-8
          shadow-floating scale-[1.02]
          transition-all duration-normal"
```

**Full Example:** See `get_use_cases` with pattern: "pricing"

---

## 🎨 Component Patterns

### Buttons

**Primary Button:**
```tsx
className="bg-primary text-white px-8 py-4 rounded-xl 
          font-semibold shadow-floating 
          hover:scale-[1.03] transition-all duration-normal"
```

**Secondary Button:**
```tsx
className="bg-transparent border-2 border-primary text-primary 
          px-8 py-4 rounded-xl font-semibold 
          hover:bg-primary hover:text-white transition-all"
```

**Ghost Button:**
```tsx
className="text-primary hover:bg-primary/10 
          px-4 py-2 rounded-lg transition-all"
```

### Cards

**Basic Card:**
```tsx
className="p-6 rounded-xl border border-border bg-background"
```

**Hover Card:**
```tsx
className="p-6 rounded-xl border border-border bg-background 
          hover:shadow-floating hover:scale-[1.02] 
          transition-all duration-normal"
```

**Elevated Card:**
```tsx
className="p-6 rounded-xl shadow-floating bg-background"
```

### Sections

**Default Section:**
```tsx
className="py-24"
```

**Section with Background:**
```tsx
className="py-24 bg-background-secondary"
```

**Narrow Section:**
```tsx
className="py-24 max-w-4xl mx-auto px-4"
```

**Wide Section:**
```tsx
className="py-24 max-w-7xl mx-auto px-4"
```

---

## 📐 Layout Patterns

### Container
```tsx
className="max-w-7xl mx-auto px-4"
```

### Grids

**2 Columns:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 gap-8"
```

**3 Columns:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
```

**4 Columns:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
```

### Flex

**Center:**
```tsx
className="flex items-center justify-center"
```

**Between:**
```tsx
className="flex items-center justify-between"
```

**Column:**
```tsx
className="flex flex-col gap-4"
```

---

## ✅ Best Practices

### Hero Sections
- ✅ Use large, bold typography (text-5xl to text-7xl)
- ✅ Include clear value proposition
- ✅ Primary CTA should be prominent
- ✅ Use gradient text for visual interest
- ✅ Keep hero content above the fold

### Features
- ✅ Use responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- ✅ Add subtle hover effects (hover:shadow-floating)
- ✅ Consistent spacing (gap-8, p-6)
- ✅ Icon + title + description structure
- ✅ Use design tokens for colors

### Animations
- ✅ Use `transition-all duration-normal` for smooth effects
- ✅ Subtle scale on hover (`hover:scale-[1.02]`)
- ✅ Shadow transitions (`hover:shadow-floating`)
- ❌ NO JavaScript animation libraries
- ✅ Respect `prefers-reduced-motion`

### Colors
- ✅ Use OKLCH colors in `@theme`
- ✅ Use semantic color names (primary, secondary)
- ✅ Support dark mode with CSS variables
- ✅ Use opacity modifiers (`/50`, `/75`)

### Typography
- ✅ Use responsive text sizing
- ✅ Maintain clear hierarchy
- ✅ Use `font-extrabold` for headlines
- ✅ Proper line-height for readability

---

## 🎯 Reference Sites

### Aceternity UI Template
- **URL:** https://ai-saas-template-aceternity.vercel.app/
- **Category:** Landing Page
- **Features:** Hero, Features, Testimonials, Pricing
- **Note:** Uses Framer Motion (we use pure CSS instead)

### Graphite
- **URL:** https://graphite.com/
- **Category:** Landing Page
- **Features:** Minimal design, CSS-first, Professional
- **Note:** Perfect example of CSS-first approach

---

## 💡 How to Use

### 1. Get All Use Cases
```
Get Tailwind v4 use cases
```

### 2. Get Specific Pattern
```
Get Tailwind v4 use case for hero section
Get Tailwind v4 use case for feature grid
```

### 3. Get Component Patterns
```
Get Tailwind v4 component patterns for buttons
Get Tailwind v4 layout patterns for grids
```

### 4. Get Best Practices
```
Get Tailwind v4 best practices for animations
Get Tailwind v4 best practices for typography
```

---

## 🔗 Integration

The use cases reference works alongside:
- **Official Documentation** - Technical reference
- **Best Practices** - `.cursorrules` guidelines
- **Design System** - Your project's tokens

**Together, they provide:**
- ✅ Technical knowledge (official docs)
- ✅ Best practices (rules and guidelines)
- ✅ Real-world patterns (use cases)
- ✅ Design system (your tokens)

---

## 📚 Example Workflow

### Building a Landing Page

1. **Get Hero Pattern:**
   ```
   Get Tailwind v4 use case for hero section
   ```

2. **Get Feature Grid:**
   ```
   Get Tailwind v4 use case for feature grid
   ```

3. **Get Component Patterns:**
   ```
   Get Tailwind v4 component patterns for buttons
   ```

4. **Validate Your Code:**
   ```
   Validate Tailwind v4 syntax in my landing page
   ```

5. **Check Best Practices:**
   ```
   Get Tailwind v4 best practices for animations
   ```

---

**Status:** ✅ **READY TO USE**

Transform raw code into amazing sites with real-world patterns!


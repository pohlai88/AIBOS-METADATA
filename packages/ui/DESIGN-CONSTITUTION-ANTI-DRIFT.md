# 🏛️ AIBOS Design Constitution - Anti-Drift Checklist

**Authority:** GRCD (Governance, Requirements, Contracts, Documentation)  
**Date:** December 1, 2025  
**Status:** 🔒 **MANDATORY** - No exceptions without Architecture Review  
**Purpose:** Prevent design drift, enforce consistency, ensure maintainability

---

## 🎯 The Three Constitutions

The AIBOS design system is governed by three fundamental constitutions:

1. **Spacing Constitution** - 8-Point Grid
2. **Layout Constitution** - 75% Rule & Proportions
3. **Typography Constitution** - Type Scale Ratio (~1.25)

**Violation of these constitutions requires Architecture Review Board approval.**

---

## 📐 CONSTITUTION 1: Spacing (8-Point Grid)

### **The Law:**

> **All spacing MUST be multiples of 4px (micro) or 8px (structural).**

### **Approved Scale:**

| Token | Value | Use Case | Figma Variable |
|-------|-------|----------|----------------|
| `1` | 4px | Micro spacing (icon gaps, tight padding) | `space/1` |
| `2` | 8px | Tight spacing (small components) | `space/2` |
| `3` | 12px | Small spacing (compact layouts) | `space/3` |
| `4` | 16px | Base spacing (standard padding) | `space/4` |
| `5` | 24px | Medium spacing (card padding) | `space/5` |
| `6` | 32px | Large spacing (section gaps) | `space/6` |
| `7` | 40px | XL spacing (major gaps) | `space/7` |
| `8` | 48px | 2XL spacing (hero padding) | `space/8` |
| `10` | 64px | 3XL spacing (major sections) | `space/10` |
| `12` | 96px | 4XL spacing (landing pages) | `space/12` |

### **Rules:**

✅ **DO:**
```tsx
<div className="p-4 gap-6 mb-8">  {/* ✅ All multiples of 4 */}
<div className="space-y-6">        {/* ✅ Uses approved token */}
```

❌ **DON'T:**
```tsx
<div className="p-[13px]">         {/* ❌ Not on 4px grid */}
<div className="mb-[11px]">        {/* ❌ Arbitrary value */}
<div style={{ padding: "15px" }}> {/* ❌ Inline styles */}
```

### **Enforcement:**

#### **🎨 Figma:**
- [ ] All padding uses `space/*` variables (no raw `px` values)
- [ ] All Auto Layout gaps use `space/*` variables
- [ ] All margins/spacing uses `space/*` variables
- [ ] No local spacing values (e.g., `13px`, `27px`)
- [ ] Deviations tagged as `EXPERIMENT` with documentation

#### **💻 Code:**
- [ ] All `p-*`, `m-*`, `gap-*`, `space-*` classes use approved scale
- [ ] No `p-[arbitrary]` values except for approved exceptions
- [ ] No inline styles with custom spacing
- [ ] ESLint rule (if configured): Warn on non-standard spacing

---

## 📏 CONSTITUTION 2: Layout (75% Rule & Proportions)

### **The Law:**

> **Content layouts MUST use approved proportion systems and max-width constraints.**

### **Approved Proportions:**

| Pattern | Main | Sidebar | Use Case | Component |
|---------|------|---------|----------|-----------|
| **75% Rule** | 3fr | 1fr | Content + Sidebar | `<ContentWithSidebar>` |
| **Full-Width** | 100% | - | Hero sections | `<FullBleedSection>` |
| **Centered** | max-width | - | Article content | `<CenteredContent>` |

### **Approved Max-Widths:**

| Token | Value | Use Case | Figma Variable |
|-------|-------|----------|----------------|
| `sm` | 640px | Small content, mobile-first | `layout/maxWidth/sm` |
| `md` | 768px | Medium content, tablets | `layout/maxWidth/md` |
| `lg` | 1024px | Large content, desktop | `layout/maxWidth/lg` |
| `xl` | 1280px | XL content, wide desktop | `layout/maxWidth/xl` |
| `2xl` | 1536px | 2XL content, ultra-wide | `layout/maxWidth/2xl` |

### **Approved Fixed Widths:**

| Token | Value | Use Case | Figma Variable |
|-------|-------|----------|----------------|
| `sidebar` | 280px | Left navigation | `layout/sidebar/width` |
| `sidebar-collapsed` | 64px | Collapsed icon nav | `layout/sidebar/collapsed` |

### **Rules:**

✅ **DO:**
```tsx
<PageShell sidebar={<Nav />}>
  <ContentWithSidebar
    main={<Article />}
    sidebar={<Metadata />}
  />
</PageShell>

<CenteredContent maxWidth="xl">
  {content}
</CenteredContent>

<div className="max-w-xl mx-auto">  {/* Uses approved token */}
```

❌ **DON'T:**
```tsx
<div className="w-[723px]">        {/* ❌ Arbitrary width */}
<div className="max-w-[900px]">    {/* ❌ Not on approved scale */}
<div style={{ width: "70%" }}>   {/* ❌ Inline styles */}

{/* ❌ Random grid without approved ratios */}
<div className="grid grid-cols-[2.3fr,1.7fr]">
```

### **Enforcement:**

#### **🎨 Figma:**
- [ ] Layouts built using `Layout/*` components (PageShell, ContentWithSidebar, etc.)
- [ ] Max-width uses `layout/maxWidth/*` variables
- [ ] Sidebar widths use `layout/sidebar/*` variables
- [ ] No random frame widths (e.g., `723px`, `917px`)
- [ ] Free-form layouts tagged as `EXPERIMENT`

#### **💻 Code:**
- [ ] Use approved layout components (`<PageShell>`, `<ContentWithSidebar>`, etc.)
- [ ] Max-width classes use approved tokens (`max-w-xl`, not `max-w-[900px]`)
- [ ] Grid layouts use standard patterns (`grid-cols-[3fr,1fr]` for 75% rule)
- [ ] No custom random widths without documentation

---

## 🔤 CONSTITUTION 3: Typography (Type Scale Ratio)

### **The Law:**

> **All font sizes MUST use the approved type scale (~1.25 ratio from 16px base).**

### **Approved Type Scale:**

| Token | Size | Use Case | Figma Variable | Component |
|-------|------|----------|----------------|-----------|
| `xs` | 12px | Small labels, captions | `type/size/xs` | `<Caption>` |
| `sm` | 14px | Secondary text, small UI | `type/size/sm` | - |
| `base` | 16px | **Body text (BASE)** | `type/size/base` | `<Body>` |
| `lg` | 18px | Large body, subtitles | `type/size/lg` | `<Subtitle>` |
| `xl` | 20px | H3, emphasized text | `type/size/xl` | `<H3>` |
| `2xl` | 24px | H2, section headings | `type/size/2xl` | `<H2>` |
| `3xl` | 30px | H1, page titles | `type/size/3xl` | `<H1>` |
| `4xl` | 36px | Display headings | `type/size/4xl` | - |
| `5xl` | 48px | Hero headings | `type/size/5xl` | - |
| `6xl` | 60px | Marketing hero | `type/size/6xl` | - |

### **Semantic Hierarchy:**

| Level | Size | Font Weight | Line Height | Use Case |
|-------|------|-------------|-------------|----------|
| **H1** | 3xl (30px) | Bold | Tight | Page titles |
| **H2** | 2xl (24px) | Semibold | Tight | Section headings |
| **H3** | xl (20px) | Medium | Tight | Subsection headings |
| **Subtitle** | lg (18px) | Medium | Tight | Subtitles, important text |
| **Body** | base (16px) | Normal | Relaxed | Body text |
| **Caption** | xs (12px) | Normal | Normal | Small text, metadata |

### **Rules:**

✅ **DO:**
```tsx
<H1>Dashboard</H1>
<H2>Analytics Overview</H2>
<Body>Your analytics for the past week.</Body>
<Caption>Last updated: 5 min ago</Caption>

<Typography variant="h1">Page Title</Typography>
<Typography variant="body" color="text-fg-muted">Description</Typography>
```

❌ **DON'T:**
```tsx
<h1 className="text-[17px]">     {/* ❌ Arbitrary font size */}
<p className="text-[22px]">      {/* ❌ Not on approved scale */}
<h2 style={{ fontSize: "19px" }}> {/* ❌ Inline styles */}

{/* ❌ Raw text without semantic component */}
<h1>Title</h1>  // Should use <H1> or <Typography>
```

### **Enforcement:**

#### **🎨 Figma:**
- [ ] All text uses `text/*` semantic styles (no "local style")
- [ ] Font sizes map to `type/size/*` variables
- [ ] No ad hoc font sizes (e.g., `17px`, `22px`)
- [ ] Headings follow hierarchy (H1 > H2 > H3)
- [ ] Body text uses `type/size/base` (16px)

#### **💻 Code:**
- [ ] Use Typography components (`<H1>`, `<H2>`, `<Body>`, etc.)
- [ ] All text classes use approved scale (`text-xl`, not `text-[19px]`)
- [ ] Semantic HTML (use `<h1>`, `<h2>`, not `<div>` for headings)
- [ ] No raw font-size values except in design tokens

---

## ✅ Pre-Handoff Checklist (Figma)

**Before handing off designs to development:**

### **Spacing:**
- [ ] All padding uses `space/*` variables
- [ ] All Auto Layout gaps use `space/*` variables
- [ ] All margins use `space/*` variables
- [ ] No raw `px` values for spacing
- [ ] Deviations documented and tagged `EXPERIMENT`

### **Layout:**
- [ ] Layout built using `Layout/*` components
- [ ] Max-width uses `layout/maxWidth/*` variables
- [ ] Sidebar widths use `layout/sidebar/*` variables
- [ ] 75% rule applied where appropriate
- [ ] No random frame widths

### **Typography:**
- [ ] All text uses `text/*` semantic styles
- [ ] Font sizes from `type/size/*` variables
- [ ] Heading hierarchy correct (H1 > H2 > H3)
- [ ] No local or ad hoc font sizes
- [ ] Line heights appropriate for text type

### **Colors:**
- [ ] All colors from design tokens
- [ ] No local colors or hex values
- [ ] Dark mode variants defined
- [ ] Semantic colors used correctly

### **General:**
- [ ] All components from design system library
- [ ] Deviations documented and approved
- [ ] Accessibility checked (contrast, focus states)
- [ ] Responsive behavior defined

---

## ✅ Pre-Merge Checklist (Code)

**Before merging code to main:**

### **Spacing:**
- [ ] No raw hex colors in Tailwind classes
- [ ] Spacing classes (`p-*`, `m-*`, `gap-*`) match approved scale
- [ ] No `[arbitrary]` values except documented exceptions
- [ ] No inline styles for spacing

### **Layout:**
- [ ] Uses approved layout components (`<PageShell>`, etc.)
- [ ] Max-width classes use approved tokens
- [ ] Grid layouts use standard patterns
- [ ] No custom random widths

### **Typography:**
- [ ] Uses Typography components or approved text classes
- [ ] Font sizes match approved scale
- [ ] Semantic HTML (proper heading levels)
- [ ] No raw `font-size` values

### **General:**
- [ ] All colors from design tokens (no hex values)
- [ ] Uses `cn()` utility for class merging
- [ ] No inline styles except approved exceptions
- [ ] Linting passes
- [ ] TypeScript passes
- [ ] New patterns either:
  - Promoted to design system component, or
  - Tagged as `EXPERIMENT` and scheduled for review

---

## 🚨 Exception Process

**When you need to break a constitution:**

1. **Document the reason** - Why is the exception necessary?
2. **Tag in code/Figma** - Mark as `EXPERIMENT` or `EXCEPTION`
3. **Architecture Review** - Submit for ARB approval
4. **Timeline** - Schedule removal or promotion to system
5. **Track** - Add to technical debt backlog

### **Example:**

```tsx
// EXCEPTION: Marketing hero needs custom 58px font size
// ARB Ticket: DS-123
// Scheduled for: Q1 2026 (promote to design system or remove)
<h1 className="text-[58px] font-bold">
  Welcome to AIBOS
</h1>
```

---

## 📊 Drift Detection

### **Automated Checks:**

- **ESLint rules:** Warn on arbitrary values
- **Type checking:** Enforce component prop types
- **Visual regression:** Screenshot diffs on PR
- **Design tokens:** CI fails if tokens don't match Figma

### **Manual Reviews:**

- **Weekly audit:** Check for drift in new components
- **Quarterly review:** Full design system health check
- **ARB meetings:** Review all exceptions and experiments

---

## 📚 Quick Reference

### **Spacing Scale (8-point grid):**
`1` (4px) | `2` (8px) | `3` (12px) | `4` (16px) | `5` (24px) | `6` (32px) | `7` (40px) | `8` (48px)

### **Type Scale (~1.25 ratio):**
`xs` (12px) | `sm` (14px) | `base` (16px) | `lg` (18px) | `xl` (20px) | `2xl` (24px) | `3xl` (30px) | `4xl` (36px) | `5xl` (48px) | `6xl` (60px)

### **Max-Width:**
`sm` (640px) | `md` (768px) | `lg` (1024px) | `xl` (1280px) | `2xl` (1536px)

### **Components:**

**Layout:** `<PageShell>`, `<ContentWithSidebar>`, `<CenteredContent>`, `<FullBleedSection>`, `<GridLayout>`

**Typography:** `<H1>`, `<H2>`, `<H3>`, `<Subtitle>`, `<Body>`, `<Caption>`, `<Typography>`

**Utility:** `cn()` (class merging)

---

## 🎓 Remember:

> **"The constitutions exist to prevent the 3 AM 'why is this 17px?' question."**

**Good design systems make right choices easy and wrong choices hard.**

---

**Status:** ✅ **MANDATORY** - Enforced via code review and architecture review  
**Authority:** AIBOS Architecture Review Board  
**Version:** 1.0.0  
**Last Updated:** December 1, 2025


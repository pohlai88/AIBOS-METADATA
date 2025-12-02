# 🎨 AIBOS Design Creative MCP Server

> **Innovative Design Generation & Enhancement**  
> Leveraging the superior AIBOS design system for creative, production-ready designs

---

## Overview

The **Design Creative MCP Server** provides AI agents with powerful tools to generate, validate, and enhance designs using the AIBOS design system's superior capabilities:

- ✅ **OKLCH Color System** - Perceptually uniform, human-readable colors
- ✅ **Comprehensive Design Tokens** - Colors, typography, spacing, shadows, animations
- ✅ **Dark-First Theme** - WCAG 2.2 AAA accessibility
- ✅ **Advanced Effects** - Glassmorphism, 3D transforms, gradient animations
- ✅ **Domain-Specific Palettes** - Metadata, finance, governance tiers
- ✅ **Steve Jobs UX Philosophy** - "Show, don't tell" with beautiful empty states

---

## Tools

### 1. `explore_design_tokens`

Explore and discover available design tokens from the AIBOS design system.

**Input:**
- `category` (optional): Filter by category (`colors`, `typography`, `spacing`, `shadows`, `animations`, `all`)
- `domain` (optional): Filter by domain (`metadata`, `finance`, `governance`, `all`)

**Output:**
- Complete token catalog with usage examples
- OKLCH color values with perceptual properties
- Tailwind class mappings
- Best practices and recommendations

---

### 2. `generate_color_palette`

Generate creative color palettes using OKLCH color science.

**Input:**
- `base_color` (optional): Starting color (hex or OKLCH)
- `palette_type`: `monochromatic`, `analogous`, `complementary`, `triadic`, `domain_specific`
- `domain` (optional): `metadata`, `finance`, `governance`
- `dark_mode_optimized`: Boolean (default: true)

**Output:**
- Complete color scale (50-950)
- OKLCH values for each shade
- Contrast ratios for accessibility
- Dark mode variants
- Usage recommendations

---

### 3. `generate_creative_component`

Generate innovative React components using the AIBOS design system.

**Input:**
- `component_type`: Component type (`card`, `button`, `badge`, `empty_state`, `workbench`, `custom`)
- `purpose`: What the component should do
- `style`: `minimal`, `elegant`, `bold`, `glassmorphism`, `3d`, `gradient`
- `domain` (optional): `metadata`, `finance`, `governance`
- `include_animations`: Boolean (default: true)
- `accessibility_level`: `AA`, `AAA` (default: `AAA`)

**Output:**
- Complete React component code
- TypeScript types
- Design token usage
- Accessibility features
- Animation implementations
- Usage examples

---

### 4. `suggest_design_enhancements`

Analyze existing components and suggest creative enhancements.

**Input:**
- `component_path`: Path to component file
- `enhancement_type`: `visual`, `interaction`, `accessibility`, `performance`, `all`
- `creativity_level`: `conservative`, `balanced`, `innovative` (default: `balanced`)

**Output:**
- Enhancement suggestions with code examples
- Before/after comparisons
- Design token recommendations
- Accessibility improvements
- Performance optimizations

---

### 5. `validate_design_quality`

Validate designs against AIBOS design system standards.

**Input:**
- `component_path`: Path to component file
- `validation_level`: `basic`, `comprehensive`, `strict`
- `check_accessibility`: Boolean (default: true)
- `check_tokens`: Boolean (default: true)
- `check_patterns`: Boolean (default: true)

**Output:**
- Validation report with scores
- Issues and recommendations
- Token compliance status
- Accessibility compliance (WCAG 2.2 AAA)
- Pattern adherence

---

### 6. `generate_design_pattern`

Generate design patterns and layouts using best practices.

**Input:**
- `pattern_type`: `workbench`, `empty_state`, `data_grid`, `form`, `dashboard`, `landing`
- `context`: Use case description
- `domain`: `metadata`, `finance`, `governance`
- `include_demo_data`: Boolean (default: false)

**Output:**
- Complete pattern implementation
- Component structure
- Design token usage
- Responsive breakpoints
- Dark mode support
- Demo data (if requested)

---

### 7. `create_animation_system`

Generate custom animations using design system motion tokens.

**Input:**
- `animation_type`: `fade`, `slide`, `scale`, `rotate`, `glow`, `gradient`, `custom`
- `duration`: `fast`, `normal`, `slow`, `custom`
- `easing`: `standard`, `in`, `out`, `custom`
- `purpose`: What the animation should achieve

**Output:**
- CSS keyframe definitions
- Tailwind animation classes
- Usage examples
- Performance considerations
- Accessibility notes (prefers-reduced-motion)

---

### 8. `generate_empty_state`

Create beautiful, educational empty states following Steve Jobs UX philosophy.

**Input:**
- `variant`: Empty state variant (`users`, `data`, `actions`, `search`, `error`, `custom`)
- `title`: Main title
- `subtitle`: Inspiring subtitle
- `description`: Educational description
- `features`: Array of feature highlights
- `action_label`: Call-to-action label
- `icon_type`: Icon style (`animated`, `gradient`, `3d`, `minimal`)

**Output:**
- Complete empty state component
- Animated icon implementation
- Gradient effects
- Responsive design
- Accessibility features

---

## Design System Features

### Color System

- **OKLCH Format**: Perceptually uniform colors
- **Primary Scale**: 50-950 with semantic mappings
- **Domain Colors**: Metadata, finance, governance
- **Tier Colors**: Governance tier visualization
- **Dark Mode**: Optimized with subtle brand hue

### Typography

- **Type Scale**: 1.25 ratio (12px to 60px)
- **Semantic Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- **Display Sizes**: For hero sections and headlines

### Spacing

- **8-Point Grid**: Consistent spacing system
- **Semantic Tokens**: spacing-1 through spacing-12
- **Container Queries**: Responsive container sizes

### Effects

- **Glassmorphism**: Backdrop blur with transparency
- **3D Transforms**: Perspective and depth
- **Gradients**: Text and background gradients
- **Animations**: Fade, slide, scale, glow, gradient-x

---

## Usage Examples

### Generate a Creative Card Component

```json
{
  "component_type": "card",
  "purpose": "Display metadata field information with lineage visualization",
  "style": "glassmorphism",
  "domain": "metadata",
  "include_animations": true,
  "accessibility_level": "AAA"
}
```

### Create a Color Palette for Finance Domain

```json
{
  "palette_type": "domain_specific",
  "domain": "finance",
  "dark_mode_optimized": true
}
```

### Generate an Empty State

```json
{
  "variant": "data",
  "title": "Build Your Metadata Catalog",
  "subtitle": "Great metadata starts with a single field",
  "description": "Create your first metadata field to begin building a comprehensive data catalog...",
  "features": ["Lineage tracking", "Quality scoring", "AI suggestions"],
  "action_label": "Create First Field",
  "icon_type": "animated"
}
```

---

## Integration

### MCP Configuration

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-design-creative": {
      "command": "node",
      "args": [".mcp/design-creative/server.mjs"],
      "cwd": "."
    }
  }
}
```

---

## Design Philosophy

### Steve Jobs: "Show, Don't Tell"

- **Empty States**: Educational and inspiring, not just placeholders
- **Demo Data**: Realistic scenarios that demonstrate capability
- **Visual Language**: State and meaning are first-class citizens

### Dark-First Design

- **WCAG 2.2 AAA**: Highest accessibility standards
- **Subtle Brand Hue**: Dark backgrounds with subtle color tint
- **Perceptual Uniformity**: OKLCH ensures consistent appearance

### Innovation Through Constraints

- **Design Tokens**: Single source of truth
- **Pattern Library**: Reusable, tested patterns
- **Accessibility First**: Built-in, not afterthought

---

## Related MCP Servers

- `aibos-ui-generator` - UI component generation
- `aibos-component-generator` - Component validation
- `aibos-design-elegance-validator` - Design quality validation
- `aibos-theme` - Theme and token management
- `aibos-tailwind-v4` - Tailwind documentation

---

## Version

**1.0.0** - Initial release with comprehensive design creative capabilities

---

**Maintained By:** AIBOS Design Team  
**Last Updated:** 2025-01-27


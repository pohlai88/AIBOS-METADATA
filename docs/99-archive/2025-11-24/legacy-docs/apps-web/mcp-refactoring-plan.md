# MCP-Driven UI Component Reframing Plan
---

## Overview

This document mcp-driven ui component reframing plan.

---


> **Date:** 2025-11-24  
> **Context:** Lynx Logo Design - Connected to Lynceus & Accademia dei Lincei (1700)  
> **Goal:** Reframe entire UI components using MCP knowledge and best practices

---

## 🎯 **Historical Context: Accademia dei Lincei**

**Accademia dei Lincei (Academy of the Lynxes)** - Founded 1603, Rome
- **Lynceus** - Mythological figure with superhuman sight
- **Philosophy:** Sharp vision, observation, scientific inquiry
- **Design Inspiration:** Precision, clarity, observation, knowledge

**Lynx Mascot Design Philosophy:**
- Sharp vision (like Lynceus)
- Observant and precise
- Scientific and analytical
- Knowledge-driven

---

## 📋 **MCP Servers Status & Capabilities**

### **✅ Active MCP Servers**

| MCP Server | Status | Purpose | Tools Available |
|------------|--------|---------|----------------|
| **Figma MCP** | ✅ Active | Design system, tokens, components | `get_design_context`, `get_variable_defs`, `get_code_connect_map` |
| **Next.js MCP** | ⚠️ Needs Server | Next.js rules, routing, best practices | `nextjs_docs`, `nextjs_runtime` |
| **React Validation** | ✅ Active | Component validation, RSC boundaries | `validate_react_component`, `check_server_client_usage` |
| **AIBOS Theme** | ✅ Active | Tailwind tokens, design system | `read_tailwind_config`, `validate_token_exists` |
| **AIBOS Documentation** | ✅ Active | Documentation generation, validation | `validate_docs`, `generate_from_template` |
| **AIBOS Component Generator** | ✅ Active | AI component generation | `generate_component` |
| **AIBOS A11Y Validation** | ✅ Active | Accessibility validation | `validate_component`, `check_contrast` |
| **AIBOS Filesystem** | ✅ Active | File operations | `read_file`, `write_file`, `list_directory` |

---

## 🎨 **1. Design System & Philosophy (Figma + Tailwind)**

### **MCP Tools to Use:**

#### **Figma MCP:**
- `mcp_Figma_get_design_context` - Extract component designs
- `mcp_Figma_get_variable_defs` - Extract design tokens
- `mcp_Figma_get_code_connect_map` - Design-code sync
- `mcp_Figma_get_screenshot` - Visual reference

#### **AIBOS Theme MCP:**
- `mcp_aibos-theme_read_tailwind_config` - Read current tokens
- `mcp_aibos-theme_validate_token_exists` - Validate token usage
- `mcp_aibos-theme_suggest_token` - Get token suggestions
- `mcp_aibos-theme_validate_tailwind_class` - Validate class usage

### **Workflow:**

1. **Extract Design System from Figma:**
   ```
   Figma Design → Design Tokens → Tailwind Tokens → Component Implementation
   ```

2. **Validate Token Alignment:**
   - Compare Figma variables with Tailwind tokens
   - Ensure design-code consistency
   - Validate token usage in components

3. **Design Philosophy Application:**
   - **Lynx/Lynceus Theme:** Sharp, precise, observant
   - **Color Palette:** Based on Accademia dei Lincei heritage
   - **Typography:** Clear, readable, scholarly
   - **Spacing:** Precise, systematic

---

## ⚛️ **2. Component System, Routing, Hooks (React + Tailwind)**

### **MCP Tools to Use:**

#### **React Validation MCP:**
- `mcp_react-validation_validate_react_component` - Component best practices
- `mcp_react-validation_check_server_client_usage` - RSC boundary validation
- `mcp_react-validation_validate_rsc_boundary` - Server/client component rules
- `mcp_react-validation_validate_imports` - Import validation

#### **Next.js MCP:**
- `mcp_next-devtools_nextjs_docs` - Next.js best practices
- `mcp_next-devtools_nextjs_runtime` - Runtime diagnostics
- `mcp_next-devtools_nextjs_runtime_get_routes` - Route information

#### **AIBOS Component Generator:**
- `mcp_aibos-component-generator_generate_component` - Generate components with validation

### **Workflow:**

1. **Component Architecture:**
   - Validate RSC boundaries
   - Check server/client component usage
   - Validate imports and dependencies

2. **Routing Structure:**
   - Use Next.js MCP to validate routing patterns
   - Check route organization
   - Validate dynamic routes

3. **Hooks & State Management:**
   - Validate hook usage
   - Check for hydration issues
   - Validate state management patterns

---

## 📊 **3. Professional Dashboard Design & UI (Figma + Tailwind + React)**

### **MCP Tools to Use:**

#### **Figma MCP:**
- `mcp_Figma_get_design_context` - Get dashboard designs
- `mcp_Figma_get_screenshot` - Visual reference
- `mcp_Figma_create_design_system_rules` - Design system rules

#### **AIBOS A11Y Validation:**
- `mcp_aibos-a11y-validation_validate_component` - Accessibility validation
- `mcp_aibos-a11y-validation_check_contrast` - Color contrast validation

#### **AIBOS Component Generator:**
- `mcp_aibos-component-generator_generate_component` - Generate dashboard components

### **Workflow:**

1. **Dashboard Design:**
   - Extract dashboard layout from Figma
   - Validate accessibility (WCAG 2.1)
   - Check color contrast
   - Generate components with validation

2. **UI Patterns:**
   - Data visualization components
   - Navigation patterns
   - Form components
   - Interactive elements

---

## 📐 **4. Next.js Rules & Best Practices**

### **MCP Tools to Use:**

#### **Next.js MCP:**
- `mcp_next-devtools_nextjs_docs` - Next.js documentation
- `mcp_next-devtools_nextjs_runtime` - Runtime diagnostics
- `mcp_next-devtools_nextjs_runtime_get_errors` - Error detection
- `mcp_next-devtools_nextjs_runtime_get_routes` - Route validation

### **Key Areas:**

1. **App Router Best Practices:**
   - Server vs Client Components
   - Route organization
   - Data fetching patterns
   - Caching strategies

2. **Performance:**
   - Code splitting
   - Image optimization
   - Font optimization
   - Bundle size

3. **SEO & Metadata:**
   - Metadata API
   - Open Graph tags
   - Structured data

---

## 📚 **5. Documentation MCP**

### **MCP Tools to Use:**

#### **AIBOS Documentation MCP:**
- `mcp_aibos-documentation_validate_docs` - Validate documentation
- `mcp_aibos-documentation_generate_from_template` - Generate docs
- `mcp_aibos-documentation_update_token_reference` - Update token docs
- `mcp_aibos-documentation_sync_nextra` - Sync to Nextra

### **Workflow:**

1. **Component Documentation:**
   - Generate component docs from templates
   - Validate documentation structure
   - Sync to Nextra site

2. **Design System Documentation:**
   - Token reference generation
   - Component usage examples
   - Best practices guides

---

## 🔄 **Reframing Workflow**

### **Phase 1: Design System Foundation**

1. **Extract from Figma:**
   - Design tokens
   - Component specs
   - Layout patterns

2. **Validate with Tailwind MCP:**
   - Token alignment
   - Class validation
   - Design system compliance

3. **Document:**
   - Token reference
   - Design philosophy
   - Usage guidelines

### **Phase 2: Component Refactoring**

1. **Validate Current Components:**
   - React validation
   - RSC boundaries
   - Import validation

2. **Generate New Components:**
   - Use Component Generator MCP
   - Validate with all MCPs
   - Ensure accessibility

3. **Update Routing:**
   - Next.js MCP validation
   - Route organization
   - Dynamic routes

### **Phase 3: Dashboard & UI**

1. **Design Extraction:**
   - Figma dashboard designs
   - Component specs
   - Layout patterns

2. **Component Generation:**
   - Generate with validation
   - Accessibility checks
   - Performance optimization

3. **Integration:**
   - Route integration
   - State management
   - Data fetching

### **Phase 4: Documentation & Validation**

1. **Documentation:**
   - Generate component docs
   - Update design system docs
   - Sync to Nextra

2. **Final Validation:**
   - All MCP validations
   - Accessibility audit
   - Performance audit

---

## 📊 **MCP Integration Matrix**

| Task | Figma | Tailwind | React | Next.js | Docs | A11Y | Component Gen |
|------|-------|----------|-------|---------|------|------|---------------|
| Design System | ✅ | ✅ | - | - | ✅ | - | - |
| Component Validation | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard Design | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Routing | - | - | ✅ | ✅ | ✅ | - | - |
| Documentation | - | - | - | - | ✅ | - | - |

---

## 🎯 **Next Steps**

1. ✅ **MCP Status Check** - Verify all MCPs are active
2. ⏭️ **Start Next.js Dev Server** - Enable Next.js MCP
3. ⏭️ **Figma Design Access** - Get Figma file keys
4. ⏭️ **Begin Reframing** - Start with design system extraction

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **PLAN READY** - All MCPs identified and workflow defined


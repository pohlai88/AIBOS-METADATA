# Complete UI Component Reframing Workflow
---

## Overview

This document complete ui component reframing workflow.

---


> **Date:** 2025-11-24  
> **Context:** Lynx Logo - Accademia dei Lincei (1700) Heritage  
> **Philosophy:** Sharp vision, precision, observation, knowledge-driven design

---

## 🎯 **Reframing Goals**

Reframe entire UI component system using MCP knowledge across:

1. **Design System & Philosophy** (Figma + Tailwind)
2. **Component System, Routing, Hooks** (React + Tailwind)
3. **Professional Dashboard Design** (Figma + Tailwind + React)
4. **Next.js Rules & Best Practices** (Next.js MCP)
5. **Documentation** (Documentation MCP)

---

## 📋 **Phase 1: Design System & Philosophy**

### **Step 1: Extract Design System from Figma**

**MCP Tools:**
- `mcp_Figma_get_design_context` - Get design system components
- `mcp_Figma_get_variable_defs` - Extract design tokens
- `mcp_Figma_get_code_connect_map` - Design-code sync

**Workflow:**
```
1. Get Figma file key and design system node ID
2. Extract design tokens using Figma MCP
3. Map Figma variables to Tailwind tokens
4. Validate token alignment
```

### **Step 2: Validate with Tailwind MCP**

**MCP Tools:**
- `mcp_aibos-theme_read_tailwind_config` - Read current tokens ✅ **WORKING**
- `mcp_aibos-theme_validate_token_exists` - Validate token usage
- `mcp_aibos-theme_suggest_token` - Get token suggestions
- `mcp_aibos-theme_validate_tailwind_class` - Validate class usage

**Workflow:**
```
1. Read current Tailwind config
2. Compare with Figma tokens
3. Identify missing tokens
4. Suggest token mappings
5. Validate all token usage
```

### **Step 3: Apply Lynx/Lynceus Philosophy**

**Design Principles:**
- **Sharp Vision** - Clear, precise visual hierarchy
- **Observant** - Attention to detail, data-driven
- **Knowledge-Driven** - Scholarly, academic aesthetic
- **Precision** - Systematic spacing, alignment

**Color Palette:**
- Based on Accademia dei Lincei heritage
- Academic, scholarly tones
- Clear contrast for readability

**Typography:**
- Clear, readable fonts
- Academic/scholarly style
- Proper hierarchy

---

## 📋 **Phase 2: Component System Reframing**

### **Step 1: Validate Current Components**

**MCP Tools:**
- `mcp_react-validation_validate_react_component` - Component validation
- `mcp_react-validation_check_server_client_usage` - RSC boundaries
- `mcp_react-validation_validate_rsc_boundary` - Boundary validation
- `mcp_react-validation_validate_imports` - Import validation

**Workflow:**
```
1. List all components in packages/ui/src/components
2. Validate each component with React MCP
3. Check RSC boundaries
4. Validate imports
5. Identify issues
```

### **Step 2: Generate/Refactor Components**

**MCP Tools:**
- `mcp_aibos-component-generator_generate_component` - Generate with 86-rule validation
- `mcp_aibos-a11y-validation_validate_component` - Accessibility validation
- `mcp_aibos-theme_validate_tailwind_class` - Token validation

**Workflow:**
```
1. Get component design from Figma
2. Generate component with Component Generator MCP
3. Validate with React MCP
4. Validate accessibility
5. Validate tokens
6. Document component
```

### **Step 3: Routing & Hooks**

**MCP Tools:**
- `mcp_next-devtools_nextjs_docs` - Next.js routing best practices
- `mcp_next-devtools_nextjs_runtime_get_routes` - Route information
- `mcp_react-validation_validate_imports` - Hook validation

**Workflow:**
```
1. Query Next.js docs for routing patterns
2. Validate current routes
3. Check hook usage
4. Apply best practices
```

---

## 📋 **Phase 3: Dashboard Design**

### **Step 1: Extract Dashboard Design**

**MCP Tools:**
- `mcp_Figma_get_design_context` - Get dashboard layout
- `mcp_Figma_get_screenshot` - Visual reference
- `mcp_Figma_get_variable_defs` - Dashboard tokens

**Workflow:**
```
1. Get Figma dashboard design
2. Extract layout structure
3. Extract component specs
4. Extract design tokens
```

### **Step 2: Generate Dashboard Components**

**MCP Tools:**
- `mcp_aibos-component-generator_generate_component` - Generate components
- `mcp_aibos-a11y-validation_validate_component` - Accessibility
- `mcp_aibos-a11y-validation_check_contrast` - Color contrast

**Workflow:**
```
1. Generate dashboard layout component
2. Generate data visualization components
3. Generate navigation components
4. Validate all components
5. Check accessibility
```

### **Step 3: Professional Dashboard Patterns**

**MCP Tools:**
- `mcp_Figma_create_design_system_rules` - Design system rules
- `mcp_aibos-component-generator_generate_component` - Generate patterns
- `mcp_next-devtools_nextjs_docs` - Next.js dashboard patterns

**Workflow:**
```
1. Query Next.js docs for dashboard patterns
2. Apply design system rules
3. Generate dashboard components
4. Validate all aspects
```

---

## 📋 **Phase 4: Next.js Rules & Best Practices**

### **Step 1: Query Next.js Documentation**

**MCP Tools:**
- `mcp_next-devtools_nextjs_docs` - Next.js documentation ✅ **INITIALIZED**
- `mcp_next-devtools_nextjs_runtime` - Runtime diagnostics (needs server)

**Key Areas:**
- App Router structure
- Server vs Client Components
- Data fetching patterns
- Caching strategies
- Route organization
- Metadata API
- Image optimization

### **Step 2: Apply Best Practices**

**MCP Tools:**
- `mcp_react-validation_validate_rsc_boundary` - RSC validation
- `mcp_next-devtools_nextjs_runtime_get_routes` - Route validation
- `mcp_next-devtools_nextjs_runtime_get_errors` - Error detection

**Workflow:**
```
1. Query Next.js docs for specific patterns
2. Validate current implementation
3. Apply best practices
4. Fix issues
```

---

## 📋 **Phase 5: Documentation**

### **Step 1: Generate Component Documentation**

**MCP Tools:**
- `mcp_aibos-documentation_generate_from_template` - Generate docs
- `mcp_aibos-documentation_validate_docs` - Validate structure
- `mcp_aibos-documentation_sync_nextra` - Sync to Nextra

**Workflow:**
```
1. Generate component docs from templates
2. Validate documentation structure
3. Sync to Nextra site
4. Update token reference
```

### **Step 2: Design System Documentation**

**MCP Tools:**
- `mcp_aibos-documentation_update_token_reference` - Token docs
- `mcp_aibos-documentation_validate_docs` - Validate docs
- `mcp_aibos-documentation_sync_nextra` - Sync

**Workflow:**
```
1. Update token reference from globals.css
2. Validate documentation
3. Sync to Nextra
```

---

## 🔄 **Complete Reframing Workflow**

### **Workflow Diagram:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Design System (Figma + Tailwind MCP)                 │
│    └─ Extract tokens → Validate → Document               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Component System (React + Next.js MCP)              │
│    └─ Validate → Generate → Validate → Document        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Dashboard Design (Figma + Component Gen MCP)       │
│    └─ Extract → Generate → Validate → Document          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Next.js Rules (Next.js MCP)                         │
│    └─ Query docs → Apply → Validate → Document         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Documentation (Documentation MCP)                    │
│    └─ Generate → Validate → Sync                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 **MCP Integration Matrix**

| Task | Figma | Tailwind | React | Next.js | Docs | A11Y | Component Gen |
|------|-------|----------|-------|---------|------|------|---------------|
| Design System | ✅ | ✅ | - | - | ✅ | - | - |
| Component Validation | - | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard Design | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Routing | - | - | ✅ | ✅ | ✅ | - | - |
| Documentation | - | - | - | - | ✅ | - | - |

---

## ⚠️ **Pre-Flight Checklist**

- [ ] ✅ Figma MCP - Active
- [ ] ✅ AIBOS Theme MCP - Active (tested)
- [ ] ⚠️ React Validation MCP - Fixing dependencies
- [ ] ⚠️ Next.js MCP - Needs dev server
- [ ] ✅ AIBOS Documentation MCP - Active
- [ ] ✅ AIBOS Component Generator - Active
- [ ] ✅ AIBOS A11Y Validation - Active
- [ ] ✅ AIBOS Filesystem - Active

---

## 🚀 **Ready to Begin**

**All MCPs identified and workflow defined!**

**Next Steps:**
1. Fix React Validation MCP dependencies
2. Start Next.js dev server for runtime MCP
3. Get Figma file keys for design extraction
4. Begin Phase 1: Design System extraction

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **READY FOR REFRAMING** - All workflows defined


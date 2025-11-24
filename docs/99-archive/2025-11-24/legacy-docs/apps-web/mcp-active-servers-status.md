# MCP Active Servers Status & Reframing Readiness
---

## Overview

This document mcp active servers status & reframing readiness.

---


> **Date:** 2025-11-24  
> **Context:** Lynx Logo - Accademia dei Lincei (1700) Heritage  
> **Goal:** Complete UI Component Reframing with MCP Knowledge

---

## ✅ **Active MCP Servers**

### **1. Figma MCP** ✅ **ACTIVE**
**Purpose:** Design system extraction, component specs, design tokens

**Available Tools:**
- `mcp_Figma_get_design_context` - Extract component designs
- `mcp_Figma_get_variable_defs` - Extract design tokens
- `mcp_Figma_get_code_connect_map` - Design-code sync
- `mcp_Figma_get_screenshot` - Visual reference
- `mcp_Figma_create_design_system_rules` - Design system rules

**Use For:**
- ✅ Design system philosophy
- ✅ Component specifications
- ✅ Token extraction
- ✅ Dashboard design reference

---

### **2. AIBOS Theme MCP** ✅ **ACTIVE**
**Purpose:** Tailwind token management, validation, design system compliance

**Available Tools:**
- `mcp_aibos-theme_read_tailwind_config` - Read Tailwind v4 tokens ✅ **TESTED**
- `mcp_aibos-theme_validate_token_exists` - Validate token usage
- `mcp_aibos-theme_suggest_token` - Suggest appropriate tokens
- `mcp_aibos-theme_validate_tailwind_class` - Validate class usage
- `mcp_aibos-theme_get_token_value` - Get CSS values

**Status:** ✅ **WORKING** - Successfully read Tailwind config

**Use For:**
- ✅ Design system tokens
- ✅ Tailwind class validation
- ✅ Token alignment with Figma

---

### **3. React Validation MCP** ⚠️ **NEEDS FIX**
**Purpose:** React component validation, RSC boundaries, best practices

**Available Tools:**
- `mcp_react-validation_validate_react_component` - Component validation ⚠️ **ERROR**
- `mcp_react-validation_check_server_client_usage` - Server/client check
- `mcp_react-validation_validate_rsc_boundary` - RSC boundary validation
- `mcp_react-validation_validate_imports` - Import validation

**Status:** ⚠️ **ERROR** - "traverse is not a function" (dependency issue)

**Action Required:**
- Fix dependency issue in `.mcp/react/server.mjs`
- Check `@babel/traverse` installation

**Use For:**
- ✅ Component best practices
- ✅ RSC boundary validation
- ✅ Import validation
- ✅ Server/client component rules

---

### **4. Next.js MCP** ⚠️ **NEEDS SERVER**
**Purpose:** Next.js rules, routing, best practices, runtime diagnostics

**Available Tools:**
- `mcp_next-devtools_nextjs_docs` - Next.js documentation ✅ **INITIALIZED**
- `mcp_next-devtools_nextjs_runtime` - Runtime diagnostics ⚠️ **NEEDS SERVER**
- `mcp_next-devtools_nextjs_runtime_get_routes` - Route information
- `mcp_next-devtools_nextjs_runtime_get_errors` - Error detection

**Status:** 
- ✅ Documentation: **INITIALIZED**
- ⚠️ Runtime: **NEEDS DEV SERVER** (port 3000)

**Action Required:**
- Start Next.js dev server: `pnpm dev`
- Wait for "Ready" message
- MCP endpoint will be available at `/_next/mcp`

**Use For:**
- ✅ Next.js best practices
- ✅ Routing patterns
- ✅ App Router rules
- ✅ Runtime diagnostics

---

### **5. AIBOS Documentation MCP** ✅ **ACTIVE**
**Purpose:** Documentation generation, validation, Nextra sync

**Available Tools:**
- `mcp_aibos-documentation_validate_docs` - Validate documentation
- `mcp_aibos-documentation_generate_from_template` - Generate docs
- `mcp_aibos-documentation_update_token_reference` - Token docs
- `mcp_aibos-documentation_sync_nextra` - Sync to Nextra

**Use For:**
- ✅ Component documentation
- ✅ Design system docs
- ✅ Token reference
- ✅ Best practices guides

---

### **6. AIBOS Component Generator** ✅ **ACTIVE**
**Purpose:** AI-driven component generation with 86-rule validation

**Available Tools:**
- `mcp_aibos-component-generator_generate_component` - Generate components

**Features:**
- Design drift detection
- Token mapping
- Comprehensive validation (86 rules)
- Constitution compliance

**Use For:**
- ✅ Component generation
- ✅ Design system compliance
- ✅ Token validation
- ✅ Best practices enforcement

---

### **7. AIBOS A11Y Validation** ✅ **ACTIVE**
**Purpose:** Accessibility validation (WCAG 2.1)

**Available Tools:**
- `mcp_aibos-a11y-validation_validate_component` - Accessibility validation
- `mcp_aibos-a11y-validation_check_contrast` - Color contrast check

**Use For:**
- ✅ Accessibility compliance
- ✅ Color contrast validation
- ✅ WCAG 2.1 compliance
- ✅ ARIA validation

---

### **8. AIBOS Filesystem MCP** ✅ **ACTIVE**
**Purpose:** File operations with controlled paths

**Available Tools:**
- `mcp_aibos-filesystem_read_file` - Read files
- `mcp_aibos-filesystem_write_file` - Write files
- `mcp_aibos-filesystem_list_directory` - List directories

**Use For:**
- ✅ File operations
- ✅ Code generation
- ✅ Documentation updates

---

## 🎯 **Reframing Workflow by Area**

### **1. Design System & Philosophy (Figma + Tailwind)**

**MCPs to Use:**
1. **Figma MCP** - Extract design tokens and component specs
2. **AIBOS Theme MCP** - Validate and align Tailwind tokens
3. **AIBOS Documentation MCP** - Document design system

**Workflow:**
```
Figma Design → Extract Tokens → Validate with Tailwind MCP → Document → Implement
```

---

### **2. Component System, Routing, Hooks (React + Tailwind)**

**MCPs to Use:**
1. **React Validation MCP** - Validate components (⚠️ needs fix)
2. **Next.js MCP** - Validate routing and App Router patterns
3. **AIBOS Component Generator** - Generate validated components
4. **AIBOS A11Y Validation** - Accessibility checks

**Workflow:**
```
Component Design → Generate with MCP → Validate React → Validate Next.js → Validate A11Y → Document
```

---

### **3. Professional Dashboard Design (Figma + Tailwind + React)**

**MCPs to Use:**
1. **Figma MCP** - Extract dashboard designs
2. **AIBOS Component Generator** - Generate dashboard components
3. **AIBOS A11Y Validation** - Dashboard accessibility
4. **AIBOS Theme MCP** - Token validation

**Workflow:**
```
Figma Dashboard → Extract Design → Generate Components → Validate All → Document
```

---

### **4. Next.js Rules & Best Practices**

**MCPs to Use:**
1. **Next.js MCP** - Documentation and runtime diagnostics
2. **React Validation MCP** - RSC boundary validation
3. **AIBOS Documentation MCP** - Document best practices

**Workflow:**
```
Query Next.js Docs → Validate Patterns → Apply Rules → Document → Implement
```

---

## ⚠️ **Issues to Fix**

### **1. React Validation MCP Error**

**Error:** `traverse is not a function`

**Fix Required:**
```bash
cd .mcp/react
pnpm install @babel/traverse @babel/parser
```

**Check:** `.mcp/react/package.json` for dependencies

---

### **2. Next.js MCP Runtime**

**Status:** Needs dev server running

**Fix Required:**
```bash
cd apps/web
pnpm dev
# Wait for "Ready" message
```

**Then:** MCP endpoint available at `/_next/mcp`

---

## 📋 **Immediate Actions**

1. ✅ **MCP Status Checked** - All servers identified
2. ⏭️ **Fix React Validation** - Install missing dependencies
3. ⏭️ **Start Next.js Server** - Enable runtime MCP
4. ⏭️ **Begin Reframing** - Start with design system extraction

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **MCP SERVERS IDENTIFIED** - Ready for reframing workflow


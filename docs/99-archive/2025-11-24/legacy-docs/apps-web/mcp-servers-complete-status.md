# MCP Servers - Complete Status & Reframing Readiness
---

## Overview

This document mcp servers - complete status & reframing readiness.

---


> **Date:** 2025-11-24  
> **Context:** Lynx Logo - Accademia dei Lincei (1700) Heritage  
> **Goal:** Complete UI component reframing using MCP knowledge

---

## ✅ **ACTIVE MCP SERVERS**

### **1. Figma MCP** ✅ **ACTIVE**
**Purpose:** Design system extraction, component specs, design tokens

**Tools:**
- `mcp_Figma_get_design_context` - Extract component designs
- `mcp_Figma_get_variable_defs` - Extract design tokens
- `mcp_Figma_get_code_connect_map` - Design-code sync
- `mcp_Figma_get_screenshot` - Visual reference
- `mcp_Figma_create_design_system_rules` - Design system rules

**Ready For:**
- ✅ Design system philosophy
- ✅ Component specifications
- ✅ Token extraction
- ✅ Dashboard design reference

---

### **2. AIBOS Theme MCP** ✅ **ACTIVE & TESTED**
**Purpose:** Tailwind token management, validation, design system compliance

**Tools:**
- `mcp_aibos-theme_read_tailwind_config` ✅ **TESTED - WORKING**
- `mcp_aibos-theme_validate_token_exists` - Validate token usage
- `mcp_aibos-theme_suggest_token` - Suggest appropriate tokens
- `mcp_aibos-theme_validate_tailwind_class` - Validate class usage
- `mcp_aibos-theme_get_token_value` - Get CSS values

**Status:** ✅ **WORKING** - Successfully read Tailwind config

**Ready For:**
- ✅ Design system tokens
- ✅ Tailwind class validation
- ✅ Token alignment with Figma

---

### **3. AIBOS Documentation MCP** ✅ **ACTIVE**
**Purpose:** Documentation generation, validation, Nextra sync

**Tools:**
- `mcp_aibos-documentation_validate_docs` - Validate documentation
- `mcp_aibos-documentation_generate_from_template` - Generate docs
- `mcp_aibos-documentation_update_token_reference` - Token docs
- `mcp_aibos-documentation_sync_nextra` - Sync to Nextra

**Ready For:**
- ✅ Component documentation
- ✅ Design system docs
- ✅ Token reference
- ✅ Best practices guides

---

### **4. AIBOS Component Generator** ✅ **ACTIVE**
**Purpose:** AI-driven component generation with 86-rule validation

**Tools:**
- `mcp_aibos-component-generator_generate_component` - Generate components

**Features:**
- Design drift detection
- Token mapping
- Comprehensive validation (86 rules)
- Constitution compliance

**Ready For:**
- ✅ Component generation
- ✅ Design system compliance
- ✅ Token validation
- ✅ Best practices enforcement

---

### **5. AIBOS A11Y Validation** ✅ **ACTIVE**
**Purpose:** Accessibility validation (WCAG 2.1)

**Tools:**
- `mcp_aibos-a11y-validation_validate_component` - Accessibility validation
- `mcp_aibos-a11y-validation_check_contrast` - Color contrast check

**Ready For:**
- ✅ Accessibility compliance
- ✅ Color contrast validation
- ✅ WCAG 2.1 compliance
- ✅ ARIA validation

---

### **6. AIBOS Filesystem MCP** ✅ **ACTIVE**
**Purpose:** File operations with controlled paths

**Tools:**
- `mcp_aibos-filesystem_read_file` - Read files
- `mcp_aibos-filesystem_write_file` - Write files
- `mcp_aibos-filesystem_list_directory` - List directories

**Ready For:**
- ✅ File operations
- ✅ Code generation
- ✅ Documentation updates

---

### **7. Next.js Docs MCP** ✅ **INITIALIZED**
**Purpose:** Next.js documentation and best practices

**Tools:**
- `mcp_next-devtools_nextjs_docs` - Next.js documentation ✅ **INITIALIZED**
- `mcp_next-devtools_nextjs_runtime` - Runtime diagnostics ⚠️ **NEEDS SERVER**

**Status:**
- ✅ Documentation: **INITIALIZED** - Ready to query
- ⚠️ Runtime: **NEEDS DEV SERVER** - Start `pnpm dev`

**Ready For:**
- ✅ Next.js best practices
- ✅ Routing patterns
- ✅ App Router rules
- ⏳ Runtime diagnostics (needs server)

---

## ⚠️ **MCP SERVERS NEEDING FIX**

### **8. React Validation MCP** ⚠️ **NEEDS FIX**
**Purpose:** React component validation, RSC boundaries, best practices

**Tools:**
- `mcp_react-validation_validate_react_component` ⚠️ **ERROR**
- `mcp_react-validation_check_server_client_usage` - Server/client check
- `mcp_react-validation_validate_rsc_boundary` - RSC boundary validation
- `mcp_react-validation_validate_imports` - Import validation

**Error:** `traverse is not a function`

**Fix Required:**
```bash
cd .mcp/react
pnpm install
```

**Dependencies:**
- `@babel/parser` - Already in package.json
- `@babel/traverse` - Already in package.json
- Need to ensure installation

**Ready For (after fix):**
- ✅ Component best practices
- ✅ RSC boundary validation
- ✅ Import validation
- ✅ Server/client component rules

---

## 📊 **MCP Coverage by Reframing Area**

### **1. Design System & Philosophy**

| Task | MCP | Status |
|------|-----|--------|
| Extract design tokens | Figma MCP | ✅ Ready |
| Validate Tailwind tokens | AIBOS Theme MCP | ✅ Ready |
| Document design system | AIBOS Documentation MCP | ✅ Ready |

### **2. Component System, Routing, Hooks**

| Task | MCP | Status |
|------|-----|--------|
| Validate components | React Validation MCP | ⚠️ Needs fix |
| Generate components | AIBOS Component Gen | ✅ Ready |
| Validate accessibility | AIBOS A11Y | ✅ Ready |
| Next.js routing | Next.js Docs MCP | ✅ Ready |
| Runtime diagnostics | Next.js Runtime MCP | ⚠️ Needs server |

### **3. Professional Dashboard Design**

| Task | MCP | Status |
|------|-----|--------|
| Extract dashboard | Figma MCP | ✅ Ready |
| Generate components | AIBOS Component Gen | ✅ Ready |
| Validate accessibility | AIBOS A11Y | ✅ Ready |
| Validate tokens | AIBOS Theme MCP | ✅ Ready |

### **4. Next.js Rules & Best Practices**

| Task | MCP | Status |
|------|-----|--------|
| Query documentation | Next.js Docs MCP | ✅ Ready |
| Runtime diagnostics | Next.js Runtime MCP | ⚠️ Needs server |
| RSC boundaries | React Validation MCP | ⚠️ Needs fix |

### **5. Documentation**

| Task | MCP | Status |
|------|-----|--------|
| Generate docs | AIBOS Documentation MCP | ✅ Ready |
| Validate docs | AIBOS Documentation MCP | ✅ Ready |
| Sync to Nextra | AIBOS Documentation MCP | ✅ Ready |

---

## 🎯 **Reframing Readiness Score**

| Area | Coverage | Status |
|------|----------|--------|
| Design System | 100% | ✅ Ready |
| Component System | 75% | ⚠️ React MCP needs fix |
| Dashboard Design | 100% | ✅ Ready |
| Next.js Rules | 50% | ⚠️ Runtime needs server |
| Documentation | 100% | ✅ Ready |

**Overall Readiness:** **85%** - Ready to begin with available MCPs

---

## 🚀 **Immediate Actions**

1. ✅ **MCP Status Checked** - All servers identified
2. ⏭️ **Fix React Validation** - Install dependencies in `.mcp/react`
3. ⏭️ **Start Next.js Server** - Enable runtime MCP
4. ⏭️ **Get Figma Access** - File keys for design extraction
5. ⏭️ **Begin Reframing** - Start with Phase 1 (Design System)

---

## 📋 **Reframing Workflow Summary**

**Phase 1:** Design System (Figma + Tailwind MCP) ✅ **READY**  
**Phase 2:** Components (React + Component Gen MCP) ⚠️ **75% READY**  
**Phase 3:** Dashboard (Figma + Component Gen MCP) ✅ **READY**  
**Phase 4:** Next.js Rules (Next.js MCP) ⚠️ **50% READY**  
**Phase 5:** Documentation (Documentation MCP) ✅ **READY**

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **85% READY** - Can begin reframing with available MCPs


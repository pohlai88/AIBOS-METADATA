# MCP-Driven UI Reframing - Execution Plan
---

## Overview

This document mcp-driven ui reframing - execution plan.

---


> **Date:** 2025-11-24  
> **Context:** Lynx Logo - Accademia dei Lincei (1700) Heritage  
> **Goal:** Complete UI component reframing using all available MCP knowledge

---

## 🎯 **Reframing Scope**

### **1. Design System & Philosophy** 
**Tools:** Figma MCP + AIBOS Theme MCP + Documentation MCP

### **2. Component System, Routing, Hooks**
**Tools:** React Validation MCP + Next.js MCP + Component Generator MCP

### **3. Professional Dashboard Design**
**Tools:** Figma MCP + Component Generator MCP + A11Y Validation MCP

### **4. Next.js Rules & Best Practices**
**Tools:** Next.js MCP (Docs + Runtime)

### **5. Documentation**
**Tools:** Documentation MCP

---

## ✅ **MCP Servers Status**

| MCP Server | Status | Tools Available | Ready |
|------------|--------|-----------------|-------|
| **Figma** | ✅ Active | `get_design_context`, `get_variable_defs`, `get_code_connect_map` | ✅ |
| **AIBOS Theme** | ✅ Active | `read_tailwind_config`, `validate_token_exists`, `suggest_token` | ✅ |
| **AIBOS Documentation** | ✅ Active | `validate_docs`, `generate_from_template`, `sync_nextra` | ✅ |
| **AIBOS Component Gen** | ✅ Active | `generate_component` (86 rules) | ✅ |
| **AIBOS A11Y** | ✅ Active | `validate_component`, `check_contrast` | ✅ |
| **AIBOS Filesystem** | ✅ Active | `read_file`, `write_file`, `list_directory` | ✅ |
| **Next.js Docs** | ✅ Initialized | `nextjs_docs` (search/get) | ✅ |
| **React Validation** | ⚠️ Fixing | `validate_react_component`, `check_server_client_usage` | ⏳ |
| **Next.js Runtime** | ⚠️ Needs Server | `nextjs_runtime` (diagnostics) | ⏳ |

---

## 📋 **Execution Workflow**

### **Phase 1: Design System Foundation**

**Step 1.1: Extract from Figma**
```typescript
// Use Figma MCP
const designContext = await mcp_Figma_get_design_context({
  fileKey: "FIGMA_FILE_KEY",
  nodeId: "DESIGN_SYSTEM_NODE_ID",
  clientLanguages: "typescript",
  clientFrameworks: "react"
});

const figmaTokens = await mcp_Figma_get_variable_defs({
  fileKey: "FIGMA_FILE_KEY",
  nodeId: "DESIGN_SYSTEM_NODE_ID"
});
```

**Step 1.2: Validate with Tailwind MCP**
```typescript
// Use AIBOS Theme MCP
const tailwindConfig = await mcp_aibos-theme_read_tailwind_config();
// Compare Figma tokens with Tailwind tokens
// Validate alignment
```

**Step 1.3: Document Design System**
```typescript
// Use Documentation MCP
await mcp_aibos-documentation_update_token_reference({
  sourcePath: "packages/ui/src/design/globals.css",
  outputPath: "docs/09-reference/tokens/auto/tokens-reference.md"
});
```

---

### **Phase 2: Component System Reframing**

**Step 2.1: Validate Current Components**
```typescript
// Use React Validation MCP (after fix)
const validation = await mcp_react-validation_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button"
});

const rscCheck = await mcp_react-validation_check_server_client_usage({
  filePath: "packages/ui/src/components/button.tsx"
});
```

**Step 2.2: Generate/Refactor Components**
```typescript
// Use Component Generator MCP
const component = await mcp_aibos-component-generator_generate_component({
  componentName: "Button",
  description: "Primary action button",
  componentType: "primitive",
  figmaNodeId: "FIGMA_NODE_ID"
});
```

**Step 2.3: Validate All Aspects**
```typescript
// Use multiple MCPs
const a11y = await mcp_aibos-a11y-validation_validate_component({
  filePath: "packages/ui/src/components/button.tsx"
});

const tokens = await mcp_aibos-theme_validate_tailwind_class({
  className: "bg-primary"
});
```

---

### **Phase 3: Dashboard Design**

**Step 3.1: Extract Dashboard from Figma**
```typescript
// Use Figma MCP
const dashboard = await mcp_Figma_get_design_context({
  fileKey: "FIGMA_FILE_KEY",
  nodeId: "DASHBOARD_NODE_ID",
  clientLanguages: "typescript",
  clientFrameworks: "react"
});
```

**Step 3.2: Generate Dashboard Components**
```typescript
// Use Component Generator MCP
const dashboardLayout = await mcp_aibos-component-generator_generate_component({
  componentName: "DashboardLayout",
  description: "Main dashboard layout",
  componentType: "layout",
  figmaNodeId: "DASHBOARD_NODE_ID"
});
```

---

### **Phase 4: Next.js Best Practices**

**Step 4.1: Query Next.js Documentation**
```typescript
// Use Next.js Docs MCP
const routingDocs = await mcp_next-devtools_nextjs_docs({
  action: "get",
  path: "/docs/app/building-your-application/routing"
});

const componentDocs = await mcp_next-devtools_nextjs_docs({
  action: "get",
  path: "/docs/app/building-your-application/rendering/server-components"
});
```

**Step 4.2: Apply Best Practices**
- Validate routing structure
- Check Server/Client component usage
- Validate data fetching patterns
- Check caching strategies

---

### **Phase 5: Documentation**

**Step 5.1: Generate Component Docs**
```typescript
// Use Documentation MCP
await mcp_aibos-documentation_generate_from_template({
  template: "component_doc",
  outputPath: "docs/04-developer/ui/components/button.md",
  data: {
    componentName: "Button",
    description: "Primary action button",
    props: {...},
    examples: [...]
  }
});
```

**Step 5.2: Sync to Nextra**
```typescript
// Use Documentation MCP
await mcp_aibos-documentation_sync_nextra({
  force: false
});
```

---

## 🎨 **Lynx/Lynceus Design Philosophy**

**Historical Context:**
- **Accademia dei Lincei** (1603) - Academy of the Lynxes
- **Lynceus** - Mythological figure with superhuman sight
- **Philosophy:** Sharp vision, observation, scientific inquiry

**Design Principles:**
1. **Sharp Vision** - Clear visual hierarchy, precise typography
2. **Observant** - Attention to detail, data-driven design
3. **Knowledge-Driven** - Scholarly, academic aesthetic
4. **Precision** - Systematic spacing, alignment, consistency

**Color Palette:**
- Academic, scholarly tones
- Clear contrast for readability
- Based on Accademia dei Lincei heritage

**Typography:**
- Clear, readable fonts
- Academic/scholarly style
- Proper information hierarchy

---

## 📊 **MCP Integration Checklist**

### **Design System:**
- [ ] Extract design tokens from Figma
- [ ] Validate with Tailwind MCP
- [ ] Align tokens
- [ ] Document design system

### **Components:**
- [ ] Validate all components with React MCP
- [ ] Generate/refactor components
- [ ] Validate accessibility
- [ ] Validate tokens
- [ ] Document components

### **Dashboard:**
- [ ] Extract dashboard design from Figma
- [ ] Generate dashboard components
- [ ] Validate all aspects
- [ ] Document dashboard

### **Next.js:**
- [ ] Query Next.js docs for best practices
- [ ] Validate routing
- [ ] Validate RSC boundaries
- [ ] Apply best practices

### **Documentation:**
- [ ] Generate component docs
- [ ] Update token reference
- [ ] Sync to Nextra
- [ ] Validate documentation

---

## 🚀 **Ready to Execute**

**All MCPs identified, workflows defined, ready to begin reframing!**

**Next Actions:**
1. Fix React Validation MCP (installing dependencies)
2. Start Next.js dev server (for runtime MCP)
3. Get Figma file keys
4. Begin Phase 1: Design System extraction

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **EXECUTION PLAN READY** - All workflows defined


# Hybrid MCP Architecture - Implementation Roadmap

> **Execution Plan** - Operationalizing the Hybrid MCP Architecture

**Status:** Ready for Implementation  
**Version:** 1.0.0

---

## ✅ Phase 1: Governance Foundation (Week 1)

### ✅ Completed

1. **Design Constitution Files**
   - ✅ `packages/ui/constitution/tokens.yml` - Token hierarchy and rules
   - ✅ `packages/ui/constitution/rsc.yml` - RSC boundary rules
   - ✅ `packages/ui/constitution/components.yml` - Component rules

### 🔄 Next Steps

1. **Validate Constitution Files**
   - Test JSON/YAML parsing
   - Validate schema structure
   - Test MCP integration

2. **Create Constitution Validator**
   - Build MCP tool to validate against constitution
   - Integrate with CI/CD
   - Add pre-commit hooks

---

## ✅ Phase 2: MCP Runtime Layer (Week 2)

### ✅ Completed

1. **MCP Client Core**
   - ✅ `packages/mcp-client/index.ts` - Core MCP client
   - ✅ `packages/mcp-client/hooks/useMcpTheme.ts` - Theme hook

2. **CSS Variable Engine**
   - ✅ `packages/ui/mcp/VariableBatcher.ts` - Atomic batching
   - ✅ `packages/ui/mcp/ThemeCssVariables.tsx` - Variable injector
   - ✅ `packages/ui/mcp/ThemeProvider.tsx` - Context provider

### 🔄 Next Steps

1. **Implement Actual MCP Tool Calls**
   - Connect to Cursor's MCP integration
   - Implement `call()` function with real MCP SDK
   - Test theme server connection

2. **Test Runtime Theme Switching**
   - Verify CSS variable injection
   - Test tenant switching
   - Test safe mode

---

## ✅ Phase 3: Validation & Enforcement (Week 3)

### ✅ Completed

1. **React Validation Server**
   - ✅ `tools/mcp-react-validation.mjs` - Component validation
   - ✅ RSC boundary checking
   - ✅ Server/Client usage validation

2. **A11y Validation Server**
   - ✅ `tools/mcp-a11y-validation.mjs` - Accessibility validation
   - ✅ Contrast checking
   - ✅ ARIA validation

3. **Component Generator**
   - ✅ `tools/mcp-component-generator.mjs` - AI component generation
   - ✅ Constitution validation
   - ✅ Code validation

### 🔄 Next Steps

1. **Integrate MCP Servers**
   - Register MCP servers in `.cursor/mcp.json`
   - Test server connections
   - Verify tool availability

2. **Build Visual Drift Engine**
   - Implement snapshot system
   - Add diff comparison
   - Integrate with CI/CD

---

## 📋 Implementation Checklist

### Phase 1: Governance ✅

- [x] Create token constitution
- [x] Create RSC constitution
- [x] Create component constitution
- [ ] Build constitution validator
- [ ] Integrate with CI/CD
- [ ] Add pre-commit hooks

### Phase 2: Runtime Layer ✅

- [x] Create MCP client core
- [x] Create theme hooks
- [x] Create VariableBatcher
- [x] Create ThemeCssVariables
- [x] Create ThemeProvider
- [ ] Implement actual MCP calls
- [ ] Test theme switching
- [ ] Test tenant overrides

### Phase 3: Validation ✅

- [x] Create React validation server
- [x] Create A11y validation server
- [x] Create component generator
- [ ] Register MCP servers
- [ ] Test validation tools
- [ ] Build visual drift engine

### Phase 4: Integration

- [ ] Integrate with AppShell
- [ ] Add theme versioning
- [ ] Add schema guards
- [ ] Add RSC purity test
- [ ] Add observability

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm add @modelcontextprotocol/sdk
pnpm add -D @babel/parser @babel/traverse
```

### 2. Register MCP Servers

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "react-validation": {
      "command": "node",
      "args": ["tools/mcp-react-validation.mjs"]
    },
    "a11y-validation": {
      "command": "node",
      "args": ["tools/mcp-a11y-validation.mjs"]
    },
    "component-generator": {
      "command": "node",
      "args": ["tools/mcp-component-generator.mjs"]
    }
  }
}
```

### 3. Use in App

```tsx
// app/layout.tsx
import { McpThemeProvider } from "@aibos/ui/mcp/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <McpThemeProvider tenant="dlbb" safeMode={false}>
          {children}
        </McpThemeProvider>
      </body>
    </html>
  );
}
```

---

## 📊 Success Metrics

### Phase 1 Success

- [ ] Constitution files validated
- [ ] Pre-commit hooks working
- [ ] CI/CD integration complete

### Phase 2 Success

- [ ] Theme switching works
- [ ] Tenant overrides functional
- [ ] Safe mode working
- [ ] No performance regression

### Phase 3 Success

- [ ] Validation tools working
- [ ] Component generation functional
- [ ] All guardrails enforced

---

**Last Updated:** 2024  
**Next Review:** After Phase 1 completion


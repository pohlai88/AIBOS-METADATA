# AI-BOS MCP Workflow

This document describes how to use the MCP UI generator and enforce the UI Constitution.

## 🎯 Overview

The AI-BOS UI generator uses:
- **MCP System Prompt** (`.mcp/ui-generator/prompt.md`) - Design system rules
- **MCP Server** (`.mcp/ui-generator/server.mjs`) - LLM integration
- **Generated Prompt** (`.mcp/ui-generator/prompt.generated.mjs`) - Synced JavaScript
- **CLI Script** (`.mcp/ui-generator/tools/generate-component.ts`) - Component generation
- **Validator** (`.mcp/component-generator/tools/validate-constitution.ts`) - Rule enforcement

## 📋 Quick Start

### 1. Verify Setup

```bash
# Check that prompt is synced
pnpm sync-mcp-prompt

# Verify no violations exist
pnpm lint:ui-constitution
```

### 2. Generate a Component

**Option A: Using CLI (Recommended)**
```bash
# Install dependencies first (one-time)
pnpm add @ai-sdk/openai ai

# Set API key
export OPENAI_API_KEY=your-key-here  # or add to .env

# Generate component
pnpm generate:ui tabs "A tabs component with multiple panels"
```

**Option B: Using API Route (Dev Only)**
```bash
# POST to http://localhost:3000/api/generate-ui
curl -X POST http://localhost:3000/api/generate-ui \
  -H "Content-Type: application/json" \
  -d '{"componentName": "tabs", "description": "A tabs component"}'
```

**Option C: Manual Creation**
1. Create `packages/ui/src/components/<name>.tsx`
2. Follow patterns from existing components
3. Use tokens from `packages/ui/src/design/tokens.ts`
4. Export in `packages/ui/src/components/index.ts`

### 3. Verify Compliance

```bash
# Run validator
pnpm lint:ui-constitution
```

## 🔒 Enforcing the Constitution

### Current Status

✅ **Validator passes** - No violations found in existing code

### Rules Enforced

1. **No raw hex colors** - Must use tokens
2. **No Tailwind palette colors** - No `bg-blue-600`, `text-slate-700`, etc.
3. **No inline visual styles** - No `style={{ color: ... }}`
4. **No direct Radix imports** - Only in `packages/ui/src/components`

### CI Integration

The GitHub Actions workflow (`.github/workflows/ui-constitution.yml`) automatically:
- Syncs MCP prompt on every PR
- Verifies generated file is in sync
- Validates UI constitution rules
- Blocks PRs with violations

## 📝 Component Creation Guidelines

### ✅ DO

- Use `componentTokens` for presets (buttonPrimary, card, etc.)
- Use `colorTokens` for surfaces and colors
- Use `accessibilityTokens` for text-on-surface pairs
- Use `radiusTokens`, `shadowTokens`, `spacingTokens` for utilities
- Import from `@aibos/ui` in app code
- Import Radix primitives only in `packages/ui/src/components`

### ❌ DON'T

- Use raw hex colors (`#2563eb`)
- Use Tailwind palette utilities (`bg-blue-600`)
- Use inline styles for visual properties
- Import `@radix-ui/react-*` directly in app code
- Create components outside `packages/ui/src/components`

## 🔄 Workflow Examples

### Creating a New Component

```bash
# 1. Generate (or create manually)
pnpm generate:ui dialog

# 2. Review generated code
# 3. Test in app
# 4. Verify compliance
pnpm lint:ui-constitution

# 5. Commit
git add packages/ui/src/components/dialog.tsx
git commit -m "feat: add dialog component"
```

### Updating System Prompt

```bash
# 1. Edit the prompt
vim .mcp/ui-generator/prompt.md

# 2. Sync to generated file
pnpm sync-mcp-prompt

# 3. Verify sync
git status  # Should show .mcp/ui-generator/prompt.generated.mjs

# 4. Commit both files
git add .mcp/ui-generator/prompt.md .mcp/ui-generator/prompt.generated.mjs
git commit -m "docs: update MCP system prompt"
```

### Refactoring Existing Code

```bash
# 1. Make changes
# 2. Validate
pnpm lint:ui-constitution

# 3. Fix any violations
# 4. Re-validate
pnpm lint:ui-constitution

# 5. Commit
```

## 🛠️ Troubleshooting

### "MCP dependencies not installed"

```bash
pnpm add @ai-sdk/openai ai
```

### "OPENAI_API_KEY not set"

```bash
# Add to .env.local or export
export OPENAI_API_KEY=your-key-here
```

### "Generated file is out of sync"

```bash
pnpm sync-mcp-prompt
git add .mcp/ui-generator/prompt.generated.mjs
```

### "UI Constitution violations found"

1. Review the violations listed
2. Replace raw colors with tokens
3. Replace Tailwind palette with tokens
4. Move Radix imports to `packages/ui/src/components`
5. Re-run validator

## 📚 Related Files

- `.mcp/ui-generator/prompt.md` - System prompt (source of truth)
- `.mcp/ui-generator/server.mjs` - MCP server implementation
- `.mcp/ui-generator/tools/generate-component.ts` - CLI generator
- `.mcp/component-generator/tools/validate-constitution.ts` - Validator
- `packages/ui/src/design/tokens.ts` - Token definitions
- `packages/ui/src/design/globals.css` - Design system CSS tokens
- `.github/workflows/ui-constitution.yml` - CI workflow (if exists)

## 🎓 Next Steps

1. **Install MCP dependencies** when ready to use AI generation
2. **Create more components** using the generator or manually
3. **Extend tokens** in `tokens.ts` as needed
4. **Update system prompt** to refine AI behavior
5. **Run validator regularly** to catch violations early

---

**Location:** `.mcp/MCP_WORKFLOW.md`  
**Related:** [MCP Architecture](./ARCHITECTURE.md) | [UI Generator README](./ui-generator/README.md)


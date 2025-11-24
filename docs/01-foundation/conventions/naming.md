# Naming Conventions

> **Last Updated:** 2025-11-24  
> **Status:** Active  
> **Scope:** All code in AI-BOS Platform

---

## Overview

This document defines naming conventions for files, components, functions, variables, and other code elements across the AI-BOS Platform monorepo.

---

## File Naming

### General Rules

- ✅ **Use kebab-case** for all file names: `button.tsx`, `user-menu.tsx`, `api-route.ts`
- ✅ **Be descriptive**: `password-toggle-field.tsx` not `toggle.tsx`
- ✅ **Use appropriate extensions**: `.tsx` for React components, `.ts` for utilities, `.mjs` for MCP servers

### Component Files

**Pattern:** `[component-name].tsx`

**Examples:**
- ✅ `button.tsx` - Simple component
- ✅ `dialog.tsx` - Complex component with sub-components
- ✅ `password-toggle-field.tsx` - Descriptive compound name
- ✅ `one-time-password-field.tsx` - Clear purpose

**Layout Components:**
- ✅ `AppShell.tsx` - PascalCase for layout components
- ✅ `Header.tsx` - Layout component
- ✅ `Sidebar.tsx` - Layout component
- ✅ `ContentArea.tsx` - Layout component

### Utility Files

**Pattern:** `[purpose].ts` or `[purpose].mjs`

**Examples:**
- ✅ `cn.ts` - Utility function (className helper)
- ✅ `tokens.ts` - Token utilities
- ✅ `server.mjs` - MCP server file
- ✅ `validate-constitution.ts` - Validation utility

### Configuration Files

**Pattern:** `[config-name].config.[ext]` or `[name].config.[ext]`

**Examples:**
- ✅ `next.config.ts` - Next.js configuration
- ✅ `eslint.config.mjs` - ESLint configuration
- ✅ `postcss.config.mjs` - PostCSS configuration
- ✅ `theme.config.tsx` - Theme configuration

### Documentation Files

**Pattern:** `[topic].md` or `README.md`

**Examples:**
- ✅ `README.md` - Package/app documentation
- ✅ `naming.md` - Topic documentation
- ✅ `CONSTITUTION_SYNC.md` - Status documentation
- ✅ `MCP_RECOMMENDATION.md` - Recommendation documentation

---

## Component Naming

### React Components

**Pattern:** PascalCase

**Examples:**
- ✅ `Button` - Simple component
- ✅ `Dialog` - Complex component
- ✅ `DialogTrigger` - Sub-component
- ✅ `PasswordToggleField` - Compound component
- ✅ `AppShell` - Layout component

### Component Props Interfaces

**Pattern:** `[ComponentName]Props`

**Examples:**
- ✅ `ButtonProps` - Button component props
- ✅ `DialogProps` - Dialog component props
- ✅ `DialogTriggerProps` - DialogTrigger component props

### Component Exports

**Pattern:** Named exports for components

**Examples:**
```typescript
// ✅ Correct
export const Button = ({ ...props }: ButtonProps) => { ... }
export const Dialog = ({ ...props }: DialogProps) => { ... }

// ❌ Incorrect
export default Button;
```

---

## Function Naming

### Regular Functions

**Pattern:** camelCase

**Examples:**
- ✅ `validateComponent` - Validation function
- ✅ `generateToken` - Generation function
- ✅ `sanitizeInput` - Utility function

### React Hooks

**Pattern:** `use[Purpose]` (camelCase with `use` prefix)

**Examples:**
- ✅ `useState` - React hook
- ✅ `useEffect` - React hook
- ✅ `useMcpTheme` - Custom hook

### Server Actions

**Pattern:** camelCase with descriptive action name

**Examples:**
- ✅ `createUser` - Server action
- ✅ `updateProfile` - Server action
- ✅ `deleteItem` - Server action

### MCP Tools

**Pattern:** `[tool-name]` (kebab-case or snake_case)

**Examples:**
- ✅ `validate_react_component` - MCP tool
- ✅ `generate_component` - MCP tool
- ✅ `read_tailwind_config` - MCP tool

---

## Variable Naming

### Constants

**Pattern:** UPPER_SNAKE_CASE for true constants

**Examples:**
- ✅ `MAX_LENGTH` - Maximum length constant
- ✅ `RATE_LIMIT_WINDOW` - Rate limit constant
- ✅ `GOVERNANCE_CONTEXT` - Governance constant

### Regular Variables

**Pattern:** camelCase

**Examples:**
- ✅ `componentName` - Variable name
- ✅ `filePath` - File path variable
- ✅ `isValid` - Boolean variable

### Type/Interface Names

**Pattern:** PascalCase

**Examples:**
- ✅ `ButtonProps` - Props interface
- ✅ `ComponentType` - Type definition
- ✅ `ValidationResult` - Result type

---

## Package Naming

### Monorepo Packages

**Pattern:** `@aibos/[package-name]`

**Examples:**
- ✅ `@aibos/ui` - UI package
- ✅ `@aibos/utils` - Utils package
- ✅ `@aibos/types` - Types package
- ✅ `@aibos/config` - Config package

### MCP Server Packages

**Pattern:** `@aibos/mcp-[server-name]`

**Examples:**
- ✅ `@aibos/mcp-react-validation` - React validation MCP
- ✅ `@aibos/mcp-theme` - Theme MCP
- ✅ `@aibos/mcp-component-generator` - Component generator MCP

---

## Directory Naming

### Source Directories

**Pattern:** lowercase, descriptive

**Examples:**
- ✅ `src/` - Source directory
- ✅ `components/` - Components directory
- ✅ `design/` - Design tokens directory
- ✅ `hooks/` - Hooks directory
- ✅ `lib/` - Library utilities

### Documentation Directories

**Pattern:** lowercase, numbered for ordering

**Examples:**
- ✅ `01-foundation/` - Foundation documentation
- ✅ `02-architecture/` - Architecture documentation
- ✅ `07-mcp/` - MCP documentation
- ✅ `99-archive/` - Archive directory

---

## Special Cases

### MCP Servers

**Pattern:** `[server-name]/server.mjs`

**Examples:**
- ✅ `.mcp/react/server.mjs` - React validation server
- ✅ `.mcp/theme/server.mjs` - Theme server
- ✅ `.mcp/component-generator/server.mjs` - Component generator server

### Constitution Files

**Pattern:** `[domain].yml`

**Examples:**
- ✅ `components.yml` - Component constitution
- ✅ `rsc.yml` - RSC boundary constitution
- ✅ `tokens.yml` - Token constitution

---

## Naming Best Practices

### 1. Be Descriptive

- ✅ `password-toggle-field.tsx` - Clear purpose
- ❌ `toggle.tsx` - Too generic

### 2. Use Consistent Patterns

- ✅ All component files: kebab-case
- ✅ All component names: PascalCase
- ✅ All functions: camelCase

### 3. Avoid Abbreviations

- ✅ `password-toggle-field.tsx` - Clear
- ❌ `pwd-tgl-fld.tsx` - Unclear

### 4. Use Semantic Names

- ✅ `isValid` - Boolean semantic
- ✅ `userCount` - Count semantic
- ✅ `handleSubmit` - Handler semantic

---

## Related Documentation

- [Folder Structure](./folder-structure.md) - Directory organization
- [Coding Standards](./coding-standards.md) - Code style and patterns
- [Component Constitution](../../../packages/ui/constitution/components.yml) - Component rules

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team

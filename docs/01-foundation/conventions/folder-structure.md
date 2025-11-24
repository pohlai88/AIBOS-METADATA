# Folder Structure Conventions

> **Last Updated:** 2025-11-24  
> **Status:** Active  
> **Scope:** AI-BOS Platform Monorepo

---

## Overview

This document defines the folder structure conventions for the AI-BOS Platform monorepo, including package organization, app structure, and documentation layout.

---

## Monorepo Structure

### Root Level

```
AIBOS-PLATFORM/
├── apps/                    # Applications
├── packages/                # Shared packages
├── docs/                    # Platform documentation (SSOT)
├── .mcp/                    # MCP servers
├── .cursor/                 # Cursor IDE configuration
├── package.json             # Root package.json
└── pnpm-workspace.yaml      # pnpm workspace config
```

---

## Package Structure

### Standard Package Layout

```
packages/[package-name]/
├── src/                     # Source code
│   ├── index.ts            # Main export
│   └── [modules]/          # Package modules
├── package.json            # Package configuration
├── README.md               # Package documentation
└── tsconfig.json           # TypeScript configuration
```

### UI Package Structure

```
packages/ui/
├── src/
│   ├── components/         # React components
│   ├── design/            # Design tokens
│   │   ├── globals.css    # CSS tokens (SSOT)
│   │   └── tokens.ts      # TypeScript tokens
│   ├── hooks/             # React hooks
│   ├── layouts/           # Layout components
│   └── lib/               # Utilities
├── constitution/           # Constitution files (YAML)
│   ├── components.yml      # Component rules
│   ├── rsc.yml            # RSC boundary rules
│   └── tokens.yml         # Token rules
├── package.json
└── README.md
```

### MCP Server Structure

```
.mcp/[server-name]/
├── server.mjs              # MCP server implementation
├── package.json            # Server dependencies
├── README.md              # Server documentation
└── tools/                 # Server-specific tools (optional)
    └── [tool-name].mjs
```

**Examples:**
- `.mcp/react/` - React validation server
- `.mcp/theme/` - Theme/token server
- `.mcp/component-generator/` - Component generator server
- `.mcp/documentation/` - Documentation server

---

## App Structure

### Next.js App (App Router)

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── api/               # API routes
│   └── [routes]/          # Dynamic routes
├── public/                 # Static assets
├── next.config.ts         # Next.js configuration
├── package.json
└── README.md
```

### Documentation App (Nextra)

```
apps/docs/
├── app/                    # Next.js App Router
│   └── [[...slug]]/       # Catch-all route
├── pages/                  # Documentation pages (synced from docs/)
│   ├── _meta.json         # Navigation metadata
│   └── [sections]/        # Documentation sections
├── scripts/               # Build scripts
├── theme.config.tsx       # Nextra theme
└── package.json
```

---

## Documentation Structure

### Root Documentation (SSOT)

```
docs/
├── 01-foundation/         # Foundation documentation
│   ├── conventions/       # Coding conventions
│   ├── philosophy/        # Design philosophy
│   └── ui-system/         # UI system
├── 02-architecture/       # Architecture documentation
├── 03-modules/            # Module documentation
├── 04-developer/           # Developer guides
├── 05-operations/         # Operations guides
├── 06-users/              # User documentation
├── 07-mcp/                # MCP documentation
├── 08-governance/         # Governance documentation
├── 09-reference/          # Reference documentation
└── 99-archive/            # Archived documentation
```

### Documentation Naming

- ✅ Use kebab-case: `naming.md`, `folder-structure.md`
- ✅ Be descriptive: `component-architecture.md` not `architecture.md`
- ✅ Use numbers for ordering: `01-foundation/`, `02-architecture/`

---

## Source Code Organization

### Component Organization

```
packages/ui/src/components/
├── [component-name].tsx    # Component file
├── index.ts                # Component exports
├── README.md               # Component documentation
└── [component-docs].md    # Additional docs
```

**Examples:**
- `button.tsx` - Button component
- `dialog.tsx` - Dialog component with sub-components
- `AppShell.tsx` - Layout component (PascalCase)

### Design Token Organization

```
packages/ui/src/design/
├── globals.css            # CSS tokens (SSOT)
└── tokens.ts              # TypeScript token access
```

**Source of Truth:** `globals.css` - All base tokens defined as CSS variables

---

## MCP Server Organization

### Server Directory Structure

```
.mcp/
├── [server-name]/         # Individual MCP server
│   ├── server.mjs         # Server implementation
│   ├── package.json      # Dependencies
│   ├── README.md         # Documentation
│   └── tools/            # Server-specific tools
├── README.md             # MCP overview
└── scripts/              # Shared scripts
```

### Server-Specific Tools

**Location:** `.mcp/[server-name]/tools/`

**Examples:**
- `.mcp/react/tools/` - React validation tools
- `.mcp/component-generator/tools/validate-constitution.ts` - Constitution validator

**Rule:** All tools used by MCP servers stay within `.mcp` directory

---

## Configuration Files

### Root Configuration

```
AIBOS-PLATFORM/
├── package.json           # Root dependencies
├── pnpm-workspace.yaml    # pnpm workspace
├── .gitignore            # Git ignore rules
└── .cursor/              # Cursor configuration
    └── mcp.json          # MCP server config
```

### Package Configuration

```
packages/[package-name]/
├── package.json          # Package dependencies
├── tsconfig.json         # TypeScript config
└── [config].config.[ext] # Other configs
```

### App Configuration

```
apps/[app-name]/
├── package.json          # App dependencies
├── next.config.ts        # Next.js config
├── tsconfig.json        # TypeScript config
└── [config].config.[ext] # Other configs
```

---

## File Organization Rules

### 1. Co-location

- ✅ Documentation lives with code when package-specific
- ✅ Tests co-located with source (if applicable)
- ✅ Configuration files at package/app root

### 2. Single Source of Truth (SSOT)

- ✅ `docs/` - Platform documentation SSOT
- ✅ `packages/ui/src/design/globals.css` - Token SSOT
- ✅ `packages/ui/constitution/` - Constitution SSOT

### 3. Clear Separation

- ✅ `apps/` - Applications (Next.js apps)
- ✅ `packages/` - Shared packages
- ✅ `docs/` - Documentation
- ✅ `.mcp/` - MCP servers

### 4. Consistent Patterns

- ✅ All packages follow same structure
- ✅ All apps follow same structure
- ✅ All MCP servers follow same structure

---

## Directory Naming Conventions

### Source Directories

- ✅ `src/` - Source code
- ✅ `components/` - React components
- ✅ `design/` - Design tokens
- ✅ `hooks/` - React hooks
- ✅ `lib/` - Library utilities
- ✅ `layouts/` - Layout components

### Documentation Directories

- ✅ `01-foundation/` - Foundation (numbered)
- ✅ `02-architecture/` - Architecture (numbered)
- ✅ `99-archive/` - Archive (numbered)

### Configuration Directories

- ✅ `.mcp/` - MCP servers (hidden)
- ✅ `.cursor/` - Cursor config (hidden)
- ✅ `scripts/` - Build/utility scripts

---

## Best Practices

### 1. Keep It Flat

- ✅ Avoid deep nesting (max 3-4 levels)
- ✅ Group related files together
- ✅ Use clear, descriptive names

### 2. Follow Conventions

- ✅ Use established patterns
- ✅ Maintain consistency
- ✅ Document exceptions

### 3. Organize by Feature

- ✅ Group related components
- ✅ Co-locate related files
- ✅ Separate concerns clearly

---

## Related Documentation

- [Naming Conventions](./naming.md) - File and component naming
- [Coding Standards](./coding-standards.md) - Code organization
- [MCP Architecture](../../07-mcp/servers/architecture.md) - MCP structure

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team

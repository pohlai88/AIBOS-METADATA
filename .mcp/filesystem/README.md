# AIBOS Filesystem MCP Server

> **Optimized filesystem access with controlled allowedPaths**

---

## Overview

This MCP server provides controlled filesystem access for the AIBOS platform. It restricts access to only source code directories, improving performance and security.

---

## Features

### ✅ Optimized Performance

- **Focused Paths:** Only includes source code directories
- **Excluded Patterns:** Automatically excludes build artifacts, node_modules, etc.
- **Fast Access:** Reduced file scanning overhead

### ✅ Security

- **Path Validation:** All paths are validated against allowed list
- **Pattern Exclusion:** Build artifacts and dependencies are excluded
- **Controlled Access:** Only source code directories are accessible

---

## Allowed Paths

The server allows access to:

```
apps/web/app          - Next.js app directory
apps/web/lib          - Next.js lib directory
packages/ui/src/*     - UI package source code
packages/ui/constitution - UI constitution files
packages/types/src    - Types package
packages/utils/src    - Utils package
.mcp                  - MCP servers
```

---

## Tools

### 1. `read_file`

Read the contents of a file.

**Input:**
```json
{
  "path": "packages/ui/src/components/button.tsx"
}
```

**Output:**
File content as text.

---

### 2. `list_directory`

List the contents of a directory.

**Input:**
```json
{
  "path": "packages/ui/src/components"
}
```

**Output:**
Array of directory entries with name, type, and path.

---

### 3. `write_file`

Write content to a file.

**Input:**
```json
{
  "path": "packages/ui/src/components/new-component.tsx",
  "content": "export function NewComponent() { ... }"
}
```

**Output:**
Success message.

---

### 4. `get_allowed_paths`

Get the list of allowed paths.

**Input:**
```json
{}
```

**Output:**
Array of allowed paths.

---

## Configuration

The server is configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-filesystem": {
      "command": "node",
      "args": [".mcp/filesystem/server.mjs"]
    }
  }
}
```

---

## Excluded Patterns

The following patterns are automatically excluded:

- `node_modules/` - Dependencies
- `.next/` - Next.js build artifacts
- `dist/` - Build output
- `.turbo/` - Turbo build cache
- `.git/` - Git directory
- `.vscode/`, `.idea/` - IDE directories
- `coverage/` - Test coverage
- `.cache/` - Cache directories

---

## Performance Benefits

### Before (External Package)
- ❌ Scans entire workspace
- ❌ Includes build artifacts
- ❌ Slower file access
- ❌ No path control

### After (Custom Server)
- ✅ Focused on source code only
- ✅ Excludes build artifacts
- ✅ Faster file access
- ✅ Full path control

---

## Usage

### In Cursor

The filesystem MCP is automatically available when configured. Use it to:

- Read source code files
- List directory contents
- Write files (within allowed paths)
- Check allowed paths

### Example

```
Read the Button component from packages/ui/src/components
```

---

## Version

**Current:** 1.0.0

---

**Location:** `.mcp/filesystem/server.mjs`  
**Status:** ✅ Active


# Tailwind v4 MCP Server

MCP server providing Tailwind CSS v4 validation, documentation access, and best practices enforcement.

## Purpose

This MCP server helps AI assistants:

- ✅ Validate Tailwind v4 syntax and patterns
- ✅ Access Tailwind v4 documentation and guides
- ✅ Check CSS-first approach compliance
- ✅ Validate design token usage
- ✅ Enforce `.cursorrules` best practices

## Available Tools

### 1. `get_use_cases` ⭐ NEW

Retrieves real-world use cases, patterns, and examples for building amazing sites with Tailwind v4.

**Input:**

- `pattern` (optional) - Specific pattern (e.g., "hero", "features", "pricing")
- `category` (optional) - Category filter (e.g., "landing-page", "components")

**Output:**

- Use case examples with code
- Component patterns (buttons, cards, sections)
- Layout patterns (grids, flex)
- Best practices
- Reference sites

**Examples:**

- `{ "pattern": "hero" }` - Get hero section example
- `{ "pattern": "pricing" }` - Get pricing section example
- `{ "category": "landing-page" }` - Get all landing page patterns

**Reference:** Inspired by [Aceternity UI Template](https://ai-saas-template-aceternity.vercel.app/) and [Graphite](https://graphite.com/)

---

### 2. `get_official_docs` ⭐ NEW

Fetches Tailwind CSS v4.1 official documentation from tailwindcss.com/docs. **Now includes navigation parsing!**

**Input:**

- `path` (optional) - Documentation path (e.g., "installation/using-vite")
- `url` (optional) - Full URL to fetch
- `query` (optional) - Search query to find relevant pages
- `getNavigation` (optional) - If true, returns navigation structure (sidebar links)

**Output:**

- Documentation content from official Tailwind v4.1 docs
- **Navigation structure** (sections, links, sidebar) - NEW!
- Search results with relevance scoring (uses navigation index)
- Code blocks extracted from documentation
- Page title

**Examples:**

- `{ "path": "installation/using-vite" }` - Get Vite installation guide with navigation
- `{ "query": "container queries" }` - Search for container queries docs (uses navigation links)
- `{ "url": "https://tailwindcss.com/docs/gradients" }` - Fetch specific page
- `{ "getNavigation": true }` - Get full navigation structure (all sidebar links)

**Navigation Features:**

- ✅ Extracts sidebar navigation links automatically
- ✅ Identifies documentation sections (CORE CONCEPTS, LAYOUT, etc.)
- ✅ Builds navigation index for better search
- ✅ Returns all available documentation pages

**Reference:** https://tailwindcss.com/docs/installation/using-vite

---

### 3. `validate_syntax`

Validates Tailwind v4 syntax in code files.

**Input:**

- `filePath` - Path to file to validate
- `code` (optional) - Code content to validate directly

**Output:**

- Validation results with errors and suggestions

### 4. `get_documentation`

Retrieves Tailwind v4 documentation from local guides.

**Input:**

- `topic` - Topic to search (e.g., "content detection", "gradients", "variants")

**Output:**

- Relevant documentation content

### 5. `validate_design_tokens`

Validates `@theme` directive usage and design tokens.

**Input:**

- `cssContent` - CSS content to validate

**Output:**

- Token validation results

### 6. `check_css_first`

Validates CSS-first approach (no JS config, proper @import, etc.)

**Input:**

- `filePath` - Path to CSS or config file

**Output:**

- Compliance check results

### 7. `get_best_practices`

Retrieves best practices from `.cursorrules` and guides.

**Input:**

- `category` (optional) - Category filter (e.g., "animation", "gradients", "variants")

**Output:**

- Best practices and rules

## Usage

The server is automatically registered in `.cursor/mcp.json` as `aibos-tailwind-v4`.

## Configuration

```json
{
  "mcpServers": {
    "aibos-tailwind-v4": {
      "command": "node",
      "args": [".mcp/tailwind-v4/server.mjs"],
      "cwd": "."
    }
  }
}
```

## References

- [Tailwind v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind v4.1 Official Docs](https://tailwindcss.com/docs) - Accessible via `get_official_docs` tool
- [Vite Installation](https://tailwindcss.com/docs/installation/using-vite) - Accessible via `get_official_docs`
- [Content Detection](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Lightning CSS](https://lightningcss.dev/docs.html)

## Official Documentation Access

The `get_official_docs` tool provides access to the entire Tailwind CSS v4.1 documentation:

**Common Documentation Paths:**

- `installation/using-vite` - Vite plugin setup
- `installation/using-postcss` - PostCSS setup
- `detecting-classes-in-source-files` - Content detection
- `theme-variables` - Design tokens
- `colors` - Color system
- `container-queries` - Container queries
- `transforms` - 3D transforms
- `gradients` - Gradient utilities
- `transitions-and-animation` - Animations

**Usage Examples:**

```
Get Tailwind v4.1 documentation for Vite installation
Search Tailwind v4.1 docs for container queries
Get official Tailwind docs for gradients
```

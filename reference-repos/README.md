# Reference Repositories

This directory contains cloned reference repositories for Tailwind CSS v4 and Next.js development.

## Best Practices for Efficiency

### 1. **Shallow Clones**

When cloning repos, use shallow clones to save space:

```bash
git clone --depth 1 <repo-url> <folder-name>
```

### 2. **Selective File Indexing**

The `.cursorignore` file excludes:

- `node_modules/` - Dependencies (can be huge)
- `.next/`, `.turbo/`, `dist/`, `build/` - Build outputs
- `.git/` - Git history (not needed for reference)
- Lock files - Can be regenerated
- Logs and cache files

### 3. **What to Keep**

- Source code files (`.tsx`, `.ts`, `.js`, `.jsx`, `.css`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`README.md`, examples)
- Example components and patterns

### 4. **Repository Structure**

```
reference-repos/
├── nextv15-tailwindv4-starter/     # Next.js 15 + Tailwind v4 patterns
├── tailwind-v4-theming-examples/   # Theming and customization examples
└── turbo-with-tailwind-v4/         # Monorepo setup with Tailwind v4
```

### 5. **IDE Benefits**

- Code completion from reference patterns
- Better understanding of Tailwind v4 syntax
- Example implementations to learn from
- Type definitions and patterns

### 6. **Maintenance**

- Periodically update repos: `git pull` (if keeping full clones)
- Or re-clone shallow: `git clone --depth 1` (fresh start)
- Remove repos you no longer need

## Current Repositories

1. **nextv15-tailwindv4-starter** - Next.js 15 starter with Tailwind v4
2. **tailwind-v4-theming-examples** - Theming examples and patterns
3. **turbo-with-tailwind-v4** - Turborepo monorepo setup

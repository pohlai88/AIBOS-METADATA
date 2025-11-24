# AIBOS Design System Documentation

Documentation site built with Nextra and Next.js 16, serving content from `packages/ui/ui-docs/`.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# From root directory
pnpm install
```

### Development

```bash
# Start dev server (automatically syncs docs)
pnpm dev

# Or from root
cd apps/docs && pnpm dev
```

The documentation site will be available at `http://localhost:3001`

### Building

```bash
# Build for production (automatically syncs docs)
pnpm build

# Start production server
pnpm start
```

## 📁 Structure

```
apps/docs/
├── app/                    # Next.js App Router
│   └── layout.tsx         # Root layout
├── pages/                  # Nextra pages (synced from packages/ui/ui-docs/)
│   ├── index.mdx          # Homepage
│   ├── _meta.json         # Navigation structure
│   ├── 01-foundation/     # Foundation docs
│   ├── 02-components/     # Component docs
│   ├── 04-integration/    # Integration guides
│   └── 05-guides/         # Developer guides
├── scripts/
│   └── sync-docs.ts       # Script to sync docs from packages/ui/ui-docs/
├── theme.config.tsx        # Nextra theme configuration
├── next.config.ts          # Next.js + Nextra configuration
└── package.json            # Dependencies
```

## 🔧 Configuration

### Next.js Config

- **Monorepo Support:** Transpiles `@aibos/*` packages
- **Nextra Integration:** Configured with docs theme
- **Output Tracing:** Configured for monorepo builds

### Documentation Sync

The `sync-docs` script automatically copies markdown files from `packages/ui/ui-docs/` to `apps/docs/pages/` before building or starting the dev server.

**Manual sync:**
```bash
pnpm sync-docs
```

### Navigation

Navigation is configured in `pages/_meta.json`. Update this file to change the sidebar structure.

## 📚 Content Source

All documentation content is sourced from `docs/`, which is the **Single Source of Truth (SSOT)** for all AI-BOS platform documentation.

**Important:** Do not edit files in `apps/docs/pages/` directly. Always edit the source files in `docs/` and run `pnpm sync-docs`.

## 🎨 Customization

### Theme

Edit `theme.config.tsx` to customize:
- Logo and branding
- Colors and styling
- Navigation behavior
- Search configuration

### Layout

Edit `app/layout.tsx` to customize:
- Metadata
- Fonts
- Global styles

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set root directory to `apps/docs`
3. Build command: `pnpm build`
4. Output directory: `.next`

### Other Platforms

The site can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Self-hosted Node.js server

## 📝 Best Practices

1. **Always edit source files** in `packages/ui/ui-docs/`, not in `apps/docs/pages/`
2. **Run sync before committing** if you've made changes to docs
3. **Update `_meta.json`** when adding new documentation sections
4. **Follow Next.js 16 best practices** for any custom components
5. **Validate documentation** against MCP tools before publishing

## 🔗 Related Documentation

- [UI Documentation Source](../../packages/ui/ui-docs/README.md)
- [Design System Guide](../../docs/design-system-guide.md)
- [Next.js Best Practices](../../docs/NEXTJS_BEST_PRACTICES.md)


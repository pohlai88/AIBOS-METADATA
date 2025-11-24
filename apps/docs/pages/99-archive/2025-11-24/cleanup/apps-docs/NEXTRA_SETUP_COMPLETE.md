# Nextra Setup Complete ✅

## Summary

Nextra documentation site has been successfully set up following Next.js 16 best practices.

## What Was Created

### 1. Documentation App Structure
- **Location:** `apps/docs/`
- **Framework:** Next.js 16.0.3 with Nextra 3.4.0
- **Port:** 3001 (to avoid conflict with main web app on 3000)

### 2. Key Files

#### Configuration
- `next.config.ts` - Next.js + Nextra configuration
- `theme.config.tsx` - Nextra theme customization
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

#### App Structure
- `app/layout.tsx` - Root layout with metadata
- `pages/` - Documentation pages (synced from `packages/ui/ui-docs/`)
- `pages/index.mdx` - Homepage
- `pages/_meta.json` - Navigation structure

#### Scripts
- `scripts/sync-docs.ts` - Syncs docs from `packages/ui/ui-docs/` to `pages/`

### 3. Integration

#### Monorepo Support
- ✅ Transpiles `@aibos/*` packages
- ✅ Output file tracing configured
- ✅ Turbo.json updated with `sync-docs` task

#### Documentation Sync
- ✅ Automatic sync before dev/build
- ✅ Manual sync via `pnpm sync-docs`
- ✅ Preserves source of truth in `packages/ui/ui-docs/`

## Next Steps

### 1. Install Dependencies

```bash
# From root
pnpm install
```

### 2. Run Initial Sync

```bash
cd apps/docs
pnpm sync-docs
```

### 3. Start Development Server

```bash
# From root
pnpm dev

# Or from apps/docs
cd apps/docs && pnpm dev
```

The site will be available at `http://localhost:3001`

### 4. Customize Theme

Edit `apps/docs/theme.config.tsx` to customize:
- Logo and branding
- Project links
- Footer text
- Navigation behavior

### 5. Update Navigation

Edit `apps/docs/pages/_meta.json` to update the sidebar structure when adding new documentation sections.

## Best Practices Followed

### ✅ Next.js 16 Best Practices
- App Router structure
- TypeScript configuration
- Monorepo transpilation
- Output file tracing
- React Strict Mode

### ✅ Nextra Best Practices
- Pages Router for documentation (Nextra's recommended approach)
- Theme configuration
- Search configuration
- Navigation structure

### ✅ Monorepo Best Practices
- Separate app for documentation
- Workspace dependencies
- Turbo integration
- Single source of truth for content

## Architecture Decisions

### Why Pages Router?
Nextra 3.x works best with Pages Router for documentation. The App Router layout is used for global configuration, while pages are handled by Nextra.

### Why Sync Script?
- Windows symlinks require admin privileges
- Ensures content is always up-to-date
- Preserves single source of truth
- Works across all platforms

### Why Separate App?
- Clear separation of concerns
- Independent deployment
- Different port for development
- Can be scaled independently

## Troubleshooting

### Issue: "Cannot find module 'nextra'"
**Solution:** Run `pnpm install` from root directory

### Issue: Documentation not updating
**Solution:** Run `pnpm sync-docs` manually

### Issue: Port 3001 already in use
**Solution:** Change port in `package.json` scripts or use `-p` flag

### Issue: TypeScript errors in next.config.ts
**Solution:** The `@ts-expect-error` comment is intentional until nextra types are installed

## Deployment

### Vercel (Recommended)
1. Connect repository
2. Set root directory to `apps/docs`
3. Build command: `pnpm build`
4. Output directory: `.next`

### Other Platforms
Any platform supporting Next.js will work. Ensure:
- Node.js 18+
- Build command runs `pnpm sync-docs && pnpm build`
- Environment variables configured if needed

## Related Documentation

- [Documentation Source](../../packages/ui/ui-docs/README.md)
- [Design System Guide](../../docs/design-system-guide.md)
- [Next.js Best Practices](../../docs/NEXTJS_BEST_PRACTICES.md)
- [Documentation Strategy](../../.mcp/DOCUMENTATION_STRATEGY_RECOMMENDATION.md)

---

**Status:** ✅ Setup Complete  
**Next:** Install dependencies and start development server


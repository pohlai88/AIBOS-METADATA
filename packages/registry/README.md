# 📦 AIBOS Component Registry

**Component templates for the AIBOS Design System**

---

## 🎯 What is This?

The **Registry** contains **component templates** that are **copied** (not imported) into consuming applications.

This approach gives developers:
- ✅ **Full control** - Modify components locally
- ✅ **No dependency hell** - No version conflicts
- ✅ **Consistency** - All components use the same design tokens
- ✅ **Flexibility** - Customize without breaking other apps

---

## 🏗️ How It Works

### 1. Components Are Templates

Components in this registry are **not published** as an npm package.  
They are **source code templates** that get copied into your app.

### 2. Automatic Copying via Workspace Scaffold

When you run `pnpm create`, the workspace scaffold automatically:
1. Creates your new app
2. Copies relevant registry components to `your-app/components/`
3. Imports `@aibos/ui` design tokens
4. Sets up ThemeProvider

### 3. Local Modification

After copying, the components are **yours to modify**:

```bash
apps/your-app/
  └── components/
      ├── Button.tsx           # ← Copied from registry, modify freely!
      ├── MetadataBadge.tsx    # ← Copied from registry, modify freely!
      └── ...
```

---

## 📋 Available Components

| Component | Purpose | Uses Tokens |
|-----------|---------|-------------|
| **Button.tsx** | Primary button component | ✅ `--color-primary-rgb` |
| **Badge.tsx** | Status and label badges | ✅ `--color-*-rgb` |
| **Card.tsx** | Content containers | ✅ `--color-background-*` |
| **MetadataBadge.tsx** | Metadata domain badges | ✅ `--color-metadata-*` |
| **TierBadge.tsx** | Governance tier indicators | ✅ `--color-tier-*` |
| **FinanceBadge.tsx** | Finance domain badges | ✅ `--color-finance-*` |

---

## 🎨 Design Token Usage

All components use CSS variables from `@aibos/ui/design/globals.css`:

```tsx
// Example: MetadataBadge.tsx uses controlled vocabulary for colors
export function MetadataBadge({ domain }: { domain: string }) {
  const colors = {
    glossary: 'bg-[rgb(var(--color-metadata-glossary)/0.1)]',
    lineage: 'bg-[rgb(var(--color-metadata-lineage)/0.1)]',
    quality: 'bg-[rgb(var(--color-metadata-quality)/0.1)]',
  };
  
  return (
    <span className={colors[domain]}>
      {domain}
    </span>
  );
}
```

**Why this works:**
- Changes to `globals.css` tokens = instant updates across all apps
- Components don't hardcode colors (controlled vocabulary!)
- Light/dark theme works automatically

---

## 🚀 Adding New Components

### 1. Create Template in Registry

```tsx
// packages/registry/components/YourComponent.tsx
export function YourComponent() {
  return (
    <div className="bg-bg-muted text-text-base p-md rounded-lg">
      Uses design tokens!
    </div>
  );
}
```

### 2. Update Workspace Scaffold

Edit `tools/workspace-scaffold/cli.mjs` to copy your component:

```javascript
// In generateNextApp():
await writeFile(
  join(targetDir, 'components/YourComponent.tsx'),
  readFileSync('../../packages/registry/components/YourComponent.tsx', 'utf-8')
);
```

### 3. Generate New App

```bash
pnpm create
# Your component is automatically included!
```

---

## 💡 Best Practices

### ✅ DO

- Use CSS variables from `globals.css`
- Reference tokens (e.g., `bg-primary`, `text-text-base`)
- Keep components simple and composable
- Document component props

### ❌ DON'T

- Hardcode colors (e.g., `#3b82f6`)
- Use arbitrary values (e.g., `bg-[#123456]`)
- Create tightly coupled components
- Make components dependent on specific apps

---

## 📊 Registry vs. Package

| Aspect | Registry (Templates) | Package (Imports) |
|--------|---------------------|-------------------|
| **Distribution** | Copy source code | npm install |
| **Customization** | Full control | Limited |
| **Updates** | Manual copy | Auto with package update |
| **Dependencies** | None | Version conflicts |
| **Best for** | UI components | Utilities, logic |

**Our approach:**
- **Design tokens** = Package (`@aibos/ui`) ✅
- **Components** = Registry (templates) ✅
- **Utilities** = Package (`@aibos/types`) ✅

---

## 🎯 Philosophy

> **"Components are templates, not dependencies."**

This gives junior developers:
1. **Confidence** - They can modify without breaking things
2. **Learning** - They see the source code
3. **Flexibility** - They adapt to their needs
4. **Consistency** - They still use the same design tokens

---

**Created by:** AIBOS Platform Team  
**Version:** 1.0.0  
**Last Updated:** December 1, 2025


/**
 * AIBOS Design System - Main Export
 * 
 * This package provides the design system foundation:
 * - Design tokens (CSS variables)
 * - Theme provider (light/dark mode)
 * - Shared Tailwind configuration
 * 
 * Components are NOT exported from here.
 * They live in the registry and are copied into apps.
 */

// Export ThemeProvider and useTheme hook
export { ThemeProvider, useTheme, ThemeToggle } from './components/ThemeProvider';

// Export utility functions
export { cn } from './utils/cn';

// Note: In Tailwind v4, each app has its own tailwind.config.js
// No need to share/extend config files - use CSS variables instead

/**
 * Design Token Documentation
 * 
 * All design tokens are defined in design/globals.css
 * Import it in your app/layout.tsx:
 * 
 * import '@aibos/ui/design/globals.css';
 * 
 * Available token categories:
 * - Colors (primary, success, warning, danger, text, background, border)
 * - Metadata colors (glossary, lineage, quality, governance, tags, kpi)
 * - Finance colors (revenue, expense, asset, liability, equity)
 * - Tier colors (1, 2, 3, 4)
 * - Spacing (xs, sm, md, lg, xl, 2xl)
 * - Typography (font families, sizes)
 * - Shadows (sm, md, lg, xl)
 * - Border radius (sm, md, lg, xl, 2xl, full)
 */

// Type exports for TypeScript
export type Theme = 'light' | 'dark' | 'system';


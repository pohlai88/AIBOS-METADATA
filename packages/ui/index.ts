/**
 * AIBOS Design System - Main Export
 * 
 * This package provides the design system foundation (PILLARS ONLY):
 * - Design tokens (CSS variables)
 * - Pure utilities (cn function)
 * 
 * Components are NOT exported from here.
 * They live in apps/web/components/ui/ following hexagonal architecture.
 */

// Export utility functions (PILLAR - pure, no React)
export { cn } from './lib/utils';

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

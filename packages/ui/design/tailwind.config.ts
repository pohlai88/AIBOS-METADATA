/**
 * AIBOS Design System - Tailwind Configuration
 *
 * This config maps our CSS tokens to Tailwind utilities.
 * All apps should extend this config to ensure consistency.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // 🎯 CRITICAL MONOREPO FIX: CONTENT DISCOVERY
  // Tailwind's Rust engine scans these paths to generate CSS
  content: [
    // 1. Shared component templates (The Registry)
    "../../packages/registry/**/*.{js,ts,jsx,tsx}",
    // 2. All applications
    "../../apps/**/*.{js,ts,jsx,tsx}",
    // 3. Include globals.css for custom utilities
    "./globals.css",
  ],

  // 1. THEME MODE SETTING (Activates Layer 3 - Dark Mode)
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind color classes
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover-rgb) / <alpha-value>)",
        },
        success: "rgb(var(--color-success-rgb) / <alpha-value>)",
        warning: "rgb(var(--color-warning-rgb) / <alpha-value>)",
        danger: "rgb(var(--color-danger-rgb) / <alpha-value>)",
        info: "rgb(var(--color-info-rgb) / <alpha-value>)",

        // Foreground (text) colors
        // Use 'fg' prefix to avoid conflict with Tailwind's 'text-{size}' utilities
        fg: {
          DEFAULT: "rgb(var(--color-text-base) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-text-subtle) / <alpha-value>)",
        },

        // Background colors
        bg: {
          DEFAULT: "rgb(var(--color-background-base) / <alpha-value>)",
          subtle: "rgb(var(--color-background-subtle) / <alpha-value>)",
          muted: "rgb(var(--color-background-muted) / <alpha-value>)",
        },

        // Border colors
        border: {
          DEFAULT: "rgb(var(--color-border-base) / <alpha-value>)",
          muted: "rgb(var(--color-border-muted) / <alpha-value>)",
        },

        // Metadata-specific colors
        metadata: {
          glossary: "rgb(var(--color-metadata-glossary) / <alpha-value>)",
          lineage: "rgb(var(--color-metadata-lineage) / <alpha-value>)",
          quality: "rgb(var(--color-metadata-quality) / <alpha-value>)",
          governance: "rgb(var(--color-metadata-governance) / <alpha-value>)",
          tags: "rgb(var(--color-metadata-tags) / <alpha-value>)",
          kpi: "rgb(var(--color-metadata-kpi) / <alpha-value>)",
        },

        // Finance domain colors
        finance: {
          revenue: "rgb(var(--color-finance-revenue) / <alpha-value>)",
          expense: "rgb(var(--color-finance-expense) / <alpha-value>)",
          asset: "rgb(var(--color-finance-asset) / <alpha-value>)",
          liability: "rgb(var(--color-finance-liability) / <alpha-value>)",
          equity: "rgb(var(--color-finance-equity) / <alpha-value>)",
        },

        // Tier colors
        tier: {
          1: "rgb(var(--color-tier-1) / <alpha-value>)",
          2: "rgb(var(--color-tier-2) / <alpha-value>)",
          3: "rgb(var(--color-tier-3) / <alpha-value>)",
          4: "rgb(var(--color-tier-4) / <alpha-value>)",
        },
      },

      // Spacing using tokens (8-point grid constitution)
      spacing: {
        1: "var(--spacing-1)",   // 4px
        2: "var(--spacing-2)",   // 8px
        3: "var(--spacing-3)",   // 12px
        4: "var(--spacing-4)",   // 16px
        5: "var(--spacing-5)",   // 24px
        6: "var(--spacing-6)",   // 32px
        7: "var(--spacing-7)",   // 40px
        8: "var(--spacing-8)",   // 48px
        10: "var(--spacing-10)", // 64px
        12: "var(--spacing-12)", // 96px
        
        // Legacy aliases (use numbered scale instead)
        xs: "var(--spacing-1)",
        sm: "var(--spacing-2)",
        md: "var(--spacing-4)",
        lg: "var(--spacing-5)",
        xl: "var(--spacing-6)",
        "2xl": "var(--spacing-8)",
      },

      // Font family (with fallbacks for better compatibility)
      fontFamily: {
        sans: [
          "var(--font-family-base)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-family-mono)",
          "SF Mono",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },

      // Font sizes (type scale constitution ~1.25 ratio)
      fontSize: {
        xs: "var(--font-size-xs)",     // 12px
        sm: "var(--font-size-sm)",     // 14px
        base: "var(--font-size-base)", // 16px
        lg: "var(--font-size-lg)",     // 18px
        xl: "var(--font-size-xl)",     // 20px
        "2xl": "var(--font-size-2xl)", // 24px
        "3xl": "var(--font-size-3xl)", // 30px
        "4xl": "var(--font-size-4xl)", // 36px
        "5xl": "var(--font-size-5xl)", // 48px
        "6xl": "var(--font-size-6xl)", // 60px
      },

      // Border radius
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      // Box shadows
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      
      // Max-width (layout constitution)
      maxWidth: {
        sm: "var(--layout-max-width-sm)",   // 640px
        md: "var(--layout-max-width-md)",   // 768px
        lg: "var(--layout-max-width-lg)",   // 1024px
        xl: "var(--layout-max-width-xl)",   // 1280px
        "2xl": "var(--layout-max-width-2xl)", // 1536px
        full: "var(--layout-max-width-full)", // 100%
      },
      
      // Width (for fixed sidebars)
      width: {
        sidebar: "var(--layout-sidebar-width)",           // 280px
        "sidebar-collapsed": "var(--layout-sidebar-width-collapsed)", // 64px
      },
    },
  },
  plugins: [],
};

export default config;

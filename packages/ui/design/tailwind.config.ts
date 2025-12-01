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

        // Text colors
        "text-base": "rgb(var(--color-text-base) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        "text-subtle": "rgb(var(--color-text-subtle) / <alpha-value>)",

        // Background colors
        "bg-base": "rgb(var(--color-background-base) / <alpha-value>)",
        "bg-subtle": "rgb(var(--color-background-subtle) / <alpha-value>)",
        "bg-muted": "rgb(var(--color-background-muted) / <alpha-value>)",

        // Border colors
        "border-base": "rgb(var(--color-border-base) / <alpha-value>)",
        "border-muted": "rgb(var(--color-border-muted) / <alpha-value>)",

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

      // Spacing using tokens
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
      },

      // Font family
      fontFamily: {
        sans: "var(--font-family-base)",
        mono: "var(--font-family-mono)",
      },

      // Font sizes
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
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
    },
  },
  plugins: [],
};

export default config;

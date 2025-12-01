/**
 * Tailwind CSS v4 Configuration for AIBOS Web App
 * 
 * In Tailwind v4, config files are optional but needed for:
 * - Custom color utilities (bg-primary, text-fg, etc.)
 * - Dark mode configuration
 * - Content paths for purging
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Content paths for Tailwind to scan
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "../../packages/registry/**/*.{js,ts,jsx,tsx}",
  ],

  // Dark mode strategy
  darkMode: "class", // Use .dark class on <html>

  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind color utilities
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover-rgb) / <alpha-value>)",
        },
        success: "rgb(var(--color-success-rgb) / <alpha-value>)",
        warning: "rgb(var(--color-warning-rgb) / <alpha-value>)",
        danger: "rgb(var(--color-danger-rgb) / <alpha-value>)",
        info: "rgb(var(--color-info-rgb) / <alpha-value>)",

        // Foreground (text) colors - 'fg' prefix to avoid conflicts
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
        "metadata-glossary": "rgb(var(--color-metadata-glossary) / <alpha-value>)",
        "metadata-lineage": "rgb(var(--color-metadata-lineage) / <alpha-value>)",
        "metadata-quality": "rgb(var(--color-metadata-quality) / <alpha-value>)",
        "metadata-governance": "rgb(var(--color-metadata-governance) / <alpha-value>)",
        "metadata-tags": "rgb(var(--color-metadata-tags) / <alpha-value>)",
        "metadata-kpi": "rgb(var(--color-metadata-kpi) / <alpha-value>)",

        // Finance domain colors
        "finance-revenue": "rgb(var(--color-finance-revenue) / <alpha-value>)",
        "finance-expense": "rgb(var(--color-finance-expense) / <alpha-value>)",
        "finance-asset": "rgb(var(--color-finance-asset) / <alpha-value>)",
        "finance-liability": "rgb(var(--color-finance-liability) / <alpha-value>)",
        "finance-equity": "rgb(var(--color-finance-equity) / <alpha-value>)",

        // Tier colors
        "tier-1": "rgb(var(--color-tier-1) / <alpha-value>)",
        "tier-2": "rgb(var(--color-tier-2) / <alpha-value>)",
        "tier-3": "rgb(var(--color-tier-3) / <alpha-value>)",
        "tier-4": "rgb(var(--color-tier-4) / <alpha-value>)",
      },

      // Motion tokens (durations & easing)
      transitionDuration: {
        fast: "var(--motion-duration-fast)",
        normal: "var(--motion-duration-normal)",
        slow: "var(--motion-duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--motion-ease-standard)",
        in: "var(--motion-ease-in)",
        out: "var(--motion-ease-out)",
      },

      // Elevation tokens (shadows)
      boxShadow: {
        raised: "var(--shadow-raised)",
        floating: "var(--shadow-floating)",
        overlay: "var(--shadow-overlay)",
        high: "var(--shadow-high)",
      },

      // Spacing (8-point grid)
      spacing: {
        1: "var(--spacing-1)", // 4px
        2: "var(--spacing-2)", // 8px
        3: "var(--spacing-3)", // 12px
        4: "var(--spacing-4)", // 16px
        5: "var(--spacing-5)", // 24px
        6: "var(--spacing-6)", // 32px
        7: "var(--spacing-7)", // 40px
        8: "var(--spacing-8)", // 48px
        10: "var(--spacing-10)", // 64px
        12: "var(--spacing-12)", // 96px
      },

      // Typography (type scale)
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
      },

      // Layout max-widths
      maxWidth: {
        sm: "var(--layout-max-width-sm)",
        md: "var(--layout-max-width-md)",
        lg: "var(--layout-max-width-lg)",
        xl: "var(--layout-max-width-xl)",
        "2xl": "var(--layout-max-width-2xl)",
        full: "var(--layout-max-width-full)",
        sidebar: "var(--layout-sidebar-width)",
      },
    },
  },

  plugins: [],
};


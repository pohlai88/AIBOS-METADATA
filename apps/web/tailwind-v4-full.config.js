/**
 * Tailwind CSS v4.0 - COMPLETE Configuration
 *
 * This configuration leverages ALL Tailwind v4 features:
 * - Container queries
 * - 3D transforms
 * - Advanced gradients
 * - Dynamic utilities
 * - And everything else from https://tailwindcss.com/blog/tailwindcss-v4
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ===== CONTENT DETECTION =====
  // Tailwind v4 auto-detects most files, but we specify for clarity
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "../../packages/registry/**/*.{js,ts,jsx,tsx}",
  ],

  // ===== DARK MODE =====
  darkMode: "class",

  theme: {
    extend: {
      // ===== COLORS (RGB format for color-mix() support) =====
      colors: {
        // Core colors
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover-rgb) / <alpha-value>)",
        },
        success: "rgb(var(--color-success-rgb) / <alpha-value>)",
        warning: "rgb(var(--color-warning-rgb) / <alpha-value>)",
        danger: "rgb(var(--color-danger-rgb) / <alpha-value>)",
        info: "rgb(var(--color-info-rgb) / <alpha-value>)",

        // Foreground (text) colors
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

        // Metadata colors
        "metadata-glossary":
          "rgb(var(--color-metadata-glossary) / <alpha-value>)",
        "metadata-lineage":
          "rgb(var(--color-metadata-lineage) / <alpha-value>)",
        "metadata-quality":
          "rgb(var(--color-metadata-quality) / <alpha-value>)",
        "metadata-governance":
          "rgb(var(--color-metadata-governance) / <alpha-value>)",
        "metadata-tags": "rgb(var(--color-metadata-tags) / <alpha-value>)",
        "metadata-kpi": "rgb(var(--color-metadata-kpi) / <alpha-value>)",

        // Finance colors
        "finance-revenue": "rgb(var(--color-finance-revenue) / <alpha-value>)",
        "finance-expense": "rgb(var(--color-finance-expense) / <alpha-value>)",
        "finance-asset": "rgb(var(--color-finance-asset) / <alpha-value>)",
        "finance-liability":
          "rgb(var(--color-finance-liability) / <alpha-value>)",
        "finance-equity": "rgb(var(--color-finance-equity) / <alpha-value>)",

        // Tier colors
        "tier-1": "rgb(var(--color-tier-1) / <alpha-value>)",
        "tier-2": "rgb(var(--color-tier-2) / <alpha-value>)",
        "tier-3": "rgb(var(--color-tier-3) / <alpha-value>)",
        "tier-4": "rgb(var(--color-tier-4) / <alpha-value>)",
      },

      // ===== SPACING (8-Point Grid) =====
      // Now dynamic - accepts ANY value!
      spacing: {
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        5: "var(--spacing-5)",
        6: "var(--spacing-6)",
        7: "var(--spacing-7)",
        8: "var(--spacing-8)",
        10: "var(--spacing-10)",
        12: "var(--spacing-12)",
      },

      // ===== TYPOGRAPHY =====
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

      // ===== LAYOUT =====
      maxWidth: {
        sm: "var(--layout-max-width-sm)",
        md: "var(--layout-max-width-md)",
        lg: "var(--layout-max-width-lg)",
        xl: "var(--layout-max-width-xl)",
        "2xl": "var(--layout-max-width-2xl)",
        sidebar: "var(--layout-sidebar-width)",
      },

      // ===== MOTION TOKENS =====
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

      // ===== ELEVATION (SHADOWS) =====
      boxShadow: {
        raised: "var(--shadow-raised)",
        floating: "var(--shadow-floating)",
        overlay: "var(--shadow-overlay)",
        high: "var(--shadow-high)",
      },

      // ===== CONTAINER QUERIES (NEW V4 FEATURE!) =====
      // Enables: @container, @sm:, @md:, @lg:, etc.
      containers: {
        xs: "var(--container-xs)",
        sm: "var(--container-sm)",
        md: "var(--container-md)",
        lg: "var(--container-lg)",
        xl: "var(--container-xl)",
        "2xl": "var(--container-2xl)",
      },

      // ===== 3D TRANSFORMS (NEW V4 FEATURE!) =====
      // Enables: rotate-x-*, rotate-y-*, perspective-*, etc.
      perspective: {
        none: "none",
        near: "500px",
        normal: "1000px",
        distant: "1500px",
        far: "2000px",
      },

      // ===== GRADIENT INTERPOLATION =====
      // New v4 feature for smoother gradients
      // Usage: bg-linear-to-r/oklch
      gradientColorStops: ({ theme }) => ({
        ...theme("colors"),
      }),
    },
  },

  // ===== PLUGINS =====
  plugins: [
    // Tailwind v4 has container queries built-in!
    // No need for @tailwindcss/container-queries anymore
  ],

  // ===== FUTURE FLAGS (Opt-in to upcoming features) =====
  future: {
    // Enable all future features for forward compatibility
    hoverOnlyWhenSupported: true,
  },

  // ===== EXPERIMENTAL FLAGS =====
  experimental: {
    // Optimize for production builds
    optimizeUniversalDefaults: true,
  },
};

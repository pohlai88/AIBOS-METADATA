/**
 * ============================================
 * AIBOS Web App - Tailwind CSS v4 Config
 * ============================================
 * 
 * Minimal configuration - most logic lives in globals.css
 * Only defines:
 * 1. Content paths for class discovery
 * 2. Dark mode strategy
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  /**
   * Content paths for class discovery
   * Scans for Tailwind classes in these files
   */
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "../../packages/registry/**/*.{js,ts,jsx,tsx}",
  ],

  /**
   * Dark mode via class strategy
   * Managed by ThemeProvider
   */
  darkMode: "class",
};

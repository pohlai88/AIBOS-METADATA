import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextra = require("nextra");
import path from "path";

// Nextra 4.x configuration - using require to avoid type issues
const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  // Point to the pages directory where docs will be
  defaultShowCopyCode: true,
  search: {
    codeblocks: false,
  },
  latex: true,
  flexsearch: {
    codeblocks: false,
  },
});

const nextConfig: NextConfig = {
  // Transpile local packages from monorepo (Next.js 16 feature)
  transpilePackages: ["@aibos/ui", "@aibos/utils", "@aibos/types"],

  // Output file tracing for monorepo builds
  outputFileTracingRoot: path.join(__dirname, "../.."),

  // Next.js 16 best practices
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 16, no need to specify

  // Allow importing from packages
  experimental: {
    optimizePackageImports: ["@aibos/ui"],
  },
};

export default withNextra(nextConfig);

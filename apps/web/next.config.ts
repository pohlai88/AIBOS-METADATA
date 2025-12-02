import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Transpile local packages from monorepo (Next.js 16 feature)
  // This replaces next-transpile-modules package
  transpilePackages: [
    '@aibos/metadata-studio',
    '@tailwindcss/postcss'
  ],

  // Optimize package imports for large libraries
  // Note: @headlessui/react is already optimized by default in Next.js 16
  experimental: {
    optimizePackageImports: [
      // Add other large icon/component libraries here if needed
    ],
  },

  // Output file tracing for monorepo builds
  // Ensures files outside app directory are included in builds
  outputFileTracingRoot: path.join(__dirname, '../..'),

  // Configure custom output directory for build files
  // Default is '.next', change this to customize the build output location
  distDir: '.next',

  // Fix sourceMapURL parsing errors
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Use webpack for production builds to avoid Turbopack module resolution issues with pnpm
  // Turbopack works fine for dev, but webpack is more stable for production builds in monorepos
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution for monorepo packages and pnpm structure
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      'node_modules',
    ];
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Empty turbopack config to allow webpack usage
  turbopack: {},
};

export default nextConfig;

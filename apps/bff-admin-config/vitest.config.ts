import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000, // 30s for integration tests
    hookTimeout: 30000,
    setupFiles: ["./tests/setup.ts"],
  },
  esbuild: {
    // Bypass tsconfig.json extends issue
    tsconfigRaw: {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        resolveJsonModule: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "business-engine/admin-config": path.resolve(
        __dirname,
        "../../business-engine/admin-config",
      ),
    },
  },
});

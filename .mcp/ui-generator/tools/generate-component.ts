// .mcp/ui-generator/tools/generate-component.ts
// CLI script to generate UI components using the MCP UI generator

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";

/**
 * Generate a UI component using the MCP UI generator
 * 
 * Usage: pnpm generate:ui <component-name> [description]
 * 
 * Example: pnpm generate:ui tabs "A tabs component with multiple panels"
 * 
 * This script:
 * 1. Calls runUiGeneratorAgent from .mcp/ui-generator/server.mjs
 * 2. Passes the component request with system prompt
 * 3. Gets back generated component code
 * 4. Writes it to packages/ui/src/components/<name>.tsx
 * 5. Updates packages/ui/src/components/index.ts
 */

const COMPONENT_DIR = join(process.cwd(), "packages", "ui", "src", "components");
const INDEX_FILE = join(COMPONENT_DIR, "index.ts");

interface GenerateOptions {
  name: string;
  description?: string;
}

async function generateComponent(options: GenerateOptions) {
  const { name, description } = options;
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);
  const filePath = join(COMPONENT_DIR, `${name}.tsx`);

  if (existsSync(filePath)) {
    console.error(
      `[generate-ui-component] ❌ Component ${componentName} already exists at ${relative(
        process.cwd(),
        filePath,
      )}`,
    );
    process.exit(1);
  }

  // Check if MCP dependencies are available
  try {
    // Try to import the MCP server (will fail if dependencies not installed)
    // Type assertion needed because .mcp directory is excluded from TypeScript compilation
    const modulePath = join(process.cwd(), ".mcp", "ui-generator", "server.mjs");
    const { runUiGeneratorAgent } = await import(modulePath) as {
      runUiGeneratorAgent: (messages: Array<{ role: string; content: string }>) => Promise<string>;
    };

    console.log(
      `[generate-ui-component] 🤖 Generating ${componentName} component using MCP UI generator...`,
    );

    // Build the user prompt
    const userPrompt = description
      ? `Generate a ${componentName} component: ${description}`
      : `Generate a ${componentName} component following the design system rules.`;

    // Call the MCP generator
    const generatedCode = await runUiGeneratorAgent([
      {
        role: "user",
        content: userPrompt,
      },
    ]);

    if (!generatedCode || generatedCode.trim().length === 0) {
      console.error(
        `[generate-ui-component] ❌ MCP generator returned empty code`,
      );
      process.exit(1);
    }

    // Ensure component directory exists
    mkdirSync(dirname(filePath), { recursive: true });

    // Write the generated component
    writeFileSync(filePath, generatedCode, "utf8");

    // Update index.ts to export the new component
    const indexContent = readFileSync(INDEX_FILE, "utf8");
    const newExport = `export * from "./${name}";`;
    
    // Only add if not already present
    if (!indexContent.includes(newExport)) {
      const updatedIndex = indexContent.trim() + "\n" + newExport + "\n";
      writeFileSync(INDEX_FILE, updatedIndex, "utf8");
    }

    console.log(
      `[generate-ui-component] ✅ Generated ${componentName} component`,
    );
    console.log(`  Location: ${relative(process.cwd(), filePath)}`);
    console.log(`  Exported in: ${relative(process.cwd(), INDEX_FILE)}`);
    console.log(`\n📝 Next steps:`);
    console.log(`  1. Review the generated code`);
    console.log(`  2. Test the component in your app`);
    console.log(`  3. Run 'pnpm lint:ui-constitution' to verify compliance`);
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND" || error.message?.includes("@ai-sdk")) {
      console.error(
        `[generate-ui-component] ❌ MCP dependencies not installed`,
      );
      console.error(`\nTo enable component generation:`);
      console.error(`  1. Install dependencies: pnpm add @ai-sdk/openai ai`);
      console.error(`  2. Set OPENAI_API_KEY environment variable`);
      console.error(`  3. Run this command again\n`);
      console.error(`For now, you can manually create components in:`);
      console.error(`  ${relative(process.cwd(), COMPONENT_DIR)}`);
      console.error(`\nFollow the patterns in:`);
      console.error(`  - packages/ui/src/components/button.tsx`);
      console.error(`  - packages/ui/src/components/card.tsx`);
      console.error(`  - packages/ui/src/components/badge.tsx`);
      process.exit(1);
    } else {
      console.error(`[generate-ui-component] ❌ Error:`, error.message);
      process.exit(1);
    }
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "[generate-ui-component] Usage: pnpm generate:ui <component-name> [description]",
    );
    console.error("  Example: pnpm generate:ui tabs");
    console.error("  Example: pnpm generate:ui dialog \"A modal dialog component\"");
    process.exit(1);
  }

  const componentName = args[0].toLowerCase();
  const description = args.slice(1).join(" ");

  if (!/^[a-z][a-z0-9-]*$/.test(componentName)) {
    console.error(
      `[generate-ui-component] ❌ Invalid component name: ${componentName}`,
    );
    console.error(
      "  Must start with a letter and contain only lowercase letters, numbers, and hyphens",
    );
    process.exit(1);
  }

  generateComponent({ name: componentName, description });
}

main();


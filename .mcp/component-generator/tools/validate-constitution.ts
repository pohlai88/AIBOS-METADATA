// .mcp/component-generator/tools/validate-constitution.ts
// CLI tool to validate UI constitution rules across the codebase
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Monorepo structure: apps/web/app, packages/ui/src/components, packages/*/src
const SRC_DIRS = ["apps", "packages"]; // adjust to your repo layout

// Regexes for rules
const hexColorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/;
const tailwindPaletteRegex =
  /\b(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/;
const inlineColorStyleRegex =
  /style\s*=\s*{{[^}]*\b(color|backgroundColor|borderColor)\b[^}]*}}/;
const radixImportRegex = /from\s+['"]@radix-ui\/react-[^'"]+['"]/;

type Violation = {
  file: string;
  line: number;
  type: string;
  snippet: string;
};

function walk(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "dist", "build"].includes(entry.name)) continue;
      walk(full, files);
    } else if (entry.isFile()) {
      if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(full);
      }
    }
  }
  return files;
}

function isInUiComponents(file: string): boolean {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  // Allow Radix imports in packages/ui/src/components (the UI component library)
  return rel.startsWith("packages/ui/src/components/");
}

function validateFile(file: string): Violation[] {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  const violations: Violation[] = [];

  lines.forEach((line, idx) => {
    // 1. Raw hex colors
    if (hexColorRegex.test(line)) {
      violations.push({
        file,
        line: idx + 1,
        type: "RAW_HEX_COLOR",
        snippet: line.trim(),
      });
    }

    // 2. Tailwind palette colors (bg-blue-600, text-slate-700, etc.)
    if (tailwindPaletteRegex.test(line)) {
      violations.push({
        file,
        line: idx + 1,
        type: "RAW_TAILWIND_PALETTE",
        snippet: line.trim(),
      });
    }

    // 3. Inline visual styles (color, backgroundColor, borderColor)
    if (inlineColorStyleRegex.test(line)) {
      violations.push({
        file,
        line: idx + 1,
        type: "INLINE_VISUAL_STYLE",
        snippet: line.trim(),
      });
    }

    // 4. Direct Radix imports outside components/ui
    if (radixImportRegex.test(line) && !isInUiComponents(file)) {
      violations.push({
        file,
        line: idx + 1,
        type: "DIRECT_RADIX_IMPORT_OUTSIDE_UI",
        snippet: line.trim(),
      });
    }
  });

  return violations;
}

function main() {
  const allFiles = SRC_DIRS.flatMap((dir) => {
    const full = path.join(ROOT, dir);
    return fs.existsSync(full) ? walk(full) : [];
  });

  const allViolations: Violation[] = [];
  for (const file of allFiles) {
    allViolations.push(...validateFile(file));
  }

  if (allViolations.length === 0) {
    console.log("[validate-ui-constitution] ✅ No violations found.");
    process.exit(0);
  }

  console.error(
    `[validate-ui-constitution] ❌ Found ${allViolations.length} UI Constitution violation(s):`,
  );
  for (const v of allViolations) {
    const rel = path.relative(ROOT, v.file).replace(/\\/g, "/");
    console.error(
      `- [${v.type}] ${rel}:${v.line}\n    ${v.snippet}`,
    );
  }

  process.exit(1);
}

main();


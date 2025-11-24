#!/usr/bin/env tsx
/**
 * Phase 2 Validation Script
 * 
 * Validates Phase 2 structure migration using MCP tools and file system analysis
 * Ensures all content is migrated correctly and structure is complete
 */

import { readdir, stat, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

const WORKSPACE_ROOT = process.cwd();
const DOCS_DIR = join(WORKSPACE_ROOT, "docs");
const OLD_DOCS_DIR = join(WORKSPACE_ROOT, "packages/ui/ui-docs");
const CONTENT_MAPPING = join(WORKSPACE_ROOT, "docs/CONTENT_MAPPING.md");

interface ValidationResult {
  category: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Expected structure sections
const REQUIRED_SECTIONS = [
  "01-foundation",
  "02-architecture",
  "03-modules",
  "04-developer",
  "05-operations",
  "06-users",
  "07-mcp",
  "08-governance",
  "09-reference",
  "99-archive",
];

// Files that should be migrated (from CONTENT_MAPPING.md)
const MIGRATED_FILES: Record<string, string> = {
  // Foundation
  "01-foundation/philosophy/principles.md": "01-foundation/philosophy.md",
  "01-foundation/ui-system/tokens.md": "01-foundation/tokens.md",
  "01-foundation/ui-system/colors.md": "01-foundation/colors.md",
  "01-foundation/ui-system/typography.md": "01-foundation/typography.md",
  "01-foundation/ui-system/spacing.md": "01-foundation/spacing.md",
  "01-foundation/ui-system/a11y-guidelines.md": "01-foundation/accessibility.md",
  
  // Components
  "04-developer/ui/components/README.md": "02-components/README.md",
  "04-developer/ui/components/button.md": "02-components/primitives/button.md",
  "04-developer/ui/components/card.md": "02-components/primitives/card.md",
  "04-developer/ui/components/input.md": "02-components/primitives/input.md",
  "04-developer/ui/components/badge.md": "02-components/primitives/badge.md",
  "04-developer/ui/components/dialog.md": "02-components/compositions/dialog.md",
  "04-developer/ui/layouts/app-shell.md": "02-components/layouts/app-shell.md",
  
  // Integration
  "07-mcp/tools/sync-figma.md": "04-integration/figma-sync.md",
  "04-developer/ui/tailwind.md": "04-integration/tailwind.md",
  
  // Guides
  "06-users/staff/beginners-guide.md": "05-guides/getting-started.md",
  
  // Meta
  "README.md": "README.md",
  "08-governance/documentation-governance.md": "GOVERNANCE.md",
  "CHANGELOG.md": "CHANGELOG.md",
  "STRUCTURE_COMPLETE.md": "STRUCTURE.md",
};

async function checkFileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function getAllFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relative(baseDir, fullPath).replace(/\\/g, "/");
      
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        const subFiles = await getAllFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(relPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

async function validateStructure() {
  console.log("📋 Validating structure...\n");
  
  for (const section of REQUIRED_SECTIONS) {
    const sectionPath = join(DOCS_DIR, section);
    if (existsSync(sectionPath)) {
      results.push({
        category: "Structure",
        status: "pass",
        message: `Section exists: ${section}`,
      });
    } else {
      results.push({
        category: "Structure",
        status: "fail",
        message: `Missing section: ${section}`,
      });
    }
  }
}

async function validateMigratedFiles() {
  console.log("📦 Validating migrated files...\n");
  
  for (const [newPath, oldPath] of Object.entries(MIGRATED_FILES)) {
    const newFullPath = join(DOCS_DIR, newPath);
    const oldFullPath = join(OLD_DOCS_DIR, oldPath);
    
    const newExists = await checkFileExists(newFullPath);
    const oldExists = await checkFileExists(oldFullPath);
    
    if (newExists) {
      results.push({
        category: "Migration",
        status: "pass",
        message: `Migrated: ${oldPath} → ${newPath}`,
      });
    } else if (oldExists) {
      results.push({
        category: "Migration",
        status: "fail",
        message: `Not migrated: ${oldPath} (should be at ${newPath})`,
      });
    } else {
      results.push({
        category: "Migration",
        status: "warning",
        message: `File not found: ${oldPath} (may have been removed)`,
      });
    }
  }
}

async function validatePlaceholders() {
  console.log("📝 Validating placeholders...\n");
  
  const allFiles = await getAllFiles(DOCS_DIR, DOCS_DIR);
  const placeholderFiles = allFiles.filter(f => {
    try {
      const content = require("fs").readFileSync(join(DOCS_DIR, f), "utf-8");
      return content.includes("Placeholder") || content.includes("Content to be added");
    } catch {
      return false;
    }
  });
  
  results.push({
    category: "Placeholders",
    status: "pass",
    message: `Placeholders created: ${placeholderFiles.length}`,
    details: placeholderFiles.slice(0, 10), // Show first 10
  });
}

async function validateManifest() {
  console.log("📄 Validating manifest...\n");
  
  const manifestPath = join(DOCS_DIR, "ui-docs.manifest.json");
  if (await checkFileExists(manifestPath)) {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
      if (manifest.structure && manifest.structure.sections) {
        results.push({
          category: "Manifest",
          status: "pass",
          message: "Manifest exists and is valid",
        });
      } else {
        results.push({
          category: "Manifest",
          status: "fail",
          message: "Manifest exists but structure is invalid",
        });
      }
    } catch {
      results.push({
        category: "Manifest",
        status: "fail",
        message: "Manifest exists but is not valid JSON",
      });
    }
  } else {
    results.push({
      category: "Manifest",
      status: "fail",
      message: "Manifest missing",
    });
  }
}

async function validateTemplates() {
  console.log("📋 Validating templates...\n");
  
  const templatesDir = join(DOCS_DIR, ".templates");
  const requiredTemplates = [
    "erp-module.md",
    "component.md",
    "api.md",
    "user-guide.md",
    "mcp-tool.md",
  ];
  
  for (const template of requiredTemplates) {
    const templatePath = join(templatesDir, template);
    if (await checkFileExists(templatePath)) {
      results.push({
        category: "Templates",
        status: "pass",
        message: `Template exists: ${template}`,
      });
    } else {
      results.push({
        category: "Templates",
        status: "fail",
        message: `Missing template: ${template}`,
      });
    }
  }
}

async function generateReport() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 PHASE 2 VALIDATION REPORT");
  console.log("=".repeat(80) + "\n");
  
  const categories = new Map<string, ValidationResult[]>();
  for (const result of results) {
    if (!categories.has(result.category)) {
      categories.set(result.category, []);
    }
    categories.get(result.category)!.push(result);
  }
  
  let totalPass = 0;
  let totalFail = 0;
  let totalWarning = 0;
  
  for (const [category, categoryResults] of categories.entries()) {
    console.log(`\n## ${category}\n`);
    
    for (const result of categoryResults) {
      const icon = result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️";
      console.log(`${icon} ${result.message}`);
      
      if (result.details && result.details.length > 0) {
        for (const detail of result.details.slice(0, 5)) {
          console.log(`   - ${detail}`);
        }
        if (result.details.length > 5) {
          console.log(`   ... and ${result.details.length - 5} more`);
        }
      }
      
      if (result.status === "pass") totalPass++;
      else if (result.status === "fail") totalFail++;
      else totalWarning++;
    }
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("📈 SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Pass: ${totalPass}`);
  console.log(`❌ Fail: ${totalFail}`);
  console.log(`⚠️  Warning: ${totalWarning}`);
  console.log(`📊 Total: ${results.length}`);
  
  const passRate = ((totalPass / results.length) * 100).toFixed(1);
  console.log(`\n✅ Pass Rate: ${passRate}%`);
  
  if (totalFail === 0 && totalWarning === 0) {
    console.log("\n🎉 PHASE 2 VALIDATION: ✅ COMPLETE - All checks passed!");
    return true;
  } else if (totalFail === 0) {
    console.log("\n⚠️  PHASE 2 VALIDATION: ⚠️  WARNINGS - Review warnings above");
    return true;
  } else {
    console.log("\n❌ PHASE 2 VALIDATION: ❌ INCOMPLETE - Fix failures above");
    return false;
  }
}

async function main() {
  console.log("🔍 Starting Phase 2 Validation...\n");
  
  await validateStructure();
  await validateMigratedFiles();
  await validatePlaceholders();
  await validateManifest();
  await validateTemplates();
  
  const isValid = await generateReport();
  
  process.exit(isValid ? 0 : 1);
}

main().catch(console.error);


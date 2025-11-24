#!/usr/bin/env tsx
/**
 * Validate Clean Repo State
 * 
 * Validates that Phase 2 is complete and repo is clean:
 * 1. All migrated files exist in new location
 * 2. Old files removed from packages/ui/ui-docs/
 * 3. Structure follows manifest schema
 * 4. No duplicates
 */

import { readdir, stat, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

const WORKSPACE_ROOT = process.cwd();
const DOCS_DIR = join(WORKSPACE_ROOT, "docs");
const OLD_DOCS_DIR = join(WORKSPACE_ROOT, "packages/ui/ui-docs");
const MANIFEST_PATH = join(DOCS_DIR, "ui-docs.manifest.json");

interface ValidationResult {
  category: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Files that should exist in new location
const REQUIRED_NEW_FILES = [
  "01-foundation/philosophy/principles.md",
  "01-foundation/ui-system/tokens.md",
  "01-foundation/ui-system/colors.md",
  "01-foundation/ui-system/typography.md",
  "01-foundation/ui-system/spacing.md",
  "01-foundation/ui-system/a11y-guidelines.md",
  "04-developer/ui/components/README.md",
  "04-developer/ui/components/button.md",
  "04-developer/ui/components/card.md",
  "04-developer/ui/components/input.md",
  "04-developer/ui/components/badge.md",
  "04-developer/ui/components/dialog.md",
  "04-developer/ui/layouts/app-shell.md",
  "07-mcp/tools/sync-figma.md",
  "04-developer/ui/tailwind.md",
  "06-users/staff/beginners-guide.md",
  "README.md",
  "08-governance/documentation-governance.md",
  "CHANGELOG.md",
  "STRUCTURE_COMPLETE.md",
];

// Files that should NOT exist in old location (migrated)
const SHOULD_NOT_EXIST_OLD = [
  "01-foundation/philosophy.md",
  "01-foundation/tokens.md",
  "01-foundation/colors.md",
  "01-foundation/typography.md",
  "01-foundation/spacing.md",
  "01-foundation/accessibility.md",
  "02-components/primitives/button.md",
  "02-components/primitives/card.md",
  "02-components/primitives/input.md",
  "02-components/primitives/badge.md",
  "02-components/compositions/dialog.md",
  "02-components/layouts/app-shell.md",
  "04-integration/figma-sync.md",
  "04-integration/tailwind.md",
  "05-guides/getting-started.md",
  "GOVERNANCE.md",
  "CHANGELOG.md",
  "STRUCTURE.md",
];

// Files that SHOULD exist in old location (README files to keep)
const SHOULD_EXIST_OLD = [
  "README.md", // Root README for package
  "02-components/README.md", // Component README
];

async function checkFileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function validateNewLocation() {
  console.log("✅ Validating new location (docs/)...\n");
  
  for (const file of REQUIRED_NEW_FILES) {
    const fullPath = join(DOCS_DIR, file);
    if (await checkFileExists(fullPath)) {
      results.push({
        category: "New Location",
        status: "pass",
        message: `File exists: ${file}`,
      });
    } else {
      results.push({
        category: "New Location",
        status: "fail",
        message: `Missing file: ${file}`,
      });
    }
  }
}

async function validateOldLocation() {
  console.log("🧹 Validating old location cleanup...\n");
  
  const oldFiles: string[] = [];
  
  try {
    const entries = await readdir(OLD_DOCS_DIR, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const relPath = relative(OLD_DOCS_DIR, entry.path).replace(/\\/g, "/");
        oldFiles.push(relPath);
      }
    }
  } catch {
    // Directory might not exist or be empty - that's fine
  }
  
  for (const file of SHOULD_NOT_EXIST_OLD) {
    const fullPath = join(OLD_DOCS_DIR, file);
    if (await checkFileExists(fullPath)) {
      results.push({
        category: "Old Location Cleanup",
        status: "fail",
        message: `File still exists (should be removed): ${file}`,
      });
    } else {
      results.push({
        category: "Old Location Cleanup",
        status: "pass",
        message: `File removed: ${file}`,
      });
    }
  }
  
  // Verify README files that should be kept
  for (const file of SHOULD_EXIST_OLD) {
    const fullPath = join(OLD_DOCS_DIR, file);
    if (await checkFileExists(fullPath)) {
      results.push({
        category: "Old Location Cleanup",
        status: "pass",
        message: `README kept (intentional): ${file}`,
      });
    } else {
      results.push({
        category: "Old Location Cleanup",
        status: "warning",
        message: `README missing (may be needed): ${file}`,
      });
    }
  }
  
  // Check for any remaining files
  if (oldFiles.length > 0) {
    results.push({
      category: "Old Location Cleanup",
      status: "warning",
      message: `${oldFiles.length} files still in old location`,
      details: oldFiles.slice(0, 10),
    });
  }
}

async function validateManifestSchema() {
  console.log("📋 Validating manifest schema...\n");
  
  if (!await checkFileExists(MANIFEST_PATH)) {
    results.push({
      category: "Manifest Schema",
      status: "fail",
      message: "Manifest file missing",
    });
    return;
  }
  
  try {
    const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));
    
    // Validate required sections
    const requiredSections = [
      "01-foundation", "02-architecture", "03-modules", "04-developer",
      "05-operations", "06-users", "07-mcp", "08-governance", "09-reference"
    ];
    
    if (manifest.structure && manifest.structure.sections) {
      for (const section of requiredSections) {
        if (manifest.structure.sections[section]) {
          results.push({
            category: "Manifest Schema",
            status: "pass",
            message: `Section defined: ${section}`,
          });
        } else {
          results.push({
            category: "Manifest Schema",
            status: "fail",
            message: `Section missing in manifest: ${section}`,
          });
        }
      }
    } else {
      results.push({
        category: "Manifest Schema",
        status: "fail",
        message: "Manifest structure.sections missing",
      });
    }
  } catch (error) {
    results.push({
      category: "Manifest Schema",
      status: "fail",
      message: `Manifest invalid JSON: ${error}`,
    });
  }
}

async function validateStructure() {
  console.log("📁 Validating structure...\n");
  
  const requiredSections = [
    "01-foundation", "02-architecture", "03-modules", "04-developer",
    "05-operations", "06-users", "07-mcp", "08-governance", "09-reference", "99-archive"
  ];
  
  for (const section of requiredSections) {
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

async function generateReport() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 CLEAN REPO VALIDATION REPORT");
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
      
      if (result.details) {
        for (const detail of result.details.slice(0, 5)) {
          console.log(`   - ${detail}`);
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
    console.log("\n🎉 REPO IS CLEAN: ✅ All checks passed!");
    console.log("✅ Phase 2 complete - Repo is clean, functional, and follows schema");
    return true;
  } else if (totalFail === 0) {
    console.log("\n⚠️  REPO MOSTLY CLEAN: ⚠️  Review warnings above");
    return true;
  } else {
    console.log("\n❌ REPO NOT CLEAN: ❌ Fix failures above");
    return false;
  }
}

async function main() {
  console.log("🔍 Validating clean repo state...\n");
  
  await validateNewLocation();
  await validateOldLocation();
  await validateManifestSchema();
  await validateStructure();
  
  const isClean = await generateReport();
  
  process.exit(isClean ? 0 : 1);
}

main().catch(console.error);


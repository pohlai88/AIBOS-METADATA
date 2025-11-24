#!/usr/bin/env tsx
/**
 * Phase 1 Validation Script
 * 
 * Validates Phase 1 cleanup using MCP tools and file system analysis
 * Ensures all legacy, outdated, duplicate, and redundant files are archived
 */

import { readdir, stat, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

const WORKSPACE_ROOT = process.cwd();
const UI_DOCS_DIR = join(WORKSPACE_ROOT, "packages/ui/ui-docs");
const ARCHIVE_DIR = join(WORKSPACE_ROOT, "docs/archive/2025-11-24");
const CONTENT_MAPPING = join(WORKSPACE_ROOT, "docs/CONTENT_MAPPING.md");

interface ValidationResult {
  category: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Files that should be archived (from CONTENT_MAPPING.md)
const FILES_TO_ARCHIVE = [
  "04-integration/react-mcp-proposal.md",
  "04-integration/react-mcp-decision.md",
  "04-integration/ARCHITECTURE_SUMMARY.md",
  "04-integration/COMPLETE_IMPLEMENTATION.md",
  "04-integration/IMPLEMENTATION_ROADMAP.md",
  "COMPONENT_DOCUMENTATION_STATUS.md",
  "VALIDATION_SUMMARY.md",
  "SECTION_2_SUMMARY.md",
  "02-components/TEMPLATE_PROPOSAL.md",
];

// Files that should remain (active files)
const ACTIVE_FILES = [
  "01-foundation/philosophy.md",
  "01-foundation/tokens.md",
  "01-foundation/colors.md",
  "01-foundation/typography.md",
  "01-foundation/spacing.md",
  "01-foundation/accessibility.md",
  "02-components/README.md",
  "02-components/primitives/button.md",
  "02-components/primitives/card.md",
  "02-components/primitives/input.md",
  "02-components/primitives/badge.md",
  "02-components/compositions/dialog.md",
  "02-components/layouts/app-shell.md",
  "04-integration/figma-sync.md",
  "04-integration/tailwind.md",
  "05-guides/getting-started.md",
  "README.md",
  "GOVERNANCE.md",
  "CHANGELOG.md",
  "STRUCTURE.md",
];

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
      
      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(relPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  return files;
}

async function validateArchiveStructure() {
  console.log("📋 Validating archive structure...\n");
  
  const requiredDirs = ["proposals", "decisions", "summaries", "outdated"];
  for (const dir of requiredDirs) {
    const dirPath = join(ARCHIVE_DIR, dir);
    if (existsSync(dirPath)) {
      results.push({
        category: "Archive Structure",
        status: "pass",
        message: `Archive directory exists: ${dir}`,
      });
    } else {
      results.push({
        category: "Archive Structure",
        status: "fail",
        message: `Missing archive directory: ${dir}`,
      });
    }
  }
}

async function validateArchivedFiles() {
  console.log("📦 Validating archived files...\n");
  
  for (const file of FILES_TO_ARCHIVE) {
    const sourcePath = join(UI_DOCS_DIR, file);
    const archivePath = join(ARCHIVE_DIR, getArchivePath(file));
    
    const sourceExists = await checkFileExists(sourcePath);
    const archiveExists = await checkFileExists(archivePath);
    
    if (archiveExists) {
      results.push({
        category: "Archived Files",
        status: "pass",
        message: `Archived: ${file}`,
      });
    } else if (sourceExists) {
      results.push({
        category: "Archived Files",
        status: "fail",
        message: `File should be archived but is not: ${file}`,
      });
    } else {
      results.push({
        category: "Archived Files",
        status: "warning",
        message: `File not found (may have been removed): ${file}`,
      });
    }
  }
}

function getArchivePath(file: string): string {
  if (file.includes("react-mcp-proposal") || file.includes("TEMPLATE_PROPOSAL")) {
    return `proposals/${file.split("/").pop()}`;
  }
  if (file.includes("react-mcp-decision")) {
    return `decisions/${file.split("/").pop()}`;
  }
  if (file.includes("ARCHITECTURE") || file.includes("COMPONENT") || file.includes("VALIDATION") || file.includes("SECTION")) {
    return `summaries/${file.split("/").pop()}`;
  }
  if (file.includes("IMPLEMENTATION") || file.includes("COMPLETE")) {
    return `outdated/${file.split("/").pop()}`;
  }
  return `outdated/${file.split("/").pop()}`;
}

async function validateActiveFiles() {
  console.log("✅ Validating active files...\n");
  
  for (const file of ACTIVE_FILES) {
    const filePath = join(UI_DOCS_DIR, file);
    const exists = await checkFileExists(filePath);
    
    if (exists) {
      results.push({
        category: "Active Files",
        status: "pass",
        message: `Active file exists: ${file}`,
      });
    } else {
      results.push({
        category: "Active Files",
        status: "warning",
        message: `Active file not found: ${file}`,
      });
    }
  }
}

async function checkForDuplicates() {
  console.log("🔍 Checking for duplicates...\n");
  
  const allFiles = await getAllFiles(UI_DOCS_DIR, UI_DOCS_DIR);
  const fileNames = new Map<string, string[]>();
  
  for (const file of allFiles) {
    const fileName = file.split("/").pop() || file;
    if (!fileNames.has(fileName)) {
      fileNames.set(fileName, []);
    }
    fileNames.get(fileName)!.push(file);
  }
  
  for (const [fileName, paths] of fileNames.entries()) {
    if (paths.length > 1) {
      results.push({
        category: "Duplicates",
        status: "warning",
        message: `Duplicate filename found: ${fileName}`,
        details: paths,
      });
    }
  }
}

async function checkForUnexpectedFiles() {
  console.log("🔎 Checking for unexpected files...\n");
  
  const allFiles = await getAllFiles(UI_DOCS_DIR, UI_DOCS_DIR);
  const expectedFiles = new Set([...FILES_TO_ARCHIVE, ...ACTIVE_FILES]);
  
  for (const file of allFiles) {
    if (!expectedFiles.has(file)) {
      results.push({
        category: "Unexpected Files",
        status: "warning",
        message: `Unexpected file found: ${file}`,
      });
    }
  }
}

async function validateArchiveReadme() {
  console.log("📄 Validating archive README...\n");
  
  const readmePath = join(ARCHIVE_DIR, "README.md");
  if (await checkFileExists(readmePath)) {
    results.push({
      category: "Archive Documentation",
      status: "pass",
      message: "Archive README exists",
    });
  } else {
    results.push({
      category: "Archive Documentation",
      status: "fail",
      message: "Archive README missing",
    });
  }
}

async function generateReport() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 PHASE 1 VALIDATION REPORT");
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
        for (const detail of result.details) {
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
    console.log("\n🎉 PHASE 1 VALIDATION: ✅ COMPLETE - All checks passed!");
    return true;
  } else if (totalFail === 0) {
    console.log("\n⚠️  PHASE 1 VALIDATION: ⚠️  WARNINGS - Review warnings above");
    return true;
  } else {
    console.log("\n❌ PHASE 1 VALIDATION: ❌ INCOMPLETE - Fix failures above");
    return false;
  }
}

async function main() {
  console.log("🔍 Starting Phase 1 Validation...\n");
  
  await validateArchiveStructure();
  await validateArchivedFiles();
  await validateActiveFiles();
  await checkForDuplicates();
  await checkForUnexpectedFiles();
  await validateArchiveReadme();
  
  const isValid = await generateReport();
  
  process.exit(isValid ? 0 : 1);
}

main().catch(console.error);


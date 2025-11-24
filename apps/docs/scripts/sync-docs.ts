#!/usr/bin/env tsx
/**
 * Sync documentation from docs/ (SSOT) to apps/docs/pages/
 * 
 * This script copies markdown files from the Single Source of Truth (docs/)
 * to the Nextra pages directory for building the documentation site.
 * 
 * SSOT: docs/ (comprehensive documentation structure)
 * Target: apps/docs/pages/ (Nextra presentation layer)
 */

import { readdir, stat, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

const SOURCE_DIR = join(process.cwd(), "../../docs");
const TARGET_DIR = join(process.cwd(), "pages");

async function syncDirectory(source: string, target: string): Promise<void> {
  // Create target directory if it doesn't exist
  if (!existsSync(target)) {
    await mkdir(target, { recursive: true });
  }

  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);

    // Skip certain files and directories
    // Skip archive directories at any level
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "scripts" ||
      entry.name === "99-archive" ||
      entry.name === "archive" ||
      entry.name.startsWith(".") ||
      // Skip if path contains archive directories
      sourcePath.includes("/99-archive/") ||
      sourcePath.includes("\\99-archive\\") ||
      sourcePath.includes("/archive/") ||
      sourcePath.includes("\\archive\\")
    ) {
      continue;
    }

    // Skip root-level report files (should be in archive or proper sections)
    if (source === SOURCE_DIR) {
      const skipRootFiles = [
        "CHANGELOG.md",
        "CONSOLIDATION_COMPLETE.md",
        "CONTENT_MAPPING.md",
        "DESIGN_CONSOLIDATION_PROPOSAL.md",
        "DESIGN_PACKAGE_ANALYSIS.md",
        "design-system-guide.md",
        "DOCUMENTATION_STEWARD_ROLE.md",
        "DOCUMENTATION_STRUCTURE.md",
        "FINAL_CLEAN_REPO_REPORT.md",
        "IMPLEMENTATION_SUMMARY.md",
        "NEXTJS_BEST_PRACTICES.md",
        "NEXTJS_VALIDATION_REPORT.md",
        "REPO_CLEANUP_COMPLETE.md",
        "SSOT_CLARIFICATION.md",
        "STRUCTURE_COMPLETE.md",
        "MANUAL_CLEANUP_COMPLETE.md"
      ];
      
      if (skipRootFiles.includes(entry.name) ||
          entry.name.endsWith("_COMPLETE.md") ||
          entry.name.endsWith("_REPORT.md") ||
          entry.name.endsWith("_SUMMARY.md") ||
          entry.name.endsWith("_CERTIFICATION.md") ||
          entry.name.endsWith("_GUIDE.md")) {
        continue;
      }
    }

    if (entry.isDirectory()) {
      await syncDirectory(sourcePath, targetPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      // Copy markdown files
      await copyFile(sourcePath, targetPath);
      console.log(`Copied: ${entry.name}`);
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      // Copy MDX files
      await copyFile(sourcePath, targetPath);
      console.log(`Copied: ${entry.name}`);
    }
  }
}

async function main() {
  console.log("Syncing documentation from docs/ (SSOT) to apps/docs/pages/");
  console.log(`Source (SSOT): ${SOURCE_DIR}`);
  console.log(`Target (Nextra): ${TARGET_DIR}`);

  if (!existsSync(SOURCE_DIR)) {
    console.error(`Source directory does not exist: ${SOURCE_DIR}`);
    process.exit(1);
  }

  try {
    await syncDirectory(SOURCE_DIR, TARGET_DIR);
    console.log("\n✅ Documentation sync complete!");
  } catch (error) {
    console.error("Error syncing documentation:", error);
    process.exit(1);
  }
}

main();


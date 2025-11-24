#!/usr/bin/env tsx
/**
 * Manual Cleanup Script for:
 * - .cursor
 * - .mcp
 * - apps/docs
 * - docs
 * 
 * This script performs targeted cleanup while preserving essential files.
 */

import { readdir, stat, copyFile, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { existsSync } from "node:fs";

const ARCHIVE_DIR = join(process.cwd(), "docs/99-archive/2025-11-24/cleanup");

interface CleanupAction {
  source: string;
  target?: string; // If undefined, delete
  reason: string;
}

const cleanupPlan: CleanupAction[] = [];

// ============================================
// 1. .cursor/ - Archive documentation files
// ============================================
cleanupPlan.push(
  {
    source: ".cursor/NEXTJS_MCP_GUIDE.md",
    target: "docs/99-archive/2025-11-24/cleanup/.cursor/NEXTJS_MCP_GUIDE.md",
    reason: "Move to archive - content should be in docs/07-mcp/"
  },
  {
    source: ".cursor/VALIDATION_REPORT.md",
    target: "docs/99-archive/2025-11-24/cleanup/.cursor/VALIDATION_REPORT.md",
    reason: "Move to archive - outdated validation report"
  }
);

// ============================================
// 2. .mcp/ - Archive decision/strategy docs
// ============================================
const mcpDocsToArchive = [
  "COMPREHENSIVE_DOCUMENTATION_STRUCTURE_DECISION_V2.md",
  "COMPREHENSIVE_DOCUMENTATION_STRUCTURE_DECISION.md",
  "DOCUMENTATION_CLEANUP_AND_AUTOMATION_STRATEGY.md",
  "DOCUMENTATION_STRATEGY_RECOMMENDATION.md",
  "GLOBALS_CSS_LOCATION_RECOMMENDATION.md",
  "GLOBALS_CSS_MIGRATION_COMPLETE.md",
  "SCRIPTS_MIGRATION_COMPLETE.md",
  "TAILWIND_CONFIG_VALIDATION.md",
  "VALIDATION_REPORT_UI_DIRECTORIES.md"
];

for (const doc of mcpDocsToArchive) {
  cleanupPlan.push({
    source: `.mcp/${doc}`,
    target: `docs/99-archive/2025-11-24/cleanup/.mcp/${doc}`,
    reason: "Archive decision/strategy document - historical reference"
  });
}

// Move ARCHITECTURE.md and STRUCTURE_EXPLANATION.md to docs/07-mcp/
cleanupPlan.push(
  {
    source: ".mcp/ARCHITECTURE.md",
    target: "docs/07-mcp/servers/architecture.md",
    reason: "Move to proper docs location"
  },
  {
    source: ".mcp/STRUCTURE_EXPLANATION.md",
    target: "docs/07-mcp/servers/structure-explanation.md",
    reason: "Move to proper docs location"
  }
);

// ============================================
// 3. apps/docs/ - Remove duplicates and old content
// ============================================

// Remove old sections that are now in proper structure
const oldSectionsToRemove = [
  "apps/docs/pages/02-components", // Now in 04-developer/ui
  "apps/docs/pages/04-integration", // Now in 04-developer/ui
  "apps/docs/pages/05-guides", // Now in 04-developer
  "apps/docs/pages/archive", // Duplicate of 99-archive
  "apps/docs/pages/99-archive", // Should only be in docs/99-archive
  "apps/docs/docs", // Duplicate archive directory
  "apps/docs/pages/scripts", // Should not be synced
  "apps/docs/pages/mcp", // Should be in 07-mcp
];

for (const section of oldSectionsToRemove) {
  cleanupPlan.push({
    source: section,
    reason: "Remove duplicate/old section - content is in proper docs/ structure"
  });
}

// Root-level reports in apps/docs/pages/ to archive
const rootReportsToArchive = [
  "CHANGELOG.md",
  "COMPONENT_DOCUMENTATION_STATUS.md",
  "CONSOLIDATION_COMPLETE.md",
  "CONTENT_MAPPING.md",
  "DESIGN_CONSOLIDATION_PROPOSAL.md",
  "DESIGN_PACKAGE_ANALYSIS.md",
  "design-system-guide.md",
  "DOCUMENTATION_STEWARD_ROLE.md",
  "DOCUMENTATION_STRUCTURE.md",
  "FINAL_CLEAN_REPO_REPORT.md",
  "GOVERNANCE.md",
  "IMPLEMENTATION_SUMMARY.md",
  "NEXTJS_BEST_PRACTICES.md",
  "NEXTJS_VALIDATION_REPORT.md",
  "PHASE1_CLEANUP_COMPLETE.md",
  "PHASE1_FINAL_REPORT.md",
  "PHASE1_MCP_CERTIFICATION.md",
  "PHASE1_MCP_VALIDATION_REPORT.md",
  "PHASE2_CLEANUP_GUIDE.md",
  "PHASE2_FINAL_REPORT.md",
  "PHASE2_MCP_CERTIFICATION.md",
  "REPO_CLEANUP_COMPLETE.md",
  "SECTION_2_SUMMARY.md",
  "SSOT_CLARIFICATION.md",
  "STRUCTURE_COMPLETE.md",
  "STRUCTURE.md",
  "VALIDATION_SUMMARY.md"
];

for (const report of rootReportsToArchive) {
  cleanupPlan.push({
    source: `apps/docs/pages/${report}`,
    target: `docs/99-archive/2025-11-24/cleanup/apps-docs/${report}`,
    reason: "Archive root-level report - should only be in docs/"
  });
}

// Remove duplicate _meta files
cleanupPlan.push({
  source: "apps/docs/pages/_meta_comprehensive.json",
  reason: "Remove duplicate - only _meta.json should exist"
});

// ============================================
// 4. docs/ - Consolidate archives and clean root
// ============================================

// Consolidate docs/archive into docs/99-archive
cleanupPlan.push({
  source: "docs/archive",
  target: "docs/99-archive/2025-11-24/archive-consolidated",
  reason: "Consolidate archive directories"
});

// Root-level reports to archive (keep only essential)
const docsRootReportsToArchive = [
  "CHANGELOG.md", // Keep in root or move to 08-governance?
  "CONSOLIDATION_COMPLETE.md",
  "CONTENT_MAPPING.md",
  "DESIGN_CONSOLIDATION_PROPOSAL.md",
  "DESIGN_PACKAGE_ANALYSIS.md",
  "design-system-guide.md", // Should be in 01-foundation or 04-developer/ui
  "DOCUMENTATION_STEWARD_ROLE.md", // Should be in 08-governance
  "DOCUMENTATION_STRUCTURE.md", // Should be in 08-governance
  "FINAL_CLEAN_REPO_REPORT.md",
  "IMPLEMENTATION_SUMMARY.md",
  "NEXTJS_BEST_PRACTICES.md", // Should be in 04-developer
  "NEXTJS_VALIDATION_REPORT.md",
  "PHASE1_CLEANUP_COMPLETE.md",
  "PHASE1_FINAL_REPORT.md",
  "PHASE1_MCP_CERTIFICATION.md",
  "PHASE1_MCP_VALIDATION_REPORT.md",
  "PHASE2_CLEANUP_GUIDE.md",
  "PHASE2_FINAL_REPORT.md",
  "PHASE2_MCP_CERTIFICATION.md",
  "REPO_CLEANUP_COMPLETE.md",
  "SSOT_CLARIFICATION.md",
  "STRUCTURE_COMPLETE.md"
];

for (const report of docsRootReportsToArchive) {
  cleanupPlan.push({
    source: `docs/${report}`,
    target: `docs/99-archive/2025-11-24/cleanup/docs-root/${report}`,
    reason: "Archive root-level report - move to appropriate section or archive"
  });
}

// ============================================
// Execution
// ============================================

async function ensureDirectoryExists(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

async function moveFile(source: string, target: string): Promise<void> {
  const targetDir = dirname(target);
  await ensureDirectoryExists(targetDir);
  await copyFile(source, target);
  await rm(source);
  console.log(`✅ Moved: ${source} → ${target}`);
}

async function deleteFileOrDir(path: string): Promise<void> {
  const stat = await import("node:fs/promises").then(m => m.stat(path));
  if (stat.isDirectory()) {
    await rm(path, { recursive: true, force: true });
    console.log(`🗑️  Deleted directory: ${path}`);
  } else {
    await rm(path);
    console.log(`🗑️  Deleted file: ${path}`);
  }
}

async function executeCleanup(): Promise<void> {
  console.log("🧹 Starting Manual Cleanup...\n");
  console.log(`Total actions: ${cleanupPlan.length}\n`);

  // Create archive directory
  await ensureDirectoryExists(ARCHIVE_DIR);

  let moved = 0;
  let deleted = 0;
  let errors = 0;

  for (const action of cleanupPlan) {
    const sourcePath = join(process.cwd(), action.source);
    
    if (!existsSync(sourcePath)) {
      console.log(`⚠️  Skip (not found): ${action.source}`);
      continue;
    }

    try {
      if (action.target) {
        const targetPath = join(process.cwd(), action.target);
        await moveFile(sourcePath, targetPath);
        moved++;
      } else {
        await deleteFileOrDir(sourcePath);
        deleted++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${action.source}:`, error);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Cleanup Summary:");
  console.log(`   ✅ Moved: ${moved}`);
  console.log(`   🗑️  Deleted: ${deleted}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log("=".repeat(60));
}

// Run cleanup
executeCleanup().catch(console.error);


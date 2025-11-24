#!/usr/bin/env node
// Cleanup legacy documentation files
// Archives status/report files and legacy documentation

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");

const ARCHIVE_DATE = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const ARCHIVE_DIR = path.join(workspaceRoot, "docs", "99-archive", ARCHIVE_DATE, "legacy-docs");

// Legacy status/report files in apps/web/
const APPS_WEB_LEGACY = [
  "browser-compatibility-issues.md",
  "complete-reframing-workflow.md",
  "console-errors-analysis.md",
  "error-101-diagnosis.md",
  "favicon-automatic-detection.md",
  "hydration-audit-report.md",
  "hydration-fix-complete.md",
  "hydration-fix-v2.md",
  "hydration-fix.md",
  "mcp-active-servers-status.md",
  "mcp-refactoring-execution-plan.md",
  "mcp-refactoring-plan.md",
  "mcp-refactoring-ready.md",
  "mcp-servers-complete-status.md",
  "mcp-servers-status-update.md",
  "mcp-setup-complete.md",
  "minimal-test-setup.md",
  "minimal-test-status.md",
  "nextjs-mcp-diagnosis.md",
  "nextjs-mcp-final-status.md",
  "nextjs-mcp-verification.md",
  "server-restart-status.md",
  "sourcemap-error-fix.md",
  "tailkit-branding-audit.md",
  "turbopack-fix.md",
  "validation-report.md",
];

// Legacy validation/report files in docs/01-foundation/conventions/
const CONVENTIONS_LEGACY = [
  "CLEANUP_COMPLETE.md",
  "CONVENTION_ENFORCEMENT_SETUP.md",
  "CONVENTION_FIXES_COMPLETE.md",
  "FINAL_VALIDATION_REPORT.md",
  "FULL_VALIDATION_SUMMARY.md",
  "REPO_VALIDATION_REPORT.md",
  "VALIDATION_COMPLETE.md",
  "VALIDATION_RESULTS_ANALYSIS.md",
];

// Legacy files in root and apps/
const ROOT_LEGACY = [
  { path: "apps/BROWSER_CONSOLE_ERRORS.md", category: "apps" },
  { path: "apps/DEV_ERRORS_REPORT.md", category: "apps" },
  { path: "docs/MANUAL_CLEANUP_COMPLETE.md", category: "docs" },
];

// Legacy cleanup scripts in docs/scripts/
const LEGACY_SCRIPTS = [
  "cleanup-old-files.ts",
  "comprehensive-cleanup.ts",
  "create-placeholders.ts",
  "manual-cleanup.ts",
  "migrate-docs.ts",
  "validate-clean-repo.ts",
  "validate-phase1.ts",
  "validate-phase2.ts",
];

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function moveFile(source, dest) {
  try {
    await ensureDir(path.dirname(dest));
    await fs.rename(source, dest);
    return true;
  } catch (error) {
    console.error(`Error moving ${source}:`, error.message);
    return false;
  }
}

async function archiveFiles(files, sourceDir, category) {
  const archiveCategoryDir = path.join(ARCHIVE_DIR, category);
  let archived = 0;

  for (const file of files) {
    const sourcePath = path.join(workspaceRoot, sourceDir, file);
    const destPath = path.join(archiveCategoryDir, file);

    try {
      await fs.access(sourcePath);
      if (await moveFile(sourcePath, destPath)) {
        console.log(`✅ Archived: ${sourceDir}/${file}`);
        archived++;
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`⏭️  Skipped (not found): ${sourceDir}/${file}`);
      } else {
        console.error(`❌ Error: ${sourceDir}/${file} - ${error.message}`);
      }
    }
  }

  return archived;
}

async function archiveRootFiles(files) {
  const archiveCategoryDir = path.join(ARCHIVE_DIR, "root");
  let archived = 0;

  for (const file of files) {
    const sourcePath = path.join(workspaceRoot, file.path);
    const destDir = path.join(archiveCategoryDir, file.category);
    const destPath = path.join(destDir, path.basename(file.path));

    try {
      await fs.access(sourcePath);
      if (await moveFile(sourcePath, destPath)) {
        console.log(`✅ Archived: ${file.path}`);
        archived++;
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`⏭️  Skipped (not found): ${file.path}`);
      } else {
        console.error(`❌ Error: ${file.path} - ${error.message}`);
      }
    }
  }

  return archived;
}

async function archiveScripts(scripts) {
  const archiveScriptsDir = path.join(ARCHIVE_DIR, "scripts");
  let archived = 0;

  for (const script of scripts) {
    const sourcePath = path.join(workspaceRoot, "docs", "scripts", script);
    const destPath = path.join(archiveScriptsDir, script);

    try {
      await fs.access(sourcePath);
      if (await moveFile(sourcePath, destPath)) {
        console.log(`✅ Archived script: docs/scripts/${script}`);
        archived++;
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`⏭️  Skipped (not found): docs/scripts/${script}`);
      } else {
        console.error(`❌ Error: docs/scripts/${script} - ${error.message}`);
      }
    }
  }

  return archived;
}

async function createArchiveReadme() {
  const readmeContent = `# Legacy Documentation Archive

> **Date:** ${ARCHIVE_DATE}  
> **Reason:** Cleanup legacy documentation in preparation for Next.js migration

---

## Overview

This archive contains legacy documentation files that were moved during the repository cleanup in preparation for Next.js migration.

---

## Archive Structure

\`\`\`
legacy-docs/
├── apps-web/          # Status/report files from apps/web/
├── conventions/        # Validation reports from docs/01-foundation/conventions/
├── root/              # Legacy files from root and apps/
│   ├── apps/          # Legacy files from apps/
│   └── docs/          # Legacy files from docs/
└── scripts/           # Legacy cleanup scripts from docs/scripts/
\`\`\`

---

## Archived Files

### apps/web/ Status Files (${APPS_WEB_LEGACY.length} files)

Temporary status and report files from development and setup phases:
- Browser compatibility issues
- Hydration fixes and audits
- MCP setup and refactoring status
- Next.js MCP diagnosis and verification
- Error reports and fixes

### Conventions Validation Reports (${CONVENTIONS_LEGACY.length} files)

Temporary validation and cleanup reports:
- Cleanup completion reports
- Convention enforcement setup
- Validation results and analysis
- Final validation reports

### Root/Apps Legacy Files (${ROOT_LEGACY.length} files)

Legacy error reports and cleanup completion files.

### Legacy Scripts (${LEGACY_SCRIPTS.length} files)

Cleanup and migration scripts that are no longer needed:
- File cleanup scripts
- Migration scripts
- Validation scripts

---

## Usage

These files are **archived for reference only**. They should not be:
- ❌ Used as current documentation
- ❌ Referenced in active documentation
- ❌ Updated or modified

---

**Archived By:** Documentation Cleanup Script  
**Date:** ${ARCHIVE_DATE}  
**Status:** ✅ Archived (Reference Only)
`;

  const readmePath = path.join(ARCHIVE_DIR, "README.md");
  await fs.writeFile(readmePath, readmeContent, "utf-8");
  console.log(`✅ Created archive README: ${readmePath}`);
}

async function main() {
  console.log("🧹 Starting legacy documentation cleanup...\n");

  await ensureDir(ARCHIVE_DIR);

  let totalArchived = 0;

  // Archive apps/web/ status files
  console.log("📦 Archiving apps/web/ status files...");
  const appsWebCount = await archiveFiles(APPS_WEB_LEGACY, "apps/web", "apps-web");
  totalArchived += appsWebCount;
  console.log(`   Archived ${appsWebCount}/${APPS_WEB_LEGACY.length} files\n`);

  // Archive conventions validation reports
  console.log("📦 Archiving conventions validation reports...");
  const conventionsCount = await archiveFiles(
    CONVENTIONS_LEGACY,
    "docs/01-foundation/conventions",
    "conventions"
  );
  totalArchived += conventionsCount;
  console.log(`   Archived ${conventionsCount}/${CONVENTIONS_LEGACY.length} files\n`);

  // Archive root/apps legacy files
  console.log("📦 Archiving root/apps legacy files...");
  const rootCount = await archiveRootFiles(ROOT_LEGACY);
  totalArchived += rootCount;
  console.log(`   Archived ${rootCount}/${ROOT_LEGACY.length} files\n`);

  // Archive legacy scripts
  console.log("📦 Archiving legacy scripts...");
  const scriptsCount = await archiveScripts(LEGACY_SCRIPTS);
  totalArchived += scriptsCount;
  console.log(`   Archived ${scriptsCount}/${LEGACY_SCRIPTS.length} scripts\n`);

  // Create archive README
  await createArchiveReadme();

  console.log(`\n✅ Cleanup complete!`);
  console.log(`📊 Total files archived: ${totalArchived}`);
  console.log(`📁 Archive location: ${path.relative(workspaceRoot, ARCHIVE_DIR)}`);
}

main().catch(console.error);


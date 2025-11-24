#!/usr/bin/env tsx
/**
 * Comprehensive Repository Cleanup
 * 
 * Cleans up all migrated documentation files, keeping only README files
 * in subdirectories where appropriate.
 */

import { unlink, stat, readdir, rmdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

const OLD_DOCS_DIR = join(process.cwd(), "packages/ui/ui-docs");
const NEW_DOCS_DIR = join(process.cwd(), "docs");

// Files that have been migrated (should be removed)
const MIGRATED_FILES = [
  // Foundation
  "01-foundation/philosophy.md",
  "01-foundation/tokens.md",
  "01-foundation/colors.md",
  "01-foundation/typography.md",
  "01-foundation/spacing.md",
  "01-foundation/accessibility.md",
  
  // Components
  "02-components/primitives/button.md",
  "02-components/primitives/card.md",
  "02-components/primitives/input.md",
  "02-components/primitives/badge.md",
  "02-components/compositions/dialog.md",
  "02-components/layouts/app-shell.md",
  
  // Integration (active - migrated)
  "04-integration/figma-sync.md",
  "04-integration/tailwind.md",
  
  // Guides
  "05-guides/getting-started.md",
  
  // Meta (migrated)
  "GOVERNANCE.md",
  "CHANGELOG.md",
  "STRUCTURE.md",
];

// Files that should be archived (already archived, can be removed)
const ARCHIVED_FILES = [
  "04-integration/react-mcp-proposal.md",
  "04-integration/react-mcp-decision.md",
  "04-integration/ARCHITECTURE_SUMMARY.md",
  "04-integration/COMPLETE_IMPLEMENTATION.md",
  "04-integration/IMPLEMENTATION_ROADMAP.md",
  "02-components/TEMPLATE_PROPOSAL.md",
  "COMPONENT_DOCUMENTATION_STATUS.md",
  "VALIDATION_SUMMARY.md",
  "SECTION_2_SUMMARY.md",
];

// Files to keep (README files in subdirectories)
const KEEP_FILES = [
  "README.md", // Root README
  "02-components/README.md", // Component README
];

async function removeFile(filePath: string): Promise<boolean> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error);
    return false;
  }
  return false;
}

async function cleanupDirectory(dir: string, relativePath: string = ""): Promise<{ removed: number; errors: number }> {
  let removed = 0;
  let errors = 0;
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        const result = await cleanupDirectory(fullPath, relPath);
        removed += result.removed;
        errors += result.errors;
        
        // Try to remove empty directory (except root)
        if (relPath !== "") {
          try {
            const dirEntries = await readdir(fullPath);
            if (dirEntries.length === 0) {
              await rmdir(fullPath);
              console.log(`✅ Removed empty directory: ${relPath}`);
            }
          } catch {
            // Directory not empty or error - skip
          }
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        // Check if this file should be kept
        const shouldKeep = KEEP_FILES.some(keep => relPath === keep || relPath.endsWith(`/${keep}`));
        
        if (shouldKeep) {
          console.log(`📄 Keeping: ${relPath}`);
          continue;
        }
        
        // Check if this file should be removed
        const shouldRemove = MIGRATED_FILES.includes(relPath) || ARCHIVED_FILES.includes(relPath);
        
        if (shouldRemove) {
          const success = await removeFile(fullPath);
          if (success) {
            console.log(`✅ Removed: ${relPath}`);
            removed++;
          } else {
            errors++;
          }
        } else {
          // File not in migration list - check if it's a README in a subdirectory
          if (entry.name === "README.md" && relPath !== "README.md") {
            console.log(`📄 Keeping README: ${relPath}`);
          } else {
            console.log(`⚠️  Unknown file (not removed): ${relPath}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    errors++;
  }
  
  return { removed, errors };
}

async function main() {
  console.log("🧹 Comprehensive Repository Cleanup\n");
  console.log("=".repeat(80));
  console.log("This will clean up packages/ui/ui-docs/ keeping only README files\n");
  
  if (!existsSync(OLD_DOCS_DIR)) {
    console.log("✅ Old docs directory doesn't exist - nothing to clean");
    return;
  }
  
  if (!existsSync(NEW_DOCS_DIR)) {
    console.error("❌ New docs directory doesn't exist - migration may not be complete");
    process.exit(1);
  }
  
  console.log("📋 Cleanup plan:");
  console.log(`   - Migrated files to remove: ${MIGRATED_FILES.length}`);
  console.log(`   - Archived files to remove: ${ARCHIVED_FILES.length}`);
  console.log(`   - Files to keep: ${KEEP_FILES.length}`);
  console.log("");
  
  const result = await cleanupDirectory(OLD_DOCS_DIR);
  
  console.log("\n" + "=".repeat(80));
  console.log("📊 Cleanup Summary");
  console.log("=".repeat(80));
  console.log(`✅ Files removed: ${result.removed}`);
  console.log(`❌ Errors: ${result.errors}`);
  console.log("");
  
  if (result.errors === 0) {
    console.log("✅ Cleanup complete!");
  } else {
    console.log("⚠️  Cleanup completed with errors");
  }
  
  console.log("\n📋 Next steps:");
  console.log("1. Verify all files are correctly migrated to docs/");
  console.log("2. Run validation script to confirm clean state");
  console.log("3. Check that only README files remain in packages/ui/ui-docs/");
}

main().catch(console.error);


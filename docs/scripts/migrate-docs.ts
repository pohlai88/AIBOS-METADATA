#!/usr/bin/env tsx
/**
 * Migration Script: packages/ui/ui-docs/ → docs/
 * 
 * This script migrates existing documentation to the new comprehensive structure
 * based on the content mapping defined in CONTENT_MAPPING.md
 */

import { readdir, stat, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { existsSync } from "node:fs";

const SOURCE_DIR = join(process.cwd(), "packages/ui/ui-docs");
const TARGET_DIR = join(process.cwd(), "docs");
const ARCHIVE_DIR = join(process.cwd(), "docs/99-archive/2025-11-24");

// Content mapping: old path → new path
const MIGRATION_MAP: Record<string, string> = {
  // Foundation
  "01-foundation/philosophy.md": "01-foundation/philosophy/principles.md",
  "01-foundation/tokens.md": "01-foundation/ui-system/tokens.md",
  "01-foundation/colors.md": "01-foundation/ui-system/colors.md",
  "01-foundation/typography.md": "01-foundation/ui-system/typography.md",
  "01-foundation/spacing.md": "01-foundation/ui-system/spacing.md",
  "01-foundation/accessibility.md": "01-foundation/ui-system/a11y-guidelines.md",
  
  // Components
  "02-components/README.md": "04-developer/ui/components/README.md",
  "02-components/primitives/button.md": "04-developer/ui/components/button.md",
  "02-components/primitives/card.md": "04-developer/ui/components/card.md",
  "02-components/primitives/input.md": "04-developer/ui/components/input.md",
  "02-components/primitives/badge.md": "04-developer/ui/components/badge.md",
  "02-components/compositions/dialog.md": "04-developer/ui/components/dialog.md",
  "02-components/layouts/app-shell.md": "04-developer/ui/layouts/app-shell.md",
  
  // Integration (active)
  "04-integration/figma-sync.md": "07-mcp/tools/sync-figma.md",
  "04-integration/tailwind.md": "04-developer/ui/tailwind.md",
  
  // Guides
  "05-guides/getting-started.md": "06-users/staff/beginners-guide.md",
  
  // Meta
  "README.md": "README.md",
  "GOVERNANCE.md": "08-governance/documentation-governance.md",
  "CHANGELOG.md": "CHANGELOG.md",
  "STRUCTURE.md": "STRUCTURE_COMPLETE.md",
};

// Files to archive
const ARCHIVE_MAP: Record<string, string> = {
  "04-integration/react-mcp-proposal.md": "proposals/react-mcp-proposal.md",
  "04-integration/react-mcp-decision.md": "decisions/react-mcp-decision.md",
  "04-integration/ARCHITECTURE_SUMMARY.md": "summaries/ARCHITECTURE_SUMMARY.md",
  "04-integration/COMPLETE_IMPLEMENTATION.md": "outdated/COMPLETE_IMPLEMENTATION.md",
  "04-integration/IMPLEMENTATION_ROADMAP.md": "outdated/IMPLEMENTATION_ROADMAP.md",
  "02-components/TEMPLATE_PROPOSAL.md": "proposals/TEMPLATE_PROPOSAL.md",
  "COMPONENT_DOCUMENTATION_STATUS.md": "summaries/COMPONENT_DOCUMENTATION_STATUS.md",
  "VALIDATION_SUMMARY.md": "summaries/VALIDATION_SUMMARY.md",
  "SECTION_2_SUMMARY.md": "summaries/SECTION_2_SUMMARY.md",
};

async function ensureDirectory(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function migrateFile(sourcePath: string, targetPath: string): Promise<void> {
  const fullSource = join(SOURCE_DIR, sourcePath);
  const fullTarget = join(TARGET_DIR, targetPath);
  
  if (!existsSync(fullSource)) {
    console.warn(`⚠️  Source file not found: ${sourcePath}`);
    return;
  }
  
  await ensureDirectory(dirname(fullTarget));
  await copyFile(fullSource, fullTarget);
  console.log(`✅ Migrated: ${sourcePath} → ${targetPath}`);
}

async function archiveFile(sourcePath: string, archivePath: string): Promise<void> {
  const fullSource = join(SOURCE_DIR, sourcePath);
  const fullTarget = join(ARCHIVE_DIR, archivePath);
  
  if (!existsSync(fullSource)) {
    console.warn(`⚠️  Source file not found: ${sourcePath}`);
    return;
  }
  
  await ensureDirectory(dirname(fullTarget));
  await copyFile(fullSource, fullTarget);
  console.log(`📦 Archived: ${sourcePath} → ${archivePath}`);
}

async function createPlaceholders(): Promise<void> {
  const placeholders = [
    "01-foundation/philosophy/design-language.md",
    "01-foundation/philosophy/platform-vision.md",
    "01-foundation/philosophy/lego-vs-jenga.md",
    "01-foundation/conventions/naming.md",
    "01-foundation/conventions/folder-structure.md",
    "01-foundation/conventions/coding-standards.md",
    "01-foundation/conventions/documentation-standard.md",
    "02-architecture/overview/system-overview.md",
    "03-modules/accounting/overview.md",
    "05-operations/deployment/environment-setup.md",
  ];
  
  for (const placeholder of placeholders) {
    const fullPath = join(TARGET_DIR, placeholder);
    if (!existsSync(fullPath)) {
      await ensureDirectory(dirname(fullPath));
      await writeFile(fullPath, `# ${placeholder.split('/').pop()?.replace('.md', '')}\n\n> Placeholder - To be filled\n\n`, 'utf-8');
      console.log(`📝 Created placeholder: ${placeholder}`);
    }
  }
}

async function main() {
  console.log("🚀 Starting documentation migration...\n");
  
  // Ensure directories exist
  await ensureDirectory(TARGET_DIR);
  await ensureDirectory(ARCHIVE_DIR);
  
  // Migrate active files
  console.log("📋 Migrating active files...\n");
  for (const [source, target] of Object.entries(MIGRATION_MAP)) {
    await migrateFile(source, target);
  }
  
  // Archive outdated files
  console.log("\n📦 Archiving outdated files...\n");
  for (const [source, archive] of Object.entries(ARCHIVE_MAP)) {
    await archiveFile(source, archive);
  }
  
  // Create placeholders
  console.log("\n📝 Creating placeholders...\n");
  await createPlaceholders();
  
  console.log("\n✅ Migration complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Review migrated files");
  console.log("2. Update internal links");
  console.log("3. Update Nextra _meta.json");
  console.log("4. Update sync scripts");
  console.log("5. Test Nextra site");
}

main().catch(console.error);


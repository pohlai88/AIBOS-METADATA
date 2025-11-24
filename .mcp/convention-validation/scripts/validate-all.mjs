#!/usr/bin/env node
// .mcp/convention-validation/scripts/validate-all.mjs
// Comprehensive validation script for all conventions

import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");

// Parse command line arguments
const args = process.argv.slice(2);
const validateNaming = args.includes("--naming") || args.length === 0;
const validateStructure = args.includes("--structure") || args.length === 0;
const validateCoding = args.includes("--coding") || args.length === 0;
const validateDocs = args.includes("--docs") || args.length === 0;

// Get all files to validate
async function getAllFiles(rootDir, extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs"]) {
  const files = [];
  
  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, .git, .next, archive directories, etc.
      if (
        entry.name.startsWith(".") ||
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === "dist" ||
        entry.name === "build" ||
        entry.name === "99-archive" ||
        fullPath.includes("/99-archive/") ||
        fullPath.includes("\\99-archive\\")
      ) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.length === 0 || extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walkDir(rootDir);
  return files;
}

// Validate naming
async function validateNamingConventions() {
  console.log("🔍 Validating naming conventions...");
  
  const files = await getAllFiles(workspaceRoot, [".ts", ".tsx", ".js", ".jsx", ".mjs"]);
  let errors = 0;
  
  for (const file of files) {
    const fileName = path.basename(file);
    const baseName = path.basename(fileName, path.extname(fileName));
    
    // Documented exceptions (per naming.md):
    // 1. Config files: [name].config.[ext]
    const isConfigFile = /\.config\./.test(fileName) || fileName === "next-env.d.ts";
    // 2. Layout components: PascalCase (AppShell, Header, Sidebar, etc.)
    const isLayoutComponent = /^(AppShell|Header|Sidebar|ContentArea|Navigation|UserMenu|Footer)\.tsx$/.test(fileName) || 
                              (file.includes("/layouts/") && /^[A-Z]/.test(baseName));
    // 3. React hooks: use[Name]
    const isHookFile = /^use[A-Z]/.test(fileName);
    // 4. MCP utility components: PascalCase in mcp/ directory
    const isMcpUtility = (file.includes("/mcp/") || file.includes("\\mcp\\")) && /^[A-Z]/.test(fileName);
    
    // Skip documented exceptions
    if (isConfigFile || isLayoutComponent || isHookFile || isMcpUtility) {
      continue;
    }
    
    // Check kebab-case for all other files
    const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    
    if (!kebabCaseRegex.test(baseName)) {
      console.error(`❌ ${file}: Filename "${fileName}" is not kebab-case`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log("✅ All files pass naming convention validation");
  } else {
    console.error(`❌ Found ${errors} naming convention violations`);
  }
  
  return errors === 0;
}

// Validate structure
async function validateFolderStructure() {
  console.log("🔍 Validating folder structure...");
  
  const requiredDirs = ["apps/", "packages/", "docs/", ".mcp/"];
  let errors = 0;
  
  for (const dir of requiredDirs) {
    const fullPath = path.join(workspaceRoot, dir);
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        console.error(`❌ Required directory "${dir}" is not a directory`);
        errors++;
      }
    } catch (error) {
      console.error(`❌ Required directory "${dir}" is missing`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log("✅ Folder structure is valid");
  } else {
    console.error(`❌ Found ${errors} folder structure violations`);
  }
  
  return errors === 0;
}

// Validate documentation format
async function validateDocumentationFormat() {
  console.log("🔍 Validating documentation format...");
  
  const files = await getAllFiles(path.join(workspaceRoot, "docs"), [".md"]);
  let errors = 0;
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, "utf-8");
      
      // Check for required elements
      const hasTitle = /^#\s+.+$/m.test(content);
      const hasOverview = /##\s+Overview/i.test(content);
      
      if (!hasTitle) {
        console.error(`❌ ${file}: Missing H1 title`);
        errors++;
      }
      
      if (!hasOverview && !file.includes("README.md")) {
        console.error(`❌ ${file}: Missing Overview section`);
        errors++;
      }
    } catch (error) {
      console.error(`❌ ${file}: Failed to read - ${error.message}`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log("✅ All documentation files pass format validation");
  } else {
    console.error(`❌ Found ${errors} documentation format violations`);
  }
  
  return errors === 0;
}

// Main validation
async function main() {
  let allValid = true;
  
  if (validateNaming) {
    allValid = (await validateNamingConventions()) && allValid;
  }
  
  if (validateStructure) {
    allValid = (await validateFolderStructure()) && allValid;
  }
  
  if (validateDocs) {
    allValid = (await validateDocumentationFormat()) && allValid;
  }
  
  if (!allValid) {
    console.error("\n❌ Convention validation failed");
    process.exit(1);
  } else {
    console.log("\n✅ All convention validations passed");
  }
}

main().catch((error) => {
  console.error("Validation error:", error);
  process.exit(1);
});


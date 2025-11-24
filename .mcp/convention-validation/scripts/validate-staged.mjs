#!/usr/bin/env node
// .mcp/convention-validation/scripts/validate-staged.mjs
// Pre-commit validation script for staged files

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      cwd: workspaceRoot,
      encoding: "utf-8",
    });
    return output
      .trim()
      .split("\n")
      .filter((line) => line.trim().length > 0);
  } catch (error) {
    console.error("Failed to get staged files:", error.message);
    return [];
  }
}

// Validate file using convention validation
async function validateFile(filePath) {
  const { execSync } = await import("child_process");
  const fs = await import("fs/promises");
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Use validate-all.mjs script for validation
    const result = execSync(
      `node "${path.join(__dirname, "validate-all.mjs")}" --file "${filePath}"`,
      { cwd: workspaceRoot, encoding: "utf-8", stdio: "pipe" }
    );
    
    return { valid: true, errors: [], warnings: [] };
  } catch (error) {
    // If validation fails, return errors
    return {
      valid: false,
      errors: [{ message: error.message }],
      warnings: []
    };
  }
}

// Main validation
async function main() {
  const stagedFiles = getStagedFiles();
  let hasErrors = false;

  for (const file of stagedFiles) {
    const fullPath = path.join(workspaceRoot, file);
    const result = await validateFile(fullPath);

    if (!result.valid) {
      hasErrors = true;
      console.error(`❌ ${file}:`);
      result.errors.forEach((error) => {
        console.error(`  - ${error.message}`);
      });
    }
  }

  if (hasErrors) {
    console.error("\n❌ Convention validation failed. Please fix errors before committing.");
    process.exit(1);
  } else {
    console.log("✅ All staged files pass convention validation.");
  }
}

main().catch((error) => {
  console.error("Validation error:", error);
  process.exit(1);
});


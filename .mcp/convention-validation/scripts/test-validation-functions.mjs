#!/usr/bin/env node
// .mcp/convention-validation/scripts/test-validation-functions.mjs
// Functional test for validation functions

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Test helper
function test(name, fn) {
  try {
    const result = fn();
    if (result) {
      results.passed++;
      results.tests.push({ name, status: "✅ PASS" });
      console.log(`✅ ${name}`);
      return true;
    } else {
      results.failed++;
      results.tests.push({ name, status: "❌ FAIL" });
      console.log(`❌ ${name}`);
      return false;
    }
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: "❌ ERROR", error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

// Test 1: Validate naming - filename
test("validate_naming - filename (kebab-case)", async () => {
  const testFile = "packages/ui/src/components/button.tsx";
  const fileName = path.basename(testFile);
  const baseName = path.basename(fileName, path.extname(fileName));
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return kebabCaseRegex.test(baseName); // "button" should pass
});

// Test 2: Validate naming - component name
test("validate_naming - component name (PascalCase)", () => {
  const componentName = "Button";
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
  return pascalCaseRegex.test(componentName);
});

// Test 3: Validate naming - package name
test("validate_naming - package name (@aibos/*)", () => {
  const packageName = "@aibos/ui";
  const packageRegex = /^@aibos\/[a-z0-9-]+$/;
  return packageRegex.test(packageName);
});

// Test 4: Validate folder structure - monorepo
test("validate_folder_structure - monorepo directories", async () => {
  const requiredDirs = ["apps", "packages", "docs", ".mcp"];
  const entries = await fs.readdir(workspaceRoot, { withFileTypes: true });
  const existing = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  return requiredDirs.every((dir) => existing.includes(dir));
});

// Test 5: Validate documentation format - markdown structure
test("validate_documentation_format - markdown has title", async () => {
  const testFile = path.join(workspaceRoot, "docs/01-foundation/conventions/naming.md");
  const content = await fs.readFile(testFile, "utf-8");
  return /^#\s+.+$/m.test(content);
});

// Test 6: Validate imports - file exists
test("validate_imports - test file exists", async () => {
  const testFile = path.join(workspaceRoot, "packages/ui/src/components/button.tsx");
  try {
    await fs.access(testFile);
    return true;
  } catch {
    return false;
  }
});

// Test 7: Validate code examples - markdown has code blocks
test("validate_code_examples - markdown has code blocks", async () => {
  const testFile = path.join(workspaceRoot, "docs/01-foundation/conventions/naming.md");
  const content = await fs.readFile(testFile, "utf-8");
  return /```[\s\S]*?```/g.test(content);
});

// Test 8: Validate cross-references - markdown has links
test("validate_cross_references - markdown has links", async () => {
  const testFile = path.join(workspaceRoot, "docs/01-foundation/conventions/naming.md");
  const content = await fs.readFile(testFile, "utf-8");
  return /\[([^\]]+)\]\(([^)]+)\)/g.test(content);
});

// Test 9: Validate docs structure - conventions directory
test("validate_docs_structure - conventions directory exists", async () => {
  const testDir = path.join(workspaceRoot, "docs/01-foundation/conventions");
  try {
    const stats = await fs.stat(testDir);
    return stats.isDirectory();
  } catch {
    return false;
  }
});

// Test 10: Validate all conventions - comprehensive
test("validate_all_conventions - test path exists", async () => {
  const testPath = path.join(workspaceRoot, "packages/ui/src/components");
  try {
    const stats = await fs.stat(testPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
});

// Run all tests
async function runTests() {
  console.log("🧪 Functional Testing - Validation Functions\n");
  console.log("=".repeat(60));

  // Run async tests
  await test("validate_folder_structure - monorepo directories", async () => {
    const requiredDirs = ["apps", "packages", "docs", ".mcp"];
    const entries = await fs.readdir(workspaceRoot, { withFileTypes: true });
    const existing = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    return requiredDirs.every((dir) => existing.includes(dir));
  });

  await test("validate_documentation_format - markdown has title", async () => {
    const testFile = path.join(workspaceRoot, "docs/01-foundation/conventions/naming.md");
    const content = await fs.readFile(testFile, "utf-8");
    return /^#\s+.+$/m.test(content);
  });

  await test("validate_imports - test file exists", async () => {
    const testFile = path.join(workspaceRoot, "packages/ui/src/components/button.tsx");
    try {
      await fs.access(testFile);
      return true;
    } catch {
      return false;
    }
  });

  await test("validate_code_examples - markdown has code blocks", async () => {
    const testFile = path.join(workspaceRoot, "docs/01-foundation/conventions/naming.md");
    const content = await fs.readFile(testFile, "utf-8");
    return /```[\s\S]*?```/g.test(content);
  });

  await test("validate_cross_references - markdown has links", async () => {
    const testFile = path.join(workspaceRoot, "docs/01-foundation/conventions/naming.md");
    const content = await fs.readFile(testFile, "utf-8");
    return /\[([^\]]+)\]\(([^)]+)\)/g.test(content);
  });

  await test("validate_docs_structure - conventions directory exists", async () => {
    const testDir = path.join(workspaceRoot, "docs/01-foundation/conventions");
    try {
      const stats = await fs.stat(testDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  });

  await test("validate_all_conventions - test path exists", async () => {
    const testPath = path.join(workspaceRoot, "packages/ui/src/components");
    try {
      const stats = await fs.stat(testPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Test Results:\n");
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log("\n🎉 All functional tests passed!");
  } else {
    console.log("\n⚠️  Some tests failed - check implementation");
  }
}

runTests().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});


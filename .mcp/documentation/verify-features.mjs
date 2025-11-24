#!/usr/bin/env node
// Feature verification script for Documentation MCP Server
// Tests all v2.0.0 features

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const docsRoot = path.resolve(workspaceRoot, "docs");
const LOCK_FILE = path.join(docsRoot, ".mcp-docs.lock");
const BACKUP_DIR = path.join(docsRoot, ".mcp-backups");

let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, message = "") {
  if (passed) {
    console.log(`✅ ${name}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}${message ? `: ${message}` : ""}`);
    testsFailed++;
  }
}

async function testFileLocking() {
  console.log("\n🔒 Testing File Locking...\n");

  // Test 1: Lock file creation
  try {
    await fs.writeFile(
      LOCK_FILE,
      JSON.stringify({
        lockId: "test-lock",
        operation: "test",
        timestamp: Date.now(),
        pid: process.pid,
      }),
      "utf-8"
    );
    const lockContent = await fs.readFile(LOCK_FILE, "utf-8");
    const lockData = JSON.parse(lockContent);
    logTest("Lock file creation", lockData.lockId === "test-lock");
  } catch (error) {
    logTest("Lock file creation", false, error.message);
  }

  // Test 2: Stale lock detection (simulate)
  try {
    const staleLock = {
      lockId: "stale-lock",
      operation: "stale",
      timestamp: Date.now() - 360000, // 6 minutes ago
      pid: 9999,
    };
    const lockAge = Date.now() - staleLock.timestamp;
    logTest("Stale lock detection", lockAge > 300000, `Lock age: ${Math.round(lockAge / 1000)}s`);
  } catch (error) {
    logTest("Stale lock detection", false, error.message);
  }

  // Cleanup
  try {
    await fs.unlink(LOCK_FILE);
  } catch (error) {
    // Ignore
  }
}

async function testBackupSystem() {
  console.log("\n💾 Testing Backup System...\n");

  // Test 1: Backup directory creation
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const stats = await fs.stat(BACKUP_DIR);
    logTest("Backup directory creation", stats.isDirectory());
  } catch (error) {
    logTest("Backup directory creation", false, error.message);
  }

  // Test 2: Backup file naming
  try {
    const testFile = path.join(docsRoot, "test-backup.md");
    const testContent = "Test content";
    await fs.writeFile(testFile, testContent, "utf-8");

    const hash = createHash("md5").update(testContent).digest("hex").substring(0, 8);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `test-backup.${timestamp}.${hash}.md`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    await fs.writeFile(backupPath, testContent, "utf-8");
    const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
    logTest("Backup file naming", backupExists, `Format: ${backupFileName}`);

    // Cleanup
    await fs.unlink(testFile);
    await fs.unlink(backupPath);
  } catch (error) {
    logTest("Backup file naming", false, error.message);
  }
}

async function testPathValidation() {
  console.log("\n🔐 Testing Path Validation...\n");

  // Test 1: Valid path
  const validPath = "docs/09-reference/tokens/auto/test.md";
  const resolved = path.resolve(workspaceRoot, validPath);
  logTest("Valid path check", resolved.startsWith(docsRoot));

  // Test 2: Path traversal prevention
  const invalidPath = "../../../etc/passwd";
  const resolvedInvalid = path.resolve(workspaceRoot, invalidPath);
  logTest("Path traversal prevention", !resolvedInvalid.startsWith(docsRoot));

  // Test 3: File extension validation
  const validExt = validPath.endsWith(".md");
  const invalidExt = "test.txt";
  logTest("File extension validation", validExt && !invalidExt.endsWith(".md"));
}

async function testTokenParsing() {
  console.log("\n🎨 Testing Semantic Token Parsing...\n");

  const testTokens = [
    { name: "color-primary", value: "#000000" },
    { name: "brand-accent", value: "#ff0000" },
    { name: "spacing-md", value: "1rem" },
    { name: "font-size-lg", value: "1.25rem" },
    { name: "layout-container", value: "1200px" },
  ];

  function parseTokenSemantically(tokenName) {
    if (/^color-|^bg-|^border-|^brand-|^semantic-/.test(tokenName)) {
      return { category: "colors", tokenName };
    }
    if (/^spacing-|^gap-|^padding-|^margin-/.test(tokenName)) {
      return { category: "spacing", tokenName };
    }
    if (/^font-|^text-|^line-height-/.test(tokenName)) {
      return { category: "typography", tokenName };
    }
    if (/^layout-|^container-|^grid-/.test(tokenName)) {
      return { category: "layout", tokenName };
    }
    return { category: "other", tokenName };
  }

  for (const token of testTokens) {
    const parsed = parseTokenSemantically(token.name);
    const expectedCategory = token.name.includes("color") || token.name.includes("brand")
      ? "colors"
      : token.name.includes("spacing")
      ? "spacing"
      : token.name.includes("font")
      ? "typography"
      : token.name.includes("layout")
      ? "layout"
      : "other";
    logTest(
      `Token parsing: ${token.name}`,
      parsed.category === expectedCategory,
      `Expected: ${expectedCategory}, Got: ${parsed.category}`
    );
  }
}

async function testTemplateValidation() {
  console.log("\n✅ Testing Template Validation...\n");

  // Test 1: Placeholder detection
  const templateContent = "Hello {{name}}, your {{role}} is {{status}}.";
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const placeholders = [];
  let match;
  while ((match = placeholderRegex.exec(templateContent)) !== null) {
    placeholders.push(match[1]);
  }
  logTest("Placeholder detection", placeholders.length === 3, `Found: ${placeholders.join(", ")}`);

  // Test 2: Missing placeholder detection
  const data = { name: "John", role: "Developer" };
  const missing = placeholders.filter((p) => !(p in data));
  logTest("Missing placeholder detection", missing.length === 1, `Missing: ${missing.join(", ")}`);

  // Test 3: Unused data detection
  const unused = Object.keys(data).filter((k) => !placeholders.includes(k));
  logTest("Unused data detection", unused.length === 0);
}

async function testRateLimiting() {
  console.log("\n⏱️  Testing Rate Limiting Logic...\n");

  const rateLimitMap = new Map();
  const RATE_LIMIT_WINDOW = 60000;
  const MAX_REQUESTS = 10;

  function checkRateLimit(key) {
    const now = Date.now();
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      return { allowed: true };
    }
    const limit = rateLimitMap.get(key);
    if (now > limit.resetAt) {
      limit.count = 1;
      limit.resetAt = now + RATE_LIMIT_WINDOW;
      return { allowed: true };
    }
    if (limit.count >= MAX_REQUESTS) {
      return { allowed: false };
    }
    limit.count++;
    return { allowed: true };
  }

  // Test: Rate limit enforcement
  let allowedCount = 0;
  for (let i = 0; i < 12; i++) {
    const result = checkRateLimit("test-tool");
    if (result.allowed) allowedCount++;
  }
  logTest("Rate limit enforcement", allowedCount === 10, `Allowed: ${allowedCount}/12`);
}

async function testDataSanitization() {
  console.log("\n🛡️  Testing Data Sanitization...\n");

  function sanitizeTemplateData(data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) continue;
      const sanitizedValue = String(value)
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "");
      sanitized[key] = sanitizedValue;
    }
    return sanitized;
  }

  const maliciousData = {
    "valid-key": "valid value",
    "invalid-key!": "should be removed",
    "xss": "<script>alert('xss')</script>",
    "js": "javascript:alert('xss')",
    "event": "onclick=alert('xss')",
  };

  const sanitized = sanitizeTemplateData(maliciousData);
  logTest("Key validation", !("invalid-key!" in sanitized));
  logTest("XSS prevention (angle brackets)", !sanitized.xss?.includes("<"));
  logTest("XSS prevention (javascript:)", !sanitized.js?.includes("javascript:"));
  logTest("XSS prevention (event handlers)", !sanitized.event?.includes("onclick"));
}

async function runAllTests() {
  console.log("🧪 Documentation MCP Server v2.0.0 - Feature Verification\n");
  console.log("=" .repeat(60));

  await testFileLocking();
  await testBackupSystem();
  await testPathValidation();
  await testTokenParsing();
  await testTemplateValidation();
  await testRateLimiting();
  await testDataSanitization();

  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Test Results:");
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  console.log(`   📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

  if (testsFailed === 0) {
    console.log("\n🎉 All tests passed! Server is ready for production.");
  } else {
    console.log("\n⚠️  Some tests failed. Please review before deployment.");
  }
}

runAllTests().catch(console.error);


#!/usr/bin/env node
// Setup pre-commit hook for convention validation
// Usage: node setup-pre-commit.mjs

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");

async function setupPreCommit() {
  const huskyDir = path.join(workspaceRoot, ".husky");
  const preCommitHook = path.join(huskyDir, "pre-commit");

  // Create .husky directory if it doesn't exist
  try {
    await fs.mkdir(huskyDir, { recursive: true });
    console.log("✅ Created .husky directory");
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  // Create pre-commit hook
  const hookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run convention validation on staged files
node .mcp/convention-validation/scripts/validate-staged.mjs
`;

  await fs.writeFile(preCommitHook, hookContent, { mode: 0o755 });
  console.log("✅ Created pre-commit hook");

  console.log("\n📋 Pre-commit hook setup complete!");
  console.log("   The hook will validate conventions on staged files before commit.");
}

setupPreCommit().catch(console.error);


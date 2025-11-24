#!/usr/bin/env node
// Bulk rename files from UPPER_SNAKE_CASE to kebab-case
// Usage: node rename-to-kebab-case.mjs <directory>

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renameFiles(directory) {
  const files = await fs.readdir(directory, { withFileTypes: true });
  let renamed = 0;

  for (const file of files) {
    if (file.isFile() && file.name.match(/^[A-Z_]+\.md$/)) {
      const oldPath = path.join(directory, file.name);
      const newName = file.name.toLowerCase().replace(/_/g, "-");
      const newPath = path.join(directory, newName);

      if (oldPath !== newPath) {
        try {
          await fs.rename(oldPath, newPath);
          console.log(`✅ Renamed: ${file.name} -> ${newName}`);
          renamed++;
        } catch (error) {
          console.error(`❌ Error renaming ${file.name}:`, error.message);
        }
      }
    }
  }

  console.log(`\n📊 Total files renamed: ${renamed}`);
}

const targetDir = process.argv[2] || path.resolve(__dirname, "../../apps/web");
renameFiles(targetDir).catch(console.error);


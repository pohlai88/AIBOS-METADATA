#!/usr/bin/env node
// Add Overview sections to markdown files missing them
// Usage: node add-overview-sections.mjs

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");

async function getAllMarkdownFiles(rootDir) {
  const files = [];
  
  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip archive, node_modules, etc.
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
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }
  
  await walkDir(rootDir);
  return files;
}

async function addOverviewSection(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    
    // Skip if already has Overview section
    if (/##\s+Overview/i.test(content)) {
      return false;
    }
    
    // Skip README files
    if (path.basename(filePath).toLowerCase() === "readme.md") {
      return false;
    }
    
    // Find the first section after metadata
    const lines = content.split("\n");
    let insertIndex = -1;
    let foundMetadata = false;
    let foundFirstSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if we've passed metadata block
      if (line.startsWith("---") && !foundMetadata) {
        foundMetadata = true;
        continue;
      }
      
      // Find first H2 section
      if (foundMetadata && line.startsWith("## ") && !foundFirstSection) {
        foundFirstSection = true;
        insertIndex = i;
        break;
      }
      
      // If no sections found, insert after metadata
      if (foundMetadata && line.trim() === "" && insertIndex === -1) {
        insertIndex = i + 1;
      }
    }
    
    // If no section found, insert after title and metadata
    if (insertIndex === -1) {
      // Find where to insert (after first --- or after title)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("---")) {
          insertIndex = i + 1;
          break;
        }
      }
      if (insertIndex === -1) {
        insertIndex = 1; // After title
      }
    }
    
    // Generate overview text from title or first paragraph
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, ".md");
    const overviewText = `This document ${title.toLowerCase().includes("complete") || title.toLowerCase().includes("report") ? "reports on" : "defines"} ${title.toLowerCase()}.`;
    
    // Insert Overview section
    const overviewSection = [
      "",
      "## Overview",
      "",
      overviewText,
      "",
      "---",
      ""
    ];
    
    lines.splice(insertIndex, 0, ...overviewSection);
    
    await fs.writeFile(filePath, lines.join("\n"), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🔍 Finding markdown files missing Overview sections...");
  
  const files = await getAllMarkdownFiles(path.join(workspaceRoot, "docs"));
  let updated = 0;
  
  for (const file of files) {
    if (await addOverviewSection(file)) {
      console.log(`✅ Added Overview to: ${path.relative(workspaceRoot, file)}`);
      updated++;
    }
  }
  
  console.log(`\n📊 Total files updated: ${updated}`);
}

main().catch(console.error);


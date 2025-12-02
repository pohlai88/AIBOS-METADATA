#!/usr/bin/env node
// .mcp/tailwind-v4/validate-extraction.mjs
// Random validation of extracted documentation

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsCachePath = path.join(__dirname, "tailwind-docs-cache.json");

// Get random sample
function getRandomSample(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function validateExtraction() {
  console.log("🔍 Validating Tailwind v4.1 Documentation Extraction...\n");

  // Load cache
  let cache;
  try {
    const cacheContent = await fs.readFile(docsCachePath, "utf-8");
    cache = JSON.parse(cacheContent);
    console.log(`✅ Loaded cache with ${cache.metadata?.totalPages || 0} pages\n`);
  } catch (error) {
    console.error("❌ Failed to load cache:", error.message);
    process.exit(1);
  }

  const pages = Object.entries(cache.pages || {});
  const totalPages = pages.length;

  if (totalPages === 0) {
    console.error("❌ No pages found in cache");
    process.exit(1);
  }

  console.log(`📊 Cache Statistics:`);
  console.log(`   - Total pages: ${totalPages}`);
  console.log(`   - Sections: ${cache.navigation?.sections?.length || 0}`);
  console.log(`   - Navigation links: ${cache.navigation?.links?.length || 0}`);
  console.log(`   - Version: ${cache.metadata?.version || "unknown"}`);
  console.log(`   - Extracted at: ${cache.metadata?.extractedAt || "unknown"}\n`);

  // Random validation - sample 10 pages
  const sampleSize = Math.min(10, totalPages);
  const randomPages = getRandomSample(pages, sampleSize);

  console.log(`🎲 Random Validation (${sampleSize} random pages):\n`);

  const validationResults = {
    total: sampleSize,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  for (const [path, page] of randomPages) {
    const result = {
      path,
      title: page.title || "N/A",
      status: "✅",
      issues: [],
    };

    // Check 1: Has content
    if (!page.content || page.content.length === 0) {
      result.status = "❌";
      result.issues.push("Missing content");
      validationResults.failed++;
    } else if (page.content.length < 100) {
      result.status = "⚠️";
      result.issues.push(`Very short content (${page.content.length} chars)`);
      validationResults.warnings++;
    } else {
      validationResults.passed++;
    }

    // Check 2: Has title
    if (!page.title || page.title.length === 0) {
      result.issues.push("Missing title");
      if (result.status === "✅") {
        result.status = "⚠️";
        validationResults.warnings++;
      }
    }

    // Check 3: Has URL
    if (!page.url || !page.url.includes("tailwindcss.com")) {
      result.issues.push("Invalid or missing URL");
      if (result.status === "✅") {
        result.status = "⚠️";
        validationResults.warnings++;
      }
    }

    // Check 4: Content quality indicators
    if (page.content) {
      const hasCodeBlocks = page.codeBlocks && page.codeBlocks.length > 0;
      const hasKeywords = page.content.toLowerCase().includes("tailwind") ||
                         page.content.toLowerCase().includes("utility") ||
                         page.content.toLowerCase().includes("class");
      
      if (!hasKeywords && page.content.length > 500) {
        result.issues.push("Content may not be relevant (no Tailwind keywords)");
        if (result.status === "✅") {
          result.status = "⚠️";
          validationResults.warnings++;
        }
      }

      if (hasCodeBlocks) {
        result.issues.push(`✅ Has ${page.codeBlocks.length} code blocks`);
      }
    }

    // Check 5: Navigation structure
    if (page.navigation && page.navigation.links) {
      result.issues.push(`✅ Has ${page.navigation.links.length} navigation links`);
    }

    validationResults.details.push(result);

    // Print result
    console.log(`${result.status} ${path}`);
    console.log(`   Title: ${result.title}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        const icon = issue.startsWith("✅") ? "   ✅" : "   ⚠️";
        console.log(`${icon} ${issue}`);
      });
    }
    console.log("");
  }

  // Summary
  console.log("📊 Validation Summary:");
  console.log(`   ✅ Passed: ${validationResults.passed}/${validationResults.total}`);
  console.log(`   ⚠️  Warnings: ${validationResults.warnings}`);
  console.log(`   ❌ Failed: ${validationResults.failed}`);
  console.log("");

  // Category distribution check
  console.log("📂 Category Distribution Check:");
  const categories = {};
  for (const [path, page] of pages) {
    // Try to infer category from path
    let category = "other";
    if (path.includes("installation")) category = "installation";
    else if (path.includes("theme") || path.includes("color") || path.includes("styling")) category = "coreConcepts";
    else if (path.includes("layout") || path.includes("display") || path.includes("position")) category = "layout";
    else if (path.includes("flex") || path.includes("grid")) category = "flexboxGrid";
    else if (path.includes("font") || path.includes("text") || path.includes("typography")) category = "typography";
    else if (path.includes("background")) category = "backgrounds";
    else if (path.includes("border")) category = "borders";
    else if (path.includes("shadow") || path.includes("opacity")) category = "effects";
    else if (path.includes("filter")) category = "filters";
    else if (path.includes("transition") || path.includes("animation")) category = "animations";
    else if (path.includes("transform") || path.includes("rotate") || path.includes("scale")) category = "transforms";
    else if (path.includes("cursor") || path.includes("scroll") || path.includes("user-select")) category = "interactivity";
    else if (path.includes("fill") || path.includes("stroke")) category = "svg";
    else if (path.includes("table")) category = "tables";
    else if (path.includes("preflight")) category = "baseStyles";
    else if (path.includes("accessibility") || path.includes("forced-color")) category = "accessibility";
    
    categories[category] = (categories[category] || 0) + 1;
  }

  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedCategories.forEach(([category, count]) => {
    console.log(`   ${category}: ${count} pages`);
  });
  console.log("");

  // Content quality metrics
  console.log("📈 Content Quality Metrics:");
  let totalContentLength = 0;
  let pagesWithCode = 0;
  let pagesWithNavigation = 0;
  
  for (const [path, page] of pages) {
    if (page.content) {
      totalContentLength += page.content.length;
    }
    if (page.codeBlocks && page.codeBlocks.length > 0) {
      pagesWithCode++;
    }
    if (page.navigation && page.navigation.links && page.navigation.links.length > 0) {
      pagesWithNavigation++;
    }
  }

  const avgContentLength = Math.round(totalContentLength / totalPages);
  const codeBlockPercentage = Math.round((pagesWithCode / totalPages) * 100);
  const navigationPercentage = Math.round((pagesWithNavigation / totalPages) * 100);

  console.log(`   Average content length: ${avgContentLength.toLocaleString()} characters`);
  console.log(`   Pages with code blocks: ${pagesWithCode} (${codeBlockPercentage}%)`);
  console.log(`   Pages with navigation: ${pagesWithNavigation} (${navigationPercentage}%)`);
  console.log("");

  // Specific page checks
  console.log("🎯 Key Pages Validation:");
  const keyPages = [
    "installation/using-vite",
    "detecting-classes-in-source-files",
    "theme",
    "colors",
    "container-queries",
    "transforms",
    "transitions-and-animation",
  ];

  for (const keyPath of keyPages) {
    const page = cache.pages[keyPath];
    if (page) {
      const hasContent = page.content && page.content.length > 500;
      const hasCode = page.codeBlocks && page.codeBlocks.length > 0;
      const status = hasContent && hasCode ? "✅" : hasContent ? "⚠️" : "❌";
      console.log(`   ${status} ${keyPath} - ${hasContent ? "Content" : "No content"}, ${hasCode ? "Code" : "No code"}`);
    } else {
      console.log(`   ❌ ${keyPath} - Not found`);
    }
  }
  console.log("");

  // Final verdict
  const successRate = (validationResults.passed / validationResults.total) * 100;
  if (successRate >= 90) {
    console.log("✅ Validation PASSED - Extraction quality is excellent!");
  } else if (successRate >= 70) {
    console.log("⚠️  Validation WARNING - Extraction quality is good but has some issues");
  } else {
    console.log("❌ Validation FAILED - Extraction quality needs improvement");
  }

  return validationResults;
}

// Run validation
validateExtraction().catch(console.error);


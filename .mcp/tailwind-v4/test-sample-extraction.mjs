#!/usr/bin/env node
// .mcp/tailwind-v4/test-sample-extraction.mjs
// Test improved extraction on sample pages

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TAILWIND_DOCS_BASE = "https://tailwindcss.com/docs";

// Copy the improved extraction functions
function extractMainContent(html) {
  // Extract code blocks FIRST (before content extraction)
  const codeBlocks = [];
  
  // Multiple code block patterns
  const codePatterns = [
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    /<code[^>]*class="[^"]*language-[^"]*"[^>]*>([\s\S]*?)<\/code>/gi,
  ];

  for (const pattern of codePatterns) {
    let codeMatch;
    while ((codeMatch = pattern.exec(html)) !== null) {
      const code = codeMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&nbsp;/g, " ")
        .trim();
      if (code && code.length > 10 && !codeBlocks.includes(code)) {
        codeBlocks.push(code);
      }
    }
  }

  // Extract main content - try multiple strategies
  let content = html;
  
  // Strategy 1: Look for main/article tags
  const mainSelectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
  ];
  
  for (const selector of mainSelectors) {
    const match = html.match(selector);
    if (match && match[1] && match[1].length > 500) {
      content = match[1];
      break;
    }
  }

  // Strategy 2: Look for content divs with common class patterns
  if (content === html || content.length < 500) {
    const contentDivPatterns = [
      /<div[^>]*class="[^"]*prose[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*markdown[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*docs-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    
    for (const pattern of contentDivPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length > 500) {
        content = match[1];
        break;
      }
    }
  }

  // Strategy 3: Extract between common markers
  if (content === html || content.length < 500) {
    const markers = [
      /<h1[^>]*>([\s\S]*?)(?:<footer|<nav|<\/body|<\/html)/i,
      /<h2[^>]*>([\s\S]*?)(?:<footer|<nav|<\/body|<\/html)/i,
    ];
    
    for (const marker of markers) {
      const match = html.match(marker);
      if (match && match[1] && match[1].length > 500) {
        content = match[1];
        break;
      }
    }
  }

  // Remove script and style tags
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
  content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

  // Convert to text with better preservation
  let textContent = content
    // Headers
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n")
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n")
    // Paragraphs (handle nested tags)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, pContent) => {
      // Clean nested tags but preserve text
      const cleaned = pContent
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim();
      return cleaned ? `${cleaned}\n` : "";
    })
    // Lists
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, "\n$1\n")
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, "\n$1\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (match, liContent) => {
      const cleaned = liContent.replace(/<[^>]+>/g, " ").trim();
      return cleaned ? `- ${cleaned}\n` : "";
    })
    // Inline code (preserve)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (match, codeContent) => {
      const cleaned = codeContent.replace(/<[^>]+>/g, "").trim();
      return cleaned ? `\`${cleaned}\`` : "";
    })
    // Links
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
      const cleaned = text.replace(/<[^>]+>/g, "").trim();
      return cleaned ? `[${cleaned}](${href})` : "";
    })
    // Strong/Em
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n")
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, " ")
    // HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    // Clean up whitespace
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  return {
    text: textContent,
    codeBlocks: codeBlocks,
  };
}

function extractTitle(html) {
  const titleMatch =
    html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

async function fetchPage(path) {
  try {
    const url = path ? `${TAILWIND_DOCS_BASE}/${path}` : TAILWIND_DOCS_BASE;
    console.log(`Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AIBOS-Tailwind-v4-MCP/1.1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const mainContent = extractMainContent(html);
    const title = extractTitle(html);

    return {
      path: path || "index",
      url,
      title,
      content: mainContent.text,
      codeBlocks: mainContent.codeBlocks,
      contentLength: mainContent.text.length,
      codeBlockCount: mainContent.codeBlocks.length,
    };
  } catch (error) {
    console.error(`Error fetching ${path}:`, error.message);
    return {
      path: path || "index",
      url: path ? `${TAILWIND_DOCS_BASE}/${path}` : TAILWIND_DOCS_BASE,
      error: error.message,
      content: null,
    };
  }
}

async function testSamplePages() {
  console.log("🧪 Testing Improved Extraction on Sample Pages...\n");

  // Test pages - mix of different types
  const testPages = [
    "installation/using-vite",           // Installation guide (should have code)
    "detecting-classes-in-source-files", // Core concept (should have examples)
    "theme",                             // Configuration (should have @theme examples)
    "colors",                             // Utility reference
    "container-queries",                  // Feature documentation
    "transforms",                         // Utility category
  ];

  const results = [];

  for (const pagePath of testPages) {
    console.log(`\n📄 Testing: ${pagePath}`);
    console.log("─".repeat(60));
    
    const page = await fetchPage(pagePath);
    
    const result = {
      path: pagePath,
      title: page.title,
      contentLength: page.contentLength || 0,
      codeBlockCount: page.codeBlockCount || 0,
      hasContent: (page.contentLength || 0) > 500,
      hasCodeBlocks: (page.codeBlockCount || 0) > 0,
      status: "✅",
      preview: page.content?.substring(0, 200) || "No content",
    };

    if (!result.hasContent) {
      result.status = "❌";
    } else if (!result.hasCodeBlocks && pagePath.includes("installation")) {
      result.status = "⚠️";
    }

    results.push(result);

    console.log(`Title: ${result.title}`);
    console.log(`Content length: ${result.contentLength.toLocaleString()} characters`);
    console.log(`Code blocks: ${result.codeBlockCount}`);
    console.log(`Status: ${result.status}`);
    
    if (result.codeBlockCount > 0) {
      console.log(`\nFirst code block preview (100 chars):`);
      console.log(page.codeBlocks[0].substring(0, 100) + "...");
    }
    
    console.log(`\nContent preview:`);
    console.log(result.preview + "...");

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Summary");
  console.log("=".repeat(60));
  
  const passed = results.filter(r => r.status === "✅").length;
  const warnings = results.filter(r => r.status === "⚠️").length;
  const failed = results.filter(r => r.status === "❌").length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\nAverage content length: ${Math.round(results.reduce((sum, r) => sum + r.contentLength, 0) / results.length).toLocaleString()} characters`);
  console.log(`Total code blocks found: ${results.reduce((sum, r) => sum + r.codeBlockCount, 0)}`);
  console.log(`Pages with code blocks: ${results.filter(r => r.hasCodeBlocks).length}/${results.length}`);

  console.log("\n📋 Detailed Results:");
  results.forEach(r => {
    console.log(`  ${r.status} ${r.path}`);
    console.log(`     Content: ${r.contentLength.toLocaleString()} chars, Code: ${r.codeBlockCount} blocks`);
  });

  return results;
}

// Run test
testSamplePages().catch(console.error);


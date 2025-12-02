#!/usr/bin/env node
// .mcp/tailwind-v4/extract-docs.mjs
// Script to extract and cache all Tailwind v4.1 documentation

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const docsCachePath = path.join(__dirname, "tailwind-docs-cache.json");

const TAILWIND_DOCS_BASE = "https://tailwindcss.com/docs";

// Enhanced HTML parsing
function extractNavigation(html) {
  const navigation = {
    sections: [],
    links: [],
  };

  // Extract section headers - look for common patterns
  const sectionPatterns = [
    /<h[23][^>]*class="[^"]*text-[^"]*uppercase[^"]*"[^>]*>([^<]+)<\/h[23]>/gi,
    /<div[^>]*class="[^"]*uppercase[^"]*"[^>]*>([^<]+)<\/div>/gi,
    /<span[^>]*class="[^"]*uppercase[^"]*"[^>]*>([^<]+)<\/span>/gi,
    /<div[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([A-Z\s&]+)<\/div>/gi,
  ];

  for (const pattern of sectionPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const text = match[1].trim();
      if (text && text.length < 100 && !navigation.sections.includes(text)) {
        // Filter for section-like text (uppercase, short, contains common words)
        if (
          text.match(
            /^(CORE|BASE|LAYOUT|FLEXBOX|SPACING|SIZING|TYPOGRAPHY|BACKGROUNDS|BORDERS|EFFECTS|FILTERS|TABLES|TRANSITIONS|TRANSFORMS|INTERACTIVITY|SVG|ACCESSIBILITY|GETTING)/i
          ) ||
          text === text.toUpperCase()
        ) {
          navigation.sections.push(text);
        }
      }
    }
  }

  // Extract all documentation links
  const linkMatches = html.matchAll(
    /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi
  );
  for (const match of linkMatches) {
    const href = match[1];
    const text = match[2].trim().replace(/\s+/g, " ");

    // Only include docs links
    if (href.startsWith("/docs/") || href.includes("tailwindcss.com/docs/")) {
      const cleanPath = href
        .replace(/^https?:\/\/tailwindcss\.com\/docs\//, "")
        .replace(/^\/docs\//, "")
        .replace(/\/$/, "");

      if (
        cleanPath &&
        text &&
        !navigation.links.find((l) => l.path === cleanPath)
      ) {
        navigation.links.push({
          path: cleanPath,
          text: text,
          url: href.startsWith("http")
            ? href
            : `https://tailwindcss.com${href}`,
        });
      }
    }
  }

  return navigation;
}

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
    .replace(
      /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      (match, href, text) => {
        const cleaned = text.replace(/<[^>]+>/g, "").trim();
        return cleaned ? `[${cleaned}](${href})` : "";
      }
    )
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
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const navigation = extractNavigation(html);
    const mainContent = extractMainContent(html);
    const title = extractTitle(html);

    return {
      path: path || "index",
      url,
      title,
      navigation,
      content: mainContent.text, // Keep full content
      codeBlocks: mainContent.codeBlocks,
      fetchedAt: new Date().toISOString(),
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

async function extractAllDocs() {
  console.log("🚀 Starting Tailwind v4.1 documentation extraction...\n");

  // Step 1: Fetch main docs page to get navigation
  console.log("Step 1: Fetching main documentation page...");
  const mainPage = await fetchPage("");

  if (!mainPage.navigation || mainPage.navigation.links.length === 0) {
    console.error("❌ Failed to extract navigation from main page");
    return;
  }

  console.log(
    `✅ Found ${mainPage.navigation.links.length} documentation links\n`
  );

  // Step 2: Extract all pages
  console.log("Step 2: Extracting all documentation pages...");
  const allDocs = {
    metadata: {
      extractedAt: new Date().toISOString(),
      version: "4.1",
      totalPages: 0,
      sections: mainPage.navigation.sections,
    },
    navigation: {
      sections: mainPage.navigation.sections,
      links: mainPage.navigation.links,
    },
    pages: {},
  };

  // Fetch all pages (with rate limiting)
  const links = mainPage.navigation.links;
  const totalLinks = links.length;

  // Remove duplicates
  const uniqueLinks = [];
  const seenPaths = new Set();
  for (const link of links) {
    if (!seenPaths.has(link.path) && link.path) {
      uniqueLinks.push(link);
      seenPaths.add(link.path);
    }
  }

  console.log(`Extracting ${uniqueLinks.length} unique pages...\n`);

  for (let i = 0; i < uniqueLinks.length; i++) {
    const link = uniqueLinks[i];
    console.log(`[${i + 1}/${uniqueLinks.length}] Extracting: ${link.path}`);

    const page = await fetchPage(link.path);
    if (!page.error) {
      allDocs.pages[link.path] = page;
    } else {
      console.log(`   ⚠️  Error: ${page.error}`);
    }

    // Rate limiting - wait 300ms between requests to be respectful
    if (i < uniqueLinks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  allDocs.metadata.totalPages = Object.keys(allDocs.pages).length;

  // Step 3: Save to JSON
  console.log(`\nStep 3: Saving to ${docsCachePath}...`);
  await fs.writeFile(docsCachePath, JSON.stringify(allDocs, null, 2), "utf-8");

  console.log(`\n✅ Documentation extraction complete!`);
  console.log(`   - Total pages: ${allDocs.metadata.totalPages}`);
  console.log(`   - Sections: ${allDocs.navigation.sections.length}`);
  console.log(`   - Cache file: ${docsCachePath}`);
  console.log(`\n📦 Documentation cache ready for use!`);

  return allDocs;
}

// Run extraction
extractAllDocs().catch(console.error);

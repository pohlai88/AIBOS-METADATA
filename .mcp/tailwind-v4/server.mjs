#!/usr/bin/env node
// .mcp/tailwind-v4/server.mjs
// AIBOS Tailwind v4 MCP Server
// Version: 1.1.0
// Purpose: Tailwind CSS v4 validation, documentation, and best practices
// Includes: Official Tailwind v4.1 documentation access

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");

// Paths to important files
const cursorRulesPath = path.resolve(workspaceRoot, ".cursor", ".cursorrules");
const tailwindGuidePath = path.resolve(
  workspaceRoot,
  "docs",
  "guidelines",
  "TAILWIND-V4-GUIDE"
);

// Cache for rules and guides
let cursorRulesCache = null;
let guidesCache = new Map();

// Cache for official Tailwind docs
const officialDocsCache = new Map();
const TAILWIND_DOCS_BASE = "https://tailwindcss.com/docs";
const docsCachePath = path.join(__dirname, "tailwind-docs-cache.json");
const referencePath = path.join(__dirname, "tailwind-v4-reference.json");
const useCasesPath = path.join(__dirname, "tailwind-v4-usecases.json");

// Load local documentation cache, reference, and use cases
let localDocsCache = null;
let localReference = null;
let localUseCases = null;

async function loadLocalDocsCache() {
  if (localDocsCache) return localDocsCache;

  try {
    const cacheContent = await fs.readFile(docsCachePath, "utf-8");
    localDocsCache = JSON.parse(cacheContent);
    console.error(
      `Loaded ${localDocsCache.metadata?.totalPages || 0} pages from local cache`
    );
    return localDocsCache;
  } catch (error) {
    // Cache doesn't exist yet, will fetch on demand
    return null;
  }
}

async function loadLocalReference() {
  if (localReference) return localReference;

  try {
    const refContent = await fs.readFile(referencePath, "utf-8");
    localReference = JSON.parse(refContent);
    console.error(
      `Loaded permanent reference with ${localReference.metadata?.totalPages || 0} pages`
    );
    return localReference;
  } catch (error) {
    // Reference doesn't exist yet
    return null;
  }
}

async function loadLocalUseCases() {
  if (localUseCases) return localUseCases;

  try {
    const useCasesContent = await fs.readFile(useCasesPath, "utf-8");
    localUseCases = JSON.parse(useCasesContent);
    console.error(`Loaded use cases reference`);
    return localUseCases;
  } catch (error) {
    // Use cases don't exist yet
    return null;
  }
}

// --- Helper Functions ---------------------------------------------------------

async function readCursorRules() {
  if (cursorRulesCache) return cursorRulesCache;
  try {
    const content = await fs.readFile(cursorRulesPath, "utf-8");
    cursorRulesCache = content;
    return content;
  } catch (error) {
    return null;
  }
}

async function readGuideFile(filename) {
  if (guidesCache.has(filename)) {
    return guidesCache.get(filename);
  }
  try {
    const filePath = path.join(tailwindGuidePath, filename);
    const content = await fs.readFile(filePath, "utf-8");
    guidesCache.set(filename, content);
    return content;
  } catch (error) {
    return null;
  }
}

function validateV4Syntax(code) {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  // Check for v3 patterns
  if (
    code.includes("@tailwind base") ||
    code.includes("@tailwind components") ||
    code.includes("@tailwind utilities")
  ) {
    errors.push({
      type: "v3_pattern",
      message:
        "Found v3 @tailwind directives. Use @import 'tailwindcss' instead.",
      line:
        code.split("\n").findIndex((line) => line.includes("@tailwind")) + 1,
    });
  }

  // Check for proper v4 import
  if (!code.includes("@import") && !code.includes('@import "tailwindcss"')) {
    warnings.push({
      type: "missing_import",
      message: "Missing @import 'tailwindcss' directive.",
    });
  }

  // Check for OKLCH colors
  const rgbPattern = /rgb\([^)]+\)/g;
  const rgbMatches = code.match(rgbPattern);
  if (rgbMatches && code.includes("@theme")) {
    warnings.push({
      type: "rgb_in_theme",
      message:
        "Consider using OKLCH format in @theme for better color uniformity.",
      examples: rgbMatches.slice(0, 3),
    });
  }

  // Check for JS config usage
  if (code.includes("tailwind.config") && code.includes("extend:")) {
    warnings.push({
      type: "js_config",
      message: "Consider moving configuration to CSS using @theme directive.",
    });
  }

  // Check for Framer Motion or animation libraries
  if (
    code.includes("framer-motion") ||
    code.includes("gsap") ||
    code.includes("motion.")
  ) {
    suggestions.push({
      type: "js_animation",
      message:
        "Consider using pure CSS transitions with Tailwind v4 tokens instead.",
      example:
        "Use 'transition-all duration-normal ease-standard' instead of JS animations.",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

// --- Official Docs Fetching -----------------------------------------------------

function extractNavigation(html) {
  const navigation = {
    sections: [],
    links: [],
  };

  // Extract navigation links from sidebar
  // Look for common navigation patterns in Tailwind docs
  const navPatterns = [
    /<nav[^>]*>([\s\S]*?)<\/nav>/gi,
    /<aside[^>]*>([\s\S]*?)<\/aside>/gi,
    /<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*nav[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  ];

  let navHtml = "";
  for (const pattern of navPatterns) {
    const match = html.match(pattern);
    if (match) {
      navHtml = match[0];
      break;
    }
  }

  if (navHtml) {
    // Extract section headers - improved patterns
    const sectionPatterns = [
      /<h[23][^>]*class="[^"]*text-[^"]*uppercase[^"]*"[^>]*>([^<]+)<\/h[23]>/gi,
      /<div[^>]*class="[^"]*uppercase[^"]*"[^>]*>([^<]+)<\/div>/gi,
      /<span[^>]*class="[^"]*uppercase[^"]*"[^>]*>([^<]+)<\/span>/gi,
      /<div[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([A-Z\s&]+)<\/div>/gi,
      /<(h[23]|div)[^>]*class="[^"]*section[^"]*"[^>]*>([^<]+)<\/(h[23]|div)>/gi,
    ];

    for (const pattern of sectionPatterns) {
      const matches = navHtml.matchAll(pattern);
      for (const match of matches) {
        const text = match[1] || match[2];
        const sectionName = text.trim();
        if (
          sectionName &&
          sectionName.length < 100 &&
          !navigation.sections.includes(sectionName) &&
          (sectionName === sectionName.toUpperCase() ||
            sectionName.match(
              /^(CORE|BASE|LAYOUT|FLEXBOX|SPACING|SIZING|TYPOGRAPHY|BACKGROUNDS|BORDERS|EFFECTS|FILTERS|TABLES|TRANSITIONS|TRANSFORMS|INTERACTIVITY|SVG|ACCESSIBILITY|GETTING)/i
            ))
        ) {
          navigation.sections.push(sectionName);
        }
      }
    }

    // Extract all links
    const linkMatches = navHtml.matchAll(
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
  }

  return navigation;
}

function extractMainContent(html) {
  // Extract main content from HTML
  let content = html;

  // Try multiple selectors for main content
  const contentSelectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*prose[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const selector of contentSelectors) {
    const match = html.match(selector);
    if (match && match[1]) {
      content = match[1];
      break;
    }
  }

  // Remove script and style tags
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Extract code blocks (preserve them)
  const codeBlocks = [];
  const codePattern = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
  let codeMatch;
  while ((codeMatch = codePattern.exec(content)) !== null) {
    codeBlocks.push(codeMatch[1].replace(/<[^>]+>/g, "").trim());
  }

  // Convert HTML to text
  let textContent = content
    .replace(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi, "\n## $1\n") // Headers
    .replace(/<p[^>]*>([^<]+)<\/p>/gi, "$1\n") // Paragraphs
    .replace(/<li[^>]*>([^<]+)<\/li>/gi, "- $1\n") // List items
    .replace(/<code[^>]*>([^<]+)<\/code>/gi, "`$1`") // Inline code
    .replace(/<strong[^>]*>([^<]+)<\/strong>/gi, "**$1**") // Bold
    .replace(/<em[^>]*>([^<]+)<\/em>/gi, "*$1*") // Italic
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, "[$2]($1)") // Links
    .replace(/<[^>]+>/g, " ") // Remove remaining HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  return {
    text: textContent.substring(0, 8000), // Limit content size
    codeBlocks: codeBlocks.slice(0, 10), // Limit code blocks
  };
}

async function fetchOfficialDocs(path) {
  const cacheKey = path || "index";

  // Try permanent reference first (most organized)
  const reference = await loadLocalReference();
  if (reference && reference.pages) {
    const cleanPath = path
      ? path.replace(/^\/docs\//, "").replace(/\/$/, "")
      : "index";
    const refPage = reference.pages[cleanPath];
    if (refPage) {
      return {
        url: refPage.url,
        title: refPage.title,
        category: refPage.category,
        summary: refPage.summary,
        keyPoints: refPage.keyPoints,
        utilities: refPage.utilities,
        variants: refPage.variants,
        configuration: refPage.configuration,
        navigation: reference.navigation || {
          sections: [],
          links: [],
          linkCount: 0,
        },
        content: refPage.content,
        fullContent: refPage.fullContent,
        codeBlocks: refPage.codeBlocks || [],
        fromReference: true,
      };
    }
  }

  // Try local cache
  const localCache = await loadLocalDocsCache();
  if (localCache && localCache.pages) {
    const cleanPath = path
      ? path.replace(/^\/docs\//, "").replace(/\/$/, "")
      : "index";
    const cachedPage = localCache.pages[cleanPath];
    if (cachedPage && !cachedPage.error) {
      return {
        url: cachedPage.url,
        title: cachedPage.title,
        navigation: cachedPage.navigation || {
          sections: localCache.navigation?.sections || [],
          links: localCache.navigation?.links || [],
          linkCount: localCache.navigation?.links?.length || 0,
        },
        content: cachedPage.content,
        codeBlocks: cachedPage.codeBlocks || [],
        fetchedAt: cachedPage.fetchedAt,
        fromCache: true,
      };
    }
  }

  // Try in-memory cache
  if (officialDocsCache.has(cacheKey)) {
    return officialDocsCache.get(cacheKey);
  }

  // Fetch from web
  try {
    const url = path.startsWith("http")
      ? path
      : `${TAILWIND_DOCS_BASE}/${path}`;
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

    // Extract navigation structure
    const navigation = extractNavigation(html);

    // Extract main content
    const mainContent = extractMainContent(html);

    const result = {
      url,
      title: extractTitle(html),
      navigation: {
        sections: navigation.sections,
        links: navigation.links.slice(0, 50), // Limit links
        linkCount: navigation.links.length,
      },
      content: mainContent.text,
      codeBlocks: mainContent.codeBlocks,
      fetchedAt: new Date().toISOString(),
      fromCache: false,
    };

    officialDocsCache.set(cacheKey, result);
    return result;
  } catch (error) {
    return {
      url: path.startsWith("http") ? path : `${TAILWIND_DOCS_BASE}/${path}`,
      error: error.message,
      content: null,
      navigation: null,
    };
  }
}

function extractTitle(html) {
  // Extract page title
  const titleMatch =
    html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

async function getNavigationIndex() {
  // Try permanent reference first
  const reference = await loadLocalReference();
  if (reference && reference.navigation) {
    return reference.navigation;
  }

  // Try local cache
  const localCache = await loadLocalDocsCache();
  if (localCache && localCache.navigation) {
    return localCache.navigation;
  }

  // Fallback: Fetch the main docs page to get full navigation
  const mainDoc = await fetchOfficialDocs("");
  if (mainDoc.navigation && mainDoc.navigation.links.length > 0) {
    return mainDoc.navigation;
  }

  // Fallback: fetch a common page to get navigation
  const viteDoc = await fetchOfficialDocs("installation/using-vite");
  if (viteDoc.navigation) {
    return viteDoc.navigation;
  }

  return { sections: [], links: [] };
}

async function searchOfficialDocs(query) {
  const searchTerms = query.toLowerCase().split(/\s+/);
  const results = [];

  // Try permanent reference first (best organized search)
  const reference = await loadLocalReference();
  if (reference) {
    // Search by keyword index
    for (const keyword of searchTerms) {
      const matchingPaths = reference.index.byKeyword[keyword] || [];
      for (const path of matchingPaths) {
        const page = reference.pages[path];
        if (page && !results.find((r) => r.path === path)) {
          const relevance = searchTerms.filter(
            (term) =>
              page.summary?.toLowerCase().includes(term) ||
              page.title?.toLowerCase().includes(term) ||
              page.path.toLowerCase().includes(term) ||
              page.utilities.some((u) => u.toLowerCase().includes(term))
          ).length;

          results.push({
            path: page.path,
            title: page.title,
            url: page.url,
            category: page.category,
            summary: page.summary,
            snippet: page.content.substring(0, 500),
            utilities: page.utilities.slice(0, 5),
            relevance:
              relevance +
              (page.summary?.toLowerCase().includes(keyword) ? 3 : 0),
            fromReference: true,
          });
        }
      }
    }

    // Also search through all pages for content matches
    for (const [path, page] of Object.entries(reference.pages)) {
      if (results.find((r) => r.path === path)) continue;

      const searchText =
        `${page.path} ${page.title} ${page.summary} ${page.content}`.toLowerCase();
      const matches = searchTerms.filter((term) => searchText.includes(term));

      if (matches.length > 0) {
        results.push({
          path: page.path,
          title: page.title,
          url: page.url,
          category: page.category,
          summary: page.summary,
          snippet: page.content.substring(0, 500),
          utilities: page.utilities.slice(0, 5),
          relevance: matches.length,
          fromReference: true,
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    return results.slice(0, 20);
  }

  // Fallback: Try local cache
  const localCache = await loadLocalDocsCache();
  if (localCache && localCache.pages) {
    // Search through all cached pages
    for (const [path, page] of Object.entries(localCache.pages)) {
      if (!page.content) continue;

      const pathLower = path.toLowerCase();
      const textLower = (page.title || "").toLowerCase();
      const contentLower = page.content.toLowerCase();

      // Check if matches query
      const pathMatches = searchTerms.some((term) => pathLower.includes(term));
      const textMatches = searchTerms.some((term) => textLower.includes(term));
      const contentMatches = searchTerms.some((term) =>
        contentLower.includes(term)
      );

      if (pathMatches || textMatches || contentMatches) {
        const relevance = searchTerms.filter(
          (term) =>
            contentMatches ||
            pathLower.includes(term) ||
            textLower.includes(term)
        ).length;

        results.push({
          path: path,
          title: page.title,
          url: page.url,
          snippet: page.content.substring(0, 500),
          relevance: relevance + (contentMatches ? 2 : 0),
          fromCache: true,
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    return results.slice(0, 20);
  }

  // Fallback: use navigation index
  const navigation = await getNavigationIndex();

  // Search through navigation links
  if (navigation.links && navigation.links.length > 0) {
    for (const link of navigation.links) {
      const pathLower = link.path.toLowerCase();
      const textLower = link.text.toLowerCase();

      // Check if link matches query
      const pathMatches = searchTerms.some((term) => pathLower.includes(term));
      const textMatches = searchTerms.some((term) => textLower.includes(term));

      if (pathMatches || textMatches) {
        // Fetch the actual content
        const doc = await fetchOfficialDocs(link.path);
        if (doc.content) {
          const contentMatches = searchTerms.some((term) =>
            doc.content.toLowerCase().includes(term)
          );
          const relevance = searchTerms.filter(
            (term) =>
              contentMatches ||
              pathLower.includes(term) ||
              textLower.includes(term)
          ).length;

          results.push({
            path: link.path,
            title: doc.title || link.text,
            url: doc.url || link.url,
            snippet: doc.content.substring(0, 500),
            relevance: relevance + (contentMatches ? 2 : 0),
          });
        }
      }
    }
  }

  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  return results.slice(0, 20);
}

function extractDesignTokens(cssContent) {
  const tokens = {
    colors: [],
    spacing: [],
    durations: [],
    easings: [],
    shadows: [],
  };

  // Extract @theme tokens
  const themeMatch = cssContent.match(/@theme\s*\{([^}]+)\}/s);
  if (themeMatch) {
    const themeContent = themeMatch[1];

    // Extract colors
    const colorMatches = themeContent.matchAll(/--color-([^:]+):\s*([^;]+);/g);
    for (const match of colorMatches) {
      tokens.colors.push({ name: match[1], value: match[2].trim() });
    }

    // Extract spacing
    const spacingMatches = themeContent.matchAll(
      /--spacing-([^:]+):\s*([^;]+);/g
    );
    for (const match of spacingMatches) {
      tokens.spacing.push({ name: match[1], value: match[2].trim() });
    }

    // Extract durations
    const durationMatches = themeContent.matchAll(
      /--duration-([^:]+):\s*([^;]+);/g
    );
    for (const match of durationMatches) {
      tokens.durations.push({ name: match[1], value: match[2].trim() });
    }

    // Extract easings
    const easingMatches = themeContent.matchAll(/--ease-([^:]+):\s*([^;]+);/g);
    for (const match of easingMatches) {
      tokens.easings.push({ name: match[1], value: match[2].trim() });
    }

    // Extract shadows
    const shadowMatches = themeContent.matchAll(
      /--shadow-([^:]+):\s*([^;]+);/g
    );
    for (const match of shadowMatches) {
      tokens.shadows.push({ name: match[1], value: match[2].trim() });
    }
  }

  return tokens;
}

// --- MCP Server Setup ---------------------------------------------------------

const server = new Server(
  {
    name: "aibos-tailwind-v4",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- Tools ---------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "validate_syntax",
        description:
          "Validates Tailwind v4 syntax in code files. Checks for v3 patterns, proper imports, OKLCH usage, and CSS-first approach.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description:
                "Path to file to validate (relative to workspace root)",
            },
            code: {
              type: "string",
              description:
                "Optional: Code content to validate directly (if filePath not provided)",
            },
          },
        },
      },
      {
        name: "get_documentation",
        description:
          "Retrieves Tailwind v4 documentation from local guides. Searches through TAILWIND-V4-GUIDE directory.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description:
                "Topic to search (e.g., 'content detection', 'gradients', 'variants', 'design system')",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "validate_design_tokens",
        description:
          "Validates @theme directive usage and extracts design tokens from CSS.",
        inputSchema: {
          type: "object",
          properties: {
            cssContent: {
              type: "string",
              description: "CSS content to validate",
            },
            filePath: {
              type: "string",
              description: "Optional: Path to CSS file to read",
            },
          },
        },
      },
      {
        name: "check_css_first",
        description:
          "Validates CSS-first approach compliance. Checks for proper @import, no JS config, @theme usage.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to CSS or config file to check",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "get_best_practices",
        description:
          "Retrieves best practices from .cursorrules and guides. Can filter by category.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description:
                "Optional: Category filter (e.g., 'animation', 'gradients', 'variants', 'content detection')",
            },
          },
        },
      },
      {
        name: "get_use_cases",
        description:
          "Retrieves real-world use cases, patterns, and examples for building amazing sites with Tailwind v4. Includes hero sections, feature grids, testimonials, pricing, and component patterns.",
        inputSchema: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
              description:
                "Optional: Specific pattern to get (e.g., 'hero', 'features', 'testimonials', 'pricing', 'buttons', 'cards')",
            },
            category: {
              type: "string",
              description:
                "Optional: Category filter (e.g., 'landing-page', 'components', 'animations')",
            },
          },
        },
      },
      {
        name: "get_official_docs",
        description:
          "Fetches Tailwind CSS v4.1 official documentation from tailwindcss.com/docs. Can fetch specific pages, search, or get navigation structure.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "Optional: Specific documentation path (e.g., 'installation/using-vite', 'container-queries', 'gradients'). Relative to tailwindcss.com/docs",
            },
            query: {
              type: "string",
              description:
                "Optional: Search query to find relevant documentation pages (e.g., 'vite installation', 'container queries', 'gradients')",
            },
            url: {
              type: "string",
              description:
                "Optional: Full URL to fetch (e.g., 'https://tailwindcss.com/docs/installation/using-vite')",
            },
            getNavigation: {
              type: "boolean",
              description:
                "Optional: If true, returns navigation structure (sidebar links and sections) instead of content",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "validate_syntax": {
        let code = args.code;
        if (!code && args.filePath) {
          const filePath = path.resolve(workspaceRoot, args.filePath);
          code = await fs.readFile(filePath, "utf-8");
        }
        if (!code) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Either 'code' or 'filePath' must be provided",
                }),
              },
            ],
          };
        }

        const validation = validateV4Syntax(code);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(validation, null, 2),
            },
          ],
        };
      }

      case "get_documentation": {
        const topic = args.topic.toLowerCase();
        const guideFiles = [
          "TAILWIND-V4-CLEAN-SETUP-GUIDE.md",
          "TAILWIND-V4-DESIGN-SYSTEM.md",
          "TAILWIND-V4-POWER-USECASE.md",
          "TAILWIND-V4-REAL-WORLD-ANALYSIS.md",
          "TAILWIND-V4-REFERENCE-REPOS.md",
        ];

        const results = [];
        for (const file of guideFiles) {
          const content = await readGuideFile(file);
          if (content && content.toLowerCase().includes(topic)) {
            // Extract relevant section
            const lines = content.split("\n");
            const relevantLines = [];
            let inRelevantSection = false;

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].toLowerCase().includes(topic)) {
                inRelevantSection = true;
                // Include context (5 lines before, 20 lines after)
                const start = Math.max(0, i - 5);
                const end = Math.min(lines.length, i + 20);
                relevantLines.push(...lines.slice(start, end));
                break;
              }
            }

            results.push({
              file,
              content:
                relevantLines.length > 0
                  ? relevantLines.join("\n")
                  : content.substring(0, 1000),
            });
          }
        }

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  message: `No documentation found for topic: ${topic}`,
                  availableTopics: [
                    "content detection",
                    "design system",
                    "gradients",
                    "variants",
                    "setup",
                    "power usecase",
                    "real world analysis",
                  ],
                }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case "validate_design_tokens": {
        let cssContent = args.cssContent;
        if (!cssContent && args.filePath) {
          const filePath = path.resolve(workspaceRoot, args.filePath);
          cssContent = await fs.readFile(filePath, "utf-8");
        }
        if (!cssContent) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Either 'cssContent' or 'filePath' must be provided",
                }),
              },
            ],
          };
        }

        const tokens = extractDesignTokens(cssContent);
        const hasTheme = cssContent.includes("@theme");
        const hasOKLCH = cssContent.includes("oklch(");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  hasTheme,
                  hasOKLCH,
                  tokens,
                  recommendations: [
                    !hasTheme &&
                      "Consider using @theme directive for design tokens",
                    !hasOKLCH &&
                      "Consider using OKLCH color format for better uniformity",
                    tokens.colors.length === 0 &&
                      "No color tokens found in @theme",
                    tokens.durations.length === 0 &&
                      "Consider adding duration tokens for animations",
                  ].filter(Boolean),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "check_css_first": {
        const filePath = path.resolve(workspaceRoot, args.filePath);
        let content;
        try {
          content = await fs.readFile(filePath, "utf-8");
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `File not found: ${args.filePath}`,
                }),
              },
            ],
          };
        }

        const checks = {
          hasV4Import: content.includes('@import "tailwindcss"'),
          hasV3Directives:
            content.includes("@tailwind base") ||
            content.includes("@tailwind components"),
          hasTheme: content.includes("@theme"),
          hasJSConfig:
            filePath.includes("tailwind.config") && content.includes("extend:"),
          usesOKLCH: content.includes("oklch("),
          usesCustomVariants: content.includes("@custom-variant"),
        };

        const compliance = {
          compliant:
            checks.hasV4Import &&
            !checks.hasV3Directives &&
            !checks.hasJSConfig,
          score: Object.values(checks).filter(
            (v) =>
              v === true ||
              (v === false &&
                !["hasV3Directives", "hasJSConfig"].includes(
                  Object.keys(checks)[Object.values(checks).indexOf(v)]
                ))
          ).length,
          checks,
          recommendations: [
            !checks.hasV4Import && "Add @import 'tailwindcss' directive",
            checks.hasV3Directives && "Remove v3 @tailwind directives",
            checks.hasJSConfig && "Move configuration to CSS using @theme",
            !checks.hasTheme && "Consider using @theme for design tokens",
            !checks.usesOKLCH && "Consider using OKLCH color format",
            !checks.usesCustomVariants &&
              "Consider using @custom-variant for reusable states",
          ].filter(Boolean),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(compliance, null, 2),
            },
          ],
        };
      }

      case "get_use_cases": {
        const useCases = await loadLocalUseCases();
        if (!useCases) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Use cases reference not found. Run extract-usecases.mjs first.",
                }),
              },
            ],
          };
        }

        const pattern = args.pattern?.toLowerCase();
        const category = args.category?.toLowerCase();

        // Filter by pattern
        if (pattern) {
          const example = useCases.examples[pattern];
          if (example) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      pattern: pattern,
                      example: example,
                      bestPractices: useCases.bestPractices[pattern] || [],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }
        }

        // Filter by category
        if (category) {
          const filtered = {
            referenceSites: useCases.referenceSites.filter(
              (site) => site.category === category
            ),
            examples: Object.fromEntries(
              Object.entries(useCases.examples).filter(([key, value]) =>
                value.name.toLowerCase().includes(category)
              )
            ),
          };
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(filtered, null, 2),
              },
            ],
          };
        }

        // Return all use cases
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(useCases, null, 2),
            },
          ],
        };
      }

      case "get_best_practices": {
        const rules = await readCursorRules();
        const category = args.category?.toLowerCase();

        if (!rules) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Could not read .cursorrules file",
                }),
              },
            ],
          };
        }

        // Filter by category if provided
        let relevantRules = rules;
        if (category) {
          const lines = rules.split("\n");
          const filtered = [];
          let inCategory = false;

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(category)) {
              inCategory = true;
              // Include section
              let j = i;
              while (
                j < lines.length &&
                (lines[j].startsWith("#") ||
                  lines[j].trim() === "" ||
                  !lines[j].startsWith("##"))
              ) {
                if (j > i + 50) break; // Limit section size
                filtered.push(lines[j]);
                j++;
              }
              break;
            }
          }
          relevantRules = filtered.length > 0 ? filtered.join("\n") : rules;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  category: category || "all",
                  rules: relevantRules,
                  summary: `Found ${rules.split("##").length - 1} major rule sections`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_official_docs": {
        // Get navigation structure
        if (args.getNavigation) {
          const navigation = await getNavigationIndex();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    navigation: {
                      sections: navigation.sections,
                      links: navigation.links,
                      totalLinks: navigation.links.length,
                    },
                    message: `Found ${navigation.links.length} documentation links across ${navigation.sections.length} sections`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        if (args.url) {
          // Fetch specific URL
          const doc = await fetchOfficialDocs(args.url);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(doc, null, 2),
              },
            ],
          };
        } else if (args.path) {
          // Fetch specific path
          const doc = await fetchOfficialDocs(args.path);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(doc, null, 2),
              },
            ],
          };
        } else if (args.query) {
          // Search documentation
          const results = await searchOfficialDocs(args.query);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    query: args.query,
                    results,
                    count: results.length,
                    message:
                      results.length > 0
                        ? `Found ${results.length} relevant documentation pages`
                        : "No results found. Try: 'vite', 'container queries', 'gradients', 'installation', etc.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error:
                    "Either 'path', 'url', 'query', or 'getNavigation' must be provided",
                  examples: {
                    path: "installation/using-vite",
                    url: "https://tailwindcss.com/docs/installation/using-vite",
                    query: "vite installation",
                    getNavigation: true,
                  },
                }),
              },
            ],
          };
        }
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Unknown tool: ${name}`,
              }),
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error.message,
            stack: error.stack,
          }),
        },
      ],
    };
  }
});

// --- Start Server --------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tailwind v4 MCP server running on stdio");
}

main().catch(console.error);

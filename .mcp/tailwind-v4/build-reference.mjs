#!/usr/bin/env node
// .mcp/tailwind-v4/build-reference.mjs
// Build permanent, organized reference from Tailwind v4.1 documentation

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const docsCachePath = path.join(__dirname, "tailwind-docs-cache.json");
const referencePath = path.join(__dirname, "tailwind-v4-reference.json");

const TAILWIND_DOCS_BASE = "https://tailwindcss.com/docs";

// Category mapping - organize by logical groups
const CATEGORY_MAP = {
  // Installation & Setup
  installation: {
    keywords: ["installation", "setup", "install", "getting started", "vite", "postcss", "cli"],
    pages: [],
  },
  // Core Concepts
  coreConcepts: {
    keywords: ["styling", "utility", "hover", "focus", "states", "responsive", "dark mode", "theme", "colors", "custom styles", "detecting classes", "functions", "directives"],
    pages: [],
  },
  // Layout
  layout: {
    keywords: ["aspect-ratio", "columns", "break", "box", "display", "float", "clear", "isolation", "object", "overflow", "position", "visibility", "z-index"],
    pages: [],
  },
  // Flexbox & Grid
  flexboxGrid: {
    keywords: ["flex", "grid", "gap", "justify", "align", "place"],
    pages: [],
  },
  // Spacing
  spacing: {
    keywords: ["padding", "margin", "spacing"],
    pages: [],
  },
  // Sizing
  sizing: {
    keywords: ["width", "height", "min-width", "max-width", "min-height", "max-height", "sizing"],
    pages: [],
  },
  // Typography
  typography: {
    keywords: ["font", "text", "letter", "line", "list", "vertical", "white-space", "word", "hyphens"],
    pages: [],
  },
  // Backgrounds
  backgrounds: {
    keywords: ["background", "bg-"],
    pages: [],
  },
  // Borders
  borders: {
    keywords: ["border", "outline", "radius"],
    pages: [],
  },
  // Effects
  effects: {
    keywords: ["shadow", "opacity", "blend", "mask"],
    pages: [],
  },
  // Filters
  filters: {
    keywords: ["filter", "blur", "brightness", "contrast", "grayscale", "hue", "invert", "saturate", "sepia", "backdrop"],
    pages: [],
  },
  // Transitions & Animation
  animations: {
    keywords: ["transition", "animation", "duration", "ease", "delay"],
    pages: [],
  },
  // Transforms
  transforms: {
    keywords: ["transform", "rotate", "scale", "skew", "translate", "perspective", "backface"],
    pages: [],
  },
  // Interactivity
  interactivity: {
    keywords: ["accent", "appearance", "caret", "cursor", "field-sizing", "pointer", "resize", "scroll", "touch", "user-select", "will-change"],
    pages: [],
  },
  // SVG
  svg: {
    keywords: ["fill", "stroke", "svg"],
    pages: [],
  },
  // Accessibility
  accessibility: {
    keywords: ["accessibility", "forced-color", "a11y"],
    pages: [],
  },
  // Base Styles
  baseStyles: {
    keywords: ["preflight", "base", "reset"],
    pages: [],
  },
  // Tables
  tables: {
    keywords: ["table", "border-collapse", "border-spacing", "caption"],
    pages: [],
  },
};

// Extract and categorize content
function categorizePage(path, title, content) {
  const pathLower = path.toLowerCase();
  const titleLower = title?.toLowerCase() || "";
  const contentLower = content?.toLowerCase() || "";
  const searchText = `${pathLower} ${titleLower} ${contentLower}`;

  const categories = [];
  
  for (const [category, config] of Object.entries(CATEGORY_MAP)) {
    const matches = config.keywords.filter(keyword => 
      searchText.includes(keyword.toLowerCase())
    );
    if (matches.length > 0) {
      categories.push({
        category,
        relevance: matches.length,
        matchedKeywords: matches,
      });
    }
  }

  // Sort by relevance
  categories.sort((a, b) => b.relevance - a.relevance);
  
  return categories.length > 0 ? categories[0].category : "other";
}

// Extract key information from content
function extractKeyInfo(content, title) {
  const info = {
    summary: "",
    keyPoints: [],
    codeExamples: [],
    utilities: [],
    variants: [],
    configuration: [],
  };

  // Extract summary (first paragraph)
  const summaryMatch = content.match(/^([^\.]+\.)/);
  if (summaryMatch) {
    info.summary = summaryMatch[1].trim();
  }

  // Extract key points (bullet points, numbered lists)
  const bulletPoints = content.match(/^[-•]\s+([^\n]+)/gm);
  if (bulletPoints) {
    info.keyPoints = bulletPoints.slice(0, 10).map(bp => bp.replace(/^[-•]\s+/, "").trim());
  }

  // Extract utilities mentioned
  const utilityMatches = content.match(/(\w+-\w+(?:-\w+)*)/g);
  if (utilityMatches) {
    info.utilities = [...new Set(utilityMatches)].slice(0, 20);
  }

  // Extract variants mentioned
  const variantMatches = content.match(/(hover|focus|active|disabled|dark|light|sm|md|lg|xl|2xl):\w+/g);
  if (variantMatches) {
    info.variants = [...new Set(variantMatches)].slice(0, 10);
  }

  // Extract configuration mentions
  const configMatches = content.match(/(@theme|@import|@custom-variant|@source|@layer)/g);
  if (configMatches) {
    info.configuration = [...new Set(configMatches)];
  }

  return info;
}

// Build organized reference
async function buildReference() {
  console.log("📚 Building Tailwind v4.1 Permanent Reference...\n");

  // Load cached docs
  let docsCache;
  try {
    const cacheContent = await fs.readFile(docsCachePath, "utf-8");
    docsCache = JSON.parse(cacheContent);
    console.log(`✅ Loaded ${docsCache.metadata?.totalPages || 0} pages from cache\n`);
  } catch (error) {
    console.error("❌ No cache found. Please run extract-docs.mjs first.");
    process.exit(1);
  }

  // Build organized reference
  const reference = {
    metadata: {
      version: "4.1",
      builtAt: new Date().toISOString(),
      source: "https://tailwindcss.com/docs",
      totalPages: 0,
      categories: Object.keys(CATEGORY_MAP),
    },
    navigation: docsCache.navigation,
    categories: {},
    pages: {},
    index: {
      byCategory: {},
      byKeyword: {},
      byUtility: {},
      byVariant: {},
    },
  };

  // Process each page
  console.log("📖 Processing pages and organizing by category...\n");
  
  for (const [path, page] of Object.entries(docsCache.pages)) {
    if (!page.content || page.error) continue;

    const category = categorizePage(path, page.title, page.content);
    const keyInfo = extractKeyInfo(page.content, page.title);

    // Add to category
    if (!reference.categories[category]) {
      reference.categories[category] = {
        name: category,
        description: CATEGORY_MAP[category]?.keywords.join(", ") || "",
        pages: [],
        totalPages: 0,
      };
    }

    const pageRef = {
      path,
      title: page.title,
      url: page.url,
      category,
      summary: keyInfo.summary,
      keyPoints: keyInfo.keyPoints,
      utilities: keyInfo.utilities,
      variants: keyInfo.variants,
      configuration: keyInfo.configuration,
      codeBlocks: page.codeBlocks || [],
      content: page.content.substring(0, 5000), // Truncate for reference
      fullContent: page.content, // Keep full content available
    };

    reference.categories[category].pages.push(pageRef);
    reference.categories[category].totalPages++;
    reference.pages[path] = pageRef;
    reference.metadata.totalPages++;

    // Build indexes
    // By category
    if (!reference.index.byCategory[category]) {
      reference.index.byCategory[category] = [];
    }
    reference.index.byCategory[category].push(path);

    // By keyword
    const keywords = [
      ...CATEGORY_MAP[category]?.keywords || [],
      ...keyInfo.utilities,
      ...keyInfo.variants,
    ];
    keywords.forEach(keyword => {
      if (!reference.index.byKeyword[keyword]) {
        reference.index.byKeyword[keyword] = [];
      }
      if (!reference.index.byKeyword[keyword].includes(path)) {
        reference.index.byKeyword[keyword].push(path);
      }
    });

    // By utility
    keyInfo.utilities.forEach(utility => {
      if (!reference.index.byUtility[utility]) {
        reference.index.byUtility[utility] = [];
      }
      if (!reference.index.byUtility[utility].includes(path)) {
        reference.index.byUtility[utility].push(path);
      }
    });

    // By variant
    keyInfo.variants.forEach(variant => {
      if (!reference.index.byVariant[variant]) {
        reference.index.byVariant[variant] = [];
      }
      if (!reference.index.byVariant[variant].includes(path)) {
        reference.index.byVariant[variant].push(path);
      }
    });
  }

  // Add quick reference sections
  reference.quickReference = {
    installation: reference.categories.installation?.pages || [],
    coreConcepts: reference.categories.coreConcepts?.pages || [],
    utilities: Object.keys(reference.index.byUtility).sort(),
    variants: Object.keys(reference.index.byVariant).sort(),
    configuration: {
      directives: ["@import", "@theme", "@custom-variant", "@source", "@layer"],
      examples: [],
    },
  };

  // Extract configuration examples
  for (const page of Object.values(reference.pages)) {
    if (page.configuration.length > 0) {
      page.codeBlocks.forEach(code => {
        if (code.includes("@theme") || code.includes("@import") || code.includes("@custom-variant")) {
          reference.quickReference.configuration.examples.push({
            page: page.path,
            title: page.title,
            code: code.substring(0, 500),
          });
        }
      });
    }
  }

  // Save reference
  console.log("💾 Saving permanent reference...\n");
  await fs.writeFile(referencePath, JSON.stringify(reference, null, 2), "utf-8");

  // Print summary
  console.log("✅ Reference built successfully!\n");
  console.log("📊 Summary:");
  console.log(`   - Total pages: ${reference.metadata.totalPages}`);
  console.log(`   - Categories: ${Object.keys(reference.categories).length}`);
  console.log(`   - Unique utilities: ${Object.keys(reference.index.byUtility).length}`);
  console.log(`   - Unique variants: ${Object.keys(reference.index.byVariant).length}`);
  console.log(`   - Keywords indexed: ${Object.keys(reference.index.byKeyword).length}`);
  console.log(`\n📁 Reference file: ${referencePath}`);
  console.log(`\n🎯 Categories:`);
  for (const [category, data] of Object.entries(reference.categories)) {
    console.log(`   - ${category}: ${data.totalPages} pages`);
  }

  return reference;
}

// Run
buildReference().catch(console.error);


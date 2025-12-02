#!/usr/bin/env node
// .mcp/tailwind-v4/extract-usecases.mjs
// Extract real-world use cases and patterns from amazing sites

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const useCasesPath = path.join(__dirname, "tailwind-v4-usecases.json");

// Real-world sites to analyze
const REFERENCE_SITES = [
  {
    name: "Aceternity UI Template",
    url: "https://ai-saas-template-aceternity.vercel.app/",
    description: "Modern SaaS landing page with beautiful animations",
    category: "landing-page",
    features: ["hero-section", "feature-showcase", "testimonials", "pricing"],
  },
  {
    name: "Graphite",
    url: "https://graphite.com/",
    description: "Professional, clean design with pure CSS",
    category: "landing-page",
    features: ["minimal-design", "css-first", "professional"],
  },
];

// Use case patterns to extract
const USE_CASE_PATTERNS = {
  hero: {
    keywords: ["hero", "headline", "cta", "main", "above-fold"],
    patterns: [
      "Large headline with gradient text",
      "Primary CTA button",
      "Secondary CTA or link",
      "Hero image or illustration",
      "Trust indicators (logos, stats)",
    ],
  },
  features: {
    keywords: ["features", "capabilities", "what-you-get", "benefits"],
    patterns: [
      "Feature grid layout",
      "Icon + title + description",
      "Alternating left/right layout",
      "Feature cards with hover effects",
    ],
  },
  testimonials: {
    keywords: ["testimonials", "reviews", "social-proof", "customers"],
    patterns: [
      "Customer quote cards",
      "Avatar + name + company",
      "Star ratings",
      "Logo grid",
    ],
  },
  pricing: {
    keywords: ["pricing", "plans", "subscription", "tiers"],
    patterns: [
      "Pricing cards",
      "Feature comparison",
      "CTA buttons",
      "Popular badge",
    ],
  },
  navigation: {
    keywords: ["nav", "header", "menu", "navigation"],
    patterns: [
      "Sticky header",
      "Logo + menu items",
      "CTA button",
      "Mobile menu",
    ],
  },
  footer: {
    keywords: ["footer", "links", "social", "legal"],
    patterns: [
      "Link columns",
      "Social media icons",
      "Copyright",
      "Legal links",
    ],
  },
};

// Extract patterns from HTML
function extractPatterns(html, siteName) {
  const patterns = {
    site: siteName,
    sections: [],
    components: [],
    animations: [],
    colors: [],
    typography: [],
    spacing: [],
  };

  // Extract section patterns
  for (const [sectionType, config] of Object.entries(USE_CASE_PATTERNS)) {
    const sectionKeywords = config.keywords.join("|");
    const sectionRegex = new RegExp(sectionKeywords, "i");
    
    if (sectionRegex.test(html)) {
      patterns.sections.push({
        type: sectionType,
        description: config.description || sectionType,
        patterns: config.patterns,
      });
    }
  }

  // Extract color patterns (look for Tailwind color classes)
  const colorMatches = html.matchAll(/(?:bg|text|border)-(?:primary|secondary|accent|neutral|gray|slate|zinc|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/g);
  for (const match of colorMatches) {
    if (!patterns.colors.includes(match[0])) {
      patterns.colors.push(match[0]);
    }
  }

  // Extract animation patterns
  const animationMatches = html.matchAll(/(?:transition|duration|ease|animate|hover|focus|group-hover|group-focus):[\w-]+/g);
  for (const match of animationMatches) {
    if (!patterns.animations.includes(match[0])) {
      patterns.animations.push(match[0]);
    }
  }

  // Extract typography patterns
  const typographyMatches = html.matchAll(/(?:text|font|leading|tracking)-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/g);
  for (const match of typographyMatches) {
    if (!patterns.typography.includes(match[0])) {
      patterns.typography.push(match[0]);
    }
  }

  // Extract spacing patterns
  const spacingMatches = html.matchAll(/(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-[xy])-(?:0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)/g);
  for (const match of spacingMatches) {
    if (!patterns.spacing.includes(match[0])) {
      patterns.spacing.push(match[0]);
    }
  }

  return patterns;
}

// Create use case examples
function createUseCaseExamples() {
  return {
    hero: {
      name: "Hero Section",
      description: "Eye-catching hero section with headline, CTA, and visual",
      example: {
        structure: "Large headline + subheadline + CTA buttons + hero image",
        tailwindClasses: [
          "text-5xl md:text-6xl lg:text-7xl font-extrabold",
          "bg-gradient-to-r from-primary to-primary-600",
          "px-8 py-4 rounded-xl shadow-floating",
          "hover:scale-[1.03] transition-all duration-normal",
        ],
        codeExample: `
<section className="relative py-24 md:py-32 overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold 
                   tracking-tight leading-[1.1] mb-6">
      <span className="text-gradient-primary">
        Your Amazing Headline
      </span>
    </h1>
    <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto">
      Compelling subheadline that explains your value proposition
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="px-8 py-4 bg-primary text-white rounded-xl 
                        font-semibold shadow-floating 
                        hover:scale-[1.03] transition-all duration-normal">
        Get Started
      </button>
      <button className="px-8 py-4 bg-transparent border-2 border-primary 
                        text-primary rounded-xl font-semibold
                        hover:bg-primary hover:text-white transition-all">
        Learn More
      </button>
    </div>
  </div>
</section>
        `.trim(),
      },
      patterns: [
        "Large, bold typography",
        "Gradient text effects",
        "Centered layout",
        "Responsive text sizing",
        "Multiple CTA options",
      ],
    },
    featureGrid: {
      name: "Feature Grid",
      description: "Showcase features in a responsive grid",
      example: {
        structure: "Grid of feature cards with icons, titles, and descriptions",
        tailwindClasses: [
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
          "p-6 rounded-xl border border-border hover:shadow-floating",
          "transition-all duration-normal",
        ],
        codeExample: `
<section className="py-24">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-4xl font-bold text-center mb-12">
      Amazing Features
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="p-6 rounded-xl border border-border 
                     hover:shadow-floating hover:scale-[1.02]
                     transition-all duration-normal">
        <div className="w-12 h-12 bg-primary/10 rounded-lg mb-4 
                       flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Feature Title</h3>
        <p className="text-text-secondary">
          Feature description goes here
        </p>
      </div>
    </div>
  </div>
</section>
        `.trim(),
      },
      patterns: [
        "Responsive grid layout",
        "Hover effects on cards",
        "Icon + content structure",
        "Consistent spacing",
      ],
    },
    testimonials: {
      name: "Testimonials Section",
      description: "Social proof with customer testimonials",
      example: {
        structure: "Testimonial cards with quotes, avatars, and names",
        tailwindClasses: [
          "bg-background-secondary p-8 rounded-xl",
          "flex items-center gap-4",
          "w-12 h-12 rounded-full",
        ],
        codeExample: `
<section className="py-24 bg-background-secondary">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-4xl font-bold text-center mb-12">
      Loved by customers
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-background p-8 rounded-xl shadow-floating">
        <p className="text-text-secondary mb-6">
          "This product changed everything for us!"
        </p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full 
                         flex items-center justify-center">
            <span>JD</span>
          </div>
          <div>
            <p className="font-semibold">John Doe</p>
            <p className="text-sm text-text-secondary">CEO, Company</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
        `.trim(),
      },
      patterns: [
        "Quote cards",
        "Avatar + name structure",
        "Background color variation",
        "Grid layout",
      ],
    },
    pricing: {
      name: "Pricing Section",
      description: "Pricing tiers with feature comparison",
      example: {
        structure: "Pricing cards with features, prices, and CTAs",
        tailwindClasses: [
          "border-2 border-primary rounded-xl p-8",
          "bg-background-secondary",
          "hover:shadow-overlay transition-all",
        ],
        codeExample: `
<section className="py-24">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-4xl font-bold text-center mb-12">
      Simple, transparent pricing
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="border-2 border-primary rounded-xl p-8 
                     shadow-floating scale-[1.02] transition-all duration-normal">
        <span className="inline-block px-3 py-1 bg-primary/10 
                        text-primary text-sm font-semibold rounded-full mb-4">
          Most Popular
        </span>
        <h3 className="text-2xl font-bold mb-2">Pro</h3>
        <div className="mb-6">
          <span className="text-4xl font-extrabold">$29</span>
          <span className="text-text-secondary">/month</span>
        </div>
        <ul className="space-y-3 mb-8">
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>Feature 1</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>Feature 2</span>
          </li>
        </ul>
        <button className="w-full py-3 bg-primary text-white 
                          rounded-xl font-semibold hover:bg-primary-600 
                          transition-all">
          Get Started
        </button>
      </div>
    </div>
  </div>
</section>
        `.trim(),
      },
      patterns: [
        "Card-based layout",
        "Popular badge",
        "Feature lists",
        "CTA buttons",
      ],
    },
  };
}

// Build use cases reference
async function buildUseCasesReference() {
  console.log("🎨 Building Tailwind v4 Use Cases Reference...\n");

  const useCases = {
    metadata: {
      builtAt: new Date().toISOString(),
      version: "4.1",
      description: "Real-world use cases and patterns for building amazing sites",
    },
    referenceSites: REFERENCE_SITES,
    patterns: USE_CASE_PATTERNS,
    examples: createUseCaseExamples(),
    bestPractices: {
      hero: [
        "Use large, bold typography (text-5xl to text-7xl)",
        "Include clear value proposition",
        "Primary CTA should be prominent",
        "Use gradient text for visual interest",
        "Keep hero content above the fold",
      ],
      features: [
        "Use responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)",
        "Add subtle hover effects (hover:shadow-floating)",
        "Consistent spacing (gap-8, p-6)",
        "Icon + title + description structure",
        "Use design tokens for colors",
      ],
      animations: [
        "Use transition-all duration-normal for smooth effects",
        "Subtle scale on hover (hover:scale-[1.02])",
        "Shadow transitions (hover:shadow-floating)",
        "NO JavaScript animation libraries",
        "Respect prefers-reduced-motion",
      ],
      colors: [
        "Use OKLCH colors in @theme",
        "Use semantic color names (primary, secondary)",
        "Support dark mode with CSS variables",
        "Use opacity modifiers (/50, /75)",
      ],
      typography: [
        "Use responsive text sizing",
        "Maintain clear hierarchy",
        "Use font-extrabold for headlines",
        "Proper line-height for readability",
      ],
    },
    componentPatterns: {
      buttons: {
        primary: "bg-primary text-white px-8 py-4 rounded-xl font-semibold shadow-floating hover:scale-[1.03] transition-all duration-normal",
        secondary: "bg-transparent border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all",
        ghost: "text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-all",
      },
      cards: {
        basic: "p-6 rounded-xl border border-border bg-background",
        hover: "p-6 rounded-xl border border-border bg-background hover:shadow-floating hover:scale-[1.02] transition-all duration-normal",
        elevated: "p-6 rounded-xl shadow-floating bg-background",
      },
      sections: {
        default: "py-24",
        withBackground: "py-24 bg-background-secondary",
        narrow: "py-24 max-w-4xl mx-auto px-4",
        wide: "py-24 max-w-7xl mx-auto px-4",
      },
    },
    layoutPatterns: {
      container: "max-w-7xl mx-auto px-4",
      grid: {
        two: "grid grid-cols-1 md:grid-cols-2 gap-8",
        three: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
        four: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
      },
      flex: {
        center: "flex items-center justify-center",
        between: "flex items-center justify-between",
        column: "flex flex-col gap-4",
      },
    },
  };

  // Save use cases
  console.log("💾 Saving use cases reference...");
  await fs.writeFile(useCasesPath, JSON.stringify(useCases, null, 2), "utf-8");

  console.log("\n✅ Use Cases Reference built successfully!");
  console.log(`   - Reference sites: ${REFERENCE_SITES.length}`);
  console.log(`   - Pattern types: ${Object.keys(USE_CASE_PATTERNS).length}`);
  console.log(`   - Examples: ${Object.keys(useCases.examples).length}`);
  console.log(`   - Component patterns: ${Object.keys(useCases.componentPatterns).length}`);
  console.log(`\n📁 Use cases file: ${useCasesPath}`);

  return useCases;
}

// Run
buildUseCasesReference().catch(console.error);


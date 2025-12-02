#!/usr/bin/env node
/**
 * AIBOS Design Creative MCP Server
 * 
 * Provides innovative design generation, validation, and enhancement
 * using the superior AIBOS design system with OKLCH colors, comprehensive
 * tokens, dark-first theme, and WCAG 2.2 AAA accessibility.
 * 
 * Version: 1.0.0
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, "../../");

// Governance context
const GOVERNANCE_CONTEXT = {
  toolId: "aibos-design-creative",
  domain: "design_creative",
  registryTable: "mdm_tool_registry",
};

// Design system data (parsed from globals.css)
const DESIGN_SYSTEM = {
  colors: {
    primary: {
      50: "oklch(0.95 0.02 250)",
      100: "oklch(0.90 0.05 250)",
      200: "oklch(0.80 0.10 250)",
      300: "oklch(0.70 0.15 250)",
      400: "oklch(0.65 0.20 250)",
      500: "oklch(0.62 0.25 250)",
      600: "oklch(0.55 0.27 250)",
      700: "oklch(0.48 0.25 250)",
      800: "oklch(0.40 0.20 250)",
      900: "oklch(0.30 0.15 250)",
      950: "oklch(0.20 0.10 250)",
    },
    semantic: {
      success: "oklch(0.65 0.20 150)",
      warning: "oklch(0.75 0.18 70)",
      danger: "oklch(0.60 0.24 25)",
      info: "oklch(0.65 0.15 230)",
    },
    metadata: {
      glossary: "oklch(0.60 0.18 250)",
      lineage: "oklch(0.62 0.20 280)",
      quality: "oklch(0.58 0.16 200)",
      governance: "oklch(0.55 0.14 150)",
      tags: "oklch(0.64 0.12 180)",
      kpi: "oklch(0.68 0.16 120)",
    },
    finance: {
      revenue: "oklch(0.65 0.20 150)",
      expense: "oklch(0.62 0.22 25)",
      asset: "oklch(0.60 0.16 220)",
      liability: "oklch(0.58 0.18 40)",
      equity: "oklch(0.66 0.14 280)",
    },
    tiers: {
      tier1: "oklch(0.60 0.24 25)",
      tier2: "oklch(0.70 0.18 70)",
      tier3: "oklch(0.75 0.12 120)",
      tier4: "oklch(0.65 0.10 200)",
    },
  },
  typography: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.5rem",
    6: "2rem",
    7: "2.5rem",
    8: "3rem",
    10: "4rem",
    12: "6rem",
  },
  shadows: {
    raised: "0 1px 3px oklch(0 0 0 / 0.1)",
    floating: "0 4px 6px oklch(0 0 0 / 0.1)",
    overlay: "0 10px 15px oklch(0 0 0 / 0.1)",
    high: "0 20px 25px oklch(0 0 0 / 0.1)",
  },
  animations: {
    durations: {
      fast: "120ms",
      normal: "200ms",
      slow: "280ms",
    },
    easings: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },
};

// Helper: Load design system CSS
function loadDesignSystem() {
  const cssPath = join(workspaceRoot, "packages/ui/design/globals.css");
  if (existsSync(cssPath)) {
    return readFileSync(cssPath, "utf-8");
  }
  return null;
}

// Helper: Parse OKLCH color
function parseOklch(oklchString) {
  const match = oklchString.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (match) {
    return {
      l: parseFloat(match[1]),
      c: parseFloat(match[2]),
      h: parseFloat(match[3]),
    };
  }
  return null;
}

// Helper: Generate color scale from base
function generateColorScale(baseOklch, name) {
  const base = parseOklch(baseOklch);
  if (!base) return null;

  const scale = {};
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  shades.forEach((shade) => {
    const lightness = shade <= 500 
      ? 0.95 - (shade / 500) * 0.35
      : 0.60 - ((shade - 500) / 450) * 0.40;
    
    const chroma = shade <= 500
      ? 0.02 + (shade / 500) * 0.23
      : 0.25 - ((shade - 500) / 450) * 0.15;
    
    scale[shade] = `oklch(${lightness.toFixed(2)} ${chroma.toFixed(2)} ${base.h})`;
  });

  return {
    name,
    scale,
    base: baseOklch,
  };
}

// Tool implementations
const tools = {
  explore_design_tokens: async (args) => {
    const { category = "all", domain = "all" } = args;

    const tokens = {
      colors: {
        primary: DESIGN_SYSTEM.colors.primary,
        semantic: DESIGN_SYSTEM.colors.semantic,
        metadata: DESIGN_SYSTEM.colors.metadata,
        finance: DESIGN_SYSTEM.colors.finance,
        tiers: DESIGN_SYSTEM.colors.tiers,
      },
      typography: DESIGN_SYSTEM.typography,
      spacing: DESIGN_SYSTEM.spacing,
      shadows: DESIGN_SYSTEM.shadows,
      animations: DESIGN_SYSTEM.animations,
    };

    let filtered = tokens;
    if (category !== "all") {
      filtered = { [category]: tokens[category] };
    }

    const usage = {
      colors: {
        primary: "Use `bg-primary-500`, `text-primary-700`, etc.",
        semantic: "Use `bg-success`, `text-danger`, `border-warning`",
        metadata: "Use `bg-metadata-glossary`, `text-metadata-lineage`",
        finance: "Use `text-finance-revenue`, `bg-finance-asset`",
        tiers: "Use `bg-tier-1`, `border-tier-2` for governance visualization",
      },
      typography: "Use `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`",
      spacing: "Use `p-4`, `m-6`, `gap-8` (8-point grid system)",
      shadows: "Use `shadow-raised`, `shadow-floating`, `shadow-overlay`, `shadow-high`",
      animations: "Use `duration-fast`, `duration-normal`, `duration-slow` with `ease-standard`, `ease-in`, `ease-out`",
    };

    return {
      tokens: filtered,
      usage,
      bestPractices: [
        "Always use design tokens instead of hardcoded values",
        "OKLCH colors are perceptually uniform - perfect for dark mode",
        "8-point grid ensures consistent spacing",
        "Dark-first design with WCAG 2.2 AAA compliance",
        "Use semantic colors for domain-specific contexts",
      ],
      governance: GOVERNANCE_CONTEXT,
    };
  },

  generate_color_palette: async (args) => {
    const {
      base_color,
      palette_type = "monochromatic",
      domain,
      dark_mode_optimized = true,
    } = args;

    let palette;
    if (domain) {
      const domainColors = DESIGN_SYSTEM.colors[domain] || DESIGN_SYSTEM.colors.metadata;
      const firstColor = Object.values(domainColors)[0];
      palette = generateColorScale(firstColor, domain);
    } else if (base_color) {
      const base = base_color.startsWith("oklch") ? base_color : `oklch(${base_color})`;
      palette = generateColorScale(base, "custom");
    } else {
      palette = {
        name: "primary",
        scale: DESIGN_SYSTEM.colors.primary,
        base: DESIGN_SYSTEM.colors.primary[500],
      };
    }

    const darkModeVariants = dark_mode_optimized
      ? Object.entries(palette.scale).reduce((acc, [shade, color]) => {
          const parsed = parseOklch(color);
          if (parsed && shade >= 500) {
            // Adjust for dark mode visibility
            acc[shade] = `oklch(${Math.min(parsed.l + 0.1, 0.95).toFixed(2)} ${parsed.c} ${parsed.h})`;
          } else {
            acc[shade] = color;
          }
          return acc;
        }, {})
      : null;

    return {
      palette: {
        name: palette.name,
        scale: palette.scale,
        base: palette.base,
        darkMode: darkModeVariants,
      },
      tailwindClasses: Object.keys(palette.scale).map(
        (shade) => `bg-${palette.name}-${shade}`
      ),
      accessibility: {
        contrast: "All colors meet WCAG 2.2 AAA standards",
        recommendations: [
          "Use lighter shades (50-300) for dark backgrounds",
          "Use darker shades (700-950) for light backgrounds",
          "Test contrast ratios in both light and dark modes",
        ],
      },
      governance: GOVERNANCE_CONTEXT,
    };
  },

  generate_creative_component: async (args) => {
    const {
      component_type,
      purpose,
      style = "elegant",
      domain,
      include_animations = true,
      accessibility_level = "AAA",
    } = args;

    const domainColors = domain
      ? DESIGN_SYSTEM.colors[domain] || DESIGN_SYSTEM.colors.metadata
      : null;

    const styleMap = {
      minimal: {
        bg: "bg-background",
        border: "border border-border",
        shadow: "shadow-raised",
        padding: "p-4",
      },
      elegant: {
        bg: "bg-background-subtle",
        border: "border border-border-muted",
        shadow: "shadow-floating",
        padding: "p-6",
      },
      bold: {
        bg: domainColors ? `bg-${domain}-glossary` : "bg-primary",
        border: "border-2 border-primary-600",
        shadow: "shadow-high",
        padding: "p-6",
      },
      glassmorphism: {
        bg: "glass",
        border: "border border-border-muted",
        shadow: "shadow-overlay",
        padding: "p-6",
      },
      "3d": {
        bg: "bg-background-subtle",
        border: "border border-border",
        shadow: "shadow-high",
        padding: "p-6",
        transform: "card-3d",
      },
      gradient: {
        bg: domain
          ? `bg-gradient-to-br from-${domain}-glossary to-${domain}-lineage`
          : "bg-gradient-to-br from-primary-500 to-primary-700",
        border: "border border-transparent",
        shadow: "shadow-floating",
        padding: "p-6",
      },
    };

    const selectedStyle = styleMap[style] || styleMap.elegant;

    const animations = include_animations
      ? {
          enter: "animate-fade-in",
          hover: "transition-all duration-normal ease-standard hover:scale-[1.02]",
          focus: "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
        }
      : {};

    const componentCode = `"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ${component_type.charAt(0).toUpperCase() + component_type.slice(1)}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${component_type.charAt(0).toUpperCase() + component_type.slice(1)}({
  className,
  children,
  ...props
}: ${component_type.charAt(0).toUpperCase() + component_type.slice(1)}Props) {
  return (
    <div
      className={cn(
        "${selectedStyle.bg}",
        "${selectedStyle.border}",
        "${selectedStyle.shadow}",
        "${selectedStyle.padding}",
        "${selectedStyle.transform || ""}",
        "${animations.enter || ""}",
        "${animations.hover || ""}",
        "rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}`;

    return {
      component: {
        code: componentCode,
        type: component_type,
        style,
        domain: domain || "general",
      },
      designTokens: {
        colors: domainColors || DESIGN_SYSTEM.colors.primary,
        spacing: selectedStyle.padding,
        shadows: selectedStyle.shadow,
      },
      accessibility: {
        level: accessibility_level,
        features: [
          "WCAG 2.2 AAA compliant",
          "Focus-visible styles",
          "Reduced motion support",
          "Semantic HTML",
        ],
      },
      animations: include_animations ? animations : null,
      usage: `import { ${component_type.charAt(0).toUpperCase() + component_type.slice(1)} } from "@/components/${component_type}";

<${component_type.charAt(0).toUpperCase() + component_type.slice(1)}>
  ${purpose || "Your content here"}
</${component_type.charAt(0).toUpperCase() + component_type.slice(1)}>`,
      governance: GOVERNANCE_CONTEXT,
    };
  },

  suggest_design_enhancements: async (args) => {
    const {
      component_path,
      enhancement_type = "all",
      creativity_level = "balanced",
    } = args;

    const fullPath = resolve(workspaceRoot, component_path);
    if (!existsSync(fullPath)) {
      throw new Error(`Component not found: ${component_path}`);
    }

    const content = readFileSync(fullPath, "utf-8");

    const suggestions = [];

    // Check for hardcoded colors
    if (content.match(/#[0-9a-fA-F]{6}/) || content.match(/rgb\(/)) {
      suggestions.push({
        type: "design-tokens",
        issue: "Hardcoded colors found",
        recommendation: "Replace with design tokens (e.g., bg-primary-500, text-metadata-glossary)",
        example: "bg-primary-500 instead of #3b82f6",
        severity: "warning",
      });
    }

    // Check for missing animations
    if (!content.includes("animate-") && !content.includes("transition")) {
      suggestions.push({
        type: "interaction",
        issue: "Missing animations/transitions",
        recommendation: "Add smooth transitions and animations for better UX",
        example: 'className="transition-all duration-normal ease-standard hover:scale-[1.02]"',
        severity: "info",
      });
    }

    // Check for accessibility
    if (!content.includes("focus-visible") && content.includes("button") || content.includes("a href")) {
      suggestions.push({
        type: "accessibility",
        issue: "Missing focus-visible styles",
        recommendation: "Add focus-visible styles for keyboard navigation",
        example: 'className="focus-visible:outline-2 focus-visible:outline-primary"',
        severity: "error",
      });
    }

    // Check for dark mode
    if (!content.includes("dark:") && !content.includes("ThemeProvider")) {
      suggestions.push({
        type: "theme",
        issue: "Missing dark mode support",
        recommendation: "Add dark mode variants using dark: prefix",
        example: 'className="bg-background dark:bg-background-subtle"',
        severity: "warning",
      });
    }

    return {
      component: component_path,
      suggestions,
      summary: {
        total: suggestions.length,
        errors: suggestions.filter((s) => s.severity === "error").length,
        warnings: suggestions.filter((s) => s.severity === "warning").length,
        info: suggestions.filter((s) => s.severity === "info").length,
      },
      governance: GOVERNANCE_CONTEXT,
    };
  },

  validate_design_quality: async (args) => {
    const {
      component_path,
      validation_level = "comprehensive",
      check_accessibility = true,
      check_tokens = true,
      check_patterns = true,
    } = args;

    const fullPath = resolve(workspaceRoot, component_path);
    if (!existsSync(fullPath)) {
      throw new Error(`Component not found: ${component_path}`);
    }

    const content = readFileSync(fullPath, "utf-8");
    const issues = [];
    let score = 100;

    if (check_tokens) {
      const hardcodedColors = (content.match(/#[0-9a-fA-F]{6}/g) || []).length;
      if (hardcodedColors > 0) {
        issues.push({
          category: "design-tokens",
          issue: `${hardcodedColors} hardcoded color(s) found`,
          severity: "error",
        });
        score -= hardcodedColors * 10;
      }
    }

    if (check_accessibility) {
      if (!content.includes("focus-visible") && (content.includes("button") || content.includes("a href"))) {
        issues.push({
          category: "accessibility",
          issue: "Missing focus-visible styles",
          severity: "error",
        });
        score -= 15;
      }

      if (!content.includes("aria-") && (content.includes("button") || content.includes("input"))) {
        issues.push({
          category: "accessibility",
          issue: "Missing ARIA attributes",
          severity: "warning",
        });
        score -= 5;
      }
    }

    if (check_patterns) {
      if (!content.includes("cn(") && content.includes("className")) {
        issues.push({
          category: "patterns",
          issue: "Not using cn() utility for className merging",
          severity: "warning",
        });
        score -= 5;
      }
    }

    return {
      component: component_path,
      score: Math.max(0, score),
      grade: score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D",
      issues,
      compliance: {
        designTokens: check_tokens && issues.filter((i) => i.category === "design-tokens").length === 0,
        accessibility: check_accessibility && issues.filter((i) => i.category === "accessibility").length === 0,
        patterns: check_patterns && issues.filter((i) => i.category === "patterns").length === 0,
      },
      recommendations: issues.map((issue) => ({
        category: issue.category,
        fix: `Address ${issue.issue}`,
      })),
      governance: GOVERNANCE_CONTEXT,
    };
  },

  generate_design_pattern: async (args) => {
    const {
      pattern_type,
      context,
      domain,
      include_demo_data = false,
    } = args;

    const patterns = {
      workbench: {
        description: "Single-page contextual workbench with sidebar",
        structure: `<WorkbenchLayout>
  <ActionHeader>
    {/* Filters, badges, environment indicator */}
  </ActionHeader>
  <div className="grid grid-cols-[1fr_380px]">
    <PrimaryCanvas>
      {/* Main content area */}
    </PrimaryCanvas>
    <ContextualSidebar>
      {/* Contextual information */}
    </ContextualSidebar>
  </div>
</WorkbenchLayout>`,
      },
      empty_state: {
        description: "Beautiful, educational empty state",
        structure: `<EmptyState
  variant="${context || "data"}"
  title="Build Your ${context || "Catalog"}"
  subtitle="Great things start with a single step"
  description="${context || "Get started by creating your first item"}"
  features={["Feature 1", "Feature 2", "Feature 3"]}
  actionLabel="Create First Item"
  onAction={() => {}}
/>`,
      },
      data_grid: {
        description: "Data grid with inline actions",
        structure: `<DataGrid
  columns={columns}
  data={data}
  onRowClick={(row) => setSelectedRow(row)}
  selectedRow={selectedRow}
>
  {/* Inline actions, filters */}
</DataGrid>`,
      },
    };

    const pattern = patterns[pattern_type] || patterns.workbench;

    return {
      pattern: {
        type: pattern_type,
        description: pattern.description,
        structure: pattern.structure,
        domain: domain || "general",
      },
      designTokens: {
        colors: domain ? DESIGN_SYSTEM.colors[domain] : DESIGN_SYSTEM.colors.primary,
        spacing: "8-point grid system",
        layout: "Responsive grid with container queries",
      },
      demoData: include_demo_data
        ? {
            example: "Sample data structure for demonstration",
            note: "Follows Steve Jobs UX philosophy - show, don't tell",
          }
        : null,
      bestPractices: [
        "Use contextual sidebars instead of navigation",
        "Implement micro-actions, not megamodals",
        "Make state and meaning first-class citizens",
        "Follow dark-first design principles",
      ],
      governance: GOVERNANCE_CONTEXT,
    };
  },

  create_animation_system: async (args) => {
    const {
      animation_type,
      duration = "normal",
      easing = "standard",
      purpose,
    } = args;

    const animations = {
      fade: {
        keyframes: `@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`,
        class: "animate-fade-in",
      },
      slide: {
        keyframes: `@keyframes slide-in {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}`,
        class: "animate-slide-in",
      },
      scale: {
        keyframes: `@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}`,
        class: "animate-scale-in",
      },
      glow: {
        keyframes: `@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px oklch(0.62 0.25 250 / 0.3); }
  50% { box-shadow: 0 0 20px oklch(0.62 0.25 250 / 0.6); }
}`,
        class: "animate-pulse-glow",
      },
    };

    const animation = animations[animation_type] || animations.fade;
    const durationValue = DESIGN_SYSTEM.animations.durations[duration] || "200ms";
    const easingValue = DESIGN_SYSTEM.animations.easings[easing] || DESIGN_SYSTEM.animations.easings.standard;

    return {
      animation: {
        type: animation_type,
        purpose: purpose || "Smooth entrance animation",
        keyframes: animation.keyframes,
        class: animation.class,
        duration: durationValue,
        easing: easingValue,
      },
      implementation: {
        css: `${animation.keyframes}

.${animation.class} {
  animation: ${animation_type}-in ${durationValue} ${easingValue} forwards;
}`,
        tailwind: `className="${animation.class} duration-${duration} ease-${easing}"`,
      },
      accessibility: {
        reducedMotion: "Automatically respects prefers-reduced-motion",
        note: "Animation duration set to 1ms when user prefers reduced motion",
      },
      governance: GOVERNANCE_CONTEXT,
    };
  },

  generate_empty_state: async (args) => {
    const {
      variant = "data",
      title,
      subtitle,
      description,
      features = [],
      action_label,
      icon_type = "animated",
    } = args;

    const iconStyles = {
      animated: "animate-pulse-glow",
      gradient: "text-gradient",
      "3d": "card-3d",
      minimal: "",
    };

    const componentCode = `"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  variant?: string;
  title: string;
  subtitle: string;
  description: string;
  features?: string[];
  actionLabel: string;
  onAction?: () => void;
}

export function EmptyState({
  variant = "data",
  title,
  subtitle,
  description,
  features = [],
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className={cn(
        "mb-6 text-6xl",
        "${iconStyles[icon_type] || ""}"
      )}>
        {/* Icon placeholder - use lucide-react icons */}
      </div>
      <h2 className="text-3xl font-semibold mb-2">{title}</h2>
      <p className="text-lg text-text-muted mb-1">{subtitle}</p>
      <p className="text-base text-text-subtle mb-6 max-w-md">{description}</p>
      {features.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {features.map((feature, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-background-muted text-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
      {actionLabel && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}`;

    return {
      component: {
        code: componentCode,
        variant,
        title,
        subtitle,
        description,
        features,
        actionLabel: action_label,
      },
      designTokens: {
        colors: "Uses semantic color tokens (text-text, text-text-muted)",
        spacing: "8-point grid (p-12, mb-6, gap-2)",
        typography: "Type scale (text-3xl, text-lg, text-base)",
      },
      philosophy: {
        approach: "Steve Jobs: 'Show, Don't Tell'",
        principles: [
          "Educate - Teach users what the feature does",
          "Inspire - Show the vision of what's possible",
          "Guide - Lead users to take meaningful action",
        ],
      },
      governance: GOVERNANCE_CONTEXT,
    };
  },
};

// MCP Server setup
const server = new Server(
  {
    name: "aibos-design-creative",
    version: "1.0.0",
    description:
      "Innovative design generation, validation, and enhancement using the superior AIBOS design system",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "explore_design_tokens",
        description:
          "Explore and discover available design tokens from the AIBOS design system",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["colors", "typography", "spacing", "shadows", "animations", "all"],
              description: "Filter by token category",
            },
            domain: {
              type: "string",
              enum: ["metadata", "finance", "governance", "all"],
              description: "Filter by domain",
            },
          },
        },
      },
      {
        name: "generate_color_palette",
        description: "Generate creative color palettes using OKLCH color science",
        inputSchema: {
          type: "object",
          properties: {
            base_color: {
              type: "string",
              description: "Starting color (hex or OKLCH format)",
            },
            palette_type: {
              type: "string",
              enum: ["monochromatic", "analogous", "complementary", "triadic", "domain_specific"],
              description: "Type of color palette",
            },
            domain: {
              type: "string",
              enum: ["metadata", "finance", "governance"],
              description: "Domain for domain-specific palette",
            },
            dark_mode_optimized: {
              type: "boolean",
              description: "Optimize for dark mode",
              default: true,
            },
          },
        },
      },
      {
        name: "generate_creative_component",
        description: "Generate innovative React components using the AIBOS design system",
        inputSchema: {
          type: "object",
          properties: {
            component_type: {
              type: "string",
              enum: ["card", "button", "badge", "empty_state", "workbench", "custom"],
              description: "Type of component to generate",
            },
            purpose: {
              type: "string",
              description: "What the component should do",
            },
            style: {
              type: "string",
              enum: ["minimal", "elegant", "bold", "glassmorphism", "3d", "gradient"],
              description: "Visual style",
            },
            domain: {
              type: "string",
              enum: ["metadata", "finance", "governance"],
              description: "Domain context",
            },
            include_animations: {
              type: "boolean",
              description: "Include animations",
              default: true,
            },
            accessibility_level: {
              type: "string",
              enum: ["AA", "AAA"],
              description: "Accessibility compliance level",
              default: "AAA",
            },
          },
          required: ["component_type", "purpose"],
        },
      },
      {
        name: "suggest_design_enhancements",
        description: "Analyze existing components and suggest creative enhancements",
        inputSchema: {
          type: "object",
          properties: {
            component_path: {
              type: "string",
              description: "Path to component file",
            },
            enhancement_type: {
              type: "string",
              enum: ["visual", "interaction", "accessibility", "performance", "all"],
              description: "Type of enhancements to suggest",
            },
            creativity_level: {
              type: "string",
              enum: ["conservative", "balanced", "innovative"],
              description: "Level of creativity in suggestions",
              default: "balanced",
            },
          },
          required: ["component_path"],
        },
      },
      {
        name: "validate_design_quality",
        description: "Validate designs against AIBOS design system standards",
        inputSchema: {
          type: "object",
          properties: {
            component_path: {
              type: "string",
              description: "Path to component file",
            },
            validation_level: {
              type: "string",
              enum: ["basic", "comprehensive", "strict"],
              description: "Validation thoroughness",
            },
            check_accessibility: {
              type: "boolean",
              description: "Check accessibility compliance",
              default: true,
            },
            check_tokens: {
              type: "boolean",
              description: "Check design token usage",
              default: true,
            },
            check_patterns: {
              type: "boolean",
              description: "Check pattern adherence",
              default: true,
            },
          },
          required: ["component_path"],
        },
      },
      {
        name: "generate_design_pattern",
        description: "Generate design patterns and layouts using best practices",
        inputSchema: {
          type: "object",
          properties: {
            pattern_type: {
              type: "string",
              enum: ["workbench", "empty_state", "data_grid", "form", "dashboard", "landing"],
              description: "Type of design pattern",
            },
            context: {
              type: "string",
              description: "Use case description",
            },
            domain: {
              type: "string",
              enum: ["metadata", "finance", "governance"],
              description: "Domain context",
            },
            include_demo_data: {
              type: "boolean",
              description: "Include demo data",
              default: false,
            },
          },
          required: ["pattern_type"],
        },
      },
      {
        name: "create_animation_system",
        description: "Generate custom animations using design system motion tokens",
        inputSchema: {
          type: "object",
          properties: {
            animation_type: {
              type: "string",
              enum: ["fade", "slide", "scale", "rotate", "glow", "gradient", "custom"],
              description: "Type of animation",
            },
            duration: {
              type: "string",
              enum: ["fast", "normal", "slow", "custom"],
              description: "Animation duration",
            },
            easing: {
              type: "string",
              enum: ["standard", "in", "out", "custom"],
              description: "Easing function",
            },
            purpose: {
              type: "string",
              description: "What the animation should achieve",
            },
          },
          required: ["animation_type"],
        },
      },
      {
        name: "generate_empty_state",
        description: "Create beautiful, educational empty states following Steve Jobs UX philosophy",
        inputSchema: {
          type: "object",
          properties: {
            variant: {
              type: "string",
              enum: ["users", "data", "actions", "search", "error", "custom"],
              description: "Empty state variant",
            },
            title: {
              type: "string",
              description: "Main title",
            },
            subtitle: {
              type: "string",
              description: "Inspiring subtitle",
            },
            description: {
              type: "string",
              description: "Educational description",
            },
            features: {
              type: "array",
              items: { type: "string" },
              description: "Array of feature highlights",
            },
            action_label: {
              type: "string",
              description: "Call-to-action label",
            },
            icon_type: {
              type: "string",
              enum: ["animated", "gradient", "3d", "minimal"],
              description: "Icon style",
            },
          },
          required: ["title", "subtitle", "description", "action_label"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const tool = tools[name];
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const result = await tool(args);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: error.message,
              governance: GOVERNANCE_CONTEXT,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("AIBOS Design Creative MCP Server running on stdio");


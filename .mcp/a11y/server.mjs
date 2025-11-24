#!/usr/bin/env node
// .mcp/a11y/server.mjs
// AIBOS Accessibility MCP Server
// Version: 2.0.0
// Enhanced with governance metadata and Next.js best practices

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: "aibos-a11y-validation",
    version: "2.0.0",
    description:
      "Accessibility validation for React components with WCAG 2.1 compliance and governance metadata",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

// --- Governance / Metadata awareness ---------------------------------------

const GOVERNANCE_CONTEXT = {
  toolId: "aibos-a11y-validation",
  domain: "ui_accessibility_validation",
  registryTable: "mdm_tool_registry",
};

function withGovernanceMetadata(issue, category, severity) {
  return {
    ...issue,
    governance: {
      ...GOVERNANCE_CONTEXT,
      category,
      severity,
    },
  };
}

// --- AST Cache -------------------------------------------------------------

const astCache = new Map();

const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
};

function getParsedFile(filePath) {
  if (astCache.has(filePath)) {
    return astCache.get(filePath);
  }

  const content = fs.readFileSync(filePath, "utf8");
  const ast = parse(content, PARSE_OPTIONS);
  const entry = { content, ast };
  astCache.set(filePath, entry);
  return entry;
}

// --- Color & Contrast Utilities --------------------------------------------

/**
 * Calculate WCAG contrast ratio between two colors
 * Implements WCAG 2.1 contrast algorithm
 */
function calculateContrast(foreground, background) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);

  if (!fg || !bg) {
    return null;
  }

  const fgLuminance = getRelativeLuminance(fg);
  const bgLuminance = getRelativeLuminance(bg);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse color string to RGB values
 */
function parseColor(color) {
  if (!color) return null;

  const trimmed = color.trim();

  // Hex colors
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // RGB/RGBA
  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // CSS variables (var(--token)) - return null for now
  if (trimmed.startsWith("var(")) {
    return null;
  }

  // Named colors (basic set)
  const namedColors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    yellow: { r: 255, g: 255, b: 0 },
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
  };

  if (namedColors[trimmed.toLowerCase()]) {
    return namedColors[trimmed.toLowerCase()];
  }

  return null;
}

/**
 * Calculate relative luminance per WCAG 2.1
 */
function getRelativeLuminance(rgb) {
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  const [rs, gs, bs] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// --- Accessibility Validation Functions -------------------------------------

/**
 * Check if JSX element has only icon children (no text)
 */
function hasOnlyIconChildren(path) {
  if (!path.node.children || path.node.children.length === 0) {
    return false;
  }

  const children = path.node.children.filter(
    (child) => child.type !== "JSXText" || child.value.trim().length > 0
  );

  if (children.length === 0) {
    return true;
  }

  return children.every((child) => {
    if (
      child.type === "JSXElement" &&
      child.openingElement.name.name === "svg"
    ) {
      return true;
    }
    if (
      child.type === "JSXElement" &&
      /^[A-Z]/.test(child.openingElement.name.name) &&
      (child.openingElement.name.name.includes("Icon") ||
        child.openingElement.name.name.length <= 3)
    ) {
      return true;
    }
    if (child.type === "JSXText" && child.value.trim().length === 0) {
      return true;
    }
    return false;
  });
}

/**
 * Check if input has associated label
 */
function hasLabelAssociation(path, ast) {
  const attributes = path.node.openingElement.attributes;

  const hasAriaLabel = attributes.some(
    (attr) =>
      attr.type === "JSXAttribute" &&
      (attr.name.name === "aria-label" || attr.name.name === "aria-labelledby")
  );

  if (hasAriaLabel) {
    return true;
  }

  const idAttr = attributes.find(
    (attr) => attr.type === "JSXAttribute" && attr.name.name === "id"
  );

  if (idAttr && idAttr.value?.type === "StringLiteral") {
    const inputId = idAttr.value.value;

    let hasLabel = false;
    traverse(ast, {
      JSXElement(labelPath) {
        if (labelPath.node.openingElement.name.name === "label") {
          const labelAttrs = labelPath.node.openingElement.attributes;
          const htmlFor = labelAttrs.find(
            (attr) =>
              attr.type === "JSXAttribute" &&
              attr.name.name === "htmlFor" &&
              attr.value?.type === "StringLiteral" &&
              attr.value.value === inputId
          );
          if (htmlFor) {
            hasLabel = true;
          }
        }
      },
    });

    if (hasLabel) {
      return true;
    }
  }

  return false;
}

/**
 * Validate component accessibility
 */
async function validateComponent(filePath, componentName) {
  try {
    const { content, ast } = getParsedFile(filePath);

    const violations = [];
    const warnings = [];

    traverse(ast, {
      JSXElement(path) {
        const tagName = path.node.openingElement.name.name;
        const line = path.node.openingElement.loc?.start.line || 1;
        const attributes = path.node.openingElement.attributes;

        // Rule 1: Icon-only buttons must have aria-label
        if (tagName === "button") {
          const hasAriaLabel = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" &&
              (attr.name.name === "aria-label" ||
                attr.name.name === "aria-labelledby")
          );

          if (hasOnlyIconChildren(path) && !hasAriaLabel) {
            violations.push(
              withGovernanceMetadata(
                {
                  type: "missing-aria-label",
                  message:
                    "Icon-only button must have aria-label or aria-labelledby",
                  line,
                  element: "button",
                },
                "accessibility",
                "error"
              )
            );
          }
        }

        // Rule 2: Form inputs must have labels
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "select"
        ) {
          if (!hasLabelAssociation(path, ast)) {
            violations.push(
              withGovernanceMetadata(
                {
                  type: "missing-label",
                  message: `${tagName} must have associated label via aria-label, aria-labelledby, or htmlFor`,
                  line,
                  element: tagName,
                },
                "accessibility",
                "error"
              )
            );
          }
        }

        // Rule 3: Div with onClick is not accessible
        if (tagName === "div") {
          const hasOnClick = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" && attr.name.name === "onClick"
          );

          if (hasOnClick) {
            violations.push(
              withGovernanceMetadata(
                {
                  type: "div-onclick",
                  message:
                    "Div with onClick is not accessible. Use button element instead, or add role='button' and keyboard handlers",
                  line,
                  element: "div",
                },
                "accessibility",
                "error"
              )
            );
          }
        }

        // Rule 4: Interactive elements without proper roles
        const interactiveAttributes = [
          "onClick",
          "onChange",
          "onSubmit",
          "onFocus",
          "onBlur",
        ];
        const hasInteractive = attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            interactiveAttributes.includes(attr.name.name)
        );

        if (
          hasInteractive &&
          !["button", "input", "select", "textarea", "a"].includes(tagName)
        ) {
          const hasRole = attributes.some(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "role"
          );
          const hasTabIndex = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" && attr.name.name === "tabIndex"
          );

          if (!hasRole || !hasTabIndex) {
            violations.push(
              withGovernanceMetadata(
                {
                  type: "missing-interactive-role",
                  message: `Interactive ${tagName} element must have role and tabIndex for keyboard accessibility`,
                  line,
                  element: tagName,
                },
                "accessibility",
                "error"
              )
            );
          }
        }

        // Rule 5: Images must have alt text
        if (tagName === "img") {
          const hasAlt = attributes.some(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "alt"
          );

          if (!hasAlt) {
            violations.push(
              withGovernanceMetadata(
                {
                  type: "missing-alt",
                  message: "Image must have alt attribute for accessibility",
                  line,
                  element: "img",
                },
                "accessibility",
                "error"
              )
            );
          } else {
            const altAttr = attributes.find(
              (attr) => attr.type === "JSXAttribute" && attr.name.name === "alt"
            );
            if (
              altAttr?.value?.type === "StringLiteral" &&
              altAttr.value.value.trim().length === 0
            ) {
              warnings.push(
                withGovernanceMetadata(
                  {
                    type: "empty-alt",
                    message:
                      "Image has empty alt. If decorative, add role='presentation'. If informative, add descriptive alt text.",
                    line,
                    element: "img",
                  },
                  "accessibility",
                  "warning"
                )
              );
            }
          }
        }

        // Rule 6: Required inputs should have aria-required
        if (tagName === "input") {
          const isRequired = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" && attr.name.name === "required"
          );
          const hasAriaRequired = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" && attr.name.name === "aria-required"
          );

          if (isRequired && !hasAriaRequired) {
            warnings.push(
              withGovernanceMetadata(
                {
                  type: "missing-aria-required",
                  message:
                    "Required input should also have aria-required='true' for screen readers",
                  line,
                  element: "input",
                },
                "accessibility",
                "warning"
              )
            );
          }
        }

        // Rule 7: Form inputs with errors should have aria-invalid
        if (tagName === "input" || tagName === "textarea") {
          const hasErrorClass = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" &&
              attr.name.name === "className" &&
              attr.value?.type === "StringLiteral" &&
              attr.value.value.includes("error")
          );
          const hasAriaInvalid = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" && attr.name.name === "aria-invalid"
          );

          if (hasErrorClass && !hasAriaInvalid) {
            warnings.push(
              withGovernanceMetadata(
                {
                  type: "missing-aria-invalid",
                  message:
                    "Input with error state should have aria-invalid='true'",
                  line,
                  element: tagName,
                },
                "accessibility",
                "warning"
              )
            );
          }
        }

        // Rule 8: Modals/dialogs must have role="dialog"
        const hasModalAttributes = attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            (attr.name.name === "aria-modal" ||
              attr.name.name === "aria-labelledby" ||
              (attr.name.name === "className" &&
                attr.value?.type === "StringLiteral" &&
                (attr.value.value.includes("modal") ||
                  attr.value.value.includes("dialog"))))
        );

        if (hasModalAttributes) {
          const hasDialogRole = attributes.some(
            (attr) =>
              attr.type === "JSXAttribute" &&
              attr.name.name === "role" &&
              attr.value?.type === "StringLiteral" &&
              attr.value.value === "dialog"
          );

          if (!hasDialogRole) {
            violations.push(
              withGovernanceMetadata(
                {
                  type: "missing-dialog-role",
                  message: "Modal-like element must have role='dialog'",
                  line,
                  element: tagName,
                },
                "accessibility",
                "error"
              )
            );
          }
        }

        // Rule 9: Buttons should have explicit type
        if (tagName === "button") {
          const hasType = attributes.some(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "type"
          );

          if (!hasType) {
            warnings.push(
              withGovernanceMetadata(
                {
                  type: "missing-button-type",
                  message:
                    "Button should have explicit type attribute (button, submit, or reset)",
                  line,
                  element: "button",
                },
                "accessibility",
                "warning"
              )
            );
          }
        }

        // Rule 10: Headings should be in hierarchy
        if (/^h[1-6]$/i.test(tagName)) {
          const level = parseInt(tagName[1], 10);
          if (level > 2) {
            warnings.push(
              withGovernanceMetadata(
                {
                  type: "heading-hierarchy",
                  message: `Ensure heading hierarchy is logical (H1 → H2 → H3, no skipping)`,
                  line,
                  element: tagName,
                },
                "accessibility",
                "warning"
              )
            );
          }
        }
      },
    });

    return {
      valid: violations.length === 0,
      violations,
      warnings,
      registryContext: GOVERNANCE_CONTEXT,
      summary: {
        totalViolations: violations.length,
        totalWarnings: warnings.length,
        rulesChecked: 10,
      },
    };
  } catch (error) {
    return {
      valid: false,
      violations: [
        withGovernanceMetadata(
          {
            type: "error",
            message: error.message,
            line: 1,
          },
          "accessibility",
          "error"
        ),
      ],
      warnings: [],
      registryContext: GOVERNANCE_CONTEXT,
      summary: {
        totalViolations: 1,
        totalWarnings: 0,
        rulesChecked: 0,
      },
    };
  }
}

/**
 * Check contrast ratio with real WCAG calculation
 */
async function checkContrast(foreground, background) {
  if (!foreground || !background) {
    return {
      valid: false,
      error: "Both foreground and background colors are required",
      registryContext: GOVERNANCE_CONTEXT,
    };
  }

  const contrast = calculateContrast(foreground, background);

  if (contrast === null) {
    return {
      valid: false,
      error:
        "Could not parse color values. Supports hex, rgb, rgba, hsl, and named colors.",
      foreground,
      background,
      registryContext: GOVERNANCE_CONTEXT,
    };
  }

  const passesAA = contrast >= 4.5;
  const passesAALarge = contrast >= 3.0;
  const passesAAA = contrast >= 7.0;
  const passesAAALarge = contrast >= 4.5;

  return {
    contrast: Math.round(contrast * 100) / 100,
    passesAA,
    passesAALarge,
    passesAAA,
    passesAAALarge,
    level:
      contrast >= 7.0
        ? "AAA"
        : contrast >= 4.5
          ? "AA"
          : contrast >= 3.0
            ? "AA (Large Text)"
            : "Fail",
    foreground,
    background,
    registryContext: GOVERNANCE_CONTEXT,
  };
}

// --- MCP Tool Handlers -----------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "validate_component",
        description:
          "Validate React component accessibility with WCAG 2.1 compliance. Checks for ARIA labels, form labels, keyboard navigation, and semantic HTML.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the React component file to validate",
            },
            componentName: {
              type: "string",
              description:
                "Optional: Specific component name to validate (if file contains multiple components)",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "check_contrast",
        description:
          "Check WCAG 2.1 contrast ratio between foreground and background colors. Returns contrast ratio and compliance levels (AA, AAA).",
        inputSchema: {
          type: "object",
          properties: {
            foreground: {
              type: "string",
              description:
                "Foreground color (hex, rgb, rgba, hsl, or named color)",
            },
            background: {
              type: "string",
              description:
                "Background color (hex, rgb, rgba, hsl, or named color)",
            },
          },
          required: ["foreground", "background"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "validate_component": {
        const { filePath, componentName } = args;
        const result = await validateComponent(filePath, componentName);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "check_contrast": {
        const { foreground, background } = args;
        const result = await checkContrast(foreground, background);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              valid: false,
              error: error.message,
              registryContext: GOVERNANCE_CONTEXT,
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

console.error("AIBOS Accessibility MCP server running on stdio");

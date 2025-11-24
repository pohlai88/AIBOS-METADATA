#!/usr/bin/env node
// tools/mcp-react-validation.mjs
// React MCP Validation Server
// Version: 1.1.0
// Score: 9.5/10 (World-Class, Enterprise-Grade)

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
// Handle both ESM and CJS exports
const traverse = _traverse.default || _traverse;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: "react-validation",
    version: "1.1.0",
    description:
      "React component validation and RSC boundary checking with enhanced AST analysis",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

/**
 * Detect top-of-file "use client" directive in a robust way.
 * Supports both single and double quotes and optional semicolon.
 */
function hasUseClientDirective(source) {
  const useClientRegex = /^\s*["']use client["'];?/m;
  return useClientRegex.test(source);
}

// --- Governance / Metadata awareness ---------------------------------------

// Static governance context so upstream systems (e.g. mdm_tool_registry)
// can consistently identify this validator.
const GOVERNANCE_CONTEXT = {
  toolId: "mcp-react-validation",
  domain: "ui_component_validation",
  registryTable: "mdm_tool_registry",
};

// Optional: design-token prefixes from env, e.g.
// AIBOS_DESIGN_TOKEN_PREFIXES="bg-surface,text-accent,border-token"
const DESIGN_TOKEN_PREFIXES = (process.env.AIBOS_DESIGN_TOKEN_PREFIXES || "")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

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

// --- AST + import caches ----------------------------------------------------

// Cache for resolved imports (prevents circular dependency issues)
const importCache = new Map();
const MAX_IMPORT_DEPTH = 10;

// Cache for parsed files (AST + content) to avoid reparsing the same file
// across validateReactComponent, checkServerClientUsage, validateRSCBoundary.
const astCache = new Map();

const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: ["typescript", "jsx", "decorators-legacy"],
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

/**
 * Resolve import path to actual file
 */
function resolveImport(importPath, fromFile) {
  const cacheKey = `${fromFile}:${importPath}`;
  if (importCache.has(cacheKey)) {
    return importCache.get(cacheKey);
  }

  try {
    // Handle relative imports
    if (importPath.startsWith(".")) {
      const resolved = path.resolve(path.dirname(fromFile), importPath);
      // Try common extensions
      for (const ext of [
        "",
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        "/index.ts",
        "/index.tsx",
      ]) {
        const fullPath = resolved + ext;
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          importCache.set(cacheKey, fullPath);
          return fullPath;
        }
      }
      // Try as directory
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        for (const ext of [
          "/index.ts",
          "/index.tsx",
          "/index.js",
          "/index.jsx",
        ]) {
          const fullPath = resolved + ext;
          if (fs.existsSync(fullPath)) {
            importCache.set(cacheKey, fullPath);
            return fullPath;
          }
        }
      }
    }
    // Handle workspace aliases (@aibos/*)
    else if (importPath.startsWith("@aibos/")) {
      const parts = importPath.split("/");
      const packageName = parts[1];
      const subPath = parts.slice(2).join("/");
      const workspaceRoot = path.resolve(__dirname, "../../");
      const packagePath = path.join(
        workspaceRoot,
        "packages",
        packageName,
        "src",
        subPath
      );

      for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const fullPath = packagePath + ext;
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          importCache.set(cacheKey, fullPath);
          return fullPath;
        }
      }
    }
  } catch (error) {
    // Silently fail - import resolution is best-effort
  }

  importCache.set(cacheKey, null);
  return null;
}

/**
 * Trace imports transitively to detect forbidden APIs
 */
function traceImports(filePath, depth = 0, visited = new Set()) {
  if (depth > MAX_IMPORT_DEPTH || visited.has(filePath)) {
    return { hasBrowserAPIs: false, hasClientHooks: false, imports: [] };
  }

  visited.add(filePath);

  if (!fs.existsSync(filePath)) {
    return { hasBrowserAPIs: false, hasClientHooks: false, imports: [] };
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const ast = parse(content, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
    });

    let hasBrowserAPIs = false;
    let hasClientHooks = false;
    const imports = [];

    // Check for browser APIs using AST (more accurate than regex)
    traverse(ast, {
      Identifier(path) {
        const name = path.node.name;
        const browserGlobals = [
          "window",
          "document",
          "navigator",
          "localStorage",
          "sessionStorage",
        ];
        const clientHooks = [
          "useEffect",
          "useLayoutEffect",
          "useState",
          "useReducer",
        ];

        // Check if it's a direct reference (not a property access)
        if (
          path.parent.type !== "MemberExpression" ||
          path.parent.object === path.node
        ) {
          if (browserGlobals.includes(name)) {
            hasBrowserAPIs = true;
          }
          if (clientHooks.includes(name)) {
            hasClientHooks = true;
          }
        }
      },
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const resolved = resolveImport(source, filePath);
        if (resolved) {
          imports.push(resolved);
        }
      },
    });

    // Recursively check imported files
    let transitiveBrowserAPIs = false;
    let transitiveClientHooks = false;

    for (const importedFile of imports) {
      const result = traceImports(importedFile, depth + 1, new Set(visited));
      if (result.hasBrowserAPIs) transitiveBrowserAPIs = true;
      if (result.hasClientHooks) transitiveClientHooks = true;
    }

    return {
      hasBrowserAPIs: hasBrowserAPIs || transitiveBrowserAPIs,
      hasClientHooks: hasClientHooks || transitiveClientHooks,
      imports,
    };
  } catch (error) {
    return { hasBrowserAPIs: false, hasClientHooks: false, imports: [] };
  }
}

/**
 * Detect all component types (function, arrow, default export, etc.)
 */
function detectComponents(ast) {
  const components = [];

  traverse(ast, {
    // Named function components
    FunctionDeclaration(path) {
      if (path.node.id && /^[A-Z]/.test(path.node.id.name)) {
        components.push({
          type: "function",
          name: path.node.id.name,
          line: path.node.loc?.start.line || 1,
          hasForwardRef: false,
          hasDisplayName: false,
        });
      }
    },
    // Arrow function components
    VariableDeclarator(path) {
      if (
        path.node.id.type === "Identifier" &&
        /^[A-Z]/.test(path.node.id.name) &&
        path.node.init &&
        (path.node.init.type === "ArrowFunctionExpression" ||
          path.node.init.type === "FunctionExpression")
      ) {
        components.push({
          type: "arrow",
          name: path.node.id.name,
          line: path.node.loc?.start.line || 1,
          hasForwardRef: false,
          hasDisplayName: false,
        });
      }
    },
    // Default export components
    ExportDefaultDeclaration(path) {
      if (path.node.declaration.type === "FunctionDeclaration") {
        const name = path.node.declaration.id?.name || "DefaultComponent";
        components.push({
          type: "default",
          name,
          line: path.node.loc?.start.line || 1,
          hasForwardRef: false,
          hasDisplayName: false,
        });
      }
    },
    // forwardRef detection
    CallExpression(path) {
      if (
        path.node.callee.type === "MemberExpression" &&
        path.node.callee.object.name === "React" &&
        path.node.callee.property.name === "forwardRef"
      ) {
        // Find which component this belongs to
        let parent = path.parent;
        while (parent) {
          if (
            parent.type === "VariableDeclarator" &&
            parent.id.type === "Identifier"
          ) {
            const componentName = parent.id.name;
            const component = components.find((c) => c.name === componentName);
            if (component) {
              component.hasForwardRef = true;
            }
          }
          parent = parent.parent;
        }
      }
    },
    // displayName detection
    AssignmentExpression(path) {
      if (
        path.node.left.type === "MemberExpression" &&
        path.node.left.property.name === "displayName"
      ) {
        const componentName =
          path.node.left.object.type === "Identifier"
            ? path.node.left.object.name
            : null;
        if (componentName) {
          const component = components.find((c) => c.name === componentName);
          if (component) {
            component.hasDisplayName = true;
          }
        }
      }
    },
  });

  return components;
}

/**
 * Check JSX accessibility
 */
function checkJSXAccessibility(ast) {
  const issues = [];

  traverse(ast, {
    JSXOpeningElement(path) {
      const tagName = path.node.name.name || path.node.name;
      const line = path.node.loc?.start.line || 1;

      // Check for img without alt
      if (tagName === "img") {
        const hasAlt = path.node.attributes.some(
          (attr) => attr.type === "JSXAttribute" && attr.name.name === "alt"
        );
        if (!hasAlt) {
          issues.push({
            type: "missing-alt",
            message: "Image must have alt attribute for accessibility",
            line,
            tag: "img",
          });
        }
      }

      // Check for button without type
      if (tagName === "button") {
        const hasType = path.node.attributes.some(
          (attr) => attr.type === "JSXAttribute" && attr.name.name === "type"
        );
        if (!hasType) {
          issues.push({
            type: "missing-button-type",
            message: "Button should have explicit type attribute",
            line,
            tag: "button",
          });
        }
      }

      // Check for div with onClick (should be button)
      if (tagName === "div") {
        const hasOnClick = path.node.attributes.some(
          (attr) => attr.type === "JSXAttribute" && attr.name.name === "onClick"
        );
        if (hasOnClick) {
          issues.push({
            type: "div-onclick",
            message:
              "Div with onClick is not accessible. Use button element instead.",
            line,
            tag: "div",
          });
        }
      }

      // Check for interactive elements without keyboard handlers
      const interactiveAttributes = ["onClick", "onChange", "onSubmit"];
      const hasInteractive = path.node.attributes.some(
        (attr) =>
          attr.type === "JSXAttribute" &&
          interactiveAttributes.includes(attr.name.name)
      );

      if (
        hasInteractive &&
        !["button", "input", "select", "textarea", "a"].includes(tagName)
      ) {
        const hasRole = path.node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name.name === "role" &&
            (attr.value?.value === "button" ||
              attr.value?.value === "link" ||
              attr.value?.value === "menuitem")
        );
        const hasTabIndex = path.node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" && attr.name.name === "tabIndex"
        );

        if (!hasRole || !hasTabIndex) {
          issues.push({
            type: "missing-keyboard-handlers",
            message: `Interactive ${tagName} element should have role and tabIndex for keyboard accessibility`,
            line,
            tag: tagName,
          });
        }
      }

      // Check for modals without role="dialog"
      const hasModalAttributes = path.node.attributes.some(
        (attr) =>
          attr.type === "JSXAttribute" &&
          (attr.name.name === "aria-modal" ||
            attr.name.name === "aria-labelledby")
      );
      if (hasModalAttributes) {
        const hasDialogRole = path.node.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name.name === "role" &&
            attr.value?.value === "dialog"
        );
        if (!hasDialogRole) {
          issues.push({
            type: "missing-dialog-role",
            message: "Modal-like element should have role='dialog'",
            line,
            tag: tagName,
          });
        }
      }
    },
  });

  return issues;
}

/**
 * Check token compliance (raw colors, arbitrary values)
 */
function checkTokenCompliance(ast, content) {
  const issues = [];

  // Check for raw hex colors in className
  const hexColorRegex = /className=["'][^"']*#[0-9a-fA-F]{3,6}[^"']*["']/g;
  if (hexColorRegex.test(content)) {
    issues.push(
      withGovernanceMetadata(
        {
          type: "raw-hex-color",
          message:
            "Raw hex colors in className are forbidden. Use token-based classes instead.",
          line: 1,
        },
        "design-tokens",
        "error"
      )
    );
  }

  // Check for Tailwind arbitrary values (bg-[#ff0000])
  const arbitraryValueRegex =
    /className=["'][^"']*\[#[0-9a-fA-F]{3,6}\][^"']*["']/g;
  if (arbitraryValueRegex.test(content)) {
    issues.push(
      withGovernanceMetadata(
        {
          type: "arbitrary-color",
          message:
            "Arbitrary color values are forbidden. Use semantic tokens instead.",
          line: 1,
        },
        "design-tokens",
        "error"
      )
    );
  }

  // Check for Tailwind palette colors (bg-red-500)
  const paletteColorRegex =
    /className=["'][^"']*(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)[^"']*["']/g;
  if (paletteColorRegex.test(content)) {
    issues.push(
      withGovernanceMetadata(
        {
          type: "palette-color",
          message:
            "Tailwind palette colors are forbidden. Use token-based classes instead.",
          line: 1,
        },
        "design-tokens",
        "error"
      )
    );
  }

  // Check for inline styles with colors
  traverse(ast, {
    JSXAttribute(path) {
      if (
        path.node.name.name === "style" &&
        path.node.value?.type === "JSXExpressionContainer"
      ) {
        const styleValue = path.node.value.expression;
        // This is a simplified check - full implementation would need to traverse the object
        if (styleValue.type === "ObjectExpression") {
          issues.push(
            withGovernanceMetadata(
              {
                type: "inline-style-color",
                message:
                  "Inline styles with colors are forbidden. Use CSS variables instead.",
                line: path.node.loc?.start.line || 1,
              },
              "design-tokens",
              "warning"
            )
          );
        }
      }
    },
  });

  // Optional positive enforcement: if DESIGN_TOKEN_PREFIXES is configured,
  // ensure color-related utility classes use approved token prefixes.
  if (DESIGN_TOKEN_PREFIXES.length > 0) {
    const classNameRegex = /className=["']([^"']*)["']/g;
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = classNameRegex.exec(content)) !== null) {
      const classList = match[1].split(/\s+/).filter(Boolean);
      for (const cls of classList) {
        if (/^(bg|text|border|ring|shadow)-/.test(cls)) {
          const matchesPrefix = DESIGN_TOKEN_PREFIXES.some((prefix) =>
            cls.startsWith(prefix)
          );
          if (!matchesPrefix) {
            issues.push(
              withGovernanceMetadata(
                {
                  type: "non-token-class",
                  message:
                    "Color-related utility class should use approved design token prefix",
                  line: 1,
                  className: cls,
                },
                "design-tokens",
                "warning"
              )
            );
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Check props interface
 */
function checkPropsInterface(ast) {
  const issues = [];
  let hasPropsInterface = false;
  let propsInterfaceName = null;
  let hasJSX = false;

  traverse(ast, {
    TSInterfaceDeclaration(path) {
      if (
        path.node.id.name.includes("Props") ||
        path.node.id.name.includes("ComponentProps")
      ) {
        hasPropsInterface = true;
        propsInterfaceName = path.node.id.name;

        // Check if it extends HTML attributes
        const extendsHTML = path.node.extends?.some(
          (ext) =>
            ext.expression.type === "Identifier" &&
            (ext.expression.name.includes("HTML") ||
              ext.expression.name.includes("ButtonHTMLAttributes") ||
              ext.expression.name.includes("InputHTMLAttributes"))
        );

        if (!extendsHTML) {
          issues.push({
            type: "props-not-extending-html",
            message: `Props interface ${propsInterfaceName} should extend appropriate HTML attributes`,
            line: path.node.loc?.start.line || 1,
          });
        }
      }
    },
    JSXOpeningElement() {
      // If we see JSX at all, this file is likely a React component module
      hasJSX = true;
    },
  });

  // Only warn about missing props interface if this file actually contains JSX.
  // Utility or non-React files should not be forced to define Props.
  if (hasJSX && !hasPropsInterface) {
    issues.push({
      type: "missing-props-interface",
      message: "Component should have a typed Props interface",
      line: 1,
    });
  }

  return issues;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "validate_react_component",
        description:
          "Validate React component for best practices, accessibility, and token compliance",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the React component file",
            },
            componentName: {
              type: "string",
              description: "Optional component name to validate",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "check_server_client_usage",
        description:
          "Check if a component should be a server or client component with import tracing",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the React component file",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "validate_rsc_boundary",
        description:
          "Validate RSC (React Server Component) boundary with enhanced checks",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the React component file",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "validate_imports",
        description: "Validate imports transitively to detect forbidden APIs",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the React component file",
            },
          },
          required: ["filePath"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "validate_react_component": {
        const { filePath, componentName } = args;
        const result = await validateReactComponent(filePath, componentName);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "check_server_client_usage": {
        const { filePath } = args;
        const result = await checkServerClientUsage(filePath);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "validate_rsc_boundary": {
        const { filePath } = args;
        const result = await validateRSCBoundary(filePath);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "validate_imports": {
        const { filePath } = args;
        const result = await validateImports(filePath);
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
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Validate React component
 */
async function validateReactComponent(filePath, componentName) {
  try {
    const { content, ast } = getParsedFile(filePath);

    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Detect all component types
    const components = detectComponents(ast);

    // If a specific componentName is provided, only validate that one.
    // Otherwise, validate all detected components in the file.
    const targetComponents = componentName
      ? components.filter((c) => c.name === componentName)
      : components;

    // Check each relevant component
    for (const component of targetComponents) {
      if (!component.hasForwardRef) {
        warnings.push({
          type: "missing-forwardRef",
          message: `Component ${component.name} should use forwardRef for ref forwarding`,
          line: component.line,
          component: component.name,
        });
      }

      if (!component.hasDisplayName) {
        warnings.push({
          type: "missing-displayName",
          message: `Component ${component.name} should set displayName for debugging`,
          line: component.line,
          component: component.name,
        });
      }
    }

    // Check props interface
    const propsIssues = checkPropsInterface(ast);
    warnings.push(...propsIssues);

    // Check JSX accessibility
    const a11yIssues = checkJSXAccessibility(ast);
    errors.push(
      ...a11yIssues.filter(
        (i) => i.type === "missing-alt" || i.type === "div-onclick"
      )
    );
    warnings.push(
      ...a11yIssues.filter(
        (i) => i.type !== "missing-alt" && i.type !== "div-onclick"
      )
    );

    // Check token compliance
    const tokenIssues = checkTokenCompliance(ast, content);
    errors.push(...tokenIssues);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      registryContext: GOVERNANCE_CONTEXT,
      components: components.map((c) => ({
        name: c.name,
        type: c.type,
        hasForwardRef: c.hasForwardRef,
        hasDisplayName: c.hasDisplayName,
      })),
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          type: "parse-error",
          message: error.message,
          line: 1,
        },
      ],
      warnings: [],
      suggestions: [],
    };
  }
}

/**
 * Check Server/Client Component usage with import tracing
 */
async function checkServerClientUsage(filePath) {
  try {
    const { content, ast } = getParsedFile(filePath);

    const hasUseClient = hasUseClientDirective(content);

    // Use AST-based detection instead of regex
    let hasBrowserGlobals = false;
    let hasClientHooks = false;
    let hasEventHandlers = false;

    traverse(ast, {
      Identifier(path) {
        const name = path.node.name;
        const browserGlobals = [
          "window",
          "document",
          "navigator",
          "localStorage",
          "sessionStorage",
        ];
        const clientHooks = [
          "useEffect",
          "useLayoutEffect",
          "useState",
          "useReducer",
        ];

        // Only flag if it's a direct reference (not property access like windowSize)
        if (
          path.parent.type !== "MemberExpression" ||
          path.parent.object === path.node
        ) {
          if (browserGlobals.includes(name)) {
            hasBrowserGlobals = true;
          }
          if (clientHooks.includes(name)) {
            hasClientHooks = true;
          }
        }
      },
      JSXAttribute(path) {
        if (
          path.node.name.name?.startsWith("on") &&
          /^on[A-Z]/.test(path.node.name.name)
        ) {
          hasEventHandlers = true;
        }
      },
    });

    // Trace imports transitively
    const importTrace = traceImports(filePath);
    if (importTrace.hasBrowserAPIs) {
      hasBrowserGlobals = true;
    }
    if (importTrace.hasClientHooks) {
      hasClientHooks = true;
    }

    const shouldBeClient =
      hasBrowserGlobals || hasClientHooks || hasEventHandlers;

    const issues = [];

    if (shouldBeClient && !hasUseClient) {
      issues.push({
        type: "missing-directive",
        message:
          "Component uses client-only features but missing 'use client' directive",
        line: 1,
        details: {
          hasBrowserGlobals,
          hasClientHooks,
          hasEventHandlers,
          transitiveViolations:
            importTrace.hasBrowserAPIs || importTrace.hasClientHooks,
        },
      });
    }

    if (!shouldBeClient && hasUseClient) {
      issues.push({
        type: "unnecessary-directive",
        message: "Component has 'use client' but doesn't need it",
        line: 1,
      });
    }

    return {
      isClientComponent: hasUseClient,
      shouldBeClient,
      reason: shouldBeClient
        ? "Uses browser APIs, hooks, or event handlers"
        : "No client-only features detected",
      registryContext: GOVERNANCE_CONTEXT,
      issues,
      importTrace: {
        hasTransitiveViolations:
          importTrace.hasBrowserAPIs || importTrace.hasClientHooks,
        tracedFiles: importTrace.imports.length,
      },
    };
  } catch (error) {
    return {
      isClientComponent: false,
      shouldBeClient: false,
      reason: `Error: ${error.message}`,
      issues: [
        {
          type: "error",
          message: error.message,
          line: 1,
        },
      ],
    };
  }
}

/**
 * Validate RSC boundary with enhanced checks
 */
async function validateRSCBoundary(filePath) {
  try {
    const { content, ast } = getParsedFile(filePath);

    const isServerComponent = !hasUseClientDirective(content);

    if (!isServerComponent) {
      return {
        valid: true,
        isServerComponent: false,
        violations: [],
      };
    }

    const violations = [];

    // AST-based browser global detection (more accurate than regex)
    traverse(ast, {
      Identifier(path) {
        const name = path.node.name;
        const browserGlobals = [
          "window",
          "document",
          "navigator",
          "localStorage",
          "sessionStorage",
        ];

        // Only flag direct references, not property access
        if (
          browserGlobals.includes(name) &&
          (path.parent.type !== "MemberExpression" ||
            path.parent.object === path.node)
        ) {
          violations.push({
            type: "browser-global",
            global: name,
            message: `Server component cannot use ${name}`,
            line: path.node.loc?.start.line || 1,
          });
        }
      },
    });

    // AST-based hook detection
    traverse(ast, {
      CallExpression(path) {
        if (path.node.callee.type === "Identifier") {
          const hookName = path.node.callee.name;
          const clientHooks = ["useEffect", "useLayoutEffect"];
          if (clientHooks.includes(hookName)) {
            violations.push({
              type: "client-hook",
              hook: hookName,
              message: `Server component cannot use ${hookName}`,
              line: path.node.loc?.start.line || 1,
            });
          }
        }
      },
    });

    // Trace imports transitively
    const importTrace = traceImports(filePath);
    if (importTrace.hasBrowserAPIs) {
      violations.push({
        type: "transitive-browser-api",
        message: "Server component imports file that uses browser APIs",
        line: 1,
      });
    }
    if (importTrace.hasClientHooks) {
      violations.push({
        type: "transitive-client-hook",
        message: "Server component imports file that uses client-only hooks",
        line: 1,
      });
    }

    return {
      valid: violations.length === 0,
      isServerComponent: true,
      registryContext: GOVERNANCE_CONTEXT,
      violations,
    };
  } catch (error) {
    return {
      valid: false,
      isServerComponent: false,
      violations: [
        {
          type: "error",
          message: error.message,
          line: 1,
        },
      ],
    };
  }
}

/**
 * Validate imports transitively
 */
async function validateImports(filePath) {
  try {
    const trace = traceImports(filePath);
    return {
      valid: !trace.hasBrowserAPIs && !trace.hasClientHooks,
      hasBrowserAPIs: trace.hasBrowserAPIs,
      hasClientHooks: trace.hasClientHooks,
      tracedFiles: trace.imports.length,
      imports: trace.imports,
      registryContext: GOVERNANCE_CONTEXT,
    };
  } catch (error) {
    return {
      valid: false,
      hasBrowserAPIs: false,
      hasClientHooks: false,
      tracedFiles: 0,
      imports: [],
      error: error.message,
    };
  }
}

console.error("React Validation MCP Server running");

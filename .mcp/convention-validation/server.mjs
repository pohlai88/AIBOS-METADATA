#!/usr/bin/env node
// .mcp/convention-validation/server.mjs
// AIBOS Convention Validation MCP Server
// Version: 1.1.0
// Purpose: Validate code against convention manifests

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { parse } from "@babel/parser";
// NOTE: Using underscore prefix for ESM/CJS compatibility workaround
// This is an acceptable exception to camelCase naming convention
// @babel/traverse exports differently in ESM vs CJS, requiring this pattern
import traverseDefault from "@babel/traverse";
// Handle both ESM and CJS exports
const traverse = traverseDefault.default || traverseDefault;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const conventionsRoot = path.resolve(
  workspaceRoot,
  "docs/01-foundation/conventions"
);

// --- Governance / Metadata awareness ---------------------------------------

const GOVERNANCE_CONTEXT = {
  toolId: "aibos-convention-validation",
  domain: "convention_validation",
  registryTable: "mdm_tool_registry",
};

function withGovernanceMetadata(payload, category, severity) {
  return {
    ...payload,
    governance: {
      ...GOVERNANCE_CONTEXT,
      category,
      severity,
      timestamp: new Date().toISOString(),
    },
  };
}

// --- Manifest Loader -------------------------------------------------------

let manifestCache = new Map();

async function loadManifest(manifestName) {
  if (manifestCache.has(manifestName)) {
    return manifestCache.get(manifestName);
  }

  const manifestPath = path.join(
    conventionsRoot,
    `${manifestName}.manifest.json`
  );
  try {
    const content = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(content);
    manifestCache.set(manifestName, manifest);
    return manifest;
  } catch (error) {
    throw new Error(
      `Failed to load manifest ${manifestName}: ${error.message}`
    );
  }
}

async function loadRegistry() {
  const registryPath = path.join(conventionsRoot, "conventions.registry.json");
  try {
    const content = await fs.readFile(registryPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load registry: ${error.message}`);
  }
}

// --- Validation Functions ---------------------------------------------------

/**
 * Validate filename against naming conventions
 */
function validateFilename(filePath, manifest) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(filePath);
  const fileExtension = path.extname(fileName);
  const baseName = path.basename(fileName, fileExtension);

  // Skip archive directories
  if (filePath.includes("/99-archive/") || filePath.includes("\\99-archive\\")) {
    return { valid: true, errors: [], warnings: [] };
  }

  // Documented exceptions (per naming.md):
  // 1. Config files: [name].config.[ext] (e.g., next.config.ts, eslint.config.mjs)
  const isConfigFile = /\.config\./.test(fileName) || fileName === "next-env.d.ts";
  // 2. Layout components: PascalCase (e.g., AppShell.tsx, Header.tsx)
  const isLayoutComponent = /^(AppShell|Header|Sidebar|ContentArea|Navigation|UserMenu|Footer)\.tsx$/.test(fileName);
  // 3. React hooks: use[Name] (e.g., useMcpTheme.ts)
  const isHookFile = /^use[A-Z]/.test(fileName);
  // 4. MCP utility components: PascalCase in mcp/ directory
  const normalizedPath = filePath.replace(/\\/g, "/");
  const isMcpUtility = normalizedPath.includes("/mcp/") && /^[A-Z]/.test(fileName);

  // If it's a documented exception, skip validation
  if (isConfigFile || isLayoutComponent || isHookFile || isMcpUtility) {
    return { valid: true, errors: [], warnings: [] };
  }

  // Get kebab-case rule
  const kebabCaseRule = manifest.rules.find(
    (r) => r.category === "file-naming" && r.pattern === "kebab-case"
  );

  if (kebabCaseRule && kebabCaseRule.enforcement === "strict") {
    // Check if filename is kebab-case
    const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!kebabCaseRegex.test(baseName)) {
      errors.push(
        withGovernanceMetadata(
          {
            type: "filename-pattern",
            message: `Filename "${fileName}" does not follow kebab-case convention`,
            file: filePath,
            expected: "kebab-case (e.g., button.tsx, user-menu.tsx)",
            actual: baseName,
          },
          "naming",
          "error"
        )
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate component name against naming conventions
 */
function validateComponentName(componentName, manifest) {
  const errors = [];
  const warnings = [];

  // Get PascalCase rule
  const pascalCaseRule = manifest.rules.find(
    (r) => r.category === "component-naming" && r.pattern === "PascalCase"
  );

  if (pascalCaseRule && pascalCaseRule.enforcement === "strict") {
    // Check if component name is PascalCase
    const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
    if (!pascalCaseRegex.test(componentName)) {
      errors.push(
        withGovernanceMetadata(
          {
            type: "component-name-pattern",
            message: `Component name "${componentName}" does not follow PascalCase convention`,
            expected: "PascalCase (e.g., Button, Dialog, AppShell)",
            actual: componentName,
          },
          "naming",
          "error"
        )
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate package name against naming conventions
 */
function validatePackageName(packageName, manifest) {
  const errors = [];
  const warnings = [];

  // Get package naming rule
  const packageRule = manifest.rules.find(
    (r) => r.category === "package-naming"
  );

  if (packageRule && packageRule.enforcement === "strict") {
    // Check if package name matches @aibos/[package-name] pattern
    const packageRegex = /^@aibos\/[a-z0-9-]+$/;
    if (!packageRegex.test(packageName)) {
      errors.push(
        withGovernanceMetadata(
          {
            type: "package-name-pattern",
            message: `Package name "${packageName}" does not follow @aibos/[package-name] convention`,
            expected: "@aibos/[package-name] (e.g., @aibos/ui, @aibos/utils)",
            actual: packageName,
          },
          "naming",
          "error"
        )
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate directory structure
 */
async function validateDirectoryStructure(directoryPath, manifest) {
  const errors = [];
  const warnings = [];

  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const structure = manifest.structure;

    // Check required directories
    if (structure.monorepo) {
      const required = structure.monorepo.required || [];
      const existing = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

      for (const req of required) {
        const reqName = req.replace("/", "");
        if (!existing.includes(reqName)) {
          errors.push(
            withGovernanceMetadata(
              {
                type: "missing-directory",
                message: `Required directory "${req}" is missing`,
                directory: directoryPath,
                required: req,
              },
              "folder-structure",
              "error"
            )
          );
        }
      }
    }
  } catch (error) {
    errors.push(
      withGovernanceMetadata(
        {
          type: "validation-error",
          message: `Failed to validate directory structure: ${error.message}`,
          directory: directoryPath,
        },
        "folder-structure",
        "error"
      )
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate markdown format
 */
async function validateMarkdownFormat(filePath, manifest) {
  const errors = [];
  const warnings = [];

  // Skip archive directories
  if (filePath.includes("/99-archive/") || filePath.includes("\\99-archive\\")) {
    return { valid: true, errors: [], warnings: [] };
  }

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const rules = manifest.rules.find((r) => r.category === "markdown-format");

    if (rules) {
      // Check for required elements
      const requiredElements = rules.rules.find(
        (r) => r.pattern === "required-elements"
      );

      if (requiredElements) {
        const required = requiredElements.required || [];
        const checks = {
          title: /^#\s+.+$/m.test(content),
          overview: /##\s+Overview/i.test(content),
          content: content.split("---").length > 2,
        };

        for (const req of required) {
          if (req === "title" && !checks.title) {
            errors.push(
              withGovernanceMetadata(
                {
                  type: "missing-required-element",
                  message: `Markdown file missing required element: ${req}`,
                  file: filePath,
                  required: req,
                },
                "documentation",
                "error"
              )
            );
          } else if (req === "overview" && !checks.overview) {
            errors.push(
              withGovernanceMetadata(
                {
                  type: "missing-required-element",
                  message: `Markdown file missing required element: ${req}`,
                  file: filePath,
                  required: req,
                },
                "documentation",
                "error"
              )
            );
          }
        }
      }
    }
  } catch (error) {
    errors.push(
      withGovernanceMetadata(
        {
          type: "validation-error",
          message: `Failed to validate markdown: ${error.message}`,
          file: filePath,
        },
        "documentation",
        "error"
      )
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate imports against naming conventions
 */
async function validateImports(filePath, manifest) {
  const errors = [];
  const warnings = [];

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const ext = path.extname(filePath);

    // Only validate TypeScript/JavaScript files
    if (![".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(ext)) {
      return { valid: true, errors: [], warnings: [] };
    }

    const parseOptions = {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
    };

    try {
      const ast = parse(content, parseOptions);
      const namingManifest = await loadManifest("naming");

      traverse(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;

          // Validate import source naming
          // Check for @aibos/* package imports
          if (source.startsWith("@aibos/")) {
            const packageName = source;
            const packageResult = validatePackageName(
              packageName,
              namingManifest
            );
            if (!packageResult.valid) {
              errors.push(...packageResult.errors);
              warnings.push(...packageResult.warnings);
            }
          }

          // Validate default import names (camelCase)
          if (path.node.specifiers) {
            path.node.specifiers.forEach((spec) => {
              if (spec.type === "ImportDefaultSpecifier" && spec.local) {
                const importName = spec.local.name;
                const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
                if (!camelCaseRegex.test(importName)) {
                  errors.push(
                    withGovernanceMetadata(
                      {
                        type: "import-name-pattern",
                        message: `Import name "${importName}" should be camelCase`,
                        file: filePath,
                        line: spec.local.loc?.start.line || 1,
                        expected: "camelCase",
                        actual: importName,
                      },
                      "naming",
                      "error"
                    )
                  );
                }
              }

              // Validate named import names (camelCase or PascalCase for components)
              if (spec.type === "ImportSpecifier" && spec.imported) {
                const importedName = spec.imported.name;
                const localName = spec.local?.name || importedName;

                // Check if it's likely a component (PascalCase)
                const isComponent = /^[A-Z]/.test(importedName);
                if (isComponent) {
                  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
                  if (!pascalCaseRegex.test(importedName)) {
                    errors.push(
                      withGovernanceMetadata(
                        {
                          type: "import-name-pattern",
                          message: `Component import "${importedName}" should be PascalCase`,
                          file: filePath,
                          line: spec.local?.loc?.start.line || 1,
                          expected: "PascalCase",
                          actual: importedName,
                        },
                        "naming",
                        "error"
                      )
                    );
                  }
                } else {
                  // Non-component imports should be camelCase
                  const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
                  if (!camelCaseRegex.test(importedName)) {
                    warnings.push(
                      withGovernanceMetadata(
                        {
                          type: "import-name-pattern",
                          message: `Import "${importedName}" should be camelCase`,
                          file: filePath,
                          line: spec.local?.loc?.start.line || 1,
                          expected: "camelCase",
                          actual: importedName,
                        },
                        "naming",
                        "warning"
                      )
                    );
                  }
                }
              }
            });
          }
        },
      });
    } catch (parseError) {
      // If file can't be parsed, skip import validation
      warnings.push(
        withGovernanceMetadata(
          {
            type: "parse-error",
            message: `Could not parse file for import validation: ${parseError.message}`,
            file: filePath,
          },
          "naming",
          "warning"
        )
      );
    }
  } catch (error) {
    errors.push(
      withGovernanceMetadata(
        {
          type: "validation-error",
          message: `Failed to validate imports: ${error.message}`,
          file: filePath,
        },
        "naming",
        "error"
      )
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate code examples in markdown
 */
async function validateCodeExamples(filePath, manifest) {
  const errors = [];
  const warnings = [];

  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Only validate markdown files
    if (!filePath.endsWith(".md")) {
      return { valid: true, errors: [], warnings: [] };
    }

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blockIndex++;
      const language = match[1] || "unknown";
      const code = match[2];

      // Check if code block has language specified
      if (!match[1]) {
        warnings.push(
          withGovernanceMetadata(
            {
              type: "missing-language-tag",
              message: `Code example #${blockIndex} missing language tag`,
              file: filePath,
              line: content.substring(0, match.index).split("\n").length,
              expected: "Language tag (e.g., typescript, javascript, bash)",
            },
            "documentation",
            "warning"
          )
        );
      }

      // Validate TypeScript/JavaScript code examples
      if (
        ["typescript", "ts", "tsx", "javascript", "js", "jsx"].includes(
          language.toLowerCase()
        )
      ) {
        // Check for common issues
        if (code.trim().length === 0) {
          warnings.push(
            withGovernanceMetadata(
              {
                type: "empty-code-example",
                message: `Code example #${blockIndex} is empty`,
                file: filePath,
                line: content.substring(0, match.index).split("\n").length,
              },
              "documentation",
              "warning"
            )
          );
        }

        // Check for incomplete examples (common patterns)
        if (code.includes("// ...") || code.includes("/* ... */")) {
          warnings.push(
            withGovernanceMetadata(
              {
                type: "incomplete-code-example",
                message: `Code example #${blockIndex} appears incomplete`,
                file: filePath,
                line: content.substring(0, match.index).split("\n").length,
              },
              "documentation",
              "warning"
            )
          );
        }
      }
    }

    // Check for inline code that should be in code blocks
    const inlineCodeRegex = /`[^`\n]{50,}`/g;
    let inlineMatch;
    while ((inlineMatch = inlineCodeRegex.exec(content)) !== null) {
      warnings.push(
        withGovernanceMetadata(
          {
            type: "long-inline-code",
            message: `Long inline code should be in a code block`,
            file: filePath,
            line: content.substring(0, inlineMatch.index).split("\n").length,
            suggestion: "Use ``` code block instead",
          },
          "documentation",
          "warning"
        )
      );
    }
  } catch (error) {
    errors.push(
      withGovernanceMetadata(
        {
          type: "validation-error",
          message: `Failed to validate code examples: ${error.message}`,
          file: filePath,
        },
        "documentation",
        "error"
      )
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate cross-references in markdown
 */
async function validateCrossReferences(filePath, manifest) {
  const errors = [];
  const warnings = [];

  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Only validate markdown files
    if (!filePath.endsWith(".md")) {
      return { valid: true, errors: [], warnings: [] };
    }

    // Find all markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    const baseDir = path.dirname(filePath);

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      const lineNumber = content.substring(0, match.index).split("\n").length;

      // Skip external links
      if (
        linkUrl.startsWith("http://") ||
        linkUrl.startsWith("https://") ||
        linkUrl.startsWith("mailto:")
      ) {
        continue;
      }

      // Skip anchor links
      if (linkUrl.startsWith("#")) {
        continue;
      }

      // Validate internal file links
      if (
        linkUrl.startsWith("./") ||
        linkUrl.startsWith("../") ||
        !linkUrl.startsWith("/")
      ) {
        const resolvedPath = path.resolve(baseDir, linkUrl);

        // Check if file exists
        try {
          const stats = await fs.stat(resolvedPath);
          if (!stats.isFile() && !stats.isDirectory()) {
            errors.push(
              withGovernanceMetadata(
                {
                  type: "broken-link",
                  message: `Broken link: "${linkText}" → "${linkUrl}"`,
                  file: filePath,
                  line: lineNumber,
                  link: linkUrl,
                },
                "documentation",
                "error"
              )
            );
          }
        } catch (statError) {
          errors.push(
            withGovernanceMetadata(
              {
                type: "broken-link",
                message: `Broken link: "${linkText}" → "${linkUrl}"`,
                file: filePath,
                line: lineNumber,
                link: linkUrl,
                error: statError.message,
              },
              "documentation",
              "error"
            )
          );
        }
      }

      // Check for empty link text
      if (!linkText.trim()) {
        errors.push(
          withGovernanceMetadata(
            {
              type: "empty-link-text",
              message: `Link has empty text`,
              file: filePath,
              line: lineNumber,
              link: linkUrl,
            },
            "documentation",
            "error"
          )
        );
      }
    }

    // Check for markdown reference-style links
    const refLinkRegex = /\[([^\]]+)\]:\s*(.+)/g;
    while ((match = refLinkRegex.exec(content)) !== null) {
      const refLabel = match[1];
      const refUrl = match[2].trim();
      const lineNumber = content.substring(0, match.index).split("\n").length;

      // Validate reference link
      if (
        !refUrl.startsWith("http://") &&
        !refUrl.startsWith("https://") &&
        !refUrl.startsWith("#")
      ) {
        const resolvedPath = path.resolve(baseDir, refUrl);
        try {
          await fs.stat(resolvedPath);
        } catch (statError) {
          errors.push(
            withGovernanceMetadata(
              {
                type: "broken-reference-link",
                message: `Broken reference link: "${refLabel}" → "${refUrl}"`,
                file: filePath,
                line: lineNumber,
                link: refUrl,
              },
              "documentation",
              "error"
            )
          );
        }
      }
    }
  } catch (error) {
    errors.push(
      withGovernanceMetadata(
        {
          type: "validation-error",
          message: `Failed to validate cross-references: ${error.message}`,
          file: filePath,
        },
        "documentation",
        "error"
      )
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate documentation structure
 */
async function validateDocsStructure(directoryPath, manifest) {
  const errors = [];
  const warnings = [];

  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const structure = manifest.structure;

    // Check for required documentation structure
    if (structure.docs) {
      const required = structure.docs.required || [];
      const existing = entries
        .filter((e) => e.isDirectory() || e.name.endsWith(".md"))
        .map((e) => e.name);

      for (const req of required) {
        const reqName = req.replace("/", "");
        if (
          !existing.includes(reqName) &&
          !existing.some((e) => e.startsWith(reqName))
        ) {
          warnings.push(
            withGovernanceMetadata(
              {
                type: "missing-docs-element",
                message: `Recommended documentation element "${req}" not found`,
                directory: directoryPath,
                recommended: req,
              },
              "folder-structure",
              "warning"
            )
          );
        }
      }
    }

    // Validate markdown files in docs directory
    const mdFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name);

    for (const mdFile of mdFiles) {
      const filePath = path.join(directoryPath, mdFile);
      const docManifest = await loadManifest("documentation-standard");
      const docResult = await validateMarkdownFormat(filePath, docManifest);

      if (!docResult.valid) {
        errors.push(...docResult.errors);
        warnings.push(...docResult.warnings);
      }
    }

    // Check for README.md in docs directories
    if (!mdFiles.includes("README.md") && !mdFiles.includes("readme.md")) {
      warnings.push(
        withGovernanceMetadata(
          {
            type: "missing-readme",
            message: `Documentation directory missing README.md`,
            directory: directoryPath,
          },
          "folder-structure",
          "warning"
        )
      );
    }
  } catch (error) {
    errors.push(
      withGovernanceMetadata(
        {
          type: "validation-error",
          message: `Failed to validate documentation structure: ${error.message}`,
          directory: directoryPath,
        },
        "folder-structure",
        "error"
      )
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

// --- MCP Server Setup ------------------------------------------------------

const server = new Server(
  {
    name: "aibos-convention-validation",
    version: "1.1.0",
    description:
      "Validates code and documentation against convention manifests (8 tools)",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "validate_naming",
        description:
          "Validate naming conventions (filenames, components, packages)",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to file to validate",
            },
            componentName: {
              type: "string",
              description: "Component name to validate (optional)",
            },
            packageName: {
              type: "string",
              description: "Package name to validate (optional)",
            },
          },
          required: [],
        },
      },
      {
        name: "validate_folder_structure",
        description: "Validate folder structure against conventions",
        inputSchema: {
          type: "object",
          properties: {
            directoryPath: {
              type: "string",
              description: "Path to directory to validate",
            },
            structureType: {
              type: "string",
              enum: ["monorepo", "package", "app", "mcpServer"],
              description: "Type of structure to validate",
            },
          },
          required: ["directoryPath", "structureType"],
        },
      },
      {
        name: "validate_all_conventions",
        description: "Validate all conventions for a file or directory",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to file or directory to validate",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "validate_imports",
        description: "Validate import naming conventions",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to file to validate imports",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "validate_code_examples",
        description: "Validate code example format in markdown",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to markdown file to validate",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "validate_cross_references",
        description: "Validate cross-references and links in markdown",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to markdown file to validate",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "validate_docs_structure",
        description: "Validate documentation directory structure",
        inputSchema: {
          type: "object",
          properties: {
            directoryPath: {
              type: "string",
              description: "Path to documentation directory to validate",
            },
          },
          required: ["directoryPath"],
        },
      },
      {
        name: "validate_documentation_format",
        description: "Validate markdown documentation format and structure",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to markdown file to validate",
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
      case "validate_naming": {
        const manifest = await loadManifest("naming");
        const results = {
          valid: true,
          errors: [],
          warnings: [],
        };

        if (args.filePath) {
          const fileResult = validateFilename(args.filePath, manifest);
          results.valid = results.valid && fileResult.valid;
          results.errors.push(...fileResult.errors);
          results.warnings.push(...fileResult.warnings);
        }

        if (args.componentName) {
          const componentResult = validateComponentName(
            args.componentName,
            manifest
          );
          results.valid = results.valid && componentResult.valid;
          results.errors.push(...componentResult.errors);
          results.warnings.push(...componentResult.warnings);
        }

        if (args.packageName) {
          const packageResult = validatePackageName(args.packageName, manifest);
          results.valid = results.valid && packageResult.valid;
          results.errors.push(...packageResult.errors);
          results.warnings.push(...packageResult.warnings);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  results,
                  "naming",
                  results.valid ? "info" : "error"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_folder_structure": {
        const manifest = await loadManifest("folder-structure");
        const result = await validateDirectoryStructure(
          args.directoryPath,
          manifest
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  result,
                  "folder-structure",
                  result.valid ? "info" : "error"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_documentation_format": {
        const manifest = await loadManifest("documentation-standard");
        const result = await validateMarkdownFormat(args.filePath, manifest);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  result,
                  "documentation",
                  result.valid ? "info" : "error"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_all_conventions": {
        // Skip archive directories
        if (args.path.includes("/99-archive/") || args.path.includes("\\99-archive\\")) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  withGovernanceMetadata(
                    { valid: true, errors: [], warnings: [], conventions: {} },
                    "convention-validation",
                    "info"
                  ),
                  null,
                  2
                ),
              },
            ],
          };
        }

        const stats = await fs.stat(args.path);
        const isDirectory = stats.isDirectory();
        const results = {
          valid: true,
          errors: [],
          warnings: [],
          conventions: {},
        };

        if (isDirectory) {
          // Validate folder structure
          const folderManifest = await loadManifest("folder-structure");
          const folderResult = await validateDirectoryStructure(
            args.path,
            folderManifest
          );
          results.valid = results.valid && folderResult.valid;
          results.errors.push(...folderResult.errors);
          results.warnings.push(...folderResult.warnings);
          results.conventions.folderStructure = folderResult;

          // For directories, also validate docs structure
          const docsStructureResult = await validateDocsStructure(
            args.path,
            folderManifest
          );
          results.valid = results.valid && docsStructureResult.valid;
          results.errors.push(...docsStructureResult.errors);
          results.warnings.push(...docsStructureResult.warnings);
          results.conventions.docsStructure = docsStructureResult;
        } else {
          // Validate file naming
          const namingManifest = await loadManifest("naming");
          const namingResult = validateFilename(args.path, namingManifest);
          results.valid = results.valid && namingResult.valid;
          results.errors.push(...namingResult.errors);
          results.warnings.push(...namingResult.warnings);
          results.conventions.naming = namingResult;

          // If markdown, validate format, code examples, and cross-references
          if (args.path.endsWith(".md")) {
            const docManifest = await loadManifest("documentation-standard");
            const docResult = await validateMarkdownFormat(
              args.path,
              docManifest
            );
            results.valid = results.valid && docResult.valid;
            results.errors.push(...docResult.errors);
            results.warnings.push(...docResult.warnings);
            results.conventions.documentation = docResult;

            // Validate code examples
            const codeExamplesResult = await validateCodeExamples(
              args.path,
              docManifest
            );
            results.valid = results.valid && codeExamplesResult.valid;
            results.errors.push(...codeExamplesResult.errors);
            results.warnings.push(...codeExamplesResult.warnings);
            results.conventions.codeExamples = codeExamplesResult;

            // Validate cross-references
            const crossRefResult = await validateCrossReferences(
              args.path,
              docManifest
            );
            results.valid = results.valid && crossRefResult.valid;
            results.errors.push(...crossRefResult.errors);
            results.warnings.push(...crossRefResult.warnings);
            results.conventions.crossReferences = crossRefResult;
          } else {
            // For code files, also validate imports
            const ext = path.extname(args.path);
            if ([".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(ext)) {
              const importResult = await validateImports(
                args.path,
                namingManifest
              );
              results.valid = results.valid && importResult.valid;
              results.errors.push(...importResult.errors);
              results.warnings.push(...importResult.warnings);
              results.conventions.imports = importResult;
            }
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  results,
                  "convention-validation",
                  results.valid ? "info" : "error"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_imports": {
        const manifest = await loadManifest("naming");
        const result = await validateImports(args.filePath, manifest);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  result,
                  "naming",
                  result.valid ? "info" : "error"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_code_examples": {
        const manifest = await loadManifest("documentation-standard");
        const result = await validateCodeExamples(args.filePath, manifest);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  result,
                  "documentation",
                  result.valid ? "info" : "error"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_cross_references": {
        const manifest = await loadManifest("documentation-standard");
        const result = await validateCrossReferences(args.filePath, manifest);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  result,
                  "documentation",
                  result.valid ? "info" : "error"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_docs_structure": {
        const manifest = await loadManifest("folder-structure");
        const result = await validateDocsStructure(
          args.directoryPath,
          manifest
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  result,
                  "folder-structure",
                  result.valid ? "info" : "error"
                ),
                null,
                2
              ),
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
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIBOS Convention Validation MCP server running on stdio");
}

main().catch((error) => {
  console.error("[CONVENTION-VALIDATION] Fatal error:", error);
  process.exit(1);
});

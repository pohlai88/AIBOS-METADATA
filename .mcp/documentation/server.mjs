#!/usr/bin/env node
// .mcp/documentation/server.mjs
// AIBOS Documentation MCP Server
// Version: 2.0.0 - Enterprise-Grade with Security & Governance
// Purpose: Auto-generate and maintain documentation via MCP tools

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get workspace root
const workspaceRoot = path.resolve(__dirname, "../../");
const docsRoot = path.resolve(workspaceRoot, "docs");
const manifestPath = path.resolve(docsRoot, "ui-docs.manifest.json");
const LOCK_FILE = path.join(docsRoot, ".mcp-docs.lock");
const BACKUP_DIR = path.join(docsRoot, ".mcp-backups");

// --- Rate Limiting & Debouncing ----------------------------------------------

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(toolName) {
  const now = Date.now();
  const key = toolName;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  const limit = rateLimitMap.get(key);

  if (now > limit.resetAt) {
    limit.count = 1;
    limit.resetAt = now + RATE_LIMIT_WINDOW;
    return { allowed: true };
  }

  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      error: `Rate limit exceeded for ${toolName}. Max ${MAX_REQUESTS_PER_WINDOW} requests per minute.`,
      resetAt: limit.resetAt,
    };
  }

  limit.count++;
  return { allowed: true };
}

// --- File Locking -------------------------------------------------------------

const activeLocks = new Set();

async function acquireLock(lockId) {
  if (activeLocks.has(lockId)) {
    return {
      success: false,
      error: `Lock already acquired for ${lockId}. Another operation is in progress.`,
    };
  }

  try {
    // Check if lock file exists
    try {
      const lockContent = await fs.readFile(LOCK_FILE, "utf-8");
      const lockData = JSON.parse(lockContent);

      // Check if lock is stale (older than 5 minutes)
      const lockAge = Date.now() - lockData.timestamp;
      if (lockAge > 300000) {
        // Stale lock, remove it
        await fs.unlink(LOCK_FILE);
      } else {
        return {
          success: false,
          error: `Lock file exists. Operation in progress: ${lockData.operation}`,
          lockInfo: lockData,
        };
      }
    } catch (error) {
      // Lock file doesn't exist, proceed
    }

    // Acquire lock
    activeLocks.add(lockId);
    await fs.writeFile(
      LOCK_FILE,
      JSON.stringify({
        lockId,
        operation: lockId,
        timestamp: Date.now(),
        pid: process.pid,
      }),
      "utf-8"
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to acquire lock: ${error.message}`,
    };
  }
}

async function releaseLock(lockId) {
  activeLocks.delete(lockId);
  try {
    await fs.unlink(LOCK_FILE);
  } catch (error) {
    // Lock file might not exist, that's okay
  }
}

// --- Backup & Versioning ------------------------------------------------------

async function createBackup(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      return { success: false, error: "Path is not a file" };
    }

    const content = await fs.readFile(filePath, "utf-8");
    const hash = createHash("md5")
      .update(content)
      .digest("hex")
      .substring(0, 8);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath);
    const backupFileName = `${fileName}.${timestamp}.${hash}${ext}`;
    const backupPath = path.join(
      BACKUP_DIR,
      path.dirname(path.relative(docsRoot, filePath)),
      backupFileName
    );

    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, content, "utf-8");

    return {
      success: true,
      backupPath,
      hash,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// --- Path Validation & Security ------------------------------------------------

function validateOutputPath(outputPath) {
  const resolved = path.resolve(workspaceRoot, outputPath);

  // Must be within docsRoot
  if (!resolved.startsWith(docsRoot)) {
    return {
      valid: false,
      error: `Output path must be within docs/ directory: ${outputPath}`,
    };
  }

  // Prevent path traversal
  if (outputPath.includes("..")) {
    return {
      valid: false,
      error: "Path traversal not allowed",
    };
  }

  // Only allow .md and .mdx files
  if (!outputPath.endsWith(".md") && !outputPath.endsWith(".mdx")) {
    return {
      valid: false,
      error: "Output path must be a .md or .mdx file",
    };
  }

  return { valid: true };
}

function sanitizeTemplateData(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Only allow alphanumeric, dash, underscore in keys
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      continue;
    }

    // Sanitize value - remove potential injection patterns
    const sanitizedValue = String(value)
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, ""); // Remove event handlers

    sanitized[key] = sanitizedValue;
  }
  return sanitized;
}

// --- Governance / Metadata awareness -------------------------------------------

const GOVERNANCE_CONTEXT = {
  toolId: "aibos-documentation",
  domain: "documentation_automation",
  registryTable: "mdm_tool_registry",
};

// Risk categories
const RISK_LEVELS = {
  SAFE_TO_AUTO: "safe_to_auto",
  REQUIRES_REVIEW: "requires_review",
  RISK_LOW: "risk_low",
  RISK_MEDIUM: "risk_medium",
  RISK_HIGH: "risk_high",
};

function withGovernanceMetadata(
  payload,
  category,
  severity,
  riskLevel = RISK_LEVELS.RISK_LOW
) {
  return {
    ...payload,
    governance: {
      ...GOVERNANCE_CONTEXT,
      category,
      severity,
      riskLevel,
      timestamp: new Date().toISOString(),
    },
  };
}

// --- Observability Hook -------------------------------------------------------

function emitEvent(eventType, data) {
  // In production, this would integrate with AppTelemetry
  // For now, we log to stderr (MCP servers use stderr for logging)
  console.error(
    JSON.stringify({
      event: eventType,
      ...data,
      timestamp: new Date().toISOString(),
    })
  );
}

// --- Manifest Loader ----------------------------------------------------------

let manifestCache = null;
let manifestMtime = null;

async function loadManifest() {
  try {
    const stats = await fs.stat(manifestPath);
    if (manifestCache && manifestMtime === stats.mtimeMs) {
      return manifestCache;
    }

    const content = await fs.readFile(manifestPath, "utf-8");
    manifestCache = JSON.parse(content);
    manifestMtime = stats.mtimeMs;
    return manifestCache;
  } catch (error) {
    console.error("Failed to load manifest:", error);
    return null;
  }
}

// --- Template Schema Validation -----------------------------------------------

async function validateTemplateSchema(template, data) {
  const errors = [];
  const warnings = [];

  // Check required sections exist in template
  if (template.sections && Array.isArray(template.sections)) {
    const templateContent = await fs.readFile(
      path.resolve(workspaceRoot, template.path),
      "utf-8"
    );

    for (const section of template.sections) {
      if (!templateContent.includes(section)) {
        warnings.push(`Section "${section}" not found in template`);
      }
    }
  }

  // Validate placeholder format
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const placeholders = [];
  let match;
  const templateContent = await fs.readFile(
    path.resolve(workspaceRoot, template.path),
    "utf-8"
  );

  while ((match = placeholderRegex.exec(templateContent)) !== null) {
    placeholders.push(match[1]);
  }

  // Check all placeholders have data
  for (const placeholder of placeholders) {
    if (!(placeholder in data)) {
      errors.push(`Missing required placeholder: ${placeholder}`);
    }
  }

  // Check for unused data (warnings only)
  for (const key of Object.keys(data)) {
    if (!placeholders.includes(key)) {
      warnings.push(`Unused data field: ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    placeholders,
  };
}

// --- Semantic Token Parsing ----------------------------------------------------

function parseTokenSemantically(tokenName, tokenValue) {
  // Semantic token categorization based on AI-BOS token system
  const categories = {
    colors: {
      patterns: [
        /^color-/,
        /^bg-/,
        /^border-/,
        /^ring-/,
        /-color$/,
        /^brand-/,
        /^semantic-/,
      ],
      subcategories: {
        brand: /^brand-/,
        semantic: /^semantic-/,
        safe: /-safe$/,
        dark: /-dark$/,
        light: /-light$/,
      },
    },
    spacing: {
      patterns: [
        /^spacing-/,
        /^gap-/,
        /^padding-/,
        /^margin-/,
        /^inset-/,
        /-spacing$/,
      ],
    },
    typography: {
      patterns: [
        /^font-/,
        /^text-/,
        /^line-height-/,
        /^letter-spacing-/,
        /-font$/,
        /-size$/,
      ],
    },
    layout: {
      patterns: [/^layout-/, /^container-/, /^grid-/, /^flex-/],
    },
    effects: {
      patterns: [/^shadow-/, /^blur-/, /^opacity-/],
    },
  };

  for (const [category, config] of Object.entries(categories)) {
    for (const pattern of config.patterns) {
      if (pattern.test(tokenName)) {
        const result = {
          category,
          tokenName,
          tokenValue,
        };

        // Add subcategory if applicable
        if (config.subcategories) {
          for (const [subcat, subPattern] of Object.entries(
            config.subcategories
          )) {
            if (subPattern.test(tokenName)) {
              result.subcategory = subcat;
              break;
            }
          }
        }

        return result;
      }
    }
  }

  return {
    category: "other",
    tokenName,
    tokenValue,
  };
}

// --- MCP Server Setup ----------------------------------------------------------

const server = new Server(
  {
    name: "aibos-documentation",
    version: "2.0.0",
    description:
      "AI-BOS Documentation automation server - Enterprise-grade with security, governance, and observability",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

// --- Tool: validate_docs ------------------------------------------------------

async function validateDocs(args) {
  const rateLimit = checkRateLimit("validate_docs");
  if (!rateLimit.allowed) {
    return withGovernanceMetadata(
      {
        error: rateLimit.error,
        resetAt: rateLimit.resetAt,
      },
      "validation",
      "error",
      RISK_LEVELS.RISK_LOW
    );
  }

  emitEvent("validate_docs_started", { args });

  const manifest = await loadManifest();
  if (!manifest) {
    emitEvent("validate_docs_failed", { error: "Failed to load manifest" });
    return withGovernanceMetadata(
      {
        error: "Failed to load documentation manifest",
      },
      "validation",
      "error",
      RISK_LEVELS.RISK_HIGH
    );
  }

  const results = {
    structure: { valid: true, errors: [] },
    templates: { valid: true, errors: [] },
    links: { valid: true, errors: [] },
    manifest: { valid: true, errors: [] },
  };

  // Check structure integrity
  if (args.checkStructure !== false) {
    const sections = Object.keys(manifest.structure.sections);
    for (const section of sections) {
      const sectionPath = path.join(docsRoot, section);
      try {
        const stats = await fs.stat(sectionPath);
        if (!stats.isDirectory()) {
          results.structure.errors.push(
            `Section ${section} should be a directory`
          );
          results.structure.valid = false;
        }
      } catch (error) {
        results.structure.errors.push(`Section ${section} does not exist`);
        results.structure.valid = false;
      }
    }
  }

  // Check 09-reference/ is MCP-only (no human edits)
  if (args.checkManifest !== false) {
    const refPath = path.join(docsRoot, "09-reference");
    try {
      const files = await fs.readdir(refPath, { recursive: true });
      // Check for files that might be manually edited (not in auto/)
      for (const file of files) {
        if (file.endsWith(".md") && !file.includes("auto/")) {
          results.manifest.errors.push(
            `File ${file} in 09-reference/ should be in auto/ subdirectory (MCP-only)`
          );
          results.manifest.valid = false;
        }
      }
    } catch (error) {
      // 09-reference might not exist yet, that's okay
    }
  }

  const isValid =
    results.structure.valid &&
    results.templates.valid &&
    results.links.valid &&
    results.manifest.valid;

  emitEvent("validate_docs_completed", {
    valid: isValid,
    totalErrors:
      results.structure.errors.length +
      results.templates.errors.length +
      results.links.errors.length +
      results.manifest.errors.length,
  });

  return withGovernanceMetadata(
    {
      valid: isValid,
      results,
      summary: {
        totalErrors:
          results.structure.errors.length +
          results.templates.errors.length +
          results.links.errors.length +
          results.manifest.errors.length,
      },
    },
    "validation",
    isValid ? "info" : "warning",
    isValid ? RISK_LEVELS.SAFE_TO_AUTO : RISK_LEVELS.REQUIRES_REVIEW
  );
}

// --- Tool: update_token_reference --------------------------------------------

async function updateTokenReference(args) {
  const rateLimit = checkRateLimit("update_token_reference");
  if (!rateLimit.allowed) {
    return withGovernanceMetadata(
      {
        error: rateLimit.error,
        resetAt: rateLimit.resetAt,
      },
      "generation",
      "error",
      RISK_LEVELS.RISK_LOW
    );
  }

  const lockId = "update_token_reference";
  const lockResult = await acquireLock(lockId);
  if (!lockResult.success) {
    return withGovernanceMetadata(
      {
        error: lockResult.error,
        lockInfo: lockResult.lockInfo,
      },
      "generation",
      "error",
      RISK_LEVELS.RISK_MEDIUM
    );
  }

  try {
    emitEvent("update_token_reference_started", { args });

    const manifest = await loadManifest();
    if (!manifest) {
      return withGovernanceMetadata(
        {
          error: "Failed to load documentation manifest",
        },
        "generation",
        "error",
        RISK_LEVELS.RISK_HIGH
      );
    }

    const sourcePath =
      args.sourcePath ||
      path.resolve(workspaceRoot, "packages/ui/src/design/globals.css");
    const outputPath =
      args.outputPath ||
      path.resolve(docsRoot, "09-reference/tokens/auto/tokens-reference.md");

    // Validate output path
    const pathValidation = validateOutputPath(outputPath);
    if (!pathValidation.valid) {
      return withGovernanceMetadata(
        {
          error: pathValidation.error,
        },
        "generation",
        "error",
        RISK_LEVELS.RISK_HIGH
      );
    }

    // Create backup if file exists
    let backup = null;
    try {
      await fs.stat(outputPath);
      backup = await createBackup(outputPath);
    } catch (error) {
      // File doesn't exist, no backup needed
    }

    // Read globals.css
    const cssContent = await fs.readFile(sourcePath, "utf-8");

    // Extract CSS variables with semantic parsing
    const tokenRegex = /--([a-z0-9-]+):\s*([^;]+);/gi;
    const tokens = [];
    let match;

    while ((match = tokenRegex.exec(cssContent)) !== null) {
      const parsed = parseTokenSemantically(match[1], match[2].trim());
      tokens.push(parsed);
    }

    // Group tokens by category (semantic)
    const categories = {};
    for (const token of tokens) {
      if (!categories[token.category]) {
        categories[token.category] = [];
      }
      categories[token.category].push(token);
    }

    // Generate markdown
    let markdown = `# Design Tokens Reference\n\n`;
    markdown += `> **Auto-generated from \`globals.css\`**\n`;
    markdown += `> **Last updated:** ${new Date().toISOString()}\n`;
    markdown += `> **⚠️ MCP-only file - Do not edit manually**\n\n`;
    markdown += `This file is automatically generated by the Documentation MCP server.\n\n`;
    markdown += `**Total tokens:** ${tokens.length}\n\n`;

    // Generate sections for each category
    for (const [category, categoryTokens] of Object.entries(categories)) {
      markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      markdown += `| Token | Value | Subcategory |\n`;
      markdown += `|-------|-------|-------------|\n`;
      for (const token of categoryTokens) {
        const subcat = token.subcategory || "-";
        markdown += `| \`--${token.tokenName}\` | \`${token.tokenValue}\` | ${subcat} |\n`;
      }
      markdown += `\n`;
    }

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write file
    await fs.writeFile(outputPath, markdown, "utf-8");

    emitEvent("update_token_reference_completed", {
      outputPath,
      tokensGenerated: tokens.length,
      categories: Object.keys(categories),
      backupCreated: backup?.success || false,
    });

    return withGovernanceMetadata(
      {
        success: true,
        outputPath,
        tokensGenerated: tokens.length,
        categories: Object.keys(categories),
        backup: backup?.success ? { path: backup.backupPath } : null,
      },
      "generation",
      "info",
      RISK_LEVELS.SAFE_TO_AUTO
    );
  } catch (error) {
    emitEvent("update_token_reference_failed", {
      error: error.message,
    });
    return withGovernanceMetadata(
      {
        error: error.message,
        stack: error.stack,
      },
      "generation",
      "error",
      RISK_LEVELS.RISK_HIGH
    );
  } finally {
    await releaseLock(lockId);
  }
}

// --- Tool: sync_nextra --------------------------------------------------------

async function syncNextra(args) {
  const rateLimit = checkRateLimit("sync_nextra");
  if (!rateLimit.allowed) {
    return withGovernanceMetadata(
      {
        error: rateLimit.error,
        resetAt: rateLimit.resetAt,
      },
      "sync",
      "error",
      RISK_LEVELS.RISK_LOW
    );
  }

  const lockId = "sync_nextra";
  const lockResult = await acquireLock(lockId);
  if (!lockResult.success) {
    return withGovernanceMetadata(
      {
        error: lockResult.error,
        lockInfo: lockResult.lockInfo,
      },
      "sync",
      "error",
      RISK_LEVELS.RISK_MEDIUM
    );
  }

  try {
    emitEvent("sync_nextra_started", { args });

    const syncScriptPath = path.resolve(
      workspaceRoot,
      "apps/docs/scripts/sync-docs.ts"
    );

    // Validate script path is within workspace
    if (!syncScriptPath.startsWith(workspaceRoot)) {
      return withGovernanceMetadata(
        {
          error: "Invalid sync script path",
        },
        "sync",
        "error",
        RISK_LEVELS.RISK_HIGH
      );
    }

    // Run sync script
    const output = execSync(`pnpm exec tsx "${syncScriptPath}"`, {
      cwd: workspaceRoot,
      encoding: "utf-8",
      stdio: "pipe",
      timeout: 60000, // 60 second timeout
    });

    emitEvent("sync_nextra_completed", {
      success: true,
    });

    return withGovernanceMetadata(
      {
        success: true,
        output: output.toString(),
        message: "Nextra sync completed successfully",
      },
      "sync",
      "info",
      RISK_LEVELS.SAFE_TO_AUTO
    );
  } catch (error) {
    emitEvent("sync_nextra_failed", {
      error: error.message,
    });
    return withGovernanceMetadata(
      {
        error: error.message,
        output: error.stdout?.toString() || "",
        stderr: error.stderr?.toString() || "",
      },
      "sync",
      "error",
      RISK_LEVELS.RISK_MEDIUM
    );
  } finally {
    await releaseLock(lockId);
  }
}

// --- Tool: generate_from_template --------------------------------------------

async function generateFromTemplate(args) {
  const rateLimit = checkRateLimit("generate_from_template");
  if (!rateLimit.allowed) {
    return withGovernanceMetadata(
      {
        error: rateLimit.error,
        resetAt: rateLimit.resetAt,
      },
      "generation",
      "error",
      RISK_LEVELS.RISK_LOW
    );
  }

  const lockId = `generate_from_template_${args.template}`;
  const lockResult = await acquireLock(lockId);
  if (!lockResult.success) {
    return withGovernanceMetadata(
      {
        error: lockResult.error,
        lockInfo: lockResult.lockInfo,
      },
      "generation",
      "error",
      RISK_LEVELS.RISK_MEDIUM
    );
  }

  try {
    emitEvent("generate_from_template_started", {
      template: args.template,
      outputPath: args.outputPath,
    });

    const manifest = await loadManifest();
    if (!manifest) {
      return withGovernanceMetadata(
        {
          error: "Failed to load documentation manifest",
        },
        "generation",
        "error",
        RISK_LEVELS.RISK_HIGH
      );
    }

    const templateName = args.template;
    const template = manifest.templates[templateName];

    if (!template) {
      return withGovernanceMetadata(
        {
          error: `Template "${templateName}" not found in manifest`,
          availableTemplates: Object.keys(manifest.templates),
        },
        "generation",
        "error",
        RISK_LEVELS.RISK_MEDIUM
      );
    }

    const templatePath = path.resolve(workspaceRoot, template.path);
    const outputPath = path.resolve(workspaceRoot, args.outputPath);

    // Validate output path
    const pathValidation = validateOutputPath(outputPath);
    if (!pathValidation.valid) {
      return withGovernanceMetadata(
        {
          error: pathValidation.error,
        },
        "generation",
        "error",
        RISK_LEVELS.RISK_HIGH
      );
    }

    // Sanitize template data
    const sanitizedData = sanitizeTemplateData(args.data || {});

    // Validate template schema
    const schemaValidation = await validateTemplateSchema(
      template,
      sanitizedData
    );
    if (!schemaValidation.valid) {
      return withGovernanceMetadata(
        {
          error: "Template schema validation failed",
          validationErrors: schemaValidation.errors,
          warnings: schemaValidation.warnings,
        },
        "generation",
        "error",
        RISK_LEVELS.RISK_MEDIUM
      );
    }

    // Create backup if file exists
    let backup = null;
    try {
      await fs.stat(outputPath);
      backup = await createBackup(outputPath);
    } catch (error) {
      // File doesn't exist, no backup needed
    }

    // Read template
    const templateContent = await fs.readFile(templatePath, "utf-8");

    // Template replacement with validation
    let generated = templateContent;
    for (const [key, value] of Object.entries(sanitizedData)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      generated = generated.replace(regex, value);
    }

    // Check for unresolved placeholders
    const unresolvedPlaceholders = generated.match(/\{\{(\w+)\}\}/g);
    if (unresolvedPlaceholders) {
      return withGovernanceMetadata(
        {
          error: "Unresolved placeholders found",
          unresolved: unresolvedPlaceholders,
        },
        "generation",
        "error",
        RISK_LEVELS.RISK_MEDIUM
      );
    }

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write file
    await fs.writeFile(outputPath, generated, "utf-8");

    emitEvent("generate_from_template_completed", {
      template: templateName,
      outputPath,
      backupCreated: backup?.success || false,
    });

    return withGovernanceMetadata(
      {
        success: true,
        outputPath,
        template: templateName,
        sections: template.sections,
        backup: backup?.success ? { path: backup.backupPath } : null,
        warnings: schemaValidation.warnings,
      },
      "generation",
      "info",
      RISK_LEVELS.SAFE_TO_AUTO
    );
  } catch (error) {
    emitEvent("generate_from_template_failed", {
      error: error.message,
      template: args.template,
    });
    return withGovernanceMetadata(
      {
        error: error.message,
        templatePath: template?.path,
        outputPath: args.outputPath,
      },
      "generation",
      "error",
      RISK_LEVELS.RISK_HIGH
    );
  } finally {
    await releaseLock(lockId);
  }
}

// --- Tool Handlers ------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "validate_docs",
        description:
          "Validate documentation structure, templates, links, and manifest compliance",
        inputSchema: {
          type: "object",
          properties: {
            checkLinks: {
              type: "boolean",
              description: "Check for broken links",
              default: true,
            },
            checkTemplates: {
              type: "boolean",
              description: "Check template compliance",
              default: true,
            },
            checkStructure: {
              type: "boolean",
              description: "Check structure integrity",
              default: true,
            },
            checkManifest: {
              type: "boolean",
              description: "Check manifest compliance",
              default: true,
            },
          },
        },
      },
      {
        name: "update_token_reference",
        description:
          "Auto-generate token reference documentation from globals.css (with semantic parsing)",
        inputSchema: {
          type: "object",
          properties: {
            sourcePath: {
              type: "string",
              description:
                "Path to globals.css (default: packages/ui/src/design/globals.css)",
            },
            outputPath: {
              type: "string",
              description:
                "Output path (default: docs/09-reference/tokens/auto/tokens-reference.md)",
            },
          },
        },
      },
      {
        name: "sync_nextra",
        description:
          "Trigger Nextra documentation sync (runs apps/docs/scripts/sync-docs.ts) with file locking",
        inputSchema: {
          type: "object",
          properties: {
            force: {
              type: "boolean",
              description: "Force sync even if no changes",
              default: false,
            },
          },
        },
      },
      {
        name: "generate_from_template",
        description:
          "Generate documentation from a template defined in ui-docs.manifest.json (with schema validation)",
        inputSchema: {
          type: "object",
          properties: {
            template: {
              type: "string",
              description: "Template name from manifest",
            },
            outputPath: {
              type: "string",
              description: "Output file path",
            },
            data: {
              type: "object",
              description: "Template data (key-value pairs)",
            },
          },
          required: ["template", "outputPath"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "validate_docs":
        return await validateDocs(args || {});

      case "update_token_reference":
        return await updateTokenReference(args || {});

      case "sync_nextra":
        return await syncNextra(args || {});

      case "generate_from_template":
        return await generateFromTemplate(args || {});

      default:
        return {
          error: `Unknown tool: ${name}`,
        };
    }
  } catch (error) {
    emitEvent("tool_error", {
      tool: name,
      error: error.message,
    });
    return {
      error: error.message,
      stack: error.stack,
    };
  }
});

// Cleanup on exit
process.on("SIGINT", async () => {
  // Release all locks
  for (const lockId of activeLocks) {
    await releaseLock(lockId);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  // Release all locks
  for (const lockId of activeLocks) {
    await releaseLock(lockId);
  }
  process.exit(0);
});

console.error("AIBOS Documentation MCP Server v2.0.0 running on stdio");

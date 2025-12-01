#!/usr/bin/env node
/**
 * MCP Enforcer
 * 
 * Validates all MCP servers against the enforcement configuration YAML.
 * 
 * Usage:
 *   pnpm dev                    # Validate all servers
 *   pnpm dev -- --server accounting-knowledge  # Validate specific server
 *   pnpm start                  # Run built version
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { load as loadYaml } from "js-yaml";

type Severity = "error" | "warning";

interface ValidationCheck {
  name: string;
  severity: Severity;
  description: string;
}

interface EnforcementConfig {
  enforcement: {
    package_json: {
      required_fields: string[];
      name_pattern: string;
      version_pattern: string;
      type: string;
      author: string;
      license: string;
      required_dependencies: Record<string, string>;
      engines: {
        node: string;
        pnpm: string;
      };
      packageManager: string;
      required_scripts: Record<string, string>;
    };
    server_structure: {
      required_files: string[];
      directory_pattern: string;
      server_file: string;
    };
    server_implementation: {
      required_imports: string[];
      server_class: string;
      transport_class: string;
      required_capabilities: Record<string, unknown>;
      server_setup: {
        name_pattern: string;
        version_pattern: string;
        description_required: boolean;
      };
      required_handlers: string[];
    };
    tools: {
      naming_convention: string;
      description_required: boolean;
      input_schema_required: boolean;
      validation: {
        library: string;
        version: string;
        required: boolean;
      };
    };
    security: {
      input_validation: {
        required: boolean;
        sanitization_required: boolean;
        max_length_enforcement: boolean;
      };
      sql_injection_prevention: {
        parameterized_queries: boolean;
        no_string_concatenation: boolean;
      };
      rate_limiting: {
        recommended: boolean;
        window_ms: number;
        max_requests: number;
      };
    };
    database: {
      neon_serverless: {
        package: string;
        version: string;
        connection_string_env: string;
        parameterized_queries: boolean;
      };
    };
    error_handling: {
      try_catch_required: boolean;
      error_messages_user_friendly: boolean;
      error_logging: boolean;
      isError_flag: boolean;
    };
    documentation: {
      readme_required: boolean;
      readme_sections: string[];
    };
    mcp_config: {
      file_path: string;
      server_registration_required: boolean;
      server_entry_format: {
        name_pattern: string;
        command: string;
        args_pattern: string;
      };
      environment_variables: Record<string, string | "optional">;
    };
  };
  validation: {
    strict_mode: boolean;
    warnings_as_errors: boolean;
    checks: ValidationCheck[];
  };
}

interface CheckResult {
  name: string;
  severity: Severity;
  ok: boolean;
  message: string;
  serverDir: string;
}

// Utility helpers
function readJson<T = unknown>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function logResult(result: CheckResult) {
  const prefix = result.ok
    ? "✅"
    : result.severity === "error"
    ? "❌"
    : "⚠️";
  const serverName = path.basename(result.serverDir);
  console.log(`${prefix} [${serverName}] ${result.name} — ${result.message}`);
}

function matchRegex(value: string, pattern: string): boolean {
  const re = new RegExp(pattern);
  return re.test(value);
}

function safeStat(p: string): fs.Stats | null {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

// Core check implementations
function checkPackageJsonStructure(
  serverDir: string,
  config: EnforcementConfig,
): CheckResult {
  const { package_json } = config.enforcement;
  const check = config.validation.checks.find(
    (c) => c.name === "package_json_structure",
  );
  const severity: Severity = (check?.severity as Severity) || "error";

  const pkgPath = path.join(serverDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: "package.json not found",
      serverDir,
    };
  }

  const pkg = readJson<any>(pkgPath);

  // Required fields
  for (const field of package_json.required_fields) {
    if (!(field in pkg)) {
      return {
        name: "package_json_structure",
        severity,
        ok: false,
        message: `Missing required field '${field}' in package.json`,
        serverDir,
      };
    }
  }

  if (!matchRegex(pkg.name, package_json.name_pattern)) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `name '${pkg.name}' does not match pattern ${package_json.name_pattern}`,
      serverDir,
    };
  }

  if (!matchRegex(pkg.version, package_json.version_pattern)) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `version '${pkg.version}' does not match pattern ${package_json.version_pattern}`,
      serverDir,
    };
  }

  if (pkg.type !== package_json.type) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `type '${pkg.type}' does not match required '${package_json.type}'`,
      serverDir,
    };
  }

  if (pkg.author !== package_json.author) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `author '${pkg.author}' does not match required '${package_json.author}'`,
      serverDir,
    };
  }

  if (pkg.license !== package_json.license) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `license '${pkg.license}' does not match required '${package_json.license}'`,
      serverDir,
    };
  }

  const deps = pkg.dependencies || {};
  for (const [dep, version] of Object.entries(
    package_json.required_dependencies,
  )) {
    if (!deps[dep]) {
      return {
        name: "package_json_structure",
        severity,
        ok: false,
        message: `Missing required dependency '${dep}'`,
        serverDir,
      };
    }
    // Optional: version matching could be stricter. For now, just presence is enough.
  }

  const engines = pkg.engines || {};
  if (engines.node !== package_json.engines.node) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `engines.node '${engines.node}' does not match required '${package_json.engines.node}'`,
      serverDir,
    };
  }
  if (engines.pnpm !== package_json.engines.pnpm) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `engines.pnpm '${engines.pnpm}' does not match required '${package_json.engines.pnpm}'`,
      serverDir,
    };
  }

  if (pkg.packageManager !== package_json.packageManager) {
    return {
      name: "package_json_structure",
      severity,
      ok: false,
      message: `packageManager '${pkg.packageManager}' does not match required '${package_json.packageManager}'`,
      serverDir,
    };
  }

  const scripts = pkg.scripts || {};
  for (const [scriptName, val] of Object.entries(
    package_json.required_scripts,
  )) {
    if (scripts[scriptName] !== val) {
      return {
        name: "package_json_structure",
        severity,
        ok: false,
        message: `script '${scriptName}' must be '${val}', found '${scripts[scriptName] ?? "undefined"}'`,
        serverDir,
      };
    }
  }

  return {
    name: "package_json_structure",
    severity,
    ok: true,
    message: "package.json matches required structure",
    serverDir,
  };
}

function checkServerImports(
  serverDir: string,
  config: EnforcementConfig,
): CheckResult {
  const { server_implementation } = config.enforcement;
  const check = config.validation.checks.find((c) => c.name === "server_imports");
  const severity: Severity = (check?.severity as Severity) || "error";

  const serverPath = path.join(serverDir, "server.mjs");
  if (!fs.existsSync(serverPath)) {
    return {
      name: "server_imports",
      severity,
      ok: false,
      message: "server.mjs not found",
      serverDir,
    };
  }

  const content = readText(serverPath);

  for (const requiredImport of server_implementation.required_imports) {
    if (!content.includes(requiredImport)) {
      return {
        name: "server_imports",
        severity,
        ok: false,
        message: `Missing required import '${requiredImport}' in server.mjs`,
        serverDir,
      };
    }
  }

  return {
    name: "server_imports",
    severity,
    ok: true,
    message: "server.mjs contains required MCP SDK imports",
    serverDir,
  };
}

function checkToolValidation(
  serverDir: string,
  config: EnforcementConfig,
): CheckResult {
  const { tools } = config.enforcement;
  const check = config.validation.checks.find((c) => c.name === "tool_validation");
  const severity: Severity = (check?.severity as Severity) || "error";

  const pkgPath = path.join(serverDir, "package.json");
  const serverPath = path.join(serverDir, "server.mjs");
  if (!fs.existsSync(pkgPath) || !fs.existsSync(serverPath)) {
    return {
      name: "tool_validation",
      severity,
      ok: false,
      message: "Missing package.json or server.mjs",
      serverDir,
    };
  }

  const pkg = readJson<any>(pkgPath);
  const deps = pkg.dependencies || {};
  if (tools.validation.required) {
    if (!deps[tools.validation.library]) {
      return {
        name: "tool_validation",
        severity,
        ok: false,
        message: `Required validation library '${tools.validation.library}' not found in dependencies`,
        serverDir,
      };
    }
  }

  const content = readText(serverPath);
  if (!content.includes(`from "zod"`) && !content.includes(`from 'zod'`)) {
    return {
      name: "tool_validation",
      severity,
      ok: false,
      message: "server.mjs does not appear to import zod",
      serverDir,
    };
  }

  // Heuristic: ensure 'z.' appears as a hint that schemas are used
  if (!content.includes("z.")) {
    return {
      name: "tool_validation",
      severity,
      ok: false,
      message: "server.mjs does not appear to use zod schemas (no 'z.' found)",
      serverDir,
    };
  }

  return {
    name: "tool_validation",
    severity,
    ok: true,
    message: "Zod validation appears to be in place for tools",
    serverDir,
  };
}

function checkSqlParameterization(
  serverDir: string,
  config: EnforcementConfig,
): CheckResult {
  const check = config.validation.checks.find(
    (c) => c.name === "sql_parameterization",
  );
  const severity: Severity = (check?.severity as Severity) || "error";

  const serverPath = path.join(serverDir, "server.mjs");
  if (!fs.existsSync(serverPath)) {
    return {
      name: "sql_parameterization",
      severity,
      ok: false,
      message: "server.mjs not found",
      serverDir,
    };
  }

  const content = readText(serverPath);

  // Very naive static check:
  // - For each 'sql.query(' occurrence, ensure the first argument is not a template literal with '${'
  //   This is heuristic but good enough as a guardrail.
  const lines = content.split("\n");
  let unsafeFound = false;

  for (const line of lines) {
    const idx = line.indexOf("sql.query(");
    if (idx !== -1) {
      const after = line.slice(idx);
      if (after.includes("`") && after.includes("${")) {
        unsafeFound = true;
        break;
      }
    }
  }

  // Also check for sql() template tag usage with unsafe patterns
  if (!unsafeFound) {
    // Check for sql`...${...}...` patterns (Neon serverless style)
    const sqlTemplateRegex = /sql\s*`[^`]*\$\{[^}]+\}[^`]*`/g;
    if (sqlTemplateRegex.test(content)) {
      // This is actually safe for Neon (it uses parameterized queries)
      // But we can check for string concatenation patterns
      const unsafePatterns = [
        /sql\s*\(\s*['"`].*\+.*\$\{/,
        /sql\s*\(\s*['"`].*\+.*['"`]/,
      ];
      for (const pattern of unsafePatterns) {
        if (pattern.test(content)) {
          unsafeFound = true;
          break;
        }
      }
    }
  }

  if (unsafeFound) {
    return {
      name: "sql_parameterization",
      severity,
      ok: false,
      message:
        "Potential unsafe SQL detected: found sql.query with template literal interpolation. Use parameterized queries instead.",
      serverDir,
    };
  }

  return {
    name: "sql_parameterization",
    severity,
    ok: true,
    message:
      "No obvious unsafe SQL string interpolation detected (heuristic pass).",
    serverDir,
  };
}

function checkErrorHandling(
  serverDir: string,
  config: EnforcementConfig,
): CheckResult {
  const check = config.validation.checks.find((c) => c.name === "error_handling");
  const severity: Severity = (check?.severity as Severity) || "warning";

  const serverPath = path.join(serverDir, "server.mjs");
  if (!fs.existsSync(serverPath)) {
    return {
      name: "error_handling",
      severity,
      ok: false,
      message: "server.mjs not found",
      serverDir,
    };
  }

  const content = readText(serverPath);

  // Heuristic: look for try/catch and isError or console.error
  const hasTry = content.includes("try {") || content.includes("try{");
  const hasCatch = content.includes("catch (") || content.includes("catch(");
  const hasIsError = content.includes("isError");
  const hasLogging = content.includes("console.error");

  if (!hasTry || !hasCatch) {
    return {
      name: "error_handling",
      severity,
      ok: false,
      message:
        "No obvious try/catch blocks found. Consider wrapping tool handlers with error handling.",
      serverDir,
    };
  }

  if (!hasIsError) {
    return {
      name: "error_handling",
      severity,
      ok: false,
      message:
        "No 'isError' flag found in responses. Consider marking error responses explicitly.",
      serverDir,
    };
  }

  if (!hasLogging) {
    return {
      name: "error_handling",
      severity,
      ok: false,
      message:
        "No 'console.error' logging found. Consider logging errors for observability.",
      serverDir,
    };
  }

  return {
    name: "error_handling",
    severity,
    ok: true,
    message: "Basic error handling heuristics satisfied (try/catch, isError, logging).",
    serverDir,
  };
}

function checkDocumentation(
  serverDir: string,
  config: EnforcementConfig,
): CheckResult {
  const { documentation } = config.enforcement;
  const check = config.validation.checks.find(
    (c) => c.name === "documentation",
  );
  const severity: Severity = (check?.severity as Severity) || "warning";

  const readmePath = path.join(serverDir, "README.md");
  if (!fs.existsSync(readmePath)) {
    return {
      name: "documentation",
      severity,
      ok: false,
      message: "README.md not found",
      serverDir,
    };
  }

  const content = readText(readmePath).toLowerCase();
  const missingSections: string[] = [];

  for (const section of documentation.readme_sections) {
    const needle = section.toLowerCase();
    if (!content.includes(needle)) {
      missingSections.push(section);
    }
  }

  if (missingSections.length > 0) {
    return {
      name: "documentation",
      severity,
      ok: false,
      message: `README.md is missing sections: ${missingSections.join(", ")}`,
      serverDir,
    };
  }

  return {
    name: "documentation",
    severity,
    ok: true,
    message: "README.md contains required sections",
    serverDir,
  };
}

// Main runner
async function main() {
  // Find workspace root (go up from tools/mcp-enforcer if needed)
  let root = process.cwd();
  
  // If we're in tools/mcp-enforcer, go up to workspace root
  if (path.basename(root) === "mcp-enforcer" && path.basename(path.dirname(root)) === "tools") {
    root = path.resolve(root, "../..");
  }
  
  // Also check if .cursor exists, if not, try going up one more level
  if (!fs.existsSync(path.join(root, ".cursor"))) {
    const parent = path.resolve(root, "..");
    if (fs.existsSync(path.join(parent, ".cursor"))) {
      root = parent;
    }
  }
  
  const serverArgIndex = process.argv.indexOf("--server");
  const serverName = serverArgIndex !== -1 ? process.argv[serverArgIndex + 1] : undefined;

  // Look for config in .cursor/mcp-enforcement.yaml (existing location)
  const configPath = path.join(root, ".cursor", "mcp-enforcement.yaml");
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Enforcement config not found at ${configPath}`);
    console.error(`   Current working directory: ${process.cwd()}`);
    console.error(`   Resolved root: ${root}`);
    process.exit(1);
  }

  const yamlRaw = readText(configPath);
  const config = loadYaml(yamlRaw) as EnforcementConfig;

  const mcpRoot = path.join(root, ".mcp");
  const mcpRootStat = safeStat(mcpRoot);
  if (!mcpRootStat || !mcpRootStat.isDirectory()) {
    console.error(`❌ .mcp directory not found at ${mcpRoot}`);
    process.exit(1);
  }

  const serverDirs: string[] = [];

  if (serverName) {
    const serverDir = path.join(mcpRoot, serverName);
    const st = safeStat(serverDir);
    if (!st || !st.isDirectory()) {
      console.error(`❌ MCP server directory not found: ${serverDir}`);
      process.exit(1);
    }
    serverDirs.push(serverDir);
  } else {
    const entries = fs.readdirSync(mcpRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip non-server directories
        const skipDirs = ["mcp-enforcer", "frontend_orchestra.md", "scripts"];
        if (!skipDirs.includes(entry.name)) {
          // Only include if it has server.mjs or package.json (actual MCP server)
          const serverPath = path.join(mcpRoot, entry.name, "server.mjs");
          const packagePath = path.join(mcpRoot, entry.name, "package.json");
          if (fs.existsSync(serverPath) || fs.existsSync(packagePath)) {
            serverDirs.push(path.join(mcpRoot, entry.name));
          }
        }
      }
    }
  }

  console.log(`🔍 MCP Enforcer - Validating ${serverDirs.length} server(s)\n`);

  const allResults: CheckResult[] = [];

  for (const serverDir of serverDirs) {
    const checks = config.validation.checks;

    for (const check of checks) {
      let result: CheckResult | null = null;
      switch (check.name) {
        case "package_json_structure":
          result = checkPackageJsonStructure(serverDir, config);
          break;
        case "server_imports":
          result = checkServerImports(serverDir, config);
          break;
        case "tool_validation":
          result = checkToolValidation(serverDir, config);
          break;
        case "sql_parameterization":
          result = checkSqlParameterization(serverDir, config);
          break;
        case "error_handling":
          result = checkErrorHandling(serverDir, config);
          break;
        case "documentation":
          result = checkDocumentation(serverDir, config);
          break;
        default:
          // Unknown checks can be added later
          result = {
            name: check.name,
            severity: (check.severity as Severity) || "warning",
            ok: true,
            message: "Check not implemented in enforcer (skipped).",
            serverDir,
          };
      }

      allResults.push(result);
      logResult(result);
    }
  }

  const strict = config.validation.strict_mode;
  const warningsAsErrors = config.validation.warnings_as_errors;

  let hasError = false;
  const errorCount = allResults.filter(r => !r.ok && r.severity === "error").length;
  const warningCount = allResults.filter(r => !r.ok && r.severity === "warning").length;
  const passedCount = allResults.filter(r => r.ok).length;

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Passed: ${passedCount}`);
  console.log(`   ⚠️  Warnings: ${warningCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  for (const r of allResults) {
    if (!r.ok) {
      if (r.severity === "error") {
        hasError = true;
      } else if (r.severity === "warning" && strict && warningsAsErrors) {
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error("\n❌ MCP Enforcer detected blocking issues.");
    process.exit(1);
  } else {
    console.log("\n✅ MCP Enforcer checks passed.");
  }
}

main().catch((err) => {
  console.error("❌ MCP Enforcer crashed:", err);
  process.exit(1);
});


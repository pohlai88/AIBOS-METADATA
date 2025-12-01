#!/usr/bin/env node
/**
 * MCP Enforcer
 *
 * Validates all MCP servers against the enforcement configuration YAML.
 *
 * Usage:
 *   node index.mjs                    # Validate all servers
 *   node index.mjs --strict           # Fail on warnings
 *   node index.mjs <server-name>      # Validate specific server
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, "../../");

// Load enforcement configuration
const enforcementPath = join(workspaceRoot, ".cursor", "mcp-enforcement.yaml");
const enforcementConfig = yaml.load(readFileSync(enforcementPath, "utf-8"));

// Load MCP config
const mcpConfigPath = join(workspaceRoot, ".cursor", "mcp.json");
const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));

// Validation results
const results = {
  errors: [],
  warnings: [],
  passed: [],
};

/**
 * Validate package.json
 */
function validatePackageJson(serverDir, serverName) {
  const packagePath = join(serverDir, "package.json");
  if (!existsSync(packagePath)) {
    results.errors.push({
      server: serverName,
      check: "package_json_structure",
      message: "package.json is missing",
    });
    return null;
  }

  const pkg = JSON.parse(readFileSync(packagePath, "utf-8"));
  const rules = enforcementConfig.enforcement.package_json;

  // Check required fields
  for (const field of rules.required_fields) {
    if (!(field in pkg)) {
      results.errors.push({
        server: serverName,
        check: "package_json_structure",
        message: `Missing required field: ${field}`,
      });
    }
  }

  // Check name pattern
  if (!new RegExp(rules.name_pattern).test(pkg.name)) {
    results.errors.push({
      server: serverName,
      check: "package_json_structure",
      message: `Package name '${pkg.name}' does not match pattern ${rules.name_pattern}`,
    });
  }

  // Check version pattern
  if (!new RegExp(rules.version_pattern).test(pkg.version)) {
    results.errors.push({
      server: serverName,
      check: "package_json_structure",
      message: `Version '${pkg.version}' does not match pattern ${rules.version_pattern}`,
    });
  }

  // Check type
  if (pkg.type !== rules.type) {
    results.errors.push({
      server: serverName,
      check: "package_json_structure",
      message: `Type must be '${rules.type}', got '${pkg.type}'`,
    });
  }

  // Check required dependencies
  for (const [dep, expectedVersion] of Object.entries(
    rules.required_dependencies
  )) {
    if (!pkg.dependencies || !pkg.dependencies[dep]) {
      results.errors.push({
        server: serverName,
        check: "package_json_structure",
        message: `Missing required dependency: ${dep}`,
      });
    } else {
      // Version check: allow ^, ~, >= prefixes
      const actualVersion = pkg.dependencies[dep];
      const expectedBase = expectedVersion.replace(/^[\^~>=]+/, "");
      const actualBase = actualVersion.replace(/^[\^~>=]+/, "");
      // Just check that the major.minor matches (loose check)
      if (
        expectedBase.split(".")[0] !== actualBase.split(".")[0] ||
        expectedBase.split(".")[1] !== actualBase.split(".")[1]
      ) {
        results.warnings.push({
          server: serverName,
          check: "package_json_structure",
          message: `Dependency ${dep} version mismatch. Expected ${expectedVersion}, got ${actualVersion}`,
        });
      }
    }
  }

  // Check Zod dependency (if tools validation is required)
  if (enforcementConfig.enforcement.tools.validation.required) {
    const zodDep = enforcementConfig.enforcement.tools.validation.library;
    const zodVersion = enforcementConfig.enforcement.tools.validation.version;
    if (!pkg.dependencies || !pkg.dependencies[zodDep]) {
      results.errors.push({
        server: serverName,
        check: "tool_validation",
        message: `Missing required dependency for tool validation: ${zodDep}`,
      });
    }
  }

  return pkg;
}

/**
 * Validate server.mjs
 */
function validateServerMjs(serverDir, serverName) {
  const serverPath = join(serverDir, "server.mjs");
  if (!existsSync(serverPath)) {
    results.errors.push({
      server: serverName,
      check: "server_imports",
      message: "server.mjs is missing",
    });
    return null;
  }

  const content = readFileSync(serverPath, "utf-8");
  const rules = enforcementConfig.enforcement.server_implementation;

  // Check required imports
  for (const importPath of rules.required_imports) {
    if (!content.includes(importPath)) {
      results.errors.push({
        server: serverName,
        check: "server_imports",
        message: `Missing required import: ${importPath}`,
      });
    }
  }

  // Check Server class usage
  if (!content.includes(`new ${rules.server_class}(`)) {
    results.errors.push({
      server: serverName,
      check: "server_imports",
      message: `Server must use ${rules.server_class} class`,
    });
  }

  // Check server name pattern
  const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
  if (nameMatch) {
    const serverNameValue = nameMatch[1];
    if (!new RegExp(rules.server_setup.name_pattern).test(serverNameValue)) {
      results.errors.push({
        server: serverName,
        check: "server_imports",
        message: `Server name '${serverNameValue}' does not match pattern ${rules.server_setup.name_pattern}`,
      });
    }
  } else {
    results.errors.push({
      server: serverName,
      check: "server_imports",
      message: "Server name not found in server.mjs",
    });
  }

  // Check description (if required)
  if (rules.server_setup.description_required) {
    if (!content.includes("description:")) {
      results.warnings.push({
        server: serverName,
        check: "server_imports",
        message: "Server description is recommended but not found",
      });
    }
  }

  // Check required handlers
  for (const handler of rules.required_handlers) {
    if (!content.includes(handler)) {
      results.errors.push({
        server: serverName,
        check: "server_imports",
        message: `Missing required handler: ${handler}`,
      });
    }
  }

  // Check try/catch (error handling)
  if (enforcementConfig.enforcement.error_handling.try_catch_required) {
    if (!content.includes("try") || !content.includes("catch")) {
      results.warnings.push({
        server: serverName,
        check: "error_handling",
        message: "Try/catch blocks recommended for error handling",
      });
    }
  }

  // Check isError flag
  if (enforcementConfig.enforcement.error_handling.isError_flag) {
    if (!content.includes("isError")) {
      results.warnings.push({
        server: serverName,
        check: "error_handling",
        message: "isError flag recommended for error responses",
      });
    }
  }

  // Check SQL parameterization
  if (content.includes("sql") || content.includes("query")) {
    // Check for parameterized queries ($1, $2, etc.)
    const hasParameterized = /\$[0-9]+/.test(content);
    const hasStringConcat =
      /\+.*['"]/.test(content) && content.includes("SELECT");

    if (!hasParameterized && hasStringConcat) {
      results.errors.push({
        server: serverName,
        check: "sql_parameterization",
        message:
          "SQL queries must use parameterized queries ($1, $2, etc.), not string concatenation",
      });
    }
  }

  return content;
}

/**
 * Validate README.md
 */
function validateReadme(serverDir, serverName) {
  const readmePath = join(serverDir, "README.md");
  if (!existsSync(readmePath)) {
    results.errors.push({
      server: serverName,
      check: "documentation",
      message: "README.md is missing",
    });
    return null;
  }

  const content = readFileSync(readmePath, "utf-8");
  const requiredSections =
    enforcementConfig.enforcement.documentation.readme_sections;

  for (const section of requiredSections) {
    // Check for section heading (## Section or # Section)
    const sectionRegex = new RegExp(`^#+\\s+${section}`, "mi");
    if (!sectionRegex.test(content)) {
      results.warnings.push({
        server: serverName,
        check: "documentation",
        message: `README.md missing section: ${section}`,
      });
    }
  }

  return content;
}

/**
 * Validate MCP config entry
 */
function validateMcpConfig(serverName) {
  const rules = enforcementConfig.enforcement.mcp_config.server_entry_format;
  // MCP config uses 'aibos-{name}' format, but server directory is just '{name}'
  const mcpConfigKey = `aibos-${serverName}`;
  const entry = mcpConfig.mcpServers[mcpConfigKey];

  if (!entry) {
    results.errors.push({
      server: serverName,
      check: "mcp_config",
      message: `Server '${mcpConfigKey}' not found in .cursor/mcp.json`,
    });
    return;
  }

  // Check name pattern (using the MCP config key)
  if (!new RegExp(rules.name_pattern).test(mcpConfigKey)) {
    results.errors.push({
      server: serverName,
      check: "mcp_config",
      message: `MCP config name '${mcpConfigKey}' does not match pattern ${rules.name_pattern}`,
    });
  }

  // Check command
  if (entry.command !== rules.command) {
    results.errors.push({
      server: serverName,
      check: "mcp_config",
      message: `Command must be '${rules.command}', got '${entry.command}'`,
    });
  }

  // Check args pattern
  if (entry.args && entry.args.length > 0) {
    const argsStr = entry.args[0];
    if (!new RegExp(rules.args_pattern).test(argsStr)) {
      results.errors.push({
        server: serverName,
        check: "mcp_config",
        message: `Args '${argsStr}' does not match pattern ${rules.args_pattern}`,
      });
    }
  }
}

/**
 * Validate a single server
 */
function validateServer(serverName) {
  const serverDir = join(workspaceRoot, ".mcp", serverName);

  if (!existsSync(serverDir)) {
    results.errors.push({
      server: serverName,
      check: "server_structure",
      message: `Server directory not found: ${serverDir}`,
    });
    return;
  }

  // Validate package.json
  const pkg = validatePackageJson(serverDir, serverName);

  // Validate server.mjs
  const serverContent = validateServerMjs(serverDir, serverName);

  // Validate README.md
  validateReadme(serverDir, serverName);

  // Validate MCP config entry
  validateMcpConfig(serverName);

  // If all checks passed
  if (pkg && serverContent) {
    results.passed.push(serverName);
  }
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  const strictMode = args.includes("--strict");
  const targetServer = args.find((arg) => !arg.startsWith("--"));

  console.log(chalk.blue("🔍 MCP Enforcer - Validating MCP Servers\n"));

  if (targetServer) {
    // Validate specific server
    validateServer(targetServer);
  } else {
    // Validate all servers in .mcp directory
    const mcpDir = join(workspaceRoot, ".mcp");
    const servers = readdirSync(mcpDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const server of servers) {
      // Only validate servers that match the pattern
      if (/^[a-z0-9-]+$/.test(server)) {
        validateServer(server);
      }
    }
  }

  // Print results
  console.log(chalk.green(`✅ Passed: ${results.passed.length}`));
  if (results.passed.length > 0) {
    results.passed.forEach((server) => {
      console.log(chalk.green(`   - ${server}`));
    });
  }

  if (results.warnings.length > 0) {
    console.log(chalk.yellow(`\n⚠️  Warnings: ${results.warnings.length}`));
    results.warnings.forEach((warning) => {
      console.log(
        chalk.yellow(
          `   [${warning.server}] ${warning.check}: ${warning.message}`
        )
      );
    });
  }

  if (results.errors.length > 0) {
    console.log(chalk.red(`\n❌ Errors: ${results.errors.length}`));
    results.errors.forEach((error) => {
      console.log(
        chalk.red(`   [${error.server}] ${error.check}: ${error.message}`)
      );
    });
  }

  // Exit code
  const hasErrors = results.errors.length > 0;
  const hasWarningsInStrict = strictMode && results.warnings.length > 0;

  if (hasErrors || hasWarningsInStrict) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();

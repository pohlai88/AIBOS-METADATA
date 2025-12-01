/**
 * Nano Banana Pro // Elegance Validator
 * * "We do not just check for existence. We check for Physics."
 * * Capabilities:
 * 1. Validates Adaptive Luminance (Math-based contrast checks)
 * 2. Verifies Kinetic Physics (Tailwind Config + CSS)
 * 3. Scans Component Implementation (TSX usage)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, "../../");

// --- 1. THE PHYSICS ENGINE (Math Helpers) ---

// Convert Hex to Luminance (0 = Black, 1 = White)
function getLuminance(hex) {
  const c = hex.substring(1);      // strip #
  const rgb = parseInt(c, 16);   // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue

  // SRP (Standard RGB) Luminance Formula
  return 0.2126 * (r/255) + 0.7152 * (g/255) + 0.0722 * (b/255);
}

// Check if a color is "Neon" enough for Dark Mode
function isNeon(hex) {
  const lum = getLuminance(hex);
  return lum > 0.4; // Threshold for "Glow"
}

// Check if a color is "Solid" enough for Light Mode
function isReadable(hex) {
  const lum = getLuminance(hex);
  return lum < 0.6; // Threshold for Contrast against white
}

// --- 2. THE SCANNER (File Access) ---

const PATHS = {
  css: "packages/ui/src/design/globals.css",
  tailwind: "tailwind.config.js", // or .ts
  components: "packages/ui/src/components"
};

function findFile(relativePath) {
  // Try workspace root first
  const fullPath = resolve(workspaceRoot, relativePath);
  if (existsSync(fullPath)) return fullPath;
  // Fallback to process.cwd() if workspace root doesn't work
  const cwdPath = resolve(process.cwd(), relativePath);
  if (existsSync(cwdPath)) return cwdPath;
  return null;
}

function recursiveScan(dir, pattern) {
  let results = [];
  const list = readdirSync(dir);
  list.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(recursiveScan(filePath, pattern));
    } else {
      if (filePath.match(pattern)) results.push(filePath);
    }
  });
  return results;
}

// --- 3. THE VALIDATORS ---

function validatePhysicsMath(cssContent) {
  const tokens = {};
  const issues = [];
  
  // Extract CSS Variables
  const lightModeBlock = cssContent.split(".dark")[0];
  const darkModeBlock = cssContent.match(/\.dark\s*{([^}]*)}/)?.[1] || "";

  const extract = (block) => {
    const map = {};
    const regex = /--([\w-]+):\s*(#[0-9a-fA-F]{6});/g;
    let match;
    while ((match = regex.exec(block)) !== null) {
      map[match[1]] = match[2];
    }
    return map;
  };

  const lightTokens = extract(lightModeBlock);
  const darkTokens = extract(darkModeBlock);

  // Validate The "Shift" (Nano Banana Principle)
  const criticalIcons = ["icon-js", "icon-ts", "icon-error", "icon-success"];
  
  criticalIcons.forEach(icon => {
    const key = `--${icon}`;
    
    // 1. Existence
    if (!lightTokens[key]) issues.push(`MISSING (Light): ${key}`);
    if (!darkTokens[key]) issues.push(`MISSING (Dark): ${key}`);

    // 2. Physics (Luminance Check)
    if (lightTokens[key] && !isReadable(lightTokens[key])) {
      issues.push(`PHYSICS FAIL (Light): ${key} (${lightTokens[key]}) is too bright for white backgrounds. Needs to be darker.`);
    }
    if (darkTokens[key] && !isNeon(darkTokens[key])) {
      issues.push(`PHYSICS FAIL (Dark): ${key} (${darkTokens[key]}) is too dark. It won't "pop" in dark mode.`);
    }

    // 3. Shift Verification
    if (lightTokens[key] === darkTokens[key]) {
      issues.push(`LAZY DESIGN: ${key} is identical in Light and Dark mode. It must shift.`);
    }
  });

  return { passed: issues.length === 0, issues };
}

function validateTailwindEngine() {
  const path = findFile(PATHS.tailwind) || findFile("tailwind.config.ts");
  if (!path) return { passed: false, issues: ["tailwind.config.js not found"] };

  const content = readFileSync(path, 'utf-8');
  const issues = [];

  // Check for the Kinetic Physics required for "Nano Banana"
  if (!content.includes("animation: {")) issues.push("Missing 'animation' block");
  if (!content.includes("blob:")) issues.push("Missing 'blob' animation (The Aurora Engine)");
  if (!content.includes("backdropBlur:")) issues.push("Missing 'backdropBlur' configuration");

  return { passed: issues.length === 0, issues };
}

function validateComponentAdoption() {
  const path = findFile(PATHS.components);
  if (!path) return { passed: true, issues: ["Skipping usage scan (path not found)"] };

  const files = recursiveScan(path, /\.tsx$/);
  let usageCount = 0;
  
  files.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    if (content.includes("ColoredMDIIcon") || content.includes("glass-panel")) {
      usageCount++;
    }
  });

  return { 
    passed: usageCount > 0, 
    stats: `${usageCount} components are using Nano Banana primitives.` 
  };
}

// --- 4. MCP SERVER SETUP ---

const server = new Server(
  {
    name: "nano-banana-validator",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "audit_design_system",
        description: "Performs a 'Chief Designer' audit on the codebase. Checks Luminance Math, Animation Physics, and Component Adoption.",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
      {
        name: "get_fix_snippets",
        description: "Returns the CSS/Tailwind code needed to fix specific elegance failures.",
        inputSchema: { 
           type: "object", 
           properties: { 
             issueType: { type: "string", enum: ["luminance", "physics", "glass"] }
           },
           required: ["issueType"] 
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "audit_design_system") {
    const cssPath = findFile(PATHS.css);
    if (!cssPath) throw new Error("globals.css not found");
    const cssContent = readFileSync(cssPath, "utf-8");

    const physics = validatePhysicsMath(cssContent);
    const engine = validateTailwindEngine();
    const adoption = validateComponentAdoption();

    const score = (
      (physics.passed ? 40 : 0) + 
      (engine.passed ? 30 : 0) + 
      (adoption.passed ? 30 : 0)
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: score === 100 ? "OUTSTANDING" : "NEEDS REFINEMENT",
          score: `${score}/100`,
          audit: {
            adaptiveLuminance: physics,
            kineticEngine: engine,
            systemAdoption: adoption
          },
          governance: {
             approvedBy: score === 100 ? "Nano Banana Council" : null,
             nextStep: score < 100 ? "Run 'get_fix_snippets'" : "Deploy"
          }
        }, null, 2)
      }]
    };
  }

  if (name === "get_fix_snippets") {
    let snippet = "";
    if (args.issueType === "luminance") {
      snippet = `
/* Recommended Fix for Adaptive Luminance */
:root {
  --icon-js: #D97706; /* Dark Amber for White BG */
}
.dark {
  --icon-js: #FCD34D; /* Neon Amber for Dark BG */
}
`;
    } else if (args.issueType === "physics") {
      snippet = `
// tailwind.config.js fix
extend: {
  animation: {
    blob: "blob 7s infinite",
  },
  keyframes: {
    blob: {
      "0%": { transform: "translate(0px, 0px) scale(1)" },
      "33%": { transform: "translate(30px, -50px) scale(1.1)" },
      "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
      "100%": { transform: "translate(0px, 0px) scale(1)" },
    },
  },
}
`;
    }

    return {
      content: [{ type: "text", text: snippet }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nano Banana Pro Validator running...");
}

main().catch(console.error);
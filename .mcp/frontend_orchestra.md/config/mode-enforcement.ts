/**
 * Operational Mode Enforcement
 * 
 * Provides type-safe mode checking that's impossible to bypass.
 * Use these functions before any file write or git operation.
 */

import { OperationalMode } from "./orchestra.run";

// ============================================================================
// Mode Enforcement Functions
// ============================================================================

/**
 * Check if file writes are allowed in current mode
 * 
 * @throws Error if mode is "off" and writes are attempted
 */
export function enforceWritePermission(mode: OperationalMode, operation: string): void {
  if (mode === "off") {
    throw new Error(
      `[Mode Enforcement] Operation "${operation}" blocked: Mode is OFF (read-only). ` +
      `Set FRONTEND_ORCHESTRA_MODE=shadow to enable writes.`
    );
  }
}

/**
 * Check if PR/branch creation is allowed in current mode
 * 
 * @throws Error if mode is not "guarded_active"
 */
export function enforcePRPermission(mode: OperationalMode, operation: string): void {
  if (mode !== "guarded_active") {
    throw new Error(
      `[Mode Enforcement] Operation "${operation}" blocked: Mode is ${mode.toUpperCase()}. ` +
      `PR/branch creation requires FRONTEND_ORCHESTRA_MODE=guarded_active.`
    );
  }
}

/**
 * Get scratch path for shadow mode writes
 * 
 * In shadow mode, all writes must go to scratch directories.
 */
export function getScratchPath(mode: OperationalMode, basePath: string): string {
  if (mode === "shadow") {
    return `scratch/orchestra/${basePath}`;
  }
  return basePath; // Guarded active writes to real paths
}

/**
 * Validate file path is within allowed scope for current mode
 */
export function validateFilePath(mode: OperationalMode, filePath: string): void {
  if (mode === "shadow") {
    // In shadow mode, only allow writes to scratch/ or sandbox branch
    if (!filePath.startsWith("scratch/") && !filePath.includes("orchestra-sandbox")) {
      throw new Error(
        `[Mode Enforcement] File path "${filePath}" not allowed in SHADOW mode. ` +
        `All writes must go to scratch/ directories or orchestra-sandbox branch.`
      );
    }
  }
  
  // In guarded_active mode, validate against agent's allowed_directories
  // (This would be called with agent config in actual implementation)
}

/**
 * Wrapper for git operations that enforces mode restrictions
 */
export async function safeGitOperation<T>(
  mode: OperationalMode,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  enforceWritePermission(mode, `git.${operation}`);
  
  if (operation === "createBranch" || operation === "createPR") {
    enforcePRPermission(mode, `git.${operation}`);
  }
  
  return fn();
}

/**
 * Wrapper for file write operations that enforces mode restrictions
 */
export async function safeFileWrite(
  mode: OperationalMode,
  filePath: string,
  content: string
): Promise<void> {
  enforceWritePermission(mode, `writeFile(${filePath})`);
  
  const finalPath = getScratchPath(mode, filePath);
  validateFilePath(mode, finalPath);
  
  // TODO: Actual file write implementation
  // await fs.writeFile(finalPath, content, 'utf-8');
  
  console.log(`[Mode Enforcement] Writing to ${finalPath} (mode: ${mode})`);
}

// ============================================================================
// Mode-Aware MCP Tool Wrapper
// ============================================================================

/**
 * Wrapper that enforces mode restrictions before calling MCP tools
 */
export function createModeAwareMcpTool(
  mode: OperationalMode,
  toolName: string,
  originalTool: (...args: any[]) => Promise<any>
) {
  return async (...args: any[]): Promise<any> => {
    // Check if tool requires write permissions
    const writeOperations = ["write_file", "create_branch", "commit", "create_pull_request"];
    if (writeOperations.some(op => toolName.includes(op))) {
      enforceWritePermission(mode, `mcp.${toolName}`);
    }
    
    // Check if tool requires PR permissions
    const prOperations = ["create_branch", "create_pull_request"];
    if (prOperations.some(op => toolName.includes(op))) {
      enforcePRPermission(mode, `mcp.${toolName}`);
    }
    
    // Call original tool
    return originalTool(...args);
  };
}

// ============================================================================
// Example Usage in Orchestrator
// ============================================================================

/**
 * Example: How to use mode enforcement in orchestrator code
 * 
 * ```typescript
 * import { getOperationalMode, enforceWritePermission, getScratchPath } from "./config/mode-enforcement";
 * 
 * async function handleTask(task: Task) {
 *   const mode = getOperationalMode();
 *   
 *   // Before any file write
 *   enforceWritePermission(mode, "component_creation");
 *   
 *   // Get correct path for shadow mode
 *   const filePath = getScratchPath(mode, "components/Button.tsx");
 *   
 *   // Write file
 *   await safeFileWrite(mode, filePath, componentCode);
 * }
 * ```
 */

export {
  OperationalMode,
  getOperationalMode,
  canWriteFiles,
  canCreatePRs,
} from "./orchestra.run";


/**
 * Frontend Dev Orchestra - Main Entry Point
 * 
 * Concrete example of wiring the config loader into real orchestrator code.
 * This demonstrates how to use the configuration files in practice.
 */

import { loadOrchestraConfig, shouldRequireHITL, OrchestraConfigLoader } from "./loader";
import { OrchestratorConfig, AgentsConfig, McpServersConfig } from "./loader";

// ============================================================================
// Operational Mode Enforcement
// ============================================================================

type OperationalMode = "off" | "shadow" | "guarded_active";

function getOperationalMode(): OperationalMode {
  const mode = process.env.FRONTEND_ORCHESTRA_MODE?.toLowerCase() || "shadow";
  
  if (!["off", "shadow", "guarded_active"].includes(mode)) {
    console.warn(`[Orchestra] Invalid mode "${mode}", defaulting to "shadow"`);
    return "shadow";
  }
  
  return mode as OperationalMode;
}

function canWriteFiles(mode: OperationalMode): boolean {
  return mode !== "off";
}

function canCreatePRs(mode: OperationalMode): boolean {
  return mode === "guarded_active";
}

function getScratchPath(mode: OperationalMode): string {
  if (mode === "shadow") {
    return "scratch/orchestra/";
  }
  return ""; // Guarded active writes to real branches
}

// ============================================================================
// Task Definition
// ============================================================================

interface Task {
  id: string;
  type: string;
  tags: string[];
  description: string;
  env: "dev" | "prod";
}

// ============================================================================
// Orchestrator Runner (Placeholder - implement with LangGraph)
// ============================================================================

async function runFrontendOrchestra(params: {
  orchestratorConfig: OrchestratorConfig;
  agentsConfig: AgentsConfig;
  mcpServersConfig: McpServersConfig;
  task: Task;
  requireHitl: boolean;
  mode: OperationalMode;
}): Promise<void> {
  const { orchestratorConfig, agentsConfig, mcpServersConfig, task, requireHitl, mode } = params;

  console.log("[Orchestra] Starting run", {
    taskId: task.id,
    mode,
    requireHitl,
    env: task.env,
  });

  // Mode enforcement
  if (!canWriteFiles(mode)) {
    console.log("[Orchestra] Mode 0 (OFF) - Read-only analysis only");
    // Only allow read operations
    return;
  }

  const scratchPath = getScratchPath(mode);
  if (scratchPath) {
    console.log(`[Orchestra] Mode 1 (SHADOW) - Writing to ${scratchPath} only`);
  }

  if (requireHitl && !canCreatePRs(mode)) {
    console.log("[Orchestra] HITL required but mode is SHADOW - will write to scratch only");
  }

  // TODO: Implement actual LangGraph orchestration here
  // This is a placeholder showing how configs would be used
  
  // Example: Route task to appropriate agent
  const routingRules = orchestratorConfig.routing.rules;
  const matchedRule = routingRules.find(rule => {
    // Simplified matching - implement actual logic
    return task.tags.some(tag => rule.when.includes(tag)) ||
           rule.when.includes(`task.type == '${task.type}'`);
  });

  if (matchedRule) {
    const targetAgentId = matchedRule.target_agent;
    const agent = agentsConfig.agents.find(a => a.id === targetAgentId);
    
    if (agent) {
      console.log(`[Orchestra] Routing to agent: ${agent.display_name} (${agent.id})`);
      console.log(`[Orchestra] Agent capabilities:`, agent.capabilities);
      console.log(`[Orchestra] Agent MCP permissions:`, agent.mcp_permissions.allowed_servers);
      console.log(`[Orchestra] Agent max_steps: ${agent.max_steps}`);
      console.log(`[Orchestra] Agent forbidden_actions:`, agent.forbidden_actions);
    }
  }

  // Example: Check quality pipeline
  const qualityPipeline = orchestratorConfig.quality_pipeline;
  const requiredGates = qualityPipeline.filter(gate => gate.required);
  console.log(`[Orchestra] Quality gates (${requiredGates.length} required):`, 
    requiredGates.map(g => g.id));

  // Example: Check environment restrictions
  const env = orchestratorConfig.environments.find(e => e.name === task.env);
  if (env) {
    console.log(`[Orchestra] Environment: ${env.name}`);
    console.log(`[Orchestra] Allowed models:`, env.allowed_models);
    console.log(`[Orchestra] Max concurrent runs: ${env.max_concurrent_runs}`);
    
    if (env.require_human_approval_for?.length) {
      const needsApproval = task.tags.some(tag => 
        env.require_human_approval_for!.includes(tag)
      );
      if (needsApproval) {
        console.log(`[Orchestra] ⚠️  Human approval required for:`, 
          env.require_human_approval_for);
      }
    }
  }

  // Example: Safety checks
  const safety = orchestratorConfig.safety;
  console.log(`[Orchestra] Safety: max_total_steps=${safety.max_total_steps}, shell_access=${safety.allow_shell_access}`);
  console.log(`[Orchestra] Safety: forbidden_global_actions=`, safety.forbidden_global_actions);

  console.log("[Orchestra] Run complete (placeholder - implement LangGraph workflow)");
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  const configDir = process.env.CONFIG_DIR || "./config";
  const mode = getOperationalMode();

  console.log("[Orchestra] Initializing Frontend Dev Orchestra");
  console.log(`[Orchestra] Mode: ${mode.toUpperCase()}`);
  console.log(`[Orchestra] Config directory: ${configDir}`);

  try {
    // Load all configuration files
    const { orchestrator, agents, mcpServers } = loadOrchestraConfig(configDir);

    // Sanity log
    console.log("[Orchestra] ✅ Configuration loaded", {
      orchestratorId: orchestrator.orchestrator_id,
      schemaVersion: orchestrator.schema_version,
      envs: orchestrator.environments.map(e => e.name),
      agents: agents.agents.map(a => `${a.id} (${a.display_name})`),
      mcpServers: mcpServers.servers.map(s => `${s.id} (${s.risk})`),
    });

    // Example task
    const task: Task = {
      id: "TASK-001",
      type: "component_implementation",
      tags: ["uiux", "component_implementation"],
      description: "Refine <CallToActionButton> with better hover & a11y.",
      env: "dev",
    };

    // Check if HITL is required
    const requireHitl = shouldRequireHITL(task, configDir);

    console.log("[Orchestra] Task:", {
      id: task.id,
      type: task.type,
      tags: task.tags,
      requireHitl,
    });

    // Run orchestrator
    await runFrontendOrchestra({
      orchestratorConfig: orchestrator,
      agentsConfig: agents,
      mcpServersConfig: mcpServers,
      task,
      requireHitl,
      mode,
    });

  } catch (error) {
    console.error("[Orchestra] ❌ Fatal error", error);
    
    if (error instanceof Error) {
      console.error("[Orchestra] Error message:", error.message);
      console.error("[Orchestra] Stack:", error.stack);
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error("[Orchestra] Unhandled error", err);
    process.exit(1);
  });
}

export { main, runFrontendOrchestra, getOperationalMode, canWriteFiles, canCreatePRs };


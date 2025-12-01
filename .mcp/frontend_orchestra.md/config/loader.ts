/**
 * Configuration Loader for Frontend Dev Orchestra
 * 
 * Loads and validates YAML configuration files using Zod schemas.
 * Provides typed access to orchestrator, agents, and MCP server configs.
 */

import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// ============================================================================
// Zod Schemas
// ============================================================================

const MemoryConfigSchema = z.object({
  type: z.enum(["local", "stateless", "shared"]),
  window: z.number().int().positive().optional(),
});

const McpPermissionsSchema = z.object({
  allowed_servers: z.array(z.string()),
  denied_servers: z.array(z.string()).optional(),
});

const QualityResponsibilitySchema = z.array(z.string());

const AgentSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  role: z.string(),
  environment: z.string(),
  capabilities: z.array(z.string()),
  memory: MemoryConfigSchema,
  max_steps: z.number().int().positive(),
  max_concurrent_tasks: z.number().int().positive(),
  forbidden_actions: z.array(z.string()),
  mcp_permissions: McpPermissionsSchema,
  quality_responsibilities: QualityResponsibilitySchema.optional(),
});

const AgentsConfigSchema = z.object({
  schema_version: z.string(),
  orchestra_id: z.string(),
  default_environment: z.string(),
  agents: z.array(AgentSchema),
  defaults: z.object({
    max_steps: z.number().int().positive(),
    max_concurrent_tasks: z.number().int().positive(),
    memory: MemoryConfigSchema,
    forbidden_actions: z.array(z.string()),
  }).optional(),
});

const EnvironmentSchema = z.object({
  name: z.string(),
  allowed_models: z.array(z.string()),
  max_concurrent_runs: z.number().int().positive(),
  require_human_approval_for: z.array(z.string()).optional(),
});

const QualityPipelineStageSchema = z.object({
  id: z.string(),
  type: z.enum(["static_check", "test_suite", "snapshot_suite"]),
  description: z.string(),
  required: z.boolean(),
  owner_agent_id: z.string(),
});

const OrchestratorConfigSchema = z.object({
  schema_version: z.string(),
  orchestrator_id: z.string(),
  description: z.string(),
  environments: z.array(EnvironmentSchema),
  topology: z.object({
    pattern: z.enum(["supervisor_worker"]),
    supervisor_agent_id: z.string(),
    notes: z.string(),
  }),
  roles: z.object({
    python_side: z.string(),
    typescript_side: z.string(),
  }),
  human_in_the_loop: z.object({
    enabled: z.boolean(),
    approval_channels: z.array(z.string()),
    require_for_tags: z.array(z.string()),
    default_timeout_seconds: z.number().int().positive(),
  }),
  quality_pipeline: z.array(QualityPipelineStageSchema),
  persistence: z.object({
    redis: z.object({
      ttl_seconds: z.object({
        run_state: z.number().int().positive(),
        tool_cache: z.number().int().positive(),
      }),
    }),
    postgres: z.object({
      retention_days: z.object({
        runs: z.number().int().positive(),
        incidents: z.number().int().positive(),
        evaluations: z.number().int().positive(),
      }),
    }),
    replay: z.object({
      enabled: z.boolean(),
      redacted_fields: z.array(z.string()),
      notes: z.string().optional(),
    }),
  }),
  observability: z.object({
    tracing: z.object({
      correlation_id_header: z.string(),
      sample_rate: z.number().min(0).max(1),
    }),
    logging: z.object({
      format: z.string(),
      level: z.string(),
      include_fields: z.array(z.string()),
    }),
    metrics: z.object({
      namespace: z.string(),
      key_dimensions: z.array(z.string()),
    }),
  }),
  incidents: z.object({
    severities: z.array(z.object({
      id: z.string(),
      description: z.string(),
      auto_actions: z.array(z.string()),
    })),
    default_severity: z.string(),
  }),
  routing: z.object({
    default_agent: z.string(),
    rules: z.array(z.object({
      when: z.string(),
      target_agent: z.string(),
    })),
  }),
  safety: z.object({
    allow_shell_access: z.boolean(),
    max_total_steps_per_run: z.number().int().positive(),
    forbidden_global_actions: z.array(z.string()),
  }),
  versioning: z.object({
    config_version: z.string(),
    requires_orchestrator_min_version: z.string(),
    notes: z.string(),
  }),
});

const McpServerSchema = z.object({
  id: z.string(),
  kind: z.enum(["local", "remote"]),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().optional(),
  capabilities: z.array(z.string()),
  risk: z.enum(["low", "medium", "high"]),
  notes: z.string(),
});

const McpServersConfigSchema = z.object({
  schema_version: z.string(),
  orchestra_id: z.string(),
  servers: z.array(McpServerSchema),
  defaults: z.object({
    retry_policy: z.object({
      max_retries: z.number().int().nonnegative(),
      backoff_seconds: z.number().int().positive(),
    }),
    timeout_seconds: z.number().int().positive(),
  }).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type AgentsConfig = z.infer<typeof AgentsConfigSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;
export type McpServersConfig = z.infer<typeof McpServersConfigSchema>;
export type McpServer = z.infer<typeof McpServerSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type QualityPipelineStage = z.infer<typeof QualityPipelineStageSchema>;

// ============================================================================
// Configuration Loader Class
// ============================================================================

export class OrchestraConfigLoader {
  private orchestratorConfig: OrchestratorConfig | null = null;
  private agentsConfig: AgentsConfig | null = null;
  private mcpServersConfig: McpServersConfig | null = null;

  /**
   * Load orchestrator configuration from YAML file
   */
  loadOrchestratorConfig(filePath: string): OrchestratorConfig {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = yaml.load(content) as unknown;
    const validated = OrchestratorConfigSchema.parse(parsed);
    this.orchestratorConfig = validated;
    return validated;
  }

  /**
   * Load agents configuration from YAML file
   */
  loadAgentsConfig(filePath: string): AgentsConfig {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = yaml.load(content) as unknown;
    const validated = AgentsConfigSchema.parse(parsed);
    this.agentsConfig = validated;
    return validated;
  }

  /**
   * Load MCP servers configuration from YAML file
   */
  loadMcpServersConfig(filePath: string): McpServersConfig {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = yaml.load(content) as unknown;
    const validated = McpServersConfigSchema.parse(parsed);
    this.mcpServersConfig = validated;
    return validated;
  }

  /**
   * Load all configuration files from a directory
   */
  loadAll(configDir: string): {
    orchestrator: OrchestratorConfig;
    agents: AgentsConfig;
    mcpServers: McpServersConfig;
  } {
    const orchestrator = this.loadOrchestratorConfig(
      path.join(configDir, "orchestrator.frontend.yaml")
    );
    const agents = this.loadAgentsConfig(
      path.join(configDir, "agents.frontend.yaml")
    );
    const mcpServers = this.loadMcpServersConfig(
      path.join(configDir, "mcp-servers.core.yaml")
    );

    // Cross-validate
    this.validateCrossReferences(orchestrator, agents, mcpServers);

    return { orchestrator, agents, mcpServers };
  }

  /**
   * Get agent configuration by ID
   */
  getAgentConfig(agentId: string): Agent | null {
    if (!this.agentsConfig) {
      throw new Error("Agents config not loaded. Call loadAgentsConfig() first.");
    }
    return this.agentsConfig.agents.find((a) => a.id === agentId) || null;
  }

  /**
   * Get MCP server configuration by ID
   */
  getMcpServer(serverId: string): McpServer | null {
    if (!this.mcpServersConfig) {
      throw new Error("MCP servers config not loaded. Call loadMcpServersConfig() first.");
    }
    return this.mcpServersConfig.servers.find((s) => s.id === serverId) || null;
  }

  /**
   * Check if a task should require human-in-the-loop approval
   */
  shouldRequireHITL(task: { tags?: string[]; type?: string }): boolean {
    if (!this.orchestratorConfig) {
      throw new Error("Orchestrator config not loaded. Call loadOrchestratorConfig() first.");
    }

    if (!this.orchestratorConfig.human_in_the_loop.enabled) {
      return false;
    }

    const tags = task.tags || [];
    const requiredTags = this.orchestratorConfig.human_in_the_loop.require_for_tags;

    return requiredTags.some((tag) => tags.includes(tag));
  }

  /**
   * Get environment configuration
   */
  getEnvironment(envName: string): Environment | null {
    if (!this.orchestratorConfig) {
      throw new Error("Orchestrator config not loaded. Call loadOrchestratorConfig() first.");
    }
    return (
      this.orchestratorConfig.environments.find((e) => e.name === envName) || null
    );
  }

  /**
   * Get quality pipeline stages
   */
  getQualityPipeline(): QualityPipelineStage[] {
    if (!this.orchestratorConfig) {
      throw new Error("Orchestrator config not loaded. Call loadOrchestratorConfig() first.");
    }
    return this.orchestratorConfig.quality_pipeline;
  }

  /**
   * Validate cross-references between config files
   */
  private validateCrossReferences(
    orchestrator: OrchestratorConfig,
    agents: AgentsConfig,
    mcpServers: McpServersConfig
  ): void {
    const errors: string[] = [];

    // Validate supervisor_agent_id exists
    const supervisorExists = agents.agents.some(
      (a) => a.id === orchestrator.topology.supervisor_agent_id
    );
    if (!supervisorExists) {
      errors.push(
        `Supervisor agent '${orchestrator.topology.supervisor_agent_id}' not found in agents config`
      );
    }

    // Validate quality pipeline owner_agent_id references
    orchestrator.quality_pipeline.forEach((stage) => {
      const ownerExists = agents.agents.some((a) => a.id === stage.owner_agent_id);
      if (!ownerExists) {
        errors.push(
          `Quality pipeline stage '${stage.id}' references unknown agent '${stage.owner_agent_id}'`
        );
      }
    });

    // Validate routing target_agent references
    orchestrator.routing.rules.forEach((rule) => {
      const targetExists = agents.agents.some((a) => a.id === rule.target_agent);
      if (!targetExists) {
        errors.push(
          `Routing rule references unknown agent '${rule.target_agent}'`
        );
      }
    });

    // Validate agent MCP server references
    agents.agents.forEach((agent) => {
      agent.mcp_permissions.allowed_servers.forEach((serverId) => {
        const serverExists = mcpServers.servers.some((s) => s.id === serverId);
        if (!serverExists) {
          errors.push(
            `Agent '${agent.id}' references unknown MCP server '${serverId}'`
          );
        }
      });
    });

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join("\n")}`);
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Load all configuration files from the default config directory
 */
export function loadOrchestraConfig(configDir: string = "./config") {
  const loader = new OrchestraConfigLoader();
  return loader.loadAll(configDir);
}

/**
 * Get agent config helper
 */
export function getAgentConfig(
  agentId: string,
  configDir: string = "./config"
): Agent | null {
  const loader = new OrchestraConfigLoader();
  loader.loadAgentsConfig(path.join(configDir, "agents.frontend.yaml"));
  return loader.getAgentConfig(agentId);
}

/**
 * Get MCP server config helper
 */
export function getMcpServer(
  serverId: string,
  configDir: string = "./config"
): McpServer | null {
  const loader = new OrchestraConfigLoader();
  loader.loadMcpServersConfig(path.join(configDir, "mcp-servers.core.yaml"));
  return loader.getMcpServer(serverId);
}

/**
 * Check if HITL is required for a task
 */
export function shouldRequireHITL(
  task: { tags?: string[]; type?: string },
  configDir: string = "./config"
): boolean {
  const loader = new OrchestraConfigLoader();
  loader.loadOrchestratorConfig(
    path.join(configDir, "orchestrator.frontend.yaml")
  );
  return loader.shouldRequireHITL(task);
}


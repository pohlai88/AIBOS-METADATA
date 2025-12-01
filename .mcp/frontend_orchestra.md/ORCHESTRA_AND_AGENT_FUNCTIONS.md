# Frontend Orchestra & Agent Functions & Actions

**Version:** 1.0.0  
**Last Updated:** 2025-11-29

---

## Table of Contents

1. [Orchestrator Functions](#orchestrator-functions)
2. [Orchestrator Actions](#orchestrator-actions)
3. [Agent Functions by Role](#agent-functions-by-role)
4. [Agent Capabilities](#agent-capabilities)
5. [Agent Forbidden Actions](#agent-forbidden-actions)
6. [Quality Pipeline Actions](#quality-pipeline-actions)
7. [MCP Tool Functions](#mcp-tool-functions)
8. [TypeScript Loader Functions](#typescript-loader-functions)
9. [Mode Enforcement Functions](#mode-enforcement-functions)

---

## Orchestrator Functions

### Core Orchestration Functions

| Function | Description | Location |
|----------|-------------|----------|
| `runFrontendOrchestra()` | Main orchestrator entry point | `orchestra.run.ts` |
| `loadOrchestraConfig()` | Load all configuration files | `loader.ts` |
| `getOperationalMode()` | Get current operational mode | `orchestra.run.ts` |
| `shouldRequireHITL()` | Check if task requires human approval | `loader.ts` |
| `validateCrossReferences()` | Validate config consistency | `loader.ts` |

### Configuration Loader Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `loadOrchestratorConfig(filePath)` | Load orchestrator YAML | `OrchestratorConfig` |
| `loadAgentsConfig(filePath)` | Load agents YAML | `AgentsConfig` |
| `loadMcpServersConfig(filePath)` | Load MCP servers YAML | `McpServersConfig` |
| `loadAll(configDir)` | Load all configs with validation | `{ orchestrator, agents, mcpServers }` |
| `getAgentConfig(agentId)` | Get agent config by ID | `Agent \| null` |
| `getMcpServer(serverId)` | Get MCP server config by ID | `McpServer \| null` |
| `getEnvironment(envName)` | Get environment config | `Environment \| null` |
| `getQualityPipeline()` | Get quality pipeline stages | `QualityPipelineStage[]` |

---

## Orchestrator Actions

### Task Management Actions

| Action | Description | Trigger |
|--------|-------------|---------|
| **Task Decomposition** | Break complex tasks into subtasks | Orchestrator receives task |
| **Task Classification** | Classify and tag incoming tasks | Task received |
| **Task Routing** | Route tasks to appropriate agents | Based on tags/type |
| **Task Coordination** | Coordinate multi-agent workflows | Supervisor pattern |
| **Task Aggregation** | Aggregate agent outputs | After agent completion |

### Routing Actions

| Action | Condition | Target Agent |
|--------|-----------|--------------|
| Route to UI/UX Designer | `task.tags contains 'uiux'` OR `task.type == 'design'` | `uiux_designer` |
| Route to Code Implementer | `task.tags contains 'component_implementation'` | `code_implementer` |
| Route to A11Y Guardian | `task.tags contains 'a11y'` | `a11y_guardian` |
| Route to Test Conductor | `task.tags contains 'testing'` OR `task.type == 'qa'` | `test_conductor` |
| Route to Docs Narrator | `task.tags contains 'docs'` OR `task.type == 'documentation'` | `docs_narrator` |
| Default Route | No matching rule | `task_classifier` |

### Quality Pipeline Actions

| Action | Stage | Owner Agent | Required |
|--------|-------|-------------|----------|
| **Lint Check** | `lint` | `test_conductor` | ✅ Yes |
| **Unit Tests** | `unit_tests` | `test_conductor` | ✅ Yes |
| **A11Y Check** | `a11y` | `a11y_guardian` | ⚠️ Optional |
| **Visual Checks** | `visual_checks` | `test_conductor` | ⚠️ Optional |

### Human-in-the-Loop (HITL) Actions

| Action | Trigger | Timeout |
|--------|---------|---------|
| **Request Approval** | Task has required tags | 1800s (30 min) |
| **Wait for Approval** | HITL enabled + required tags | Until approved/timeout |
| **Auto-escalate** | Approval timeout | Notify oncall |

**Required Tags for HITL:**
- `prod_release`
- `schema_migration`
- `kernel_touch`
- `high_risk_change`

### Incident Management Actions

| Severity | Auto-Actions | Description |
|----------|-------------|-------------|
| **S1** | `pause_orchestrator`<br>`notify:oncall`<br>`require_manual_approval_for_all` | Dangerous production change |
| **S2** | `notify:oncall` | Repeated quality gate failures |
| **S3** | `log_only` | Non-critical errors (default) |

### Safety Actions

| Action | Description | Enforcement |
|--------|-------------|-------------|
| **Circuit Breaker** | Max 40 steps per run | Global limit |
| **Shell Access Block** | No direct shell access | `allow_shell_access: false` |
| **Forbidden Actions Block** | Prevent dangerous operations | Global forbidden list |

**Global Forbidden Actions:**
- `delete_repo`
- `modify_kernel_code`
- `change_auth_config`
- `rotate_prod_secrets`

### Observability Actions

| Action | Description | Configuration |
|--------|-------------|---------------|
| **Tracing** | Correlation ID tracking | 20% sample rate |
| **Logging** | JSON structured logs | Info level |
| **Metrics** | Prometheus metrics | Namespace: `aibos_frontend_orchestra` |

---

## Agent Functions by Role

### 1. Orchestra Conductor (Supervisor)

**Agent ID:** `orchestra_conductor`

**Capabilities:**
- `task_decomposition` - Break tasks into subtasks
- `agent_routing` - Route tasks to workers
- `pipeline_coordination` - Coordinate quality pipeline

**Quality Responsibilities:**
- `ensure_quality_pipeline_configured`
- `aggregate_agent_reports`

**MCP Permissions:**
- ✅ Allowed: `next-devtools`
- ❌ Denied: `git`, `shell`

**Limits:**
- Max Steps: 16
- Max Concurrent Tasks: 5
- Memory: Local (window: 20)

**Forbidden Actions:**
- `write_application_code`
- `modify_auth_config`
- `touch_kernel_files`

---

### 2. Task Classifier

**Agent ID:** `task_classifier`

**Capabilities:**
- `task_tagging` - Tag and categorize tasks
- `scope_detection` - Detect task scope

**Quality Responsibilities:**
- `assign_initial_tags`

**MCP Permissions:**
- ✅ Allowed: `[]` (none - read-only)
- ❌ Denied: `git`, `shell`, `tests-runner`

**Limits:**
- Max Steps: 6
- Max Concurrent Tasks: 5
- Memory: Stateless

**Forbidden Actions:**
- `write_any_code`
- `invoke_high_risk_tools`

---

### 3. UI/UX Designer

**Agent ID:** `uiux_designer`

**Capabilities:**
- `design_tokens` - Validate and use design tokens
- `component_api` - Design component APIs
- `ux_copy` - Write UX copy
- `wireframe_description` - Describe wireframes

**Quality Responsibilities:**
- `define_component_contract`
- `validate_against_design_system`

**MCP Permissions:**
- ✅ Allowed: `next-devtools`
- ❌ Denied: `git`, `shell`, `tests-runner`

**Limits:**
- Max Steps: 8
- Max Concurrent Tasks: 4
- Memory: Local (window: 10)

**Forbidden Actions:**
- `write_server_code`
- `modify_auth_config`
- `touch_kernel_files`
- `change_ci_config`

---

### 4. Code Implementer

**Agent ID:** `code_implementer`

**Capabilities:**
- `react_components` - Implement React components
- `story_files` - Create Storybook stories
- `unit_test_scaffolding` - Scaffold unit tests
- `refactor_with_constraints` - Refactor with constraints

**Quality Responsibilities:**
- `respect_component_contract`
- `ensure_lint_clean`
- `attach_minimum_tests`

**MCP Permissions:**
- ✅ Allowed: `git`, `next-devtools`, `tests-runner`
- ❌ Denied: `shell`

**Limits:**
- Max Steps: 10
- Max Concurrent Tasks: 3
- Memory: Local (window: 12)

**Forbidden Actions:**
- `modify_auth_config`
- `touch_kernel_files`
- `change_env_files`
- `change_ci_config`

---

### 5. A11Y Guardian

**Agent ID:** `a11y_guardian`

**Capabilities:**
- `a11y_audit` - Audit accessibility
- `token_validation` - Validate safe-mode tokens
- `aria_review` - Review ARIA attributes

**Quality Responsibilities:**
- `a11y_gate_review`
- `safe_mode_token_verification`

**MCP Permissions:**
- ✅ Allowed: `next-devtools`
- ❌ Denied: `git`, `shell`, `tests-runner`

**Limits:**
- Max Steps: 4
- Max Concurrent Tasks: 4
- Memory: Stateless

**Forbidden Actions:**
- `write_any_application_code`
- `modify_auth_config`
- `touch_kernel_files`

---

### 6. Test Conductor

**Agent ID:** `test_conductor`

**Capabilities:**
- `run_lint` - Execute lint checks
- `run_unit_tests` - Run unit tests
- `summarize_test_failures` - Summarize failures

**Quality Responsibilities:**
- `execute_quality_pipeline`
- `report_quality_status`

**MCP Permissions:**
- ✅ Allowed: `tests-runner`, `git` (read-only)
- ❌ Denied: `shell`

**Limits:**
- Max Steps: 8
- Max Concurrent Tasks: 3
- Memory: Local (window: 8)

**Forbidden Actions:**
- `modify_auth_config`
- `touch_kernel_files`
- `change_ci_config`

---

### 7. Docs Narrator

**Agent ID:** `docs_narrator`

**Capabilities:**
- `docs_generation` - Generate documentation
- `changelog_updates` - Update changelogs
- `readme_updates` - Update README files

**Quality Responsibilities:**
- `update_docs_for_changes`
- `sync_with_grcd`

**MCP Permissions:**
- ✅ Allowed: `git`
- ❌ Denied: `shell`, `tests-runner`

**Limits:**
- Max Steps: 8
- Max Concurrent Tasks: 3
- Memory: Local (window: 10)

**Forbidden Actions:**
- `modify_auth_config`
- `touch_kernel_files`
- `change_ci_config`

---

## Agent Capabilities

### Complete Capability List

| Capability | Agents | Description |
|------------|--------|-------------|
| `task_decomposition` | `orchestra_conductor` | Break tasks into subtasks |
| `agent_routing` | `orchestra_conductor` | Route tasks to workers |
| `pipeline_coordination` | `orchestra_conductor` | Coordinate quality pipeline |
| `task_tagging` | `task_classifier` | Tag and categorize tasks |
| `scope_detection` | `task_classifier` | Detect task scope |
| `design_tokens` | `uiux_designer` | Validate and use design tokens |
| `component_api` | `uiux_designer` | Design component APIs |
| `ux_copy` | `uiux_designer` | Write UX copy |
| `wireframe_description` | `uiux_designer` | Describe wireframes |
| `react_components` | `code_implementer` | Implement React components |
| `story_files` | `code_implementer` | Create Storybook stories |
| `unit_test_scaffolding` | `code_implementer` | Scaffold unit tests |
| `refactor_with_constraints` | `code_implementer` | Refactor with constraints |
| `a11y_audit` | `a11y_guardian` | Audit accessibility |
| `token_validation` | `a11y_guardian` | Validate safe-mode tokens |
| `aria_review` | `a11y_guardian` | Review ARIA attributes |
| `run_lint` | `test_conductor` | Execute lint checks |
| `run_unit_tests` | `test_conductor` | Run unit tests |
| `summarize_test_failures` | `test_conductor` | Summarize failures |
| `docs_generation` | `docs_narrator` | Generate documentation |
| `changelog_updates` | `docs_narrator` | Update changelogs |
| `readme_updates` | `docs_narrator` | Update README files |

---

## Agent Forbidden Actions

### Complete Forbidden Actions List

| Action | Agents | Reason |
|--------|--------|--------|
| `write_application_code` | `orchestra_conductor` | Supervisor only |
| `modify_auth_config` | All agents | Security boundary |
| `touch_kernel_files` | All agents | System boundary |
| `write_any_code` | `task_classifier` | Read-only classifier |
| `invoke_high_risk_tools` | `task_classifier` | Read-only classifier |
| `write_server_code` | `uiux_designer` | Frontend only |
| `change_ci_config` | `uiux_designer`, `code_implementer`, `test_conductor`, `docs_narrator` | CI boundary |
| `change_env_files` | `code_implementer` | Environment boundary |
| `write_any_application_code` | `a11y_guardian` | Audit only |
| `delete_repo` | All (default) | Global safety |

---

## Quality Pipeline Actions

### Pipeline Stages

| Stage ID | Type | Owner | Required | Description |
|----------|------|-------|----------|-------------|
| `lint` | `static_check` | `test_conductor` | ✅ Yes | ESLint / TypeScript checks |
| `unit_tests` | `test_suite` | `test_conductor` | ✅ Yes | Run unit tests |
| `a11y` | `static_check` | `a11y_guardian` | ⚠️ Optional | WCAG / token validation |
| `visual_checks` | `snapshot_suite` | `test_conductor` | ⚠️ Optional | Visual regression |

### Quality Responsibilities

| Responsibility | Agent | Description |
|----------------|-------|-------------|
| `ensure_quality_pipeline_configured` | `orchestra_conductor` | Verify pipeline setup |
| `aggregate_agent_reports` | `orchestra_conductor` | Collect agent outputs |
| `assign_initial_tags` | `task_classifier` | Tag tasks for routing |
| `define_component_contract` | `uiux_designer` | Define component API |
| `validate_against_design_system` | `uiux_designer` | Validate design tokens |
| `respect_component_contract` | `code_implementer` | Follow UX spec |
| `ensure_lint_clean` | `code_implementer` | Pass lint checks |
| `attach_minimum_tests` | `code_implementer` | Add tests |
| `a11y_gate_review` | `a11y_guardian` | Review accessibility |
| `safe_mode_token_verification` | `a11y_guardian` | Verify tokens |
| `execute_quality_pipeline` | `test_conductor` | Run quality gates |
| `report_quality_status` | `test_conductor` | Report results |
| `update_docs_for_changes` | `docs_narrator` | Update documentation |
| `sync_with_grcd` | `docs_narrator` | Sync with GRCD |

---

## MCP Tool Functions

### MCP Server Capabilities

#### next-devtools (Medium Risk)

| Capability | Description |
|------------|-------------|
| `inspect_components` | Inspect React components |
| `read_routes` | Read Next.js routes |
| `inspect_props` | Inspect component props |

**Allowed Agents:**
- `orchestra_conductor`
- `uiux_designer`
- `code_implementer`
- `a11y_guardian`

#### git (High Risk)

| Capability | Description |
|------------|-------------|
| `read_repo` | Read repository |
| `write_repo` | Write to repository |
| `create_branch` | Create branches |

**Allowed Agents:**
- `code_implementer`
- `test_conductor` (read-only)
- `docs_narrator`

#### tests-runner (Medium Risk)

| Capability | Description |
|------------|-------------|
| `run_unit_tests` | Execute unit tests |
| `run_lint` | Run lint checks |

**Allowed Agents:**
- `code_implementer`
- `test_conductor`

---

## TypeScript Loader Functions

### Configuration Loading

```typescript
// Load all configurations
loadOrchestraConfig(configDir?: string): {
  orchestrator: OrchestratorConfig;
  agents: AgentsConfig;
  mcpServers: McpServersConfig;
}

// Load individual configs
loadOrchestratorConfig(filePath: string): OrchestratorConfig
loadAgentsConfig(filePath: string): AgentsConfig
loadMcpServersConfig(filePath: string): McpServersConfig
```

### Query Functions

```typescript
// Get agent config
getAgentConfig(agentId: string, configDir?: string): Agent | null

// Get MCP server config
getMcpServer(serverId: string, configDir?: string): McpServer | null

// Get environment config
getEnvironment(envName: string): Environment | null

// Get quality pipeline
getQualityPipeline(): QualityPipelineStage[]
```

### Validation Functions

```typescript
// Check HITL requirement
shouldRequireHITL(task: { tags?: string[]; type?: string }, configDir?: string): boolean

// Cross-reference validation (internal)
validateCrossReferences(
  orchestrator: OrchestratorConfig,
  agents: AgentsConfig,
  mcpServers: McpServersConfig
): void
```

---

## Mode Enforcement Functions

### Mode Management

```typescript
// Get current operational mode
getOperationalMode(): OperationalMode  // "off" | "shadow" | "guarded_active"

// Check permissions
canWriteFiles(mode: OperationalMode): boolean
canCreatePRs(mode: OperationalMode): boolean
```

### Permission Enforcement

```typescript
// Enforce write permission
enforceWritePermission(mode: OperationalMode, operation: string): void

// Enforce PR permission
enforcePRPermission(mode: OperationalMode, operation: string): void

// Validate file path
validateFilePath(mode: OperationalMode, filePath: string): void

// Get scratch path for shadow mode
getScratchPath(mode: OperationalMode, basePath: string): string
```

### Safe Operation Wrappers

```typescript
// Safe git operation
safeGitOperation<T>(
  mode: OperationalMode,
  operation: string,
  fn: () => Promise<T>
): Promise<T>

// Safe file write
safeFileWrite(
  mode: OperationalMode,
  filePath: string,
  content: string
): Promise<void>

// Mode-aware MCP tool wrapper
createModeAwareMcpTool(
  mode: OperationalMode,
  toolName: string,
  originalTool: (...args: any[]) => Promise<any>
): (...args: any[]) => Promise<any>
```

---

## Operational Modes

### Mode 0: OFF

**Description:** Read-only analysis only

**Allowed Actions:**
- ✅ Read configurations
- ✅ Analyze tasks
- ✅ Inspect code (via MCP)
- ❌ No file writes
- ❌ No git operations
- ❌ No PR creation

### Mode 1: SHADOW

**Description:** Writes to scratch only, no PRs

**Allowed Actions:**
- ✅ Read configurations
- ✅ Analyze tasks
- ✅ Write to `scratch/orchestra/` directories
- ✅ Write to `feat/orchestra-sandbox` branch
- ❌ No PR creation
- ❌ No writes to main branches

### Mode 2: GUARDED ACTIVE

**Description:** Full operation with HITL

**Allowed Actions:**
- ✅ Read configurations
- ✅ Analyze tasks
- ✅ Write to feature branches
- ✅ Create PRs (with HITL approval)
- ✅ Run quality pipeline
- ✅ Execute all agent capabilities

---

## Summary

### Orchestrator Functions: 10
- Core orchestration: 5
- Configuration loading: 5

### Orchestrator Actions: 25+
- Task management: 5
- Routing: 6
- Quality pipeline: 4
- HITL: 3
- Incident management: 3
- Safety: 3
- Observability: 3

### Agent Functions: 7 agents × ~5 functions each = 35+
- Capabilities: 22 unique capabilities
- Quality responsibilities: 14 responsibilities
- MCP permissions: 3 servers × multiple agents

### Total Functions & Actions: **70+**

---

**Last Updated:** 2025-11-29  
**Next Review:** After orchestrator implementation


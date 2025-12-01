# 🎼 Frontend Orchestra Configuration Recommendations

**Based on GitHub Research & Best Practices Analysis**  
**Version:** 1.0.0  
**Last Updated:** 2025-11-29  
**Status:** Recommended Configuration

---

## Executive Summary

This document provides **production-ready configuration recommendations** for the Frontend Dev Orchestra based on analysis of leading multi-agent orchestration frameworks on GitHub. The recommendations align with your existing GRCD structure while incorporating proven patterns from:

- **dev-pro-agents** (BjornMelin) - LangGraph supervisor, Pydantic v2, SQLModel
- **agentic-template** (samirpatil2000) - FastAPI + LangGraph, PostgreSQL persistence
- **multi-agent-orchestration-framework** (yx-fan) - YAML-based workflows, Redis memory
- **Major-Project** (Om-Shree-0709) - MCP-based tool routing, FastAPI orchestrator

---

## 🏗️ Topology & Intent

### Design Contract

This orchestra uses a **supervisor → worker** pattern via LangGraph, **not** a wild mesh of interconnected agents. The design intent is explicit:

**LangGraph Supervisor Pattern:**
- **Supervisor (L1):** `frontend-orchestrator` - Routes tasks, enforces gates, coordinates agents
- **Workers (L2):** Specialized agents (`Lynx.UIUXEngineer`, `Lynx.FrontendImplementor`, etc.) - Execute narrow-scope tasks
- **Tools (L3):** MCP servers - Capability-limited tool access
- **Reality (L4):** Next.js app, design tokens, Storybook - Where changes become real

**State Architecture:**
- **Redis** = Ephemeral graph state / in-flight runs / agent coordination / task queues
- **PostgreSQL** = Run history / incidents / evaluations / GRCD artifacts / audit trails

**Language Separation:**
- **Python (orchestration)** = Infrastructure layer (LangGraph, FastAPI, Pydantic)
- **TypeScript (Zod)** = Contract layer controlling what the orchestrator is allowed to do (MCP tools, schemas)

This separation prevents accidental spaghetti architecture and makes the design contract testable.

---

## 🏗️ Recommended Architecture Stack

### Core Orchestration Framework

**Primary Choice: LangGraph + FastAPI**

```yaml
orchestration:
  framework: "langgraph"
  version: "^0.2.0"
  pattern: "supervisor_worker"  # Explicit: no wild mesh
  backend: "fastapi"
  version: "^0.115.0"
  rationale: |
    - LangGraph provides native multi-agent coordination via supervisor pattern
    - FastAPI offers async support, type safety, and auto-documentation
    - Both are production-proven and actively maintained
    - Excellent TypeScript/Python interop for MCP tools
```

**Alternative Consideration:**
- **CrewAI** - If you need more opinionated agent workflows
- **AutoGen** - If you need Microsoft ecosystem integration
- **Native MCP Orchestrator** - If you want pure MCP protocol compliance

### State Management & Persistence

**Recommended: Redis + PostgreSQL Hybrid**

```yaml
state_management:
  short_term:
    provider: "redis"
    version: "^7.0.0"
    purpose: "ephemeral_graph_state_in_flight_runs"
    use_cases:
      - Agent session state
      - Task queue management
      - Real-time coordination
      - Cache for MCP tool responses
  
  long_term:
    provider: "postgresql"
    version: "^16.0"
    purpose: "run_history_incidents_evaluations_grcd_artifacts"
    use_cases:
      - Task history and audit logs
      - Agent performance metrics
      - Design token registry
      - Quality gate results
      - GRCD compliance records
```

**Rationale:**
- Redis for fast, ephemeral state (agent coordination, task queues)
- PostgreSQL for persistent audit trails and compliance records
- Matches patterns from `multi-agent-orchestration-framework` and `agentic-template`

### Data Validation & Type Safety

**Recommended: Pydantic v2 + Zod (TypeScript)**

```yaml
validation:
  python:
    library: "pydantic"
    version: "^2.11.7"
    features:
      - Computed fields
      - Custom validators
      - JSON schema generation
      - Type coercion
  
  typescript:
    library: "zod"
    version: "^3.23.0"
    features:
      - Runtime validation
      - Type inference
      - Schema composition
```

**Rationale:**
- Pydantic v2 is the industry standard for Python data validation
- Zod provides type-safe validation for TypeScript MCP tools
- Both generate JSON schemas compatible with MCP protocol

---

## 📋 Configuration Structure

### 1. Orchestrator Configuration (`config/orchestrator.yaml`)

```yaml
orchestrator:
  name: "frontend-orchestrator"
  version: "1.0.0"
  schema_version: "1.0.0"
  min_orchestrator_version: "1.0.0"
  
  # Environments & Tiers
  environments:
    - name: dev
      allowed_models: ["gpt-4.1-mini", "gpt-4", "local-llm"]
      max_concurrent_runs: 5
      require_human_approval_for: []
    
    - name: staging
      allowed_models: ["gpt-4", "claude-3.5-sonnet"]
      max_concurrent_runs: 10
      require_human_approval_for:
        - production_repo_writes
    
    - name: prod
      allowed_models: ["gpt-4.1", "claude-3.5-opus"]
      max_concurrent_runs: 20
      require_human_approval_for:
        - critical_fs_changes
        - production_repo_writes
        - schema_migrations
        - dependency_major_updates
  
  # Human-in-the-Loop (HITL)
  human_in_the_loop:
    enabled: true
    approval_channels:
      - "slack:#frontend-orchestra-review"
      - "email:orchestrator-approvals@aibos.io"
    require_for_tags:
      - "prod_release"
      - "schema_migration"
      - "security_patch"
      - "breaking_change"
    timeout_seconds: 3600  # 1 hour for human approval
    auto_escalate: true
  
  # Agent Coordination
  max_concurrent_agents: 4
  task_timeout_seconds: 1800  # 30 minutes
  retry_attempts: 3
  retry_backoff_strategy: "exponential"  # exponential, linear, fixed
  retry_backoff_base: 1.0  # seconds
  
  # Quality Gate Pipeline (Declarative)
  quality_pipeline:
    - id: lint
      type: static_check
      required: true
      timeout_seconds: 60
      parallel_execution: false
    - id: a11y
      type: static_check
      required: true
      timeout_seconds: 120
      parallel_execution: false
    - id: unit_tests
      type: test_suite
      required: true
      timeout_seconds: 300
      parallel_execution: false
    - id: visual_checks
      type: snapshot_suite
      required: false
      timeout_seconds: 180
      parallel_execution: false
  
  # Agent Routing
  routing:
    strategy: "capability_based"  # capability_based, round_robin, load_balanced
    enable_parallel_routing: false  # Sequential for frontend tasks
    task_classification:
      enabled: true
      model: "gpt-4"  # For intent classification
      fallback: "rule_based"
  
  # MCP Governance
  mcp:
    manifest_validation: true
    schema_enforcement: true
    tool_allocation_strategy: "scope_based"
    audit_all_invocations: true
    version_compatibility: "semver"
  
  # Persistence & Retention
  persistence:
    redis:
      ttl_seconds:
        run_state: 3600  # in-flight graphs (1 hour)
        tool_cache: 600  # MCP tool response cache (10 minutes)
        agent_session: 1800  # agent session state (30 minutes)
    postgres:
      retention_days:
        runs: 90
        incidents: 365
        evaluations: 365
        audit_logs: 730  # 2 years for compliance
    replay:
      enabled: true
      redacted_fields:
        - "api_key"
        - "access_token"
        - "password"
        - "secret"
      store_full_state: true
  
  # Observability & Incident Model
  observability:
    tracing:
      enabled: true
      correlation_id_header: "x-aibos-correlation-id"
      sample_rate: 0.2  # 20% of requests
      backend: "jaeger"  # jaeger, zipkin, datadog
    
    metrics:
      enabled: true
      namespace: "aibos_frontend_orchestra"
      key_dimensions:
        - "agent_id"
        - "environment"
        - "tenant_id"
        - "task_type"
      backend: "prometheus"  # prometheus, datadog, custom
  
  incidents:
    severities:
      - id: S1
        description: "Production outage / dangerous change"
        auto_actions:
          - "pause_orchestrator"
          - "require_manual_approval_for_all"
          - "notify:oncall"
          - "create_incident_ticket"
      - id: S2
        description: "Quality gate repeatedly failing"
        auto_actions:
          - "notify:oncall"
          - "escalate_to_team_lead"
      - id: S3
        description: "Agent timeout or error"
        auto_actions:
          - "retry_with_backoff"
          - "log_to_incident_db"
      - id: S4
        description: "Warning or non-critical issue"
        auto_actions:
          - "log_to_metrics"
  
  # Health Monitoring
  health_check:
    interval_seconds: 30
    agent_timeout_seconds: 5
    enable_metrics: true
    metrics_backend: "prometheus"  # prometheus, datadog, custom
  
  # Logging
  logging:
    level: "INFO"  # DEBUG, INFO, WARNING, ERROR
    format: "structured"  # structured, json, text
    outputs:
      - "console"
      - "file"
      - "syslog"  # Optional for production
    file:
      path: "logs/orchestrator.log"
      rotation: "daily"
      retention_days: 30
```

### 2. Agent Configuration (`config/agents.yaml`)

```yaml
agents:
  # UI/UX Engineer Agent
  uiux_engineer:
    enabled: true
    agent_id: "Lynx.UIUXEngineer"
    role: "Designs component API and UX flows using design tokens"
    max_concurrent_tasks: 2
    timeout_seconds: 600  # 10 minutes
    max_steps: 8  # Maximum reasoning steps per task
    llm_provider: "openai"
    model: "gpt-4"
    temperature: 0.7
    
    # Memory Configuration
    memory:
      type: "local"  # local, stateless, shared
      window: 10  # last 10 messages/context items
    
    # Allowed MCP Tools
    mcp_tools:
      - "tokens.mcp"
      - "repo.mcp"
      - "design-system.mcp"
    
    # MCP Permissions (explicit allow/deny)
    mcp_permissions:
      allowed_servers:
        - "tokens"
        - "repo"
        - "design-system"
      denied_servers:
        - "git"
        - "test"
        - "a11y"
    
    # Allowed Directories
    allowed_directories:
      - "apps/web/components/ui/"
      - "apps/web/components/containers/"
      - "apps/web/styles/"
    
    # Forbidden Actions (explicit guardrails)
    forbidden_actions:
      - "write_server_code"
      - "modify_auth_config"
      - "change_design_tokens"
      - "modify_kernel_code"
      - "delete_files_outside_scope"
    
    # Capabilities
    capabilities:
      - "ui_design"
      - "layout_creation"
      - "token_validation"
      - "component_structure"
    
    # Quality Requirements
    quality_requirements:
      require_design_notes: true
      require_token_compliance: true
      require_accessibility_check: false  # A11yGuard handles this
  
  # Frontend Implementor Agent
  frontend_implementor:
    enabled: true
    agent_id: "Lynx.FrontendImplementor"
    role: "Implements business logic and wires components together"
    max_concurrent_tasks: 3
    timeout_seconds: 900  # 15 minutes
    max_steps: 12
    llm_provider: "openai"
    model: "gpt-4"
    temperature: 0.5
    
    memory:
      type: "local"
      window: 15
    
    mcp_tools:
      - "repo.mcp"
      - "git.mcp"
      - "lint.mcp"
      - "test.mcp"
    
    mcp_permissions:
      allowed_servers:
        - "repo"
        - "git"
        - "lint"
        - "test"
      denied_servers:
        - "tokens"  # Cannot modify design tokens
        - "a11y"  # A11yGuard handles this
    
    allowed_directories:
      - "apps/web/"
      - "packages/ui/"
    
    forbidden_actions:
      - "write_server_code"
      - "modify_auth_config"
      - "change_design_tokens"
      - "modify_kernel_code"
      - "bypass_quality_gates"
    
    capabilities:
      - "code_implementation"
      - "business_logic"
      - "api_integration"
      - "state_management"
    
    quality_requirements:
      require_implementation_notes: true
      require_test_coverage: true
      min_test_coverage: 0.80
  
  # Frontend Tester Agent
  frontend_tester:
    enabled: true
    agent_id: "Lynx.FrontendTester"
    role: "Generates and executes comprehensive test suites"
    max_concurrent_tasks: 4
    timeout_seconds: 1200  # 20 minutes
    max_steps: 10
    llm_provider: "openai"
    model: "gpt-4"
    temperature: 0.3
    
    memory:
      type: "local"
      window: 12
    
    mcp_tools:
      - "test.mcp"
      - "repo.mcp"
      - "coverage.mcp"
    
    mcp_permissions:
      allowed_servers:
        - "test"
        - "repo"
        - "coverage"
      denied_servers:
        - "git"
        - "tokens"
    
    allowed_directories:
      - "apps/web/**/*.test.ts"
      - "apps/web/**/*.test.tsx"
      - "apps/web/**/*.spec.ts"
    
    forbidden_actions:
      - "modify_production_code"
      - "bypass_test_requirements"
      - "delete_test_files"
    
    capabilities:
      - "unit_testing"
      - "integration_testing"
      - "test_generation"
      - "coverage_analysis"
    
    quality_requirements:
      require_test_reports: true
      min_coverage_threshold: 0.80
  
  # A11y Guard Agent
  a11y_guard:
    enabled: true
    agent_id: "Lynx.A11yGuard"
    role: "Enforces WCAG compliance and safe-mode token usage"
    max_concurrent_tasks: 3
    timeout_seconds: 300  # 5 minutes
    max_steps: 4
    llm_provider: "openai"
    model: "gpt-4"
    temperature: 0.2
    
    memory:
      type: "stateless"  # A11y checks are independent
    
    mcp_tools:
      - "a11y.mcp"
      - "repo.mcp"
    
    mcp_permissions:
      allowed_servers:
        - "a11y"
        - "repo"
      denied_servers:
        - "git"
        - "test"
    
    allowed_directories:
      - "apps/web/**"  # Can audit entire app
    
    forbidden_actions:
      - "modify_code_directly"  # Only reports, fixes go through other agents
      - "bypass_a11y_requirements"
    
    capabilities:
      - "accessibility_audit"
      - "wcag_compliance"
      - "a11y_fixes"
    
    quality_requirements:
      wcag_level: "AA"  # AA, AAA
      require_a11y_report: true
      fail_on_critical: true
  
  # Storybook Agent
  storybook_agent:
    enabled: true
    agent_id: "Lynx.StorybookAgent"
    role: "Generates Storybook stories and component documentation"
    max_concurrent_tasks: 2
    timeout_seconds: 600
    max_steps: 6
    llm_provider: "openai"
    model: "gpt-4"
    temperature: 0.6
    
    memory:
      type: "local"
      window: 8
    
    mcp_tools:
      - "storybook.mcp"
      - "repo.mcp"
    
    mcp_permissions:
      allowed_servers:
        - "storybook"
        - "repo"
      denied_servers:
        - "git"
        - "test"
    
    allowed_directories:
      - ".storybook/stories/"
      - "apps/web/components/**/*.stories.tsx"
    
    forbidden_actions:
      - "modify_component_code"
      - "change_storybook_config"
    
    capabilities:
      - "story_generation"
      - "component_documentation"
      - "visual_testing"
  
  # Frontend Dependencies Agent
  frontend_dependencies:
    enabled: true
    agent_id: "Lynx.FrontendDependenciesAgent"
    role: "Manages dependencies and compatibility checks"
    max_concurrent_tasks: 1
    timeout_seconds: 300
    max_steps: 5
    llm_provider: "openai"
    model: "gpt-4"
    temperature: 0.3
    
    memory:
      type: "stateless"
    
    mcp_tools:
      - "repo.mcp"
      - "package-manager.mcp"
    
    mcp_permissions:
      allowed_servers:
        - "repo"
        - "package-manager"
      denied_servers:
        - "git"  # Cannot commit dependency changes directly
        - "test"
    
    allowed_directories:
      - "package.json"
      - "pnpm-lock.yaml"
      - "packages/*/package.json"
    
    forbidden_actions:
      - "install_unapproved_packages"
      - "modify_kernel_dependencies"
      - "bypass_compatibility_matrix"
    
    capabilities:
      - "dependency_analysis"
      - "version_management"
      - "compatibility_checking"
```

### 3. MCP Server Configuration (`config/mcp-servers.yaml`)

```yaml
mcp_servers:
  # Repository Operations
  repo:
    name: "repo.mcp"
    version: "1.0.0"
    type: "stdin"  # stdin, sse, http
    command: "node"
    args:
      - ".mcp/repo/server.mjs"
    env:
      WORKSPACE_ROOT: "${WORKSPACE_ROOT}"
    capabilities:
      - "read_repo"
      - "write_repo"
      - "list_directory"
      - "create_directory"
      - "delete_file"
      - "search_files"
    risk: "medium"
    tools:
      - "read_file"
      - "write_file"
      - "list_directory"
      - "create_directory"
      - "delete_file"
      - "search_files"
  
  # Git Operations
  git:
    name: "git.mcp"
    version: "1.0.0"
    type: "stdin"
    command: "node"
    args:
      - ".mcp/git/server.mjs"
    capabilities:
      - "read_repo"
      - "write_repo"
      - "create_branch"
      - "commit"
      - "create_pull_request"
    risk: "high"
    tools:
      - "create_branch"
      - "commit"
      - "create_pull_request"
      - "get_diff"
      - "get_status"
  
  # Design Tokens
  tokens:
    name: "tokens.mcp"
    version: "1.0.0"
    type: "stdin"
    command: "node"
    args:
      - ".mcp/tokens/server.mjs"
    capabilities:
      - "read_tokens"
      - "validate_token_usage"
      - "check_compliance"
    risk: "low"
    tools:
      - "get_token"
      - "validate_token_usage"
      - "list_tokens"
      - "check_compliance"
  
  # Linting
  lint:
    name: "lint.mcp"
    version: "1.0.0"
    type: "stdin"
    command: "node"
    args:
      - ".mcp/lint/server.mjs"
    capabilities:
      - "static_analysis"
      - "code_quality_check"
    risk: "low"
    tools:
      - "run_eslint"
      - "run_stylelint"
      - "get_lint_errors"
  
  # Testing
  test:
    name: "test.mcp"
    version: "1.0.0"
    type: "stdin"
    command: "node"
    args:
      - ".mcp/test/server.mjs"
    capabilities:
      - "run_tests"
      - "get_coverage"
      - "test_analysis"
    risk: "low"
    tools:
      - "run_tests"
      - "get_test_results"
      - "get_coverage"
  
  # Accessibility
  a11y:
    name: "a11y.mcp"
    version: "1.0.0"
    type: "stdin"
    command: "node"
    args:
      - ".mcp/a11y/server.mjs"
    capabilities:
      - "accessibility_audit"
      - "wcag_compliance_check"
    risk: "low"
    tools:
      - "run_axe_audit"
      - "get_a11y_violations"
      - "check_wcag_compliance"
  
  # Storybook
  storybook:
    name: "storybook.mcp"
    version: "1.0.0"
    type: "stdin"
    command: "node"
    args:
      - ".mcp/storybook/server.mjs"
    capabilities:
      - "inspect_components"
      - "read_routes"
      - "generate_stories"
    risk: "low"
    tools:
      - "list_stories"
      - "run_story"
      - "generate_story"
  
  # Next.js DevTools (Example of external MCP)
  next-devtools:
    name: "next-devtools.mcp"
    version: "1.0.0"
    type: "stdin"
    command: "npx"
    args:
      - "-y"
      - "next-devtools-mcp@latest"
    capabilities:
      - "inspect_components"
      - "read_routes"
      - "check_build_status"
    risk: "medium"
    tools:
      - "list_routes"
      - "get_component_tree"
      - "check_errors"
```

### 4. Environment Configuration (`.env.example`)

```bash
# ============================================
# Frontend Orchestra Configuration
# ============================================

# Orchestrator Settings
ORCHESTRATOR_HOST=0.0.0.0
ORCHESTRATOR_PORT=8000
ORCHESTRATOR_ENV=development  # development, staging, production

# LLM Provider Settings
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=4000

# Alternative LLM Providers (Optional)
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_key_here

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=frontend_orchestra
POSTGRES_USER=orchestrator
POSTGRES_PASSWORD=your_password_here
POSTGRES_SSL_MODE=prefer

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password_here
REDIS_SSL=false

# MCP Configuration
MCP_WORKSPACE_ROOT=/path/to/workspace
MCP_LOG_LEVEL=INFO
MCP_TIMEOUT_SECONDS=30

# Quality Gate Configuration
QUALITY_GATE_LINT_ENABLED=true
QUALITY_GATE_A11Y_ENABLED=true
QUALITY_GATE_TEST_ENABLED=true
QUALITY_GATE_MIN_COVERAGE=0.80
QUALITY_GATE_WCAG_LEVEL=AA

# Agent Configuration
AGENT_MAX_WORKERS=4
AGENT_TIMEOUT_SECONDS=1800
AGENT_RETRY_ATTEMPTS=3
AGENT_RETRY_BACKOFF_BASE=1.0

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=structured
LOG_OUTPUT=console,file
LOG_FILE_PATH=logs/orchestrator.log
LOG_ROTATION=daily
LOG_RETENTION_DAYS=30

# Monitoring & Observability
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
METRICS_ENABLED=true
TRACING_ENABLED=true
TRACING_BACKEND=jaeger  # jaeger, zipkin, datadog

# Security
API_KEY_REQUIRED=false
API_KEY=your_api_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Design Token Configuration
DESIGN_TOKENS_PATH=packages/design-tokens
DESIGN_TOKENS_STRICT_MODE=true
DESIGN_TOKENS_VALIDATION_ENABLED=true
```

---

## 🔧 Implementation Recommendations

### 1. Directory Structure

```
frontend-orchestrator/
├── orchestrator/
│   ├── domains/
│   │   └── frontend/
│   │       ├── frontend-orchestrator.ts
│   │       ├── task-classifier.ts
│   │       ├── agent-router.ts
│   │       ├── quality-gate.ts
│   │       ├── token-validator.ts
│   │       ├── directory-lint.ts
│   │       └── agent-coordinator.ts
│   └── core/
│       ├── state.py
│       ├── registry.py
│       └── exceptions.py
├── agents/
│   └── frontend/
│       ├── uiux-engineer/
│       ├── frontend-implementor/
│       ├── frontend-tester/
│       ├── a11y-guard/
│       ├── storybook-agent/
│       └── frontend-dependencies/
├── mcp/
│   ├── servers/
│   │   ├── repo.mcp.ts
│   │   ├── git.mcp.ts
│   │   ├── tokens.mcp.ts
│   │   ├── lint.mcp.ts
│   │   ├── test.mcp.ts
│   │   ├── a11y.mcp.ts
│   │   └── storybook.mcp.ts
│   └── frontend-orchestrator.mcp.json
├── config/
│   ├── orchestrator.yaml
│   ├── agents.yaml
│   └── mcp-servers.yaml
├── schemas/
│   ├── task.schema.ts
│   ├── agent-output.schema.ts
│   └── quality-gate.schema.ts
├── services/
│   ├── task-service.ts
│   ├── agent-service.ts
│   └── audit-service.ts
├── repositories/
│   ├── task-repository.ts
│   └── audit-repository.ts
├── api/
│   ├── routes/
│   │   ├── tasks.ts
│   │   ├── agents.ts
│   │   └── health.ts
│   └── middleware/
│       ├── auth.ts
│       └── logging.ts
├── memory/
│   ├── redis-client.ts
│   └── state-manager.ts
├── .env.example
├── package.json
├── requirements.txt
└── README.md
```

### 2. Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Orchestration** | LangGraph | ^0.2.0 | Multi-agent coordination |
| **Backend API** | FastAPI | ^0.115.0 | Async, type-safe, auto-docs |
| **State (Short-term)** | Redis | ^7.0.0 | Fast session/queue management |
| **State (Long-term)** | PostgreSQL | ^16.0 | Persistent audit/compliance |
| **Validation (Python)** | Pydantic v2 | ^2.11.7 | Industry standard validation |
| **Validation (TS)** | Zod | ^3.23.0 | Type-safe runtime validation |
| **Database ORM** | SQLModel | ^0.0.14 | Pydantic + SQLAlchemy |
| **MCP SDK** | @modelcontextprotocol/sdk | ^1.0.0 | Official MCP protocol |
| **Logging** | structlog | ^24.1.0 | Structured logging |
| **Monitoring** | Prometheus | Latest | Metrics collection |
| **Testing** | Vitest | ^1.0.0 | Fast, Vite-native testing |

### 3. Key Implementation Patterns

#### A. Task Classification Pattern

```python
# orchestrator/domains/frontend/task-classifier.py
from pydantic import BaseModel
from typing import Literal

class TaskType(str, Enum):
    UIUX_UPDATE = "UIUX_UPDATE"
    IMPLEMENTATION = "IMPLEMENTATION"
    TESTING = "TESTING"
    A11Y_FIX = "A11Y_FIX"
    DOCS_UPDATE = "DOCS_UPDATE"
    DEPENDENCY_UPDATE = "DEPENDENCY_UPDATE"

class TaskClassifier:
    async def classify(self, description: str) -> TaskType:
        # Use LLM for intent classification
        # Fallback to rule-based if LLM fails
        ...
```

#### B. Agent Routing Pattern

```python
# orchestrator/domains/frontend/agent-router.py
class AgentRouter:
    def route_task(self, task: FrontendTask) -> List[AgentConfig]:
        """
        Returns ordered list of agents to execute for this task type.
        """
        routing_map = {
            TaskType.UIUX_UPDATE: [
                "Lynx.UIUXEngineer",
                "Lynx.FrontendImplementor",
                "Lynx.A11yGuard",
                "Lynx.FrontendTester",
                "Lynx.StorybookAgent"
            ],
            TaskType.IMPLEMENTATION: [
                "Lynx.FrontendImplementor",
                "Lynx.FrontendTester",
                "Lynx.A11yGuard"
            ],
            # ... other mappings
        }
        return routing_map.get(task.type, [])
```

#### C. Quality Gate Pipeline Pattern

```python
# orchestrator/domains/frontend/quality-gate.py
class QualityGatePipeline:
    async def execute(self, task_id: str, changed_files: List[str]) -> QualityGateResult:
        results = {}
        
        # Sequential execution for safety
        results["lint"] = await self._run_lint(changed_files)
        if results["lint"].status != "pass":
            return QualityGateResult(overall="fail", **results)
        
        results["a11y"] = await self._run_a11y(changed_files)
        if results["a11y"].status != "pass":
            return QualityGateResult(overall="fail", **results)
        
        results["tests"] = await self._run_tests(changed_files)
        
        overall = "pass" if all(r.status == "pass" for r in results.values()) else "fail"
        return QualityGateResult(overall=overall, **results)
```

---

## 🚀 Deployment Recommendations

### Development Environment

```yaml
development:
  orchestrator:
    host: "localhost"
    port: 8000
    reload: true
    log_level: "DEBUG"
  
  database:
    postgres:
      host: "localhost"
      port: 5432
      db: "frontend_orchestra_dev"
    redis:
      host: "localhost"
      port: 6379
      db: 0
  
  agents:
    max_concurrent: 2
    timeout: 600
```

### Production Environment

```yaml
production:
  orchestrator:
    host: "0.0.0.0"
    port: 8000
    workers: 4  # Gunicorn/Uvicorn workers
    log_level: "INFO"
    enable_metrics: true
  
  database:
    postgres:
      host: "${POSTGRES_HOST}"
      port: 5432
      db: "frontend_orchestra_prod"
      ssl_mode: "require"
      connection_pool_size: 20
    redis:
      host: "${REDIS_HOST}"
      port: 6379
      db: 0
      ssl: true
      connection_pool_size: 10
  
  agents:
    max_concurrent: 4
    timeout: 1800
    retry_attempts: 3
  
  monitoring:
    prometheus:
      enabled: true
      port: 9090
    tracing:
      enabled: true
      backend: "jaeger"
```

---

## 📊 Monitoring & Observability

### Recommended Metrics

```yaml
metrics:
  orchestrator:
    - frontend_orchestrator_tasks_total
    - frontend_orchestrator_routing_duration_seconds
    - frontend_orchestrator_agent_executions_total
    - frontend_orchestrator_quality_gate_total
    - frontend_orchestrator_token_validations_total
    - frontend_orchestrator_audit_events_total
    - frontend_orchestrator_mcp_tool_invocations_total
  
  agents:
    - agent_execution_duration_seconds
    - agent_success_rate
    - agent_error_rate
    - agent_queue_depth
  
  quality_gates:
    - quality_gate_lint_duration_seconds
    - quality_gate_a11y_duration_seconds
    - quality_gate_test_duration_seconds
    - quality_gate_pass_rate
```

### Recommended Logging Schema

```json
{
  "timestamp": "2025-11-29T10:30:00Z",
  "level": "info",
  "trace_id": "abc123",
  "component": "frontend-orchestrator",
  "message": "Task orchestrated successfully",
  "metadata": {
    "task_id": "task-789",
    "task_type": "UIUX_UPDATE",
    "agents_executed": ["Lynx.UIUXEngineer", "Lynx.FrontendImplementor"],
    "quality_gates": {
      "lint": "pass",
      "a11y": "pass",
      "tests": "pass"
    },
    "duration_ms": 1250,
    "files_changed": 3
  }
}
```

---

## 🚫 When NOT to Use Multi-Agent

**Critical Decision Point:** Push single agent to the limit before going multi-agent.

### Use Single Agent For:
- Simple refactors (rename variables, extract functions)
- Small bug fixes (typo corrections, minor logic tweaks)
- Documentation updates (README, comments, JSDoc)
- Non-critical UI tweaks (spacing, colors via tokens)
- Single-file changes
- Dependency updates (patch/minor versions)

### Use Orchestra Only When:
- Cross-file changes requiring coordination
- Tests + A11y + visual checks need sequential validation
- Multi-repo or multi-stack work
- Complex feature implementation (UI + logic + tests + docs)
- Design system compliance requires multiple validators
- Quality gates must run in specific order

### Never Use Orchestra For:
- Direct changes on kernel / security / auth (until shadow-mode validated)
- Emergency hotfixes (use single agent + manual review)
- Experimental/prototype code (orchestra overhead not justified)
- One-off scripts or temporary files

**Rationale:** Multi-agent orchestration adds latency, complexity, and coordination overhead. Use it when the benefits (quality gates, compliance, coordination) outweigh the costs.

---

## 🛡️ Threat Model & Guardrails

### What Can Go Wrong

| Threat | Impact | Mitigation (Config Block) |
|--------|--------|---------------------------|
| **Wrong Repository** | Code changes in wrong repo | `mcp_permissions` → restrict repo access |
| **Wrong Branch** | Changes to production/main | `environments.prod.require_human_approval_for` |
| **Mass File Delete** | Accidental deletion of critical files | `forbidden_actions` → "delete_files_outside_scope" |
| **Secret Leakage** | API keys, tokens in code | `persistence.replay.redacted_fields` |
| **Nonsense UI** | Broken components, invalid tokens | `quality_pipeline` → lint + a11y + tests |
| **Auth Bypass** | Security vulnerabilities | `forbidden_actions` → "modify_auth_config" |
| **Design Token Drift** | Hardcoded colors/spacing | `quality_requirements.require_token_compliance` |
| **Quality Gate Bypass** | Untested code in production | `quality_pipeline.required: true` |

### Guardrail Mapping

```yaml
# Example: How config blocks map to threats

threat_mitigation:
  wrong_repo:
    - mcp_permissions.allowed_servers
    - allowed_directories
    - environments.prod.require_human_approval_for
  
  wrong_branch:
    - environments.prod.require_human_approval_for
    - human_in_the_loop.require_for_tags: ["prod_release"]
  
  mass_delete:
    - forbidden_actions: ["delete_files_outside_scope"]
    - mcp_permissions.denied_servers: ["git"] (for some agents)
  
  secret_leakage:
    - persistence.replay.redacted_fields
    - observability.tracing.sample_rate (reduce exposure)
  
  nonsense_ui:
    - quality_pipeline (lint, a11y, tests)
    - quality_requirements.require_token_compliance
  
  auth_bypass:
    - forbidden_actions: ["modify_auth_config", "write_server_code"]
    - mcp_permissions.denied_servers: ["git"] (for UI agents)
  
  token_drift:
    - quality_requirements.require_token_compliance
    - mcp_permissions.allowed_servers: ["tokens"] (for validation)
  
  quality_bypass:
    - quality_pipeline.required: true
    - incidents.severities.S2 (repeated failures trigger alerts)
```

---

## 🔄 Rolling Upgrades & Versioning

### Config Versioning

Configs are **versioned artifacts** with explicit schema requirements:

```yaml
orchestrator:
  schema_version: "1.0.0"
  min_orchestrator_version: "1.0.0"
```

### Upgrade Process

When bumping LangGraph / MCP servers / orchestrator version:

1. **Add New Config Version**
   ```yaml
   orchestrator:
     schema_version: "1.1.0"
     min_orchestrator_version: "1.1.0"
   ```

2. **Run Golden Task Suite in Shadow Mode**
   - Execute known-good tasks with new version
   - Compare outputs (diffs, quality gate results)
   - Validate no regressions

3. **Promote Only When GRCD Passes**
   - All quality gates pass
   - No new incidents (S1/S2)
   - Audit logs show expected behavior
   - Human approval for production

### Version Compatibility Matrix

| Component | Current | Next | Breaking? | Migration Required? |
|-----------|---------|------|-----------|-------------------|
| LangGraph | 0.2.0 | 0.3.0 | Yes | Update graph construction |
| MCP SDK | 1.0.0 | 1.1.0 | No | None |
| FastAPI | 0.115.0 | 0.116.0 | No | None |

---

## 👤 Onboarding a New Agent (Runbook)

### Step-by-Step Process

**1. Define Role + Scope in `agents.yaml`**

```yaml
agents:
  new_agent:
    enabled: false  # Start disabled
    agent_id: "Lynx.NewAgent"
    role: "Clear, single-sentence role description"
    max_concurrent_tasks: 1
    timeout_seconds: 300
    max_steps: 5
    memory:
      type: "local"
      window: 10
```

**2. Attach Only Required MCP Servers/Tools**

```yaml
mcp_permissions:
  allowed_servers:
    - "repo"  # Only what it truly needs
  denied_servers:
    - "git"  # Explicit deny list
    - "test"
```

**3. Add Tests / Eval Tasks**

Create test suite:
- `tests/agents/new_agent/test_basic_task.py`
- `tests/agents/new_agent/test_edge_cases.py`
- `tests/agents/new_agent/test_permissions.py`

**4. Run in Dev with HITL Required**

```yaml
environments:
  - name: dev
    require_human_approval_for:
      - "new_agent_executions"  # Force manual review
```

**5. Promote to Prod Only After X Successful Runs**

Success criteria:
- ✅ 10+ successful runs in dev
- ✅ Zero S1/S2 incidents
- ✅ Quality gates pass consistently
- ✅ Human review approves agent output
- ✅ GRCD compliance verified

Then:
```yaml
agents:
  new_agent:
    enabled: true  # Enable for production
```

**6. Monitor & Iterate**

- Track agent metrics (success rate, duration, errors)
- Adjust `max_steps`, `timeout_seconds` based on real usage
- Refine `forbidden_actions` and `mcp_permissions` as needed

---

## ✅ Next Steps

1. **Review & Approve Configuration**
   - Review YAML configurations against your GRCD requirements
   - Adjust agent timeouts, concurrency, and quality gates as needed
   - Validate MCP server configurations match your existing setup

2. **Implement Core Orchestrator**
   - Start with `task-classifier.ts` and `agent-router.ts`
   - Implement `quality-gate.ts` pipeline (using declarative config)
   - Add Redis state management with TTL configuration

3. **Set Up Infrastructure**
   - Configure PostgreSQL database with retention policies
   - Set up Redis instance with TTL configuration
   - Configure environment variables (including HITL channels)

4. **Implement Agents**
   - Start with `Lynx.UIUXEngineer` and `Lynx.FrontendImplementor`
   - Add remaining agents incrementally using onboarding runbook
   - Test each agent in isolation with HITL enabled

5. **Add Monitoring & Incident Response**
   - Set up Prometheus metrics with proper namespace
   - Configure structured logging with correlation IDs
   - Add health check endpoints
   - Set up incident severity auto-actions

---

## 📚 References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Multi-Agent Workflows](https://blog.langchain.com/langgraph-multi-agent-workflows/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic v2 Documentation](https://docs.pydantic.dev/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [dev-pro-agents Repository](https://github.com/BjornMelin/dev-pro-agents)
- [multi-agent-orchestration-framework](https://github.com/yx-fan/multi-agent-orchestration-framework)
- [Best Practices for Multi-Agent Systems](https://lekha-bhan88.medium.com/best-practices-for-building-multi-agent-systems-in-ai-3006bf2dd1d6)
- [Building Multi-Agent Systems: Hands-On Experience](https://www.altexsoft.com/blog/building-multi-agent-systems/)

---

> ✅ **Status:** Configuration recommendations are ready for review and implementation. All recommendations align with your GRCD v1.0.0 requirements and incorporate best practices from production-grade multi-agent systems. The document now includes explicit topology intent, threat modeling, upgrade procedures, and agent onboarding runbooks.


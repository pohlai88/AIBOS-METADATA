# Frontend Dev Orchestra Configuration

**Version:** 1.0.0  
**Status:** ✅ Validated & Production-Ready

---

## Files

This directory contains the three core configuration files for the Frontend Dev Orchestra:

1. **`orchestrator.frontend.yaml`** - Global orchestrator behavior, environments, quality gates, persistence, observability
2. **`agents.frontend.yaml`** - All agent definitions with permissions, capabilities, and guardrails
3. **`mcp-servers.core.yaml`** - MCP server registry with risk levels and capabilities

---

## Quick Start

### Load Configuration (TypeScript)

```typescript
import { loadOrchestraConfig, getAgentConfig, shouldRequireHITL } from "./config/loader";

// Load all configs
const { orchestrator, agents, mcpServers } = loadOrchestraConfig("./config");

// Get specific agent
const uiuxAgent = getAgentConfig("uiux_designer");

// Check if task needs HITL
const needsApproval = shouldRequireHITL({
  tags: ["prod_release"],
  type: "design"
});
```

### Load Configuration (Python)

```python
import yaml
from pathlib import Path

config_dir = Path("./config")

# Load orchestrator config
with open(config_dir / "orchestrator.frontend.yaml") as f:
    orchestrator = yaml.safe_load(f)

# Load agents config
with open(config_dir / "agents.frontend.yaml") as f:
    agents = yaml.safe_load(f)

# Load MCP servers config
with open(config_dir / "mcp-servers.core.yaml") as f:
    mcp_servers = yaml.safe_load(f)
```

---

## Configuration Structure

### Orchestrator Config

- **Environments:** dev/prod with model restrictions and concurrency limits
- **Topology:** Supervisor → worker pattern declaration
- **Quality Pipeline:** Declarative gates (lint, tests, a11y, visual)
- **Persistence:** Redis TTLs and PostgreSQL retention policies
- **Observability:** Tracing, logging, metrics configuration
- **Incidents:** Severity levels with auto-actions
- **Safety:** Global circuit breakers and forbidden actions

### Agents Config

- **7 Agents Defined:**
  - `orchestra_conductor` - Supervisor
  - `task_classifier` - Task classification
  - `uiux_designer` - UI/UX design
  - `code_implementer` - Implementation
  - `a11y_guardian` - Accessibility
  - `test_conductor` - Testing
  - `docs_narrator` - Documentation

- **Per-Agent Settings:**
  - `role` - Clear responsibility description
  - `capabilities` - What the agent can do
  - `memory` - Local/stateless with window size
  - `max_steps` - Reasoning step limits
  - `forbidden_actions` - Explicit guardrails
  - `mcp_permissions` - Allowed/denied servers

### MCP Servers Config

- **3 Core Servers:**
  - `next-devtools` - Component inspection (medium risk)
  - `git` - Repository operations (high risk)
  - `tests-runner` - Test/lint execution (medium risk)

- **Per-Server Settings:**
  - `capabilities` - What the server can do
  - `risk` - low/medium/high
  - `notes` - Safety constraints

---

## Validation

All configuration files are validated for:
- ✅ Schema compliance (Zod/Pydantic)
- ✅ Cross-file consistency (agent IDs, MCP server references)
- ✅ GRCD compliance
- ✅ Safety guardrails
- ✅ Conservative production values

See `VALIDATION_REPORT.md` for detailed validation results.

---

## Usage Examples

### Check Agent Permissions

```typescript
const agent = getAgentConfig("code_implementer");
console.log(agent?.mcp_permissions.allowed_servers);
// ["git", "next-devtools", "tests-runner"]
```

### Get Quality Pipeline

```typescript
const loader = new OrchestraConfigLoader();
loader.loadOrchestratorConfig("./config/orchestrator.frontend.yaml");
const pipeline = loader.getQualityPipeline();

pipeline.forEach(stage => {
  console.log(`${stage.id}: ${stage.required ? "required" : "optional"}`);
});
```

### Check Environment Settings

```typescript
const env = loader.getEnvironment("prod");
console.log(env?.max_concurrent_runs); // 5
console.log(env?.require_human_approval_for);
// ["critical_fs_changes", "schema_migration", "prod_release", "kernel_touch"]
```

---

## Operational Modes

Before going live, decide which operational mode the orchestra will run in:

| Mode | Description                     | Allowed Actions                          | Environment |
|------|---------------------------------|------------------------------------------|-------------|
| 0    | Off                             | Read-only, no file writes                | Any         |
| 1    | Shadow                          | Writes to scratch only, no PRs           | dev only    |
| 2    | Guarded Active (default target) | Branch + PR + tests + HITL               | dev/prod    |

**Implementation:**
- Set via environment variable: `FRONTEND_ORCHESTRA_MODE=shadow`
- Enforced in orchestrator code before any MCP `git`/`tests-runner` calls
- See `orchestra.run.md` for playbook

**Current Recommendation:** Start in **Mode 1 (Shadow)** with dev environment.

---

## Next Steps

1. **Copy these files** to your orchestrator's `config/` directory
2. **Wire the loader** into your LangGraph/FastAPI orchestrator
3. **Set operational mode** to `FRONTEND_ORCHESTRA_MODE=shadow`
4. **Run golden flows** (see `golden-tasks.md`)
5. **Observe for 3-5 days** before adjusting values or moving to Mode 2

---

## GRCD Integration

**These configuration files are first-class GRCD artifacts.**

- **Linked in GRCD:** See `docs/08-governance/grcd/GRCD-FRONTEND-ORCHESTRA-v1.0.0.md` Section 15
- **Change Management:** Any change must be:
  1. Reviewed under GRCD-FRONTEND-ORCHESTRA
  2. Recorded in configuration changelog
  3. Validated for cross-file consistency
  4. Tested with golden flows

**Governance Story:**
- Configs and GRCD are **locked together** — this is the anti-drift philosophy
- Configs enforce what GRCD declares
- GRCD documents what configs implement

---

## Notes

- Agent IDs in config (`uiux_designer`) may need mapping to GRCD IDs (`Lynx.UIUXEngineer`) in orchestrator code
- All `owner_agent_id` references in quality_pipeline must match agent `id` values
- MCP server `id` values must match exactly between `agents.frontend.yaml` and `mcp-servers.core.yaml`
- **Any change to these configs must be reflected in GRCD + changelog**


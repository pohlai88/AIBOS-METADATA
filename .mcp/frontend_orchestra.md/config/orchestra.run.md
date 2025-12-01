# Frontend Dev Orchestra — Run Playbook

**Purpose:** Step-by-step guide for running the Frontend Dev Orchestra in different operational modes.

**Status:** ✅ Ready for Shadow Mode Testing

---

## Prerequisites

1. ✅ Configuration files created in `config/` directory
2. ✅ TypeScript loader (`loader.ts`) available
3. ✅ Orchestrator code wired to use configs
4. ✅ MCP servers configured and accessible
5. ✅ Environment variables set

---

## Step 1: Set Operational Mode

Choose your operational mode based on your readiness:

### Mode 0: OFF (Read-Only)

```bash
export FRONTEND_ORCHESTRA_MODE=off
```

**Use when:**
- Testing config loading
- Validating agent routing logic
- Analyzing tasks without making changes

**Allowed actions:**
- Read files
- Analyze code
- Generate reports
- ❌ No file writes
- ❌ No git operations
- ❌ No test execution

---

### Mode 1: SHADOW (Default for Initial Testing)

```bash
export FRONTEND_ORCHESTRA_MODE=shadow
```

**Use when:**
- First runs of golden flows
- Validating agent behavior
- Building confidence in orchestrator

**Allowed actions:**
- Write to `scratch/orchestra/` directories
- Write to `feat/orchestra-sandbox` branch
- Run tests in sandbox
- ❌ No PRs to main branches
- ❌ No production deployments

**Safety:**
- All writes go to scratch locations
- Human reviews before porting to real branches
- No risk to production code

---

### Mode 2: GUARDED ACTIVE (Production)

```bash
export FRONTEND_ORCHESTRA_MODE=guarded_active
```

**Use when:**
- Golden flows are consistently ✅
- 3+ consecutive successful runs
- Human review confirms readiness

**Allowed actions:**
- Create branches
- Open PRs/MRs
- Run lint/tests
- ✅ Requires HITL approval
- ✅ Quality gates must pass

**Safety:**
- HITL gates enforced
- Quality pipeline required
- Git safeguards (no force-push, no deletes on main)

---

## Step 2: Set Environment

```bash
# Development (default)
export FRONTEND_ORCHESTRA_ENV=dev

# Production (requires Mode 2)
export FRONTEND_ORCHESTRA_ENV=prod
```

**Dev Environment:**
- Models: `gpt-4.1-mini`, `gpt-4o-mini`, `local-llm`
- Max concurrent runs: 3
- More permissive for testing

**Prod Environment:**
- Models: `gpt-4.1`, `claude-3.5`
- Max concurrent runs: 5
- Requires HITL for critical changes

---

## Step 3: Run Orchestrator

### Option A: Direct TypeScript Execution

```bash
# Load configs and run
npx ts-node config/orchestra.run.ts
```

### Option B: Via Orchestrator Service

```bash
# If you have a FastAPI/LangGraph service
python -m orchestrator.frontend.main \
  --mode shadow \
  --env dev \
  --task "TASK-001"
```

### Option C: Via CLI Tool

```bash
# If you have a CLI wrapper
orchestra run \
  --mode shadow \
  --env dev \
  --task-file tasks/golden-flow-1.json
```

---

## Step 4: Review Results

### Check Logs

Look for:
- ✅ Configuration loaded successfully
- ✅ Agent routing decisions
- ✅ Quality gate results
- ⚠️ Warnings about mode restrictions
- ❌ Errors or misbehavior

### Check Outputs

**Mode 0 (OFF):**
- Reports in `reports/orchestra/`
- Analysis files only

**Mode 1 (SHADOW):**
- Files in `scratch/orchestra/`
- Branch: `feat/orchestra-sandbox`
- Review before porting

**Mode 2 (GUARDED ACTIVE):**
- PR/MR created
- Quality gates passed
- HITL approval received

---

## Step 5: Run Golden Flows

See `golden-tasks.md` for the 5 golden flows.

**Recommended order:**
1. Start with Flow 1 (Small Component Refinement) - simplest
2. Then Flow 2 (New Simple Component) - tests full workflow
3. Then Flow 3 (Layout Tweak) - tests precision
4. Then Flow 4 (Docs Sync) - tests boundaries
5. Finally Flow 5 (A11Y Review) - tests read-only behavior

**Track results:**
- ✅ = Good
- ⚠️ = Needs human patch
- ❌ = Misbehavior

---

## Step 6: Physical Repo Safeguards

### Dedicated Working Branch

```bash
# Create long-lived sandbox branch
git checkout -b feat/frontend-orchestra-sandbox
git push -u origin feat/frontend-orchestra-sandbox
```

**Always run orchestra against this branch in Mode 1.**

### Git Server-Level Safeguards

**Recommended settings:**
- ❌ Deny force-push on `main`/`master`
- ❌ Deny branch deletion on `main`/`master`
- ✅ Require PR reviews (even for orchestra bot)
- ✅ Require CI checks to pass

**GitHub Example:**
```yaml
# .github/branch-protection.yml
main:
  required_pull_request_reviews:
    required_approving_review_count: 1
  restrictions:
    force_push: false
    deletions: false
```

---

## Troubleshooting

### Config Loading Fails

```bash
# Check config directory
ls -la config/

# Validate YAML syntax
yamllint config/*.yaml

# Test loader
npx ts-node -e "import('./config/loader').then(m => m.loadOrchestraConfig('./config'))"
```

### Agent Routing Issues

- Check `routing.rules` in `orchestrator.frontend.yaml`
- Verify task `tags` match rule `when` conditions
- Check agent IDs exist in `agents.frontend.yaml`

### Mode Enforcement Not Working

- Verify `FRONTEND_ORCHESTRA_MODE` env var is set
- Check orchestrator code calls `getOperationalMode()`
- Ensure `canWriteFiles()` / `canCreatePRs()` checks are in place

### Quality Gates Failing

- Check `quality_pipeline` in orchestrator config
- Verify `owner_agent_id` matches agent IDs
- Review agent `quality_responsibilities`

---

## Success Criteria for Mode Progression

### Mode 0 → Mode 1 (Shadow)

✅ Configs load without errors  
✅ Agent routing works  
✅ Tasks can be analyzed  
✅ Reports generated correctly

### Mode 1 → Mode 2 (Guarded Active)

✅ All 5 golden flows are ✅ for 3 consecutive runs  
✅ No ❌ results in last 5 runs  
✅ Human review confirms outputs are production-ready  
✅ Quality gates consistently pass  
✅ No agent boundary violations  
✅ No drift from design tokens

---

## Next Steps After Mode 2

Once in Guarded Active mode:

1. **Monitor for 1-2 weeks** - Track all runs, log incidents
2. **Adjust configs** - Tune `max_steps`, `memory.window`, `max_concurrent_runs` based on data
3. **Expand golden flows** - Add more test cases as you discover patterns
4. **Document learnings** - Update GRCD with operational insights

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `export FRONTEND_ORCHESTRA_MODE=shadow` | Set to shadow mode |
| `export FRONTEND_ORCHESTRA_ENV=dev` | Set to dev environment |
| `npx ts-node config/orchestra.run.ts` | Run orchestrator |
| `git checkout feat/frontend-orchestra-sandbox` | Switch to sandbox branch |

---

> **Remember:** Start in Shadow Mode, run golden flows, observe for 3-5 days, then decide if you're ready for Guarded Active. Don't rush to production.


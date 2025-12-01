# Operational Readiness Checklist

**Status:** ✅ Configuration Complete | ⏳ Awaiting Implementation

This document tracks readiness for going live with the Frontend Dev Orchestra.

---

## ✅ Configuration Complete

- [x] **Orchestrator Config** (`orchestrator.frontend.yaml`) - Validated
- [x] **Agents Config** (`agents.frontend.yaml`) - Validated
- [x] **MCP Servers Config** (`mcp-servers.core.yaml`) - Validated
- [x] **TypeScript Loader** (`loader.ts`) - Created with Zod validation
- [x] **Mode Enforcement** (`mode-enforcement.ts`) - Created
- [x] **Golden Tasks** (`golden-tasks.md`) - Defined (5 flows)
- [x] **Run Playbook** (`orchestra.run.md`) - Created
- [x] **GRCD Integration** - Configs linked as first-class artifacts

---

## ⏳ Implementation Required

### 1. Wire Loader into Orchestrator

- [ ] Integrate `loader.ts` into LangGraph/FastAPI orchestrator
- [ ] Use `loadOrchestraConfig()` on startup
- [ ] Pass configs to agent nodes
- [ ] Implement `shouldRequireHITL()` checks

**Example:** See `orchestra.run.ts` for reference implementation

---

### 2. Implement Mode Enforcement

- [ ] Add `getOperationalMode()` check at orchestrator entry point
- [ ] Call `enforceWritePermission()` before any file write
- [ ] Call `enforcePRPermission()` before git branch/PR operations
- [ ] Use `getScratchPath()` for shadow mode writes
- [ ] Wrap MCP tool calls with `createModeAwareMcpTool()`

**Example:** See `mode-enforcement.ts` for enforcement functions

---

### 3. Set Up Physical Safeguards

- [ ] Create dedicated sandbox branch: `feat/frontend-orchestra-sandbox`
- [ ] Configure git branch protection (no force-push, no deletes on main)
- [ ] Require PR reviews for orchestra bot user
- [ ] Set up CI checks for orchestra-created PRs

---

### 4. Run Golden Flows

- [ ] Flow 1: Small Component Refinement (Badge)
- [ ] Flow 2: New Simple Component (EmptyStateCard)
- [ ] Flow 3: Layout Tweak (PageShell mobile)
- [ ] Flow 4: Docs Sync (Button)
- [ ] Flow 5: A11Y Review (Modal)

**Track results:** ✅ Good | ⚠️ Needs patch | ❌ Misbehavior

**Success threshold:** All 5 flows ✅ for 3 consecutive runs

---

## 🎯 Go-Live Plan

### Phase 1: Shadow Mode (Week 1)

**Goal:** Validate orchestrator behavior without risk

1. Set `FRONTEND_ORCHESTRA_MODE=shadow`
2. Run all 5 golden flows
3. Review outputs in `scratch/orchestra/`
4. Document any issues or surprises
5. Adjust configs if needed

**Exit Criteria:**
- All golden flows consistently ✅
- No agent boundary violations
- Quality gates working correctly

---

### Phase 2: Guarded Active - Dev (Week 2-3)

**Goal:** Real branches and PRs, but with HITL gates

1. Set `FRONTEND_ORCHESTRA_MODE=guarded_active`
2. Set `FRONTEND_ORCHESTRA_ENV=dev`
3. Run golden flows again (now creating real PRs)
4. Human review all PRs before merge
5. Monitor quality gate pass rates
6. Track incident severities

**Exit Criteria:**
- PRs are production-ready (minimal human patches)
- Quality gates pass consistently
- No S1/S2 incidents

---

### Phase 3: Guarded Active - Prod (Week 4+)

**Goal:** Full production operation

1. Set `FRONTEND_ORCHESTRA_ENV=prod`
2. Run real production tasks
3. Monitor metrics and incidents
4. Adjust configs based on operational data

**Ongoing:**
- Weekly review of runs
- Monthly config tuning
- Quarterly GRCD updates

---

## 📊 Success Metrics

### Technical Metrics

- **Quality Gate Pass Rate:** Target >95%
- **Agent Boundary Violations:** Target 0
- **Token Compliance:** Target 100%
- **Test Coverage:** Maintain >80%

### Operational Metrics

- **HITL Approval Time:** Track average
- **PR Review Time:** Track average
- **Incident Rate:** Track S1/S2/S3 counts
- **Golden Flow Success Rate:** Target 100%

---

## 🚨 Risk Mitigation

### Risk: Agent Wanders / Over-Edits

**Mitigation:**
- Strict `max_steps` limits (4-16)
- `forbidden_actions` per agent
- Mode enforcement (shadow mode = scratch only)
- Golden flows catch this early

### Risk: Quality Gates Bypassed

**Mitigation:**
- Declarative `quality_pipeline` config
- `required: true` flags
- Sequential execution enforced
- HITL gates for prod

### Risk: Token Drift

**Mitigation:**
- `uiux_designer` only can validate tokens
- `code_implementer` denied `tokens` server
- Design Notes required
- A11y Guardian checks token usage

### Risk: Production Changes Without Approval

**Mitigation:**
- Mode enforcement (can't create PRs in shadow)
- HITL required for prod tags
- Git branch protection
- PR reviews required

---

## 📝 Documentation Status

- [x] Configuration files created
- [x] Validation report
- [x] README with usage examples
- [x] Golden tasks defined
- [x] Run playbook created
- [x] Mode enforcement code
- [x] GRCD integration complete
- [ ] Implementation guide (in progress)
- [ ] Troubleshooting guide (in progress)

---

## 🎓 Learning & Iteration

**After each phase:**

1. **Review:** What worked? What didn't?
2. **Adjust:** Tune configs based on data
3. **Document:** Update GRCD with learnings
4. **Iterate:** Refine golden flows

**Key Questions:**
- Are `max_steps` limits appropriate?
- Are memory windows sufficient?
- Are quality gates catching issues?
- Are agents staying in their lanes?

---

## ✅ Ready to Start?

**Before you begin:**

1. ✅ Configs validated
2. ✅ Loader created
3. ✅ Mode enforcement ready
4. ✅ Golden flows defined
5. ✅ Physical safeguards planned
6. ⏳ Orchestrator code wired (your task)
7. ⏳ First golden flow run (your task)

**Next Step:** Wire `loader.ts` into your orchestrator and run Flow 1 in Shadow Mode.

---

> **Remember:** Start slow, observe carefully, iterate based on data. The goal is systematic, governed frontend development—not speed at the cost of quality.


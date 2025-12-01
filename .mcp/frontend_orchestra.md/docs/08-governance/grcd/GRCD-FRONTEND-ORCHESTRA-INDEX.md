# 📚 Frontend Dev Orchestra GRCD Index

**Last Updated:** 2025-11-29  
**Status:** Active

This index provides quick access to all GRCD documents for the Frontend Dev Orchestra system.

---

## 🎯 Main GRCD (SSOT)

### [GRCD-FRONTEND-ORCHESTRA-v1.0.0.md](./GRCD-FRONTEND-ORCHESTRA-v1.0.0.md)
**The Single Source of Truth for the Frontend Dev Orchestra**

- Orchestrator (L1) responsibilities and architecture
- Agent hierarchy (L0-L4)
- MCP tool allocation
- Quality gate pipeline
- Anti-drift rules
- Directory structure enforcement
- Dependency compatibility matrix

---

## 🤖 Individual Agent GRCDs

### Core Agents

1. **[GRCD-AGENT-UIUX-ENGINEER-v1.0.0.md](./agents/GRCD-AGENT-UIUX-ENGINEER-v1.0.0.md)**
   - **Role:** Senior UI/UX Engineer
   - **Scope:** Presentational components, design tokens, layout patterns
   - **Boundaries:** No business logic, no state management, no data fetching

2. **[GRCD-AGENT-FRONTEND-IMPLEMENTOR-v1.0.0.md](./agents/GRCD-AGENT-FRONTEND-IMPLEMENTOR-v1.0.0.md)**
   - **Role:** Senior Frontend Engineer
   - **Scope:** Logic wiring, data fetching, state management
   - **Boundaries:** No visual styling changes, respects UI/UX types

3. **[GRCD-AGENT-FRONTEND-TESTER-v1.0.0.md](./agents/GRCD-AGENT-FRONTEND-TESTER-v1.0.0.md)**
   - **Role:** Senior QA Automation Engineer
   - **Scope:** Unit/integration tests, test coverage
   - **Boundaries:** No business logic changes, gatekeeper role

4. **[GRCD-AGENT-A11Y-GUARD-v1.0.0.md](./agents/GRCD-AGENT-A11Y-GUARD-v1.0.0.md)**
   - **Role:** Accessibility Reviewer and Fixer
   - **Scope:** WCAG compliance, accessibility fixes
   - **Boundaries:** Minimal fixes only, respects token system

5. **[GRCD-AGENT-STORYBOOK-v1.0.0.md](./agents/GRCD-AGENT-STORYBOOK-v1.0.0.md)**
   - **Role:** Component Documentation Maintainer
   - **Scope:** Storybook stories, MDX documentation
   - **Boundaries:** Documentation only, no code changes

6. **[GRCD-AGENT-FRONTEND-DEPENDENCIES-v1.0.0.md](./agents/GRCD-AGENT-FRONTEND-DEPENDENCIES-v1.0.0.md)**
   - **Role:** Frontend Dependency and Config Hygiene
   - **Scope:** Dependency analysis, config cleanup
   - **Boundaries:** No changes without explicit task

---

## 📋 Quick Reference

### Agent Execution Order (Typical Workflow)

1. **Lynx.UIUXEngineer** — Design & Layout
2. **Lynx.FrontendImplementor** — Logic & Wiring
3. **Lynx.A11yGuard** — Accessibility Audit
4. **Lynx.FrontendTester** — Test Coverage
5. **Lynx.StorybookAgent** — Documentation

### Quality Gates (All Tasks)

1. **Lint Check** — ESLint must pass
2. **A11y Check** — WCAG 2.1 AA minimum
3. **Test Check** — Unit/integration tests must pass

### Anti-Drift Rules (Non-Negotiable)

1. **Tokens Are Law** — No hardcoded design values
2. **Orchestrator Is the Gate** — All agents route through orchestrator
3. **Agents Work in Diffs** — Surgical changes, not rewrites
4. **Every Change Has Notes** — Design/Implementation Notes required
5. **Quality Gates Before Done** — Lint + A11y + Tests must pass

---

## 🔗 Related Documents

- **Frontend Dev Orchestra Reference Spec v1** — Human-approved baseline
- **GRCD Template v4** — Template structure
- **GRCD-KERNEL v4.0.0** — Kernel GRCD for MCP governance patterns

---

## 📝 Version History

| Version | Date       | Changes                          |
| ------- | ---------- | -------------------------------- |
| 1.0.0   | 2025-11-29 | Initial GRCD creation (SSOT)    |

---

> ✅ **Status:** All GRCD documents have been created and are ready for use. The Frontend Dev Orchestra system is now fully documented and governed.


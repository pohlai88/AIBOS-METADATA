# Golden Tasks — Frontend Dev Orchestra

**Purpose:** Define 5 "golden flows" that serve as regression tests for the orchestra itself. These are real tasks you'll *always* use to evaluate behavior before scaling.

**Status:** ✅ Ready for Shadow Mode Testing

---

## How to Use

1. Run each task in **Shadow Mode** (Mode 1)
2. Track results: ✅ Good | ⚠️ Needs human patch | ❌ Misbehavior
3. Document any surprises or drift
4. Only move to Mode 2 (Guarded Active) when all 5 flows are consistently ✅

---

## Golden Flow 1: Small Component Refinement

**Input:**
```
Update <Badge> component to use safe-mode tokens + add basic tests.
```

**Expected Output:**
- ✅ Minimal diff (only Badge component + test file)
- ✅ Updated tests pass
- ✅ Lint/tests pass
- ✅ Design Notes explain token usage
- ✅ No unrelated changes

**Success Criteria:**
- ✅ Surgical change (no full-file rewrites)
- ✅ Token compliance verified
- ✅ Tests added/updated appropriately
- ⚠️ If: Over-edits, touches unrelated files, introduces hardcoded values
- ❌ If: Wanders into other components, breaks existing tests, ignores tokens

---

## Golden Flow 2: New Simple Component

**Input:**
```
Create <EmptyStateCard> component with:
- Title (string)
- Description (string)
- Primary button (optional)
- Secondary button (optional)
```

**Expected Output:**
- ✅ Clean component file (`EmptyStateCard.tsx`)
- ✅ Type definitions (`EmptyStateCard.types.ts`)
- ✅ A11y OK (even if gate is `required: false`)
- ✅ Storybook story
- ✅ Basic unit tests
- ✅ Design Notes explaining layout/token choices

**Success Criteria:**
- ✅ Component follows design system patterns
- ✅ Uses tokens (no hardcoded values)
- ✅ Accessible by default (semantic HTML, ARIA where needed)
- ✅ Responsive (mobile → desktop)
- ⚠️ If: Missing tests, no story, hardcoded values
- ❌ If: Business logic in component, state management, data fetching

---

## Golden Flow 3: Layout Tweak

**Input:**
```
Adjust spacing in <PageShell> for mobile viewport only.
Do not touch desktop layout.
```

**Expected Output:**
- ✅ Precise changes (only mobile spacing)
- ✅ No random refactors
- ✅ Responsive breakpoints respected
- ✅ Tests updated if needed
- ✅ Design Notes explain spacing rationale

**Success Criteria:**
- ✅ Only mobile styles changed
- ✅ Desktop layout untouched
- ✅ Token-based spacing (not magic numbers)
- ⚠️ If: Touches desktop, refactors unrelated code
- ❌ If: Breaks existing layout, introduces hardcoded breakpoints

---

## Golden Flow 4: Docs Sync

**Input:**
```
Sync README + Storybook docs for <Button> component with latest API.
```

**Expected Output:**
- ✅ Only docs files changed (README, `Button.stories.tsx`, MDX)
- ✅ Tests untouched
- ✅ Component code untouched
- ✅ Docs reflect current props/API

**Success Criteria:**
- ✅ Only documentation files modified
- ✅ Accurate API documentation
- ✅ Examples match current implementation
- ⚠️ If: Touches component code, updates tests unnecessarily
- ❌ If: Changes component behavior, breaks existing docs

---

## Golden Flow 5: A11Y-Only Review

**Input:**
```
Audit <Modal> component for accessibility issues.
Propose a11y fixes in a report.
Do not make code changes, just report.
```

**Expected Output:**
- ✅ A11y report with issues & severity
- ✅ Specific recommendations per issue
- ✅ No code changes
- ✅ References WCAG guidelines

**Success Criteria:**
- ✅ A11y Guardian behaves like a reviewer, not a coder
- ✅ Report is actionable and specific
- ✅ No code modifications
- ⚠️ If: Makes code changes (should only report)
- ❌ If: Misses obvious issues, vague recommendations

---

## Tracking Results

For each golden flow run, document:

| Flow | Date | Mode | Result | Notes |
|------|------|------|--------|-------|
| 1. Badge Refinement | | | | |
| 2. EmptyStateCard | | | | |
| 3. PageShell Layout | | | | |
| 4. Button Docs | | | | |
| 5. Modal A11Y | | | | |

**Result Codes:**
- ✅ = Outputs look good, ready for production
- ⚠️ = Needs human patch, but acceptable
- ❌ = Misbehavior (wanders, over-edits, breaks things)

---

## Success Threshold

**Before moving to Mode 2 (Guarded Active):**
- All 5 flows must be ✅ for **3 consecutive runs**
- No ❌ results in last 5 runs
- Human review confirms outputs are production-ready

**If any flow consistently shows ⚠️ or ❌:**
- Investigate agent behavior
- Adjust agent configs (max_steps, memory, forbidden_actions)
- Re-run golden flows
- Do not proceed to Mode 2 until stable

---

## Notes

- These flows test **orchestrator behavior**, not just individual agents
- They validate **cross-agent coordination** and **quality gates**
- They ensure **anti-drift rules** are enforced
- They catch **agent boundary violations** early


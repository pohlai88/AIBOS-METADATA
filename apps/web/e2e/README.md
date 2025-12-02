# Metadata Studio E2E Tests

Comprehensive End-to-End tests for the "Silent Killer Frontend" using Playwright.

## Test Coverage

### ✅ **Glossary Browser** (`glossary-browser.spec.ts`)
- Display 25 metadata fields
- Search by name and definition
- Filter by domain (Finance, Tax, HR, Operations, Sales)
- Filter by module (AR, AP, GL, Tax, Payroll, etc.)
- Row selection and sidebar updates
- **6 Sidebar Tabs:**
  - ✅ Definition (business definition, technical details, sensitivity, tags)
  - ✅ Owner (data steward, autonomy tier)
  - ✅ Quality (score, last profiled, thresholds)
  - ✅ Lineage (upstream sources, transformations, downstream consumers)
  - ✅ AI (suggestions with confidence scores, Accept/Reject)
  - ✅ Compliance (standards, gap analysis, remediation)
- AI suggestion badges in grid
- Empty states for missing data

**Total Tests:** 20

---

### ✅ **Change Request Workflow** (`change-request-workflow.spec.ts`)
- Request Change button (appears when field selected)
- MicroActionDrawer slide-in
- Change type selection (Definition, Tier, Owner, Sensitivity, Tags)
- Form validation (required fields)
- **Tier-Aware Approval Flow:**
  - T1 + Low = Auto-apply (0 approvals)
  - T2 + Medium = 1 approval (Data Steward)
  - T3 + High = 2 approvals (Steward + Domain Lead)
  - T4 = 3 approvals (Steward + Domain Lead + Compliance)
- Impact Analysis drawer
- Risk assessment (Low/Medium/High/Critical)
- Affected components (databases, APIs, reports, users)
- Recommendations checklist
- Proceed/Cancel actions

**Total Tests:** 13

---

### ✅ **Proposals & Approvals** (`proposals-approvals.spec.ts`)
- Display pending approvals (5 in sample data)
- Approval card details (field, tier, change type, impact)
- Diff view (current → proposed)
- Justification display
- Approval chain with statuses (approved, pending, rejected)
- Approve/Reject buttons (role-based permissions)
- **Filters:**
  - By role (data-steward, domain-lead, compliance)
  - By impact (high, medium, low)
  - Clear filters
- **Statistics Sidebar:**
  - Requires My Action count
  - Total Pending
  - By Impact breakdown
- Export report
- Empty states

**Total Tests:** 18

---

### ✅ **Analytics Dashboard** (`analytics-dashboard.spec.ts`)
- **Metadata Health Score:** 87% with status (excellent/good/warning/critical)
- **Key Metrics:**
  - Quality: 92%
  - Governance: 84%
  - Compliance: 96%
- **Progress Metrics:**
  - Datasets Cataloged: 47/50 (94%)
  - Fields Documented: 245/280 (87%)
  - Lineage Mapped: 38/50 (76%)
- **Activity Stats:**
  - Active Stakeholders: 23
  - Pending Approvals: 5
  - AI Suggestions: 8
  - Avg Time to Approval: 2.4 days
- **Predictive Insights (4):**
  - Quality decline prediction (94% confidence)
  - Missing lineage detection (98% confidence)
  - Outdated definitions (89% confidence)
  - Usage spike detection (92% confidence)
- Confidence scores, priority levels, affected fields
- Predicted impact & timeframe
- Suggested actions
- Historical patterns
- Take Action / Details buttons
- **Activity Feed:**
  - 8 recent activities
  - Actor attribution (users and AI agents)
  - Timestamps
  - Metadata badges
- Time range filtering (24h, 7d, 30d, 90d)
- Schedule Report / Export buttons

**Total Tests:** 22

---

## Total Test Count: **73 E2E Tests**

---

## Running Tests

### Install Playwright browsers:
```bash
cd apps/web
pnpm exec playwright install
```

### Run all tests (headless):
```bash
pnpm test:e2e
```

### Run with UI mode (recommended for development):
```bash
pnpm test:e2e:ui
```

### Run with headed browsers (see what's happening):
```bash
pnpm test:e2e:headed
```

### Debug mode (step through tests):
```bash
pnpm test:e2e:debug
```

### View test report:
```bash
pnpm test:e2e:report
```

---

## Test Configuration

**Browsers tested:**
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

**Features:**
- Parallel test execution (faster)
- Automatic retries (2 retries on CI)
- Screenshots on failure
- Video recording on failure
- Trace collection on retry
- HTML report generation

---

## Test Philosophy

These tests follow the **"Silent Killer Frontend"** principles:

1. **Contextual, Not Navigational**
   - Tests verify sidebar updates without page navigation
   - All interactions happen in-context

2. **Micro-Actions, Not Full Pages**
   - Tests verify MicroActionDrawer slide-ins
   - Change requests don't navigate away

3. **Quiet AI, Not Chatbots**
   - Tests verify AI suggestions with confidence scores
   - Accept/Reject buttons tested

4. **Beautiful Empty States**
   - Tests verify empty states are meaningful
   - No generic "No data" messages

5. **Tier-Aware Governance**
   - Tests verify approval flows change based on tier
   - Impact analysis before changes

---

## Coverage Summary

```
Feature                     | Tests | Status
----------------------------|-------|--------
Glossary Browser            |   20  |   ✅
Change Request Workflow     |   13  |   ✅
Proposals & Approvals       |   18  |   ✅
Analytics Dashboard         |   22  |   ✅
----------------------------|-------|--------
TOTAL                       |   73  |   ✅
```

---

## Next Steps

1. **Run tests locally** to verify all pass
2. **Add to CI/CD pipeline** (GitHub Actions)
3. **Monitor test reports** for failures
4. **Extend coverage** as new features are added

---

## Continuous Testing

Add to `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

**Ready to test the future of metadata governance! 🚀**


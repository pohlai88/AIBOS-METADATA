# Silent Killer Frontend – UI Implementation Plan

**Version:** 1.0  
**Status:** Implementation Blueprint  
**Base:** GRCD-METADATA-FRONTEND.md + Existing Backend (Phase 1-3 Complete)  
**Stack:** Next.js 16 (App Router) + Tailwind v4 + shadcn/ui + Hexagonal Architecture

---

## Executive Summary

This plan translates the **Silent Killer Frontend** strategy into a concrete Next.js implementation that:

- ✅ Lives **inside the work context** (no separate portals)
- ✅ Uses **single-page contextual workbench** pattern
- ✅ Implements **micro-actions** (inline edits, not megamodals)
- ✅ Provides **quiet AI** (suggestions, not chatbots)
- ✅ Makes **state & meaning first-class** (badges, tooltips, visual language)

**Backend Ready:** 14 API routes, 17 database tables, AI agents, autonomy tiers (Tier 0-3)

---

## Table of Contents

1. [Architecture Alignment](#1-architecture-alignment)
2. [Core UI Patterns](#2-core-ui-patterns)
3. [Phase 1: Foundation Screens](#3-phase-1-foundation-screens-weeks-1-3)
4. [Phase 2: Lineage & Quality](#4-phase-2-lineage--quality-in-context-weeks-4-6)
5. [Phase 3: Governance Workflows](#5-phase-3-governance-aware-workflows-weeks-7-9)
6. [Phase 4: Blue Ocean Realization](#6-phase-4-full-blue-ocean-realization-weeks-10-12)
7. [Component Library](#7-component-library-breakdown)
8. [Integration Points](#8-backend-integration-map)
9. [Success Metrics](#9-success-metrics--kpis)

---

## 1. Architecture Alignment

### 1.1 Hexagonal Architecture (Established)

```
packages/ui/                    ← PILLARS (Shared, Low-Risk)
├── design/globals.css         ← Design tokens (OKLCH colors, spacing, shadows)
└── lib/utils.ts               ← Pure utility (cn function)

apps/web/                       ← COMPONENTS (Isolated, High-Control)
├── components/
│   ├── ThemeProvider.tsx      ← App-specific (dark-first theme)
│   ├── ui/                    ← 13 shadcn components + custom AIBOS components
│   └── workbench/             ← NEW: Silent Killer patterns
│       ├── ContextualSidebar.tsx
│       ├── DataGrid.tsx
│       ├── ActionHeader.tsx
│       └── MicroActionDrawer.tsx
└── app/
    ├── (metadata)/            ← Metadata workbench routes
    ├── (finance)/             ← Future: Finance module routes
    └── (operations)/          ← Future: Operations routes
```

### 1.2 Design System Tokens (Already in `packages/ui/design/globals.css`)

**Metadata Colors:**

- `--metadata-glossary` (blue)
- `--metadata-lineage` (purple)
- `--metadata-quality` (green)
- `--metadata-governance` (amber)

**State Colors:**

- `--state-draft`, `--state-approved`, `--state-certified`
- `--risk-low`, `--risk-medium`, `--risk-high`, `--risk-critical`

**Tier Colors:**

- `--tier-1` (Tier 1: Suggest)
- `--tier-2` (Tier 2: Propose)
- `--tier-3` (Tier 3: Auto-Apply)

---

## 2. Core UI Patterns

### Pattern 1: Single-Page Contextual Workbench

**Layout Structure:**

```tsx
<WorkbenchLayout>
  <ActionHeader>
    {/* Filters, state badges, environment indicator */}
  </ActionHeader>

  <div className="grid grid-cols-[1fr_380px]">
    <PrimaryCanvas>
      {/* Data grid, visual editor, or workflow canvas */}
    </PrimaryCanvas>

    <ContextualSidebar>
      {/* Tabs: Definition | Owner | Quality | Lineage | AI Suggestions */}
    </ContextualSidebar>
  </div>
</WorkbenchLayout>
```

**Key Principle:** Clicking a row/column/field **never navigates away** – only refreshes sidebar context.

---

### Pattern 2: Micro-Actions (Not Megamodals)

**Instead of Full-Page Modals:**

```tsx
// ❌ BAD: Full-page modal
<Dialog fullScreen>
  <form>...</form>
</Dialog>

// ✅ GOOD: Inline edit + focused drawer
<InlineEditField
  field="businessDefinition"
  onSave={handleSave}
/>

<MicroActionDrawer
  title="Propose Mapping"
  size="sm"
  trigger={<Button variant="ghost" size="sm">Map Field</Button>}
>
  <MapFieldForm />
</MicroActionDrawer>
```

---

### Pattern 3: Quiet AI

**AI appears as:**

1. **Highlighted Suggestions** (badges in grid)
2. **Risk Indicators** (icons with tooltips)
3. **Guided Flows** (step-by-step fix suggestions)

```tsx
<DataGridCell>
  <span>{value}</span>

  {aiSuggestion && (
    <Badge variant="ai" size="xs">
      <SparklesIcon /> Map to TAX_CODE?
    </Badge>
  )}

  {riskLevel === "high" && (
    <Tooltip content="PII field exported to 3 external systems">
      <AlertTriangleIcon className="text-risk-high" />
    </Tooltip>
  )}
</DataGridCell>
```

---

### Pattern 4: State as First-Class

**Visual Language:**

```tsx
// Metadata State Badge
<MetadataStateBadge state="approved" />
<MetadataStateBadge state="draft" />
<MetadataStateBadge state="certified" />

// Quality Score Badge
<QualityScoreBadge score={94} threshold={80} />

// Tier Badge (AI Autonomy)
<TierBadge tier="tier2" label="Propose" />

// Risk Level Indicator
<RiskIndicator level="medium" />
```

---

## 3. Phase 1: Foundation Screens (Weeks 1-3)

### 3.1 Metadata Glossary Browser

**Route:** `/metadata/glossary`

**Purpose:** Core SSOT for all canonical field definitions

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Search] [Filter: Domain ▼] [Filter: Module ▼] [+ New Field]   │
├─────────────────────────────────────────────────┬───────────────┤
│ Field Name       │ Label          │ Domain │ T │               │
│─────────────────────────────────────────────────│  DEFINITION   │
│ customer_name    │ Customer Name  │ Finance│ 2 │               │
│ revenue_gross    │ Gross Revenue  │ Finance│ 3 │  Label:       │
│ tax_code         │ Tax Code       │ Tax    │ 2 │  Customer Name│
│ ...              │ ...            │ ...    │ . │               │
│                                                 │  Domain:      │
│                                                 │  FINANCE / AR │
│                                                 │               │
│                                                 │  Owner:       │
│                                                 │  @john.doe    │
│                                                 │               │
│                                                 │  Quality: 94% │
│                                                 │  [●●●●○]      │
│                                                 │               │
│                                                 │  [Edit Inline]│
└─────────────────────────────────────────────────┴───────────────┘
```

**Features:**

- ✅ DataTable with search, sort, filter
- ✅ Click row → sidebar shows full definition
- ✅ Inline edit: description, owner, tags
- ✅ State badges: Draft/Approved/Certified
- ✅ Tier badges: T1/T2/T3 (autonomy level)

**Backend Integration:**

```typescript
// API: GET /metadata/fields
// Service: metadata.fields.search(query, filters)

const { data } = await fetch("/metadata/fields?domain=FINANCE&search=customer");
```

---

### 3.2 Metadata Detail View

**Route:** `/metadata/glossary/[fieldId]`

**Sidebar Tabs:**

1. **Definition** – Business meaning, technical name, data type, units
2. **Owner** – Data steward, approval history
3. **Standards** – MFRS/IFRS mapping, tax standards
4. **Tags** – User-generated tags
5. **Quality** – Latest profile score, thresholds

**Micro-Actions:**

- `Edit Definition` (inline)
- `Change Owner` (drawer)
- `Add Tag` (inline)
- `Request Mapping` (drawer)

---

### 3.3 Components to Build (Phase 1)

| Component            | Location                         | Purpose                                     |
| -------------------- | -------------------------------- | ------------------------------------------- |
| `WorkbenchLayout`    | `apps/web/components/workbench/` | Main layout pattern                         |
| `ActionHeader`       | `apps/web/components/workbench/` | Top bar with filters and actions            |
| `ContextualSidebar`  | `apps/web/components/workbench/` | Right sidebar with tabs                     |
| `DataGrid`           | `apps/web/components/workbench/` | Main data table (shadcn table + extensions) |
| `InlineEditField`    | `apps/web/components/ui/`        | Editable text with save/cancel              |
| `MetadataStateBadge` | `apps/web/components/ui/`        | Draft/Approved/Certified badges             |
| `TierBadge`          | `apps/web/components/ui/`        | T1/T2/T3 badges (already exists, enhance)   |
| `QualityScoreBadge`  | `apps/web/components/ui/`        | Quality % with visual indicator             |

---

## 4. Phase 2: Lineage & Quality in Context (Weeks 4-6)

### 4.1 Lineage Visualization Sidebar

**Integration:** Add "Lineage" tab to `ContextualSidebar`

**View:**

```
┌───────────────────────────────────┐
│ LINEAGE                           │
├───────────────────────────────────┤
│                                   │
│   [Source DB]                     │
│       ↓                           │
│   [ETL Job: daily_sales]          │
│       ↓                           │
│ ┌─► customer_name ◄─┐             │
│ │       ↓           │             │
│ │   [API: GET /customers]         │
│ │       ↓           │             │
│ │   [Dashboard: Sales Report]     │
│ │                   │             │
│ └───[Risk: Medium]──┘             │
│                                   │
│ [View Full Graph →]               │
└───────────────────────────────────┘
```

**Backend:**

```typescript
// API: GET /lineage/graph?nodeId=field:customer_name&depth=2
const lineage = await fetch(`/lineage/graph?nodeId=${fieldId}&depth=2`);
```

**Components:**

- `LineageMiniGraph` – SVG-based mini-graph (D3/React Flow lite)
- `LineageNode` – Single node with icon, label, status
- `LineageEdge` – Connection line with edge type (transform/read/write)

---

### 4.2 Quality Signals in Grid

**Enhancement:** Add quality indicators to every row in `DataGrid`

```tsx
<TableCell>
  <div className="flex items-center gap-2">
    <span>customer_name</span>
    <QualityScoreBadge score={94} size="xs" />
    {qualityIssues > 0 && (
      <Tooltip content="3 quality issues detected">
        <AlertCircleIcon className="h-4 w-4 text-warning" />
      </Tooltip>
    )}
  </div>
</TableCell>
```

**Backend:**

```typescript
// API: GET /quality/profile/latest?entityUrn=gl.account:revenue_gross
const quality = await fetch(`/quality/profile/latest?entityUrn=${entityUrn}`);
```

---

### 4.3 AI Suggestions (Tier 0-1)

**Display:** Add "AI" tab to `ContextualSidebar`

**View:**

```
┌───────────────────────────────────┐
│ AI SUGGESTIONS                    │
├───────────────────────────────────┤
│                                   │
│ ✨ Mapping Suggestion             │
│ "customer_name" → "CUSTOMER_NAME" │
│ Confidence: 95%                   │
│ [Accept] [Reject]                 │
│                                   │
│ ⚠️  Quality Warning                │
│ Field has 12% null values         │
│ Threshold: 5% max                 │
│ [View Details]                    │
│                                   │
│ 📊 Lineage Alert                  │
│ Used by 3 critical reports        │
│ Changes require approval          │
│ [View Impact]                     │
└───────────────────────────────────┘
```

**Backend:**

```typescript
// API: GET /agent-proposals?status=pending&entityId=field:customer_name
const proposals = await fetch("/agent-proposals?status=pending");
```

---

## 5. Phase 3: Governance-Aware Workflows (Weeks 7-9)

### 5.1 Change Request Flow (Tier 2)

**Scenario:** User edits a Tier 2 field → triggers approval workflow

**UI Flow:**

1. User clicks "Edit Definition" on a Tier 2 field
2. `MicroActionDrawer` appears:
   ```
   ┌──────────────────────────────────┐
   │ Propose Change Request           │
   ├──────────────────────────────────┤
   │ Field: customer_name             │
   │                                  │
   │ Current Definition:              │
   │ "Legal name of customer entity"  │
   │                                  │
   │ Proposed Change:                 │
   │ [Text area...]                   │
   │                                  │
   │ Justification:                   │
   │ [Text area...]                   │
   │                                  │
   │ Impact: 3 downstream reports     │
   │ Approver: @data.steward          │
   │                                  │
   │ [Cancel] [Submit for Review]     │
   └──────────────────────────────────┘
   ```
3. On submit → Creates proposal in backend
4. Status badge changes to "Pending Approval"

**Backend:**

```typescript
// API: POST /agent-proposals
const proposal = await fetch("/agent-proposals", {
  method: "POST",
  body: JSON.stringify({
    entityType: "METADATA_FIELD",
    entityId: fieldId,
    changeType: "UPDATE_DEFINITION",
    proposedValue: newDefinition,
    justification,
  }),
});
```

---

### 5.2 Approval Dashboard

**Route:** `/metadata/approvals`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Filter: Pending ▼] [Filter: My Approvals ▼]                   │
├─────────────────────────────────────────────┬───────────────────┤
│ Entity           │ Change Type  │ Requester │                   │
│──────────────────────────────────────────────│  PROPOSAL DETAILS │
│ customer_name    │ Definition   │ @john     │                   │
│ revenue_gross    │ Mapping      │ @ai-agent │  Requester:       │
│ tax_code         │ Owner        │ @jane     │  @john.doe        │
│ ...              │ ...          │ ...       │                   │
│                                              │  Change:          │
│                                              │  Update definition│
│                                              │                   │
│                                              │  Impact:          │
│                                              │  3 reports        │
│                                              │  1 dashboard      │
│                                              │                   │
│                                              │  [Approve]        │
│                                              │  [Reject]         │
└─────────────────────────────────────────────┴───────────────────┘
```

**Features:**

- ✅ View all pending proposals
- ✅ Filter by status, requester, entity type
- ✅ Approve/reject with comments
- ✅ View change diff (before/after)
- ✅ See impact analysis

**Backend:**

```typescript
// API: GET /approvals?status=pending
// API: POST /approvals/:id/approve
// API: POST /approvals/:id/reject
```

---

### 5.3 Compliance Hints

**Integration:** Add "Compliance" tab to `ContextualSidebar`

**View:**

```
┌───────────────────────────────────┐
│ COMPLIANCE                        │
├───────────────────────────────────┤
│                                   │
│ 🛡️  Standards Mapping             │
│                                   │
│ MFRS 15: Revenue Recognition      │
│ Status: ✓ Aligned                 │
│                                   │
│ IFRS 9: Financial Instruments     │
│ Status: ⚠️  Partial               │
│ [View Details]                    │
│                                   │
│ 🔒 Sensitivity: PII               │
│ GDPR: Requires consent            │
│ PDPA: Restricted transfer         │
│                                   │
│ 📋 Controls:                      │
│ • Access: Role-based              │
│ • Encryption: At rest             │
│ • Audit: Full logging             │
└───────────────────────────────────┘
```

**Backend:**

```typescript
// API: GET /policy/control-status?standard=MFRS&entityId=field:revenue_gross
const compliance = await fetch("/policy/control-status?...");
```

---

## 6. Phase 4: Full Blue Ocean Realization (Weeks 10-12)

### 6.1 Finance Module Integration

**Route:** `/finance/ar/invoices`

**Concept:** Apply Silent Killer patterns to a real finance workflow

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Accounts Receivable / Invoices                                  │
│ [Filter: Overdue ▼] [Date Range ▼] [Customer ▼]                │
├─────────────────────────────────────────┬───────────────────────┤
│ Invoice # │ Customer      │ Amount │ Due│                       │
│───────────────────────────────────────────│  INVOICE DETAILS      │
│ INV-001   │ Acme Corp     │ $5,000 │ 🔴│                       │
│ INV-002   │ Beta Ltd      │ $3,200 │ 🟡│  Invoice: INV-001     │
│ INV-003   │ Gamma Inc     │ $1,500 │ 🟢│                       │
│ ...       │ ...           │ ...    │ . │  Customer:            │
│                                           │  Acme Corp            │
│                                           │  [View Lineage]       │
│                                           │                       │
│                                           │  Amount: $5,000       │
│                                           │  Field: revenue_gross │
│                                           │  Quality: 94%         │
│                                           │                       │
│                                           │  ✨ AI Suggestion:    │
│                                           │  Consider payment plan│
│                                           │  based on history     │
│                                           │                       │
│                                           │  [Approve] [Escalate] │
└─────────────────────────────────────────┴───────────────────────┘
```

**Key Features:**

- ✅ Clicking "Amount" column → shows field metadata (revenue_gross)
- ✅ Lineage shows: Invoice → GL Journal → Financial Report → Tax Return
- ✅ AI suggests actions based on customer payment history
- ✅ Compliance hints: MFRS 15 alignment status

**This demonstrates:**  
_"Your existing ERP screens become governed, AI-native surfaces"_

---

### 6.2 Governance Overlay Pattern

**Component:** `<GovernanceOverlay>`

**Purpose:** Wrap ANY existing screen with metadata awareness

```tsx
// apps/web/app/finance/ar/invoices/page.tsx
import { GovernanceOverlay } from "@/components/workbench/GovernanceOverlay";

export default function InvoicesPage() {
  return (
    <GovernanceOverlay entityType="invoice" contextDomain="FINANCIAL_REPORTING">
      <InvoiceGrid data={invoices} />
    </GovernanceOverlay>
  );
}
```

**What it adds:**

1. Metadata tooltips on hover over any field
2. Contextual sidebar (auto-populated on row click)
3. AI suggestions badge overlay
4. Compliance status indicators

---

## 7. Component Library Breakdown

### 7.1 Workbench Components (New)

| Component           | File                                                  | Description                  |
| ------------------- | ----------------------------------------------------- | ---------------------------- |
| `WorkbenchLayout`   | `apps/web/components/workbench/WorkbenchLayout.tsx`   | Main 3-panel layout          |
| `ActionHeader`      | `apps/web/components/workbench/ActionHeader.tsx`      | Top action bar               |
| `ContextualSidebar` | `apps/web/components/workbench/ContextualSidebar.tsx` | Right sidebar with tabs      |
| `DataGrid`          | `apps/web/components/workbench/DataGrid.tsx`          | Enhanced table with metadata |
| `MicroActionDrawer` | `apps/web/components/workbench/MicroActionDrawer.tsx` | Small focused drawer         |
| `GovernanceOverlay` | `apps/web/components/workbench/GovernanceOverlay.tsx` | Wrap existing screens        |

---

### 7.2 Domain Components (Metadata-Specific)

| Component            | File                                                | Description                |
| -------------------- | --------------------------------------------------- | -------------------------- |
| `MetadataStateBadge` | `apps/web/components/ui/metadata-badges.tsx`        | Draft/Approved/Certified   |
| `QualityScoreBadge`  | `apps/web/components/ui/quality-badge.tsx`          | Quality % with indicator   |
| `LineageMiniGraph`   | `apps/web/components/metadata/LineageMiniGraph.tsx` | Mini lineage visualization |
| `ComplianceStatus`   | `apps/web/components/metadata/ComplianceStatus.tsx` | Standards compliance view  |
| `AISuggestionCard`   | `apps/web/components/metadata/AISuggestionCard.tsx` | AI proposal card           |
| `ImpactAnalysis`     | `apps/web/components/metadata/ImpactAnalysis.tsx`   | Upstream/downstream impact |

---

### 7.3 shadcn/ui Components (Already Installed)

✅ badge, button, card, dialog, dropdown-menu, input, label, scroll-area, select, separator, sonner, table, tabs

**Additional Components to Install:**

- `tooltip` – For metadata hints
- `popover` – For inline help
- `drawer` – For `MicroActionDrawer`
- `combobox` – For field search/select
- `skeleton` – For loading states
- `alert` – For warnings/errors
- `progress` – For quality scores
- `avatar` – For user/owner display

---

## 8. Backend Integration Map

| Frontend Feature  | Backend API                           | Service                       |
| ----------------- | ------------------------------------- | ----------------------------- |
| Glossary Browser  | `GET /metadata/fields`                | `metadata.fields.search()`    |
| Field Detail      | `GET /metadata/fields/:id`            | `metadata.fields.describe()`  |
| Lineage View      | `GET /lineage/graph?nodeId=...`       | `lineage.graphForNode()`      |
| Quality Score     | `GET /quality/profile/latest`         | Quality profiler              |
| AI Suggestions    | `GET /agent-proposals?status=pending` | Agent proposal service        |
| Mapping Lookup    | `POST /mapping/lookup`                | `metadata.mappings.lookup()`  |
| Compliance Status | `GET /policy/control-status`          | `policy.controlStatus.list()` |
| Change Request    | `POST /agent-proposals`               | Approval workflow             |
| Approve/Reject    | `POST /approvals/:id/approve`         | Approval service              |
| Impact Analysis   | `GET /impact?nodeId=...`              | `lineage.impactReport()`      |

---

## 9. Success Metrics & KPIs

### 9.1 Trust & Governance KPIs

- **Field Trust Coverage:** % of fields with complete metadata (target: 90%)
- **Policy Awareness:** % of screens with compliance hints visible (target: 100%)
- **Change Traceability:** % of changes logged and traceable (target: 100%)

### 9.2 Productivity KPIs

- **Time-to-Understand:** Time for new user to interpret a screen (target: <2 min)
- **Click Reduction:** Avg clicks saved per task vs portal-based approach (target: 50%)
- **Inline Edit Adoption:** % of metadata edits done inline (target: 80%)

### 9.3 Compliance KPIs

- **Incidents Prevented:** Errors caught by AI warnings (measure monthly)
- **Audit Prep Time:** Reduction vs manual evidence gathering (target: 70%)
- **Business User Participation:** Non-IT users contributing to metadata (target: 40%)

---

## 10. Next Steps

### Immediate (Week 1)

1. ✅ Create `apps/web/components/workbench/` directory
2. ✅ Build `WorkbenchLayout` component
3. ✅ Build `ContextualSidebar` component with tabs
4. ✅ Build `DataGrid` with metadata integration
5. ✅ Create `/metadata/glossary` page using workbench pattern

### Week 2-3

6. Enhance `MetadataStateBadge` and create `QualityScoreBadge`
7. Build `InlineEditField` component
8. Integrate with backend: `GET /metadata/fields`
9. Add search, filter, and sort to glossary

### Week 4-6 (Phase 2)

10. Build `LineageMiniGraph` component
11. Add "Lineage" tab to sidebar
12. Add "AI Suggestions" tab
13. Integrate quality signals into grid

### Week 7-9 (Phase 3)

14. Build change request workflow UI
15. Create approval dashboard
16. Add compliance status view
17. Implement Tier 2/3 governance flows

### Week 10-12 (Phase 4)

18. Build first finance module screen (AR Invoices)
19. Create `GovernanceOverlay` pattern
20. Document blue ocean positioning
21. Prepare for customer demos

---

## Conclusion

This plan delivers the **Silent Killer Frontend** vision:

- ✅ **Context-of-Work UI** – Metadata lives where work happens
- ✅ **No Portal Trap** – Everything in one workbench
- ✅ **Quiet AI** – Suggestions, not chatbots
- ✅ **Governance as Trust** – Not external policing
- ✅ **Blue Ocean Positioning** – A new category for governed ERP UX

**The system will feel calmer, safer, and easier to trust than anything users have used before.**

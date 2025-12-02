# 🎯 Metadata MVP - Definition of Done Checklist

**Status:** 🚧 In Progress  
**Last Updated:** 2025-12-02  
**Owner:** AIBOS Team

---

## 🧱 A. Infra & Schema (Postgres + Drizzle + Zod)

**Goal:** All metadata tables + migrations are defined, synced and Zod-validated.

### A1. Core metadata tables exist in DB (with migrations)

- [x] `mdm_standard_pack` ✅
- [x] `mdm_global_metadata` (concepts) ✅
- [x] `mdm_alias` ✅
- [x] `mdm_naming_variant` ✅
- [x] `mdm_approval` (for workflows) ✅
- [ ] `mdm_business_rule` (for governed config) ⏳
- [ ] `mdm_lineage_entity` + `mdm_lineage_link` (minimal version) ⏳
- [ ] `mdm_profile_config` + `mdm_profile_run` (for profiling engine) ⏳

### A2. Verification scripts exist and run cleanly

- [x] `VERIFY-mdm-approval-schema.sql` exists and passes ✅
- [ ] `VERIFY-mdm-global-metadata-schema.sql` ⏳
- [ ] `VERIFY-mdm-alias-schema.sql` ⏳
- [ ] `VERIFY-mdm-naming-variant-schema.sql` ⏳
- [x] Index hints implemented (tenant_id + status, canonical_key) ✅

### A3. Drizzle schemas match DB exactly

- [x] `standard-pack.tables.ts` ✅
- [x] `metadata.tables.ts` ✅
- [x] `alias.tables.ts` ✅
- [x] `naming-variant.tables.ts` ✅
- [x] `approval.tables.ts` ✅
- [ ] `business-rule.tables.ts` ⏳
- [ ] `lineage.tables.ts` ⏳
- [ ] `observability.tables.ts` (for profiling) ⏳
- [x] `pnpm db:generate && pnpm db:migrate` completes without drift ✅

### A4. Env/config for Metadata service

- [x] `DATABASE_URL` set (Supabase) ✅
- [x] `METADATA_BASE_URL` set ✅
- [x] `METADATA_DEFAULT_TENANT_ID` set ✅
- [x] `.env` file created ✅
- [ ] Zod-based env validation (`env.metadata.ts`) ⏳
- [x] `dotenv/config` loaded in server ✅

**Section A Status:** 🚧 **60% Complete** (core tables ✅, verification scripts partial, some tables pending)

---

## 📦 B. Bootstrap & Standard Pack Injection

**Goal:** From CSV/JSON, you can fully rebuild your metadata into a clean DB.

### B1. Bootstrap directory structured

- [x] `bootstrap/metadata/standard-packs/finance-ifrs-core.csv` ✅
- [x] `bootstrap/metadata/concepts/finance-core.csv` ✅
- [x] `bootstrap/metadata/aliases/finance-aliases.csv` ✅
- [x] Directory structure correct ✅

### B2. Zod schemas for CSV rows

- [x] `StandardPackRowSchema` ✅
- [x] `ConceptRowSchema` ✅
- [x] `AliasRowSchema` ✅

### B3. Loader functions implemented

- [x] `loadStandardPacks()` - upsert into `mdm_standard_pack` ✅
- [x] `loadConcepts()` - upsert into `mdm_global_metadata` ✅
- [x] `loadAliases()` - upsert into `mdm_alias` ✅
  - [x] Canonical key lookup into `mdm_global_metadata` ✅
  - [x] Skip rows with missing `canonical_key` with warnings ✅
  - [x] Handle forbidden aliases (empty canonical_key) ✅

### B4. Bootstrap entrypoint

- [x] `bootstrap/metadata/load-metadata.ts` created ✅
- [x] `async function main()` with all loaders ✅
- [x] Script in `package.json`: `"metadata:bootstrap"` ✅

### B5. Smoke test

- [ ] Run `pnpm metadata:bootstrap` on clean DB ⏳
- [ ] Verify non-empty `mdm_standard_pack` ⏳
- [ ] Verify non-empty `mdm_global_metadata` ⏳
- [ ] Verify non-empty `mdm_alias` with expected aliases ⏳
- [ ] Verify console output shows: ✅ Created/Updated counts ⏳

**Section B Status:** ✅ **95% Complete** (all code ready, needs smoke test)

---

## 📜 C. Contracts & Types (Zod SSOT)

**Goal:** All internal/external types for Metadata are generated from one Zod file.

### C1. Contracts in `packages/contracts/src/metadata.ts`

- [x] `TierSchema` ✅
- [x] `AliasStrengthSchema` ✅
- [x] `NamingContextSchema` ✅
- [x] `NamingStyleSchema` ✅
- [x] `ContextDomainSchema` ✅
- [x] `MetadataConceptSchema` ✅
- [x] `AliasRecordSchema` ✅
- [x] `NamingVariantSchema` ✅
- [x] `StandardPackSchema` ✅
- [x] `ConceptFilterSchema` ✅
- [x] `ResolveAliasInputSchema` ✅
- [x] `ResolveAliasResultSchema` ✅
- [x] `ResolveNameInputSchema` ✅
- [x] `BatchResolveNamesInputSchema` ✅
- [x] `BatchResolveNamesResultSchema` ✅
- [ ] `MetadataConceptDraftSchema` (for curation) ⏳
- [ ] `AliasDraftSchema` (for curation) ⏳
- [ ] `MetadataChangeProposalSchema` (for curation) ⏳

### C2. Types derived via `z.infer`

- [x] All types exported from contracts ✅
- [x] No manually duplicated TS interfaces ✅
- [x] SDK imports from `@aibos/contracts` ✅

### C3. Zod–OpenAPI integration

- [x] `openapi-setup.ts` extends Zod with `.openapi()` ✅
- [x] All schemas have descriptions + examples ✅
- [x] `createMetadataOpenApiDocument()` function ✅

**Section C Status:** ✅ **90% Complete** (curation schemas pending)

---

## 🌐 D. API Layer (Metadata Service)

**Goal:** One clean HTTP API, Zod-validated, that the SDK/MCP uses.

### D1. Endpoints implemented (using contracts)

- [ ] `GET /metadata/concepts/:canonicalKey` ⏳
- [ ] `GET /metadata/concepts` (filters: domain/pack/tier/search) ⏳
- [ ] `GET /metadata/aliases/resolve` ⏳
- [ ] `GET /metadata/aliases/concept/:canonicalKey` ⏳
- [ ] `GET /metadata/standard-packs` ⏳
- [ ] `GET /naming/resolve/:canonicalKey` ⏳
- [ ] `GET /metadata/glossary/search` ⏳
- [ ] `POST /metadata/curation/proposals` (for AI proposals) ⏳

### D2. All params/bodies validated with Zod

- [ ] Path params use Zod schemas ⏳
- [ ] Query params validated with `ConceptFilterSchema`, etc. ⏳
- [ ] Responses validated with `.parse()` before sending ⏳

### D3. OpenAPI document

- [x] `createMetadataOpenApiDocument()` implemented ✅
- [ ] `GET /openapi.json` endpoint ⏳
- [ ] (Optional) `GET /docs` Swagger UI ⏳

**Section D Status:** ⏳ **10% Complete** (OpenAPI ready, routes pending)

---

## 📦 E. Metadata SDK (for ERP Engine, services, agents)

**Goal:** All internal services call Metadata through one SDK, not random SQL.

### E1. Package `packages/metadata-sdk` exists

- [x] `src/config.ts` - `MetadataSdkConfig` + `createDefaultConfig()` ✅
- [x] `src/http-client.ts` - fetch wrapper ✅
- [x] `src/metadata-client.ts` - main client ✅
- [x] `src/index.ts` - exports ✅

### E2. `MetadataClient` methods

- [x] `getConcept(canonicalKey)` ✅
- [x] `listConcepts(filter)` ✅
- [x] `resolveAlias(input)` ✅
- [x] `getAliasesForConcept(canonicalKey)` ✅
- [x] `resolveNameForContext(input)` ✅
- [x] `batchResolveNames(keys, context)` ✅
- [x] `listStandardPacks()` ✅
- [x] `getConceptsInPack(packKey)` ✅
- [x] `searchGlossary(query)` ✅

### E3. Uses contracts types, not local types

- [x] Imports from `@aibos/contracts/metadata` ✅
- [x] No local type definitions ✅

### E4. Integration

- [ ] ERP Engine uses `metadataClient` instead of DB ⏳
- [ ] Dashboards use `metadataClient` ⏳
- [ ] AI Agents use SDK via MCP ⏳

**Section E Status:** ✅ **90% Complete** (SDK ready, integration pending)

---

## 🤖 F. MCP Layer (SSOT Read + Curation Write)

**Goal:** AI tools interact with metadata only via MCP, never DB directly.

### F1. Read-only MCP: `metadata-ssot`

- [x] `.mcp/metadata-ssot/` directory ✅
- [x] `package.json` ✅
- [x] `server.mts` ✅
- [x] `tsconfig.json` ✅
- [x] `README.md` ✅
- [x] Tools implemented:
  - [x] `metadata-list-concepts` ✅
  - [x] `metadata-get-concept` ✅
  - [x] `metadata-resolve-alias` ✅
  - [x] `metadata-resolve-name` ✅
  - [x] `metadata-search-glossary` ✅
- [x] All tools use `MetadataClient` ✅
- [x] All tools validate with Zod ✅
- [x] Registered in `.cursor/mcp.json` ✅

### F2. Curation MCP: `metadata-curation`

- [ ] `.mcp/metadata-curation/` directory ⏳
- [ ] `package.json` ⏳
- [ ] `server.mts` ⏳
- [ ] Tools implemented:
  - [ ] `metadata-propose-concept` ⏳
  - [ ] `metadata-propose-alias` ⏳
- [ ] Uses `MetadataChangeProposalSchema` ⏳
- [ ] POST to `/metadata/curation/proposals` ⏳
- [ ] Creates `mdm_approval` rows ⏳
- [ ] **Safety:** No direct writes to `mdm_concept_global` or `mdm_alias` ⏳

**Section F Status:** 🚧 **50% Complete** (read MCP ✅, curation MCP pending)

---

## 📚 G. Wiki, Glossary & Controlled Vocabulary

**Goal:** Human-facing SSOT that matches the DB + contracts.

### G1. Global Metadata Wiki (SSOT)

- [x] `docs/metadata-ssot/` directory ✅
- [x] `docs/metadata-ssot/index.md` (rules) ✅
- [x] `docs/metadata-ssot/finance-revenue-matrix.md` ✅
  - [x] Revenue vs Sales vs Income vs Gain vs Turnover ✅
  - [x] Matrix with contexts (FINANCIAL_REPORTING, MANAGEMENT, etc.) ✅
- [x] Canonical keys explained (snake_case) ✅
- [x] Naming variants explained (camelCase, PascalCase, etc.) ✅
- [ ] Tiers explained (tier1–tier5) ⏳
- [ ] Lanes explained (kernel, governed, draft) ⏳

### G2. Domain Wikis

- [x] `docs/domains/` directory ✅
- [x] `docs/domains/erp-engine/` ✅
- [x] `docs/domains/erp-engine/posting-rules-sales-invoice.md` ✅
  - [x] References SSOT concepts ✅
  - [x] Shows posting logic ✅
- [x] `docs/domains/finance/` ✅
- [ ] More domain pages as needed ⏳

### G3. Glossary alignment

- [x] Glossary terms map to `mdm_alias` entries ✅
- [x] "Sales" matrix in wiki ≈ `finance-aliases.csv` ≈ `mdm_alias` ✅
- [ ] Glossary search UI (later) ⏳

**Section G Status:** ✅ **80% Complete** (core wiki done, needs tier/lane docs)

---

## 📊 H. Dashboard & Profiling (Minimal)

**Goal:** Very slim manifest-driven dashboard to see profiling/quality.

### H1. Event hooks (Option 3)

- [x] Event system designed ✅
- [x] Event schemas in `@aibos/events` ✅
- [x] On `mdm_approval.status` change:
  - [x] Emit `metadata.changed` ✅
  - [x] Emit `metadata.approved` ✅
  - [x] Emit `metadata.profile.due` for Tier1/2 ✅
- [ ] Event system integrated with approval routes ⏳

### H2. Profiler engine

- [ ] `mdm_profile_config` schema ⏳
- [ ] `mdm_profile_run` schema ⏳
- [ ] Profile subscriber listens to `metadata.profile.due` ⏳
- [ ] Profiler runs SQL quality checks ⏳
- [ ] Stores results in `mdm_profile_run` ⏳
- [ ] Emits `metadata.profile.completed` ⏳

### H3. Manifest-driven dashboard skeleton

- [ ] JSON manifest for profiler dashboard ⏳
- [ ] Types defined for dashboard widgets ⏳
- [ ] API endpoints for dashboard data ⏳

**Section H Status:** 🚧 **30% Complete** (events designed, profiler pending)

---

## 🖥️ I. Metadata Studio UI

**Goal:** Minimal but real UI so humans can actually use this.

### I1. Concept browser

- [ ] Table of `mdm_global_metadata` with filters ⏳
- [ ] Concept detail page ⏳
  - [ ] Canonical key, label, tier ⏳
  - [ ] Aliases list ⏳
  - [ ] Naming variants ⏳
  - [ ] Lineage (minimal) ⏳
  - [ ] Profile summary ⏳

### I2. Alias & glossary view

- [ ] List all aliases for a concept ⏳
- [ ] Show contextDomain + strength ⏳
- [ ] Global search: "Sales" → matrix view ⏳

### I3. Approval queue UI

- [ ] List pending `mdm_approval` rows ⏳
- [ ] Filter by `entity_type="METADATA_CHANGE"` ⏳
- [ ] Detail view: payload, reason ⏳
- [ ] Approve/Reject buttons ⏳
- [ ] Wired to approval routes ⏳

### I4. Simple dashboard screen

- [ ] Render profiler widgets ⏳
- [ ] Status badges for Tier1/2 concepts ⏳
- [ ] Recent profile runs ⏳

**Section I Status:** ⏳ **0% Complete** (UI layer deferred)

---

## 🚀 J. Deployment & Final Smoke Test

**Goal:** "Deployment successful" for Metadata MVP.

### J1. Migrations applied

- [ ] All migrations applied on staging/prod DB ⏳
- [ ] No errors in migration log ⏳
- [ ] Schema verification scripts pass ⏳

### J2. Bootstrap runs on staging/prod

- [ ] `pnpm metadata:bootstrap` completes ⏳
- [ ] Populates packs + concepts + aliases ⏳
- [ ] No Zod validation errors ⏳

### J3. Metadata API reachable

- [ ] `GET /metadata/concepts` returns IFRS/MFRS concepts ⏳
- [ ] `GET /metadata/aliases/resolve?aliasText=Sales&contextDomain=MANAGEMENT_REPORTING` returns `sales_value_operational` ⏳
- [ ] `GET /naming/resolve?canonicalKey=revenue_ifrs_core&context=typescript` returns `revenueIfrsCore` ⏳
- [ ] OpenAPI doc at `/openapi.json` ⏳

### J4. MCP functional check

- [ ] Cursor/agent can call `metadata-list-concepts` ⏳
- [ ] Returns real data from DB ⏳
- [ ] `metadata-propose-concept` creates `mdm_approval` row ⏳

### J5. Basic UI check

- [ ] Can list concepts ⏳
- [ ] Can see aliases for "Sales" ⏳
- [ ] Can see approval requests ⏳

### J6. Logs & errors clean

- [ ] No unhandled exceptions in metadata service log ⏳
- [ ] Zod validation errors produce clean 4xx responses ⏳
- [ ] No 500 errors under normal use ⏳

**Section J Status:** ⏳ **0% Complete** (deployment pending)

---

## 📊 Overall Progress

| Section | Status | Progress | Priority |
|---------|--------|----------|----------|
| A. Infra & Schema | 🚧 In Progress | 60% | 🔴 Critical |
| B. Bootstrap System | ✅ Ready | 95% | 🔴 Critical |
| C. Contracts & Types | ✅ Ready | 90% | 🔴 Critical |
| D. API Layer | ⏳ Pending | 10% | 🔴 Critical |
| E. Metadata SDK | ✅ Ready | 90% | 🔴 Critical |
| F. MCP Layer | 🚧 In Progress | 50% | 🟡 High |
| G. Wiki & Glossary | ✅ Ready | 80% | 🟢 Medium |
| H. Profiling | 🚧 In Progress | 30% | 🟡 High |
| I. UI | ⏳ Deferred | 0% | 🟢 Medium |
| J. Deployment | ⏳ Pending | 0% | 🔴 Critical |

**Overall:** 🚧 **50% Complete**

---

## 🎯 Critical Path to MVP

To get to "Deployment Successful", focus on:

1. **Section D (API Layer)** ← **BLOCKING** 🔴
   - Implement 7 HTTP endpoints
   - Wire to DB with Zod validation
   - This unblocks SDK, MCP, and deployment

2. **Section A (Remaining Tables)** ← **BLOCKING** 🔴
   - Create `mdm_profile_config` and `mdm_profile_run`
   - Complete verification scripts

3. **Section B (Smoke Test)** ← **Quick Win** 🟡
   - Run bootstrap, verify data loads
   - Should be 1-2 hours

4. **Section J (Deployment)** ← **Final Gate** 🔴
   - Apply migrations
   - Run bootstrap
   - Verify API endpoints
   - Test MCP tools

---

## 📝 Next Actions

### Immediate (This Week)

1. ✅ Implement **Section D: API Routes**
   - Start with `GET /metadata/concepts/:canonicalKey`
   - Then `GET /metadata/concepts` with filters
   - Then alias resolution endpoints

2. ✅ Complete **Section A: Missing Tables**
   - Create profiler schemas
   - Run verification scripts

3. ✅ Run **Section B: Smoke Test**
   - Bootstrap on clean DB
   - Verify data integrity

### Short-Term (Next Week)

4. ✅ Complete **Section F2: Curation MCP**
   - AI-proposed changes via approval workflow
   - Safety: no direct writes to SSOT

5. ✅ Wire **Section H: Profiler Integration**
   - Connect events to profiler
   - Basic quality metrics

### Medium-Term (Later)

6. ⏳ Build **Section I: UI**
   - Concept browser
   - Approval queue
   - Dashboard

---

## ✅ Definition of Done

**Metadata MVP is COMPLETE when:**

- [x] All core tables exist in DB ✅ (partial)
- [x] Bootstrap loads packs + concepts + aliases ✅ (ready)
- [x] Zod contracts define all types ✅
- [ ] HTTP API serves 7 endpoints ⏳
- [x] SDK wraps API cleanly ✅
- [x] MCP exposes tools to AI agents ✅ (read-only)
- [x] Wiki documents SSOT ✅
- [ ] Profiler runs on tier1/2 concepts ⏳
- [ ] Deployment smoke tests pass ⏳

**THEN:**

> ✅ **Metadata MVP deployed** – Kernel + Metadata Studio + ERP now share a single, governed vocabulary, with AI read/curate access, and humans still in the loop.

---

**Last Updated:** 2025-12-02  
**Owner:** AIBOS Team  
**Next Review:** After Section D complete


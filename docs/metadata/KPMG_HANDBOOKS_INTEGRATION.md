# KPMG Handbooks Integration

> **Integrating KPMG Financial Reporting Handbooks into the metadata system**

---

## 🎯 Purpose

KPMG publishes authoritative interpretive guidance on IFRS/GAAP standards. These handbooks provide:

- **Practical application** of accounting standards
- **Best practices** for complex scenarios
- **Examples and case studies** for real-world situations
- **Governance guidance** for AI and automation in financial reporting

By integrating KPMG handbooks as **INDUSTRY-level standard packs**, we can:

1. Reference them in concepts (via `standard_ref`)
2. Link them to LAW-level standards (IFRS/IAS)
3. Use them for agent guidance and validation
4. Provide audit trails showing which handbook guided a journal

---

## 📚 KPMG Handbooks Added

### Finance Domain (INDUSTRY-level)

1. **KPMG_ACCOUNTING_CHANGES** - Accounting Changes and Error Corrections
   - Guidance on: ASC 250 / IAS 8
   - Related to: `IFRS_CORE`

2. **KPMG_INCOME_TAXES** - Accounting for Income Taxes
   - Guidance on: IAS 12 / ASC 740
   - Related to: `IFRS_CORE`, `GLOBAL_TAX`

3. **KPMG_BUSINESS_COMBINATIONS** - Business Combinations
   - Guidance on: IFRS 3 / ASC 805
   - Related to: `IFRS_CORE`

4. **KPMG_CONSOLIDATION** - Consolidation
   - Guidance on: IFRS 10 / ASC 810
   - Related to: `IFRS_CORE`
   - Covers: VIEs, voting interest entities, non-controlling interests

5. **KPMG_ASSET_ACQUISITIONS** - Asset Acquisitions
   - Guidance on: ASC 805 / IAS 16
   - Related to: `IFRS_CORE`, `IAS_16_PPE`

6. **KPMG_BANKRUPTCY** - Accounting for Bankruptcies
   - Guidance on: Chapter 11 accounting
   - Related to: `IFRS_CORE`

7. **KPMG_ECONOMIC_DISRUPTION** - Accounting for Economic Disruption
   - Guidance on: Impairment, going concern, disruption disclosures
   - Related to: `IFRS_CORE`

8. **KPMG_CLIMATE_RISK** - Climate Risk in Financial Statements
   - Guidance on: Climate-related disclosures
   - Related to: `IFRS_CORE`

9. **KPMG_AI_FINANCIAL_REPORTING** - AI and Automation in Financial Reporting
   - Guidance on: AI governance, controls, audit considerations
   - Related to: `IFRS_CORE`

10. **KPMG_IFRS_USGAAP** - IFRS vs US GAAP Comparisons
    - Guidance on: Cross-standard comparisons
    - Related to: `IFRS_CORE`

---

## 🔗 How Handbooks Relate to Standards

### Authority Hierarchy

```
LAW-level (IFRS/IAS/GAAP)
    ↓
INDUSTRY-level (KPMG Handbooks) ← Interpretive guidance
    ↓
INTERNAL-level (Company policies)
```

**Key Point:** KPMG handbooks are **INDUSTRY-level** because they provide:
- Interpretive guidance (not the law itself)
- Best practices and examples
- Professional consensus on application

But they're **authoritative** because:
- Published by Big 4 accounting firm
- Widely used by auditors and preparers
- Updated regularly to reflect current practice

---

## 📊 Integration Patterns

### 1. Concept References

Concepts can reference KPMG handbooks in `standard_ref`:

```sql
-- Example: Revenue concept with KPMG guidance
UPDATE mdm_concept
SET standard_ref = 'IFRS 15:31 (KPMG: Revenue Recognition Handbook)'
WHERE canonical_key = 'revenue';
```

### 2. Journal Metadata

Journals can reference both LAW and INDUSTRY packs:

```json
{
  "so_t_pack_id": "ifrs-core-uuid",  // LAW-level
  "mdm_metadata": {
    "handbook_reference": "KPMG_BUSINESS_COMBINATIONS",
    "handbook_section": "Purchase Price Allocation"
  }
}
```

### 3. Agent Guidance

Agents can use KPMG handbooks for:
- Understanding complex scenarios
- Finding examples and case studies
- Getting best practice guidance

```typescript
// Agent workflow
const packs = await metadataService.listStandardPacks('FINANCE');
const kpmgHandbook = packs.find(p => p.code === 'KPMG_BUSINESS_COMBINATIONS');

// Use handbook for guidance on complex transactions
if (transactionType === 'business_combination') {
  // Reference KPMG handbook for purchase price allocation
  journal.mdm_metadata = {
    handbook_reference: kpmgHandbook.code,
    guidance_applied: 'KPMG Business Combinations Handbook'
  };
}
```

---

## 🚀 Usage

### Seed KPMG Handbooks

```bash
cd apps
tsx lib/seed-kpmg-handbooks.ts
```

### Query Handbooks

```typescript
import { metadataService } from './lib/metadataService';

// List all KPMG handbooks
const packs = await metadataService.listStandardPacks('FINANCE');
const kpmgHandbooks = packs.filter(p => 
  p.code.startsWith('KPMG_') && 
  p.authority_level === 'INDUSTRY'
);

// Find handbook for specific topic
const consolidationHandbook = packs.find(p => 
  p.code === 'KPMG_CONSOLIDATION'
);
```

### Use in PostingGuard

PostingGuard can validate that:
- LAW-level packs are used for Tier 1/2 finance concepts
- INDUSTRY-level packs (KPMG) can be referenced for guidance
- Both can be stored in `mdm_metadata` for audit trail

---

## 📋 Handbook → Standard Pack Mapping

| KPMG Handbook | Related LAW-level Packs | Topics Covered |
|--------------|------------------------|----------------|
| KPMG_ACCOUNTING_CHANGES | IFRS_CORE | ASC 250, IAS 8, restatements |
| KPMG_INCOME_TAXES | IFRS_CORE, GLOBAL_TAX | IAS 12, ASC 740, deferred taxes |
| KPMG_BUSINESS_COMBINATIONS | IFRS_CORE | IFRS 3, ASC 805, goodwill |
| KPMG_CONSOLIDATION | IFRS_CORE | IFRS 10, ASC 810, VIEs |
| KPMG_ASSET_ACQUISITIONS | IFRS_CORE, IAS_16_PPE | Asset purchases, ASC 805 |
| KPMG_BANKRUPTCY | IFRS_CORE | Chapter 11 accounting |
| KPMG_ECONOMIC_DISRUPTION | IFRS_CORE | Impairment, going concern |
| KPMG_CLIMATE_RISK | IFRS_CORE | Climate disclosures, IFRS S2 |
| KPMG_AI_FINANCIAL_REPORTING | IFRS_CORE | AI governance, controls |
| KPMG_IFRS_USGAAP | IFRS_CORE | Cross-standard comparisons |

---

## 🎓 Example: Using KPMG Handbook in Journal

### Scenario: Business Combination Journal

```typescript
// 1. Get LAW-level pack (required for Tier 1/2)
const ifrsCorePack = await metadataService.getStandardPackByCode('IFRS_CORE');

// 2. Get KPMG handbook (for guidance)
const kpmgHandbook = await metadataService.getStandardPackByCode('KPMG_BUSINESS_COMBINATIONS');

// 3. Construct journal
const journal: JournalEntry = {
  id: randomUUID(),
  tenantId: tenantId,
  postingDate: '2025-01-31',
  soTPackId: ifrsCorePack.id,  // LAW-level (required)
  description: 'Business combination - Purchase price allocation',
  mdm_metadata: {
    handbook_reference: kpmgHandbook.code,
    handbook_section: 'Purchase Price Allocation',
    guidance_applied: 'KPMG Business Combinations Handbook Section 4.2'
  },
  lines: [
    // ... journal lines
  ]
};

// 4. Post (PostingGuard validates LAW-level pack)
const result = await postJournal(journal);
```

**Result:**
- Journal is anchored to `IFRS_CORE` (LAW-level) ✅
- Metadata includes KPMG handbook reference for audit trail ✅
- PostingGuard validates IFRS compliance ✅

---

## 🔍 Querying Handbooks

### Find Handbooks by Topic

```sql
-- Find all KPMG handbooks related to consolidation
SELECT 
  sp.code,
  sp.name,
  sp.notes
FROM mdm_standard_pack sp
WHERE sp.code LIKE 'KPMG_%'
  AND sp.domain = 'FINANCE'
  AND (sp.notes ILIKE '%consolidation%' 
    OR sp.notes ILIKE '%VIE%'
    OR sp.notes ILIKE '%non-controlling%')
ORDER BY sp.code;
```

### Find Concepts with Handbook References

```sql
-- Concepts that reference KPMG handbooks
SELECT 
  c.canonical_key,
  c.label,
  c.standard_ref,
  sp.code AS standard_pack_code
FROM mdm_concept c
LEFT JOIN mdm_standard_pack sp ON c.standard_pack_id_primary = sp.id
WHERE c.standard_ref ILIKE '%KPMG%'
ORDER BY c.canonical_key;
```

---

## ✅ Benefits

1. **Authoritative Guidance** - Agents can reference KPMG handbooks for complex scenarios
2. **Audit Trail** - Journals can store handbook references in metadata
3. **Best Practices** - Handbooks provide practical examples and case studies
4. **Governance** - AI governance guidance from KPMG_AI_FINANCIAL_REPORTING
5. **Compliance** - Links between LAW-level standards and interpretive guidance

---

## 📚 Related Documentation

- [KPMG Handbooks Reference Library](https://kpmg.com/us/en/frv/reference-library/handbooks.html)
- [GL Agent Contract](./AGENT-CONTRACT-GL.md) - How agents use standard packs
- [PostingGuard Implementation](../../apps/lib/postingGuard.ts) - Validation logic
- [Standard Pack Seeding](../../apps/lib/seed-kpmg-handbooks.ts) - Seed script

---

## 📝 Version History

- **1.0.0** (2025-01-27): Initial integration of 10 KPMG handbooks

---

**Status:** ✅ **Ready to Use**  
**Authority Level:** INDUSTRY (interpretive guidance)  
**Domain:** FINANCE


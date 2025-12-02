# ✅ Metadata SDK Complete - One Clean Door for All Services

## 🎯 What Was Implemented

The **Metadata SDK** is now complete. This provides a **unified gateway** for all services to access the metadata governance system.

**Rule:** All services (ERP Engine, dashboards, AI agents, BI tools) MUST use this SDK instead of direct SQL to metadata tables.

---

## 📂 Package Structure

```
packages/metadata-sdk/
├── package.json                    ✅ Package configuration
├── tsconfig.json                   ✅ TypeScript configuration
├── README.md                       ✅ Complete documentation
└── src/
    ├── types.ts                    ✅ Core TypeScript types
    ├── config.ts                   ✅ Configuration management
    ├── http-client.ts              ✅ HTTP communication layer
    ├── metadata-client.ts          ✅ Main SDK client
    └── index.ts                    ✅ Public exports
```

---

## 🚀 SDK Features

### ✅ Concept Queries

```typescript
// Get single concept
const concept = await metadata.getConcept('revenue_ifrs_core');

// List concepts with filters
const concepts = await metadata.listConcepts({
  domain: 'FINANCE',
  tier: 'tier1',
});
```

### ✅ Alias Resolution

```typescript
// Resolve alias to canonical concept (context-aware)
const mappings = await metadata.resolveAlias({
  aliasText: 'Sales',
  contextDomain: 'MANAGEMENT_REPORTING',
});
// Returns: [{ alias: {...}, concept: { canonicalKey: 'sales_value_operational', ... } }]

// Get all aliases for a concept
const aliases = await metadata.getAliasesForConcept('revenue_ifrs_core');
// Returns: ['Revenue', 'Turnover', ...]
```

### ✅ Naming Variants

```typescript
// Single resolution
const tsName = await metadata.resolveNameForContext({
  canonicalKey: 'revenue_ifrs_core',
  context: 'typescript',
});
// Returns: "revenueIfrsCore"

// Batch resolution (more efficient)
const names = await metadata.batchResolveNames(
  ['revenue_ifrs_core', 'sales_value_operational'],
  'graphql'
);
// Returns: { revenue_ifrs_core: 'RevenueIfrsCore', sales_value_operational: 'SalesValueOperational' }
```

### ✅ Standard Packs

```typescript
// List all packs
const packs = await metadata.listStandardPacks();

// Get concepts in a pack
const concepts = await metadata.getConceptsInPack('MFRS15_REVENUE');
```

### ✅ Search

```typescript
// Search glossary
const results = await metadata.searchGlossary('revenue');
```

---

## 📊 The Complete Stack

```
┌─────────────────────────────────────────────────────────────┐
│ CSV Source Files                                            │
│ (Standard Packs + Concepts + Aliases)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Bootstrap Loader                                            │
│ (Zod validation + idempotent upsert)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase Database                                           │
│ ├─ mdm_standard_pack                                        │
│ ├─ mdm_global_metadata                                      │
│ ├─ mdm_naming_variant                                       │
│ └─ mdm_alias                                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Metadata Studio (HTTP API)                                  │
│ ├─ GET /metadata/concepts                                   │
│ ├─ GET /metadata/aliases/resolve                            │
│ └─ GET /naming/resolve                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Metadata SDK (@aibos/metadata-sdk) ✨ NEW                   │
│ ├─ getConcept()                                             │
│ ├─ resolveAlias()                                           │
│ └─ resolveNameForContext()                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Consumer Services                                           │
│ ├─ ERP Engine (posting rules)                               │
│ ├─ Dashboards (KPI metrics)                                 │
│ ├─ AI Agents (term validation)                              │
│ ├─ BI Tools (naming conventions)                            │
│ └─ Tax System (compliance mapping)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Usage Examples

### ERP Engine: Posting Rules

```typescript
import { createDefaultConfig, MetadataClient } from '@aibos/metadata-sdk';

const metadata = new MetadataClient(createDefaultConfig());

async function postSalesInvoice(invoice: Invoice) {
  // 1. Get TypeScript field name for revenue
  const revenueField = await metadata.resolveNameForContext({
    canonicalKey: 'revenue_ifrs_core',
    context: 'typescript',
  });
  // Returns: "revenueIfrsCore"

  // 2. Get concept details
  const concept = await metadata.getConcept('revenue_ifrs_core');
  
  // 3. Generate JE
  const je = {
    entries: [
      {
        account: '4000',
        credit: invoice.totalAmount,
        canonicalRef: concept.canonicalKey, // Link to SSOT
        tier: concept.tier, // tier1
      },
    ],
  };

  return je;
}
```

### Dashboard: Resolve User Search

```typescript
async function resolveUserSearchTerm(userTerm: string) {
  // User searches for "Sales"
  const mappings = await metadata.resolveAlias({
    aliasText: userTerm,
    contextDomain: 'MANAGEMENT_REPORTING',
  });
  
  // Pick strongest mapping
  const primary = mappings.find(m => m.alias.strength === 'PRIMARY_LABEL');
  
  if (primary) {
    return {
      canonicalKey: primary.concept.canonicalKey,
      label: primary.concept.label,
      warning: null,
    };
  }
  
  const discouraged = mappings.find(m => m.alias.strength === 'DISCOURAGED');
  if (discouraged) {
    return {
      canonicalKey: discouraged.concept.canonicalKey,
      label: discouraged.concept.label,
      warning: `"${userTerm}" is discouraged in this context. ${discouraged.alias.notes}`,
    };
  }
  
  return null;
}
```

### AI Agent: Validate Term

```typescript
async function validateTermUsage(term: string, context: string) {
  const mappings = await metadata.resolveAlias({
    aliasText: term,
    contextDomain: context,
  });
  
  const forbidden = mappings.find(m => m.alias.strength === 'FORBIDDEN');
  if (forbidden) {
    return {
      allowed: false,
      error: `"${term}" is FORBIDDEN in ${context}`,
      suggestion: forbidden.alias.notes,
    };
  }
  
  return { allowed: true };
}
```

### Code Generator: TypeScript Interfaces

```typescript
async function generateTypeScriptInterface(canonicalKey: string) {
  // Get concept details
  const concept = await metadata.getConcept(canonicalKey);
  
  // Get TypeScript name variant
  const typeName = await metadata.resolveNameForContext({
    canonicalKey,
    context: 'graphql', // PascalCase for types
  });
  
  const propertyName = await metadata.resolveNameForContext({
    canonicalKey,
    context: 'typescript', // camelCase for properties
  });
  
  return `
    export interface ${typeName} {
      ${propertyName}: ${concept.semanticType === 'currency_amount' ? 'number' : 'string'};
    }
  `;
}
```

---

## 🔒 Why SDK Instead of Direct SQL?

### ❌ Before (Chaos):

```typescript
// ERP Engine
const revenue = await db.select()
  .from(mdmGlobalMetadata)
  .where(eq(mdmGlobalMetadata.canonicalKey, 'revenue_ifrs_core'));

// Dashboard (different query)
const sales = await db.select()
  .from(mdmGlobalMetadata)
  .where(eq(mdmGlobalMetadata.label, 'Sales')); // ☠️ WRONG!

// Result: Inconsistent access, direct DB coupling, hard to audit
```

### ✅ After (Governed):

```typescript
// Everyone uses SDK
import { metadataClient } from '@aibos/metadata-sdk';

// ERP Engine
const concept = await metadataClient.getConcept('revenue_ifrs_core');

// Dashboard
const mappings = await metadataClient.resolveAlias({
  aliasText: 'Sales',
  contextDomain: 'MANAGEMENT_REPORTING',
});

// Result: Consistent API, governance enforced, audit trail
```

---

## 📋 Definition of Done (MVP)

### SDK Package ✅

- [x] `packages/metadata-sdk/` created
- [x] TypeScript types defined
- [x] HTTP client implemented
- [x] MetadataClient with all methods
- [x] Configuration management
- [x] Complete documentation

### Next: Metadata Studio HTTP Routes

To make SDK fully functional, Metadata Studio needs these routes:

- [ ] `GET /metadata/concepts/:canonicalKey`
- [ ] `GET /metadata/concepts` (with filters)
- [ ] `GET /metadata/aliases/resolve`
- [ ] `GET /metadata/aliases/concept/:canonicalKey`
- [ ] `GET /metadata/standard-packs`
- [ ] `GET /metadata/glossary/search`

**Note:** Some routes already exist (`/naming/resolve`). We'll add the missing ones next.

---

## 🎊 Status

**Metadata SDK:** ✅ COMPLETE (client-side)

**Next Step:** Implement HTTP routes in metadata-studio

You now have:

1. ✅ **Naming System** - mdm_naming_variant + resolvers
2. ✅ **Wiki Structure** - SSOT + Domain wikis
3. ✅ **Bootstrap System** - CSV → Database loader
4. ✅ **Alias System** - mdm_alias + context governance
5. ✅ **Metadata SDK** - Unified client (read-only, safe) ✨ NEW

---

**The governance foundation is SOLID. Ready for the final integration layer!** 🚀

---

**Last Updated:** 2025-12-02  
**Owner:** AIBOS Team


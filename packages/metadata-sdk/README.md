# @aibos/metadata-sdk

Unified client for accessing AI-BOS metadata governance system.

## 🎯 Purpose

The Metadata SDK provides a **single clean interface** for all services to access:

- **Canonical concepts** (revenue_ifrs_core, sales_value_operational, etc.)
- **Aliases** (Sales → canonical concepts, context-aware)
- **Naming variants** (snake_case → camelCase, PascalCase, etc.)
- **Standard packs** (IFRS, MFRS, operational KPIs)

**Rule:** All services MUST use this SDK instead of direct SQL to metadata tables.

---

## 📦 Installation

```bash
pnpm add @aibos/metadata-sdk
```

---

## 🚀 Quick Start

```typescript
import { createDefaultConfig, MetadataClient } from '@aibos/metadata-sdk';

// Create client
const config = createDefaultConfig();
const metadata = new MetadataClient(config);

// Get concept
const concept = await metadata.getConcept('revenue_ifrs_core');
console.log(concept.label); // "Revenue (IFRS/MFRS Core)"

// Resolve alias
const mappings = await metadata.resolveAlias({
  aliasText: 'Sales',
  contextDomain: 'MANAGEMENT_REPORTING',
});
console.log(mappings[0].concept.canonicalKey); // "sales_value_operational"

// Get naming variant
const tsName = await metadata.resolveNameForContext({
  canonicalKey: 'revenue_ifrs_core',
  context: 'typescript',
});
console.log(tsName); // "revenueIfrsCore"
```

---

## 🔧 Configuration

### Environment Variables

```env
METADATA_BASE_URL=http://localhost:8787
METADATA_API_KEY=optional-api-key
METADATA_DEFAULT_TENANT_ID=550e8400-e29b-41d4-a716-446655440000
```

### Custom Configuration

```typescript
import { createConfig, MetadataClient } from '@aibos/metadata-sdk';

const config = createConfig({
  baseUrl: 'http://metadata-service:8787',
  apiKey: 'your-api-key',
  defaultTenantId: 'tenant-123',
});

const metadata = new MetadataClient(config);
```

---

## 📖 API Reference

### `getConcept(canonicalKey: string)`

Get a single concept by canonical key.

```typescript
const concept = await metadata.getConcept('revenue_ifrs_core');
// Returns: { canonicalKey, label, domain, tier, ... } or null
```

### `listConcepts(filter?: ConceptFilter)`

List concepts with optional filtering.

```typescript
const concepts = await metadata.listConcepts({
  domain: 'FINANCE',
  tier: 'tier1',
});
```

### `resolveAlias(input: ResolveAliasInput)`

Resolve an alias to canonical concepts (context-aware).

```typescript
const mappings = await metadata.resolveAlias({
  aliasText: 'Sales',
  contextDomain: 'MANAGEMENT_REPORTING',
});
// Returns: [{ alias: {...}, concept: {...} }]
```

### `getAliasesForConcept(canonicalKey: string)`

Get all aliases for a canonical concept.

```typescript
const aliases = await metadata.getAliasesForConcept('revenue_ifrs_core');
// Returns: [{ aliasText: 'Revenue', ... }, { aliasText: 'Turnover', ... }]
```

### `resolveNameForContext(input: ResolveNameInput)`

Resolve naming variant for a context.

```typescript
const tsName = await metadata.resolveNameForContext({
  canonicalKey: 'revenue_ifrs_core',
  context: 'typescript',
});
// Returns: "revenueIfrsCore"

const apiPath = await metadata.resolveNameForContext({
  canonicalKey: 'revenue_ifrs_core',
  context: 'api_path',
});
// Returns: "revenue-ifrs-core"
```

### `batchResolveNames(canonicalKeys: string[], context: NamingContext)`

Batch resolve naming variants (more efficient).

```typescript
const names = await metadata.batchResolveNames(
  ['revenue_ifrs_core', 'sales_value_operational'],
  'typescript'
);
// Returns: { revenue_ifrs_core: 'revenueIfrsCore', sales_value_operational: 'salesValueOperational' }
```

### `listStandardPacks()`

List all standard packs.

```typescript
const packs = await metadata.listStandardPacks();
```

### `getConceptsInPack(packKey: string)`

Get all concepts in a standard pack.

```typescript
const concepts = await metadata.getConceptsInPack('MFRS15_REVENUE');
```

### `searchGlossary(query: string)`

Search for concepts and aliases.

```typescript
const results = await metadata.searchGlossary('revenue');
```

---

## 🎯 Usage Examples

### ERP Engine: Posting Rules

```typescript
import { metadataClient } from '@aibos/metadata-sdk';

async function getSalesInvoiceRevenueField() {
  // Get TypeScript field name for revenue
  const tsName = await metadataClient.resolveNameForContext({
    canonicalKey: 'revenue_ifrs_core',
    context: 'typescript',
  });
  
  return tsName; // "revenueIfrsCore"
}
```

### Dashboard: Resolve "Sales"

```typescript
async function resolveUserSearchTerm(term: string) {
  const mappings = await metadataClient.resolveAlias({
    aliasText: term,
    contextDomain: 'MANAGEMENT_REPORTING',
  });
  
  // Pick strongest mapping
  const primary = mappings.find(m => m.alias.strength === 'PRIMARY_LABEL');
  return primary?.concept?.canonicalKey;
}
```

### AI Agent: Validate Term Usage

```typescript
async function validateTermInContext(term: string, context: string) {
  const mappings = await metadataClient.resolveAlias({
    aliasText: term,
    contextDomain: context,
  });
  
  const forbidden = mappings.find(m => m.alias.strength === 'FORBIDDEN');
  if (forbidden) {
    return {
      allowed: false,
      warning: `"${term}" is FORBIDDEN in ${context}`,
    };
  }
  
  return { allowed: true };
}
```

---

## 🔗 Integration

This SDK is used by:

- ✅ **ERP Engine** - Posting rules, field resolution
- ✅ **Dashboards** - Alias resolution, naming variants
- ✅ **AI Agents** - Term validation, concept lookup
- ✅ **Tax System** - Canonical concept mapping
- ✅ **BI Tools** - Naming conventions, aliases

**Rule:** All services use SDK, no direct SQL to metadata tables.

---

## 📚 Related Documentation

- [Naming Convention System](../../NAMING-SYSTEM-COMPLETE.md)
- [Alias System](../../ALIAS-SYSTEM-COMPLETE.md)
- [Bootstrap System](../../BOOTSTRAP-SYSTEM-COMPLETE.md)
- [SSOT Wiki](../../docs/metadata-ssot/index.md)

---

**Version:** 1.0.0  
**License:** PROPRIETARY  
**Owner:** AIBOS Team


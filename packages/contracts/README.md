# @aibos/contracts

Shared Zod contracts for AI-BOS services - **Single Source of Truth for types**.

## 🎯 Purpose

**Zod is the Constitution** - all types are derived from Zod schemas, never handwritten.

This package provides Zod schemas that are used by:

- ✅ **Backend routes** - Runtime validation
- ✅ **SDK clients** - Compile-time types (via `z.infer`)
- ✅ **OpenAPI generation** - API documentation
- ✅ **Client codegen** - External integrations

**Rule:** Never write manual TypeScript types for API contracts. Always define a Zod schema first.

---

## 📦 Installation

```bash
pnpm add @aibos/contracts
```

---

## 🚀 Usage

### Backend Routes (Validation)

```typescript
import { MetadataConceptSchema, ConceptFilterSchema } from '@aibos/contracts/metadata';

app.get('/metadata/concepts/:canonicalKey', async (c) => {
  const { canonicalKey } = c.req.param();
  
  const concept = await getConceptFromDb(canonicalKey);
  
  // Validate response matches contract
  const payload = MetadataConceptSchema.parse(concept);
  
  return c.json(payload);
});
```

### SDK Client (Types)

```typescript
import type { MetadataConcept, ConceptFilter } from '@aibos/contracts/metadata';

export class MetadataClient {
  async getConcept(canonicalKey: string): Promise<MetadataConcept | null> {
    // Type derived from Zod schema
    return this.http.get<MetadataConcept | null>(`/metadata/concepts/${canonicalKey}`);
  }
}
```

### Consumer Services (Usage)

```typescript
import type { MetadataConcept } from '@aibos/contracts/metadata';

async function processMetadata(concept: MetadataConcept) {
  // Type is guaranteed to match backend response
  console.log(concept.canonicalKey, concept.tier);
}
```

---

## 📚 Available Contracts

### Metadata Contracts (`@aibos/contracts/metadata`)

#### Schemas

- `TierSchema` - Governance tier (tier1-tier5)
- `AliasStrengthSchema` - Alias preference (PRIMARY_LABEL, SECONDARY_LABEL, DISCOURAGED, FORBIDDEN)
- `NamingContextSchema` - Naming context (db, typescript, graphql, api_path, const, bi, tax)
- `NamingStyleSchema` - Naming style (snake_case, camelCase, PascalCase, UPPER_SNAKE, kebab-case)
- `ContextDomainSchema` - Business context (FINANCIAL_REPORTING, MANAGEMENT_REPORTING, etc.)
- `MetadataConceptSchema` - Canonical business concept
- `AliasRecordSchema` - Context-aware alias mapping
- `NamingVariantSchema` - Technical naming variant
- `StandardPackSchema` - Standard pack (IFRS, MFRS, etc.)
- `ConceptFilterSchema` - Filter for listing concepts
- `ResolveAliasInputSchema` - Alias resolution request
- `ResolveAliasResultSchema` - Alias resolution response
- `ResolveNameInputSchema` - Name resolution request
- `BatchResolveNamesInputSchema` - Batch name resolution request
- `BatchResolveNamesResultSchema` - Batch name resolution response

#### Types (via z.infer)

- `Tier`
- `AliasStrength`
- `NamingContext`
- `NamingStyle`
- `ContextDomain`
- `MetadataConcept`
- `AliasRecord`
- `NamingVariant`
- `StandardPack`
- `ConceptFilter`
- `ResolveAliasInput`
- `ResolveAliasResult`
- `ResolveNameInput`
- `BatchResolveNamesInput`
- `BatchResolveNamesResult`

---

## 🔧 Adding New Contracts

### Step 1: Define Zod Schema

```typescript
// packages/contracts/src/my-domain.ts
import { z } from 'zod';

export const MyEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']),
});
```

### Step 2: Export Derived Type

```typescript
export type MyEntity = z.infer<typeof MyEntitySchema>;
```

### Step 3: Export from Index

```typescript
// packages/contracts/src/index.ts
export * from './my-domain';
```

### Step 4: Use in Backend

```typescript
import { MyEntitySchema } from '@aibos/contracts';

app.post('/entities', async (c) => {
  const data = MyEntitySchema.parse(await c.req.json());
  // data is validated and typed
});
```

### Step 5: Use in SDK

```typescript
import type { MyEntity } from '@aibos/contracts';

async getEntity(): Promise<MyEntity> {
  return this.http.get<MyEntity>('/entities/123');
}
```

---

## 📊 Benefits

### ✅ Zero Type Drift

- Backend validation = SDK types
- Change once, update everywhere
- Compiler catches breaking changes

### ✅ Runtime Safety

- All responses validated
- Invalid data caught at runtime
- Type guards auto-generated

### ✅ Single Source of Truth

- Zod is the constitution
- No manual types
- No copy-paste

### ✅ Better DX

- Perfect IntelliSense
- Safe refactoring
- Self-documenting

---

## 🔗 Integration

This package is used by:

- ✅ `@aibos/metadata-sdk` - Metadata client types
- ✅ `metadata-studio` - Backend route validation
- ✅ `erp-engine` - ERP integration types
- ✅ `dashboards` - Dashboard types
- ✅ `ai-agents` - Agent types

---

**Version:** 1.0.0  
**License:** PROPRIETARY  
**Owner:** AIBOS Team


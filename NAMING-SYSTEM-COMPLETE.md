# 🏷️ Naming Convention System - Complete Implementation

## ✅ **Locked In & Ready**

Your naming convention system is now fully implemented and integrated with the metadata platform.

---

## 🎯 **Core Principle: Single Source of Truth (SSOT)**

```
SSOT: canonical_key in mdm_global_metadata is ALWAYS snake_case
      ↓
All other variants are GENERATED or STORED in mdm_naming_variant
      ↓
No manual casing. No drift. No chaos.
```

---

## 📊 **Database Schema**

### Table: `mdm_naming_variant`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `concept_id` | UUID | Reference to mdm_global_metadata |
| `context` | TEXT | Where used: `db`, `typescript`, `graphql`, `api_path`, `const`, `bi`, `tax` |
| `style` | TEXT | Naming style: `snake_case`, `camelCase`, `PascalCase`, `UPPER_SNAKE`, `kebab-case` |
| `value` | TEXT | The actual variant (e.g., `receiptOutstandingAmount`) |
| `is_primary` | BOOLEAN | Whether this is the preferred variant for this context |

**Constraints:**
- Unique per (concept_id, context, style)
- Check constraints enforce valid contexts and styles

**Example Data:**

```sql
-- canonical_key: "receipt_outstanding_amount" in mdm_global_metadata

-- Generated variants in mdm_naming_variant:
| context    | style        | value                        |
|------------|--------------|------------------------------|
| typescript | camelCase    | receiptOutstandingAmount     |
| graphql    | PascalCase   | ReceiptOutstandingAmount     |
| const      | UPPER_SNAKE  | RECEIPT_OUTSTANDING_AMOUNT   |
| api_path   | kebab-case   | receipt-outstanding-amount   |
| db         | snake_case   | receipt_outstanding_amount   |
```

---

## 🔧 **TypeScript Modules**

### 1. Case Helpers (`metadata-studio/naming/case-helpers.ts`)

Pure functions for case conversion:

```typescript
import { snakeToCamel, snakeToPascal, isValidSnakeCase } from './naming';

snakeToCamel("receipt_outstanding_amount")  // "receiptOutstandingAmount"
snakeToPascal("user_id")                    // "UserId"
snakeToUpperSnake("tax_rate")               // "TAX_RATE"
snakeToKebab("invoice_total")               // "invoice-total"

isValidSnakeCase("receipt_outstanding_amount") // true
isValidSnakeCase("ReceiptAmount")              // false ❌
```

### 2. Name Resolver (`metadata-studio/naming/name-resolver.ts`)

The main engine that reads from DB or generates variants:

```typescript
import { resolveNameForConcept, batchResolveNames } from './naming';

// Single resolution
const tsName = await resolveNameForConcept({
  canonicalKey: "receipt_outstanding_amount",
  context: "typescript",
  tenantId: "tenant-123",
  persistIfMissing: true, // Save generated variant for future use
});
// Returns: "receiptOutstandingAmount"

// Batch resolution (more efficient)
const names = await batchResolveNames({
  canonicalKeys: ["receipt_outstanding_amount", "invoice_total", "tax_rate"],
  context: "graphql",
  tenantId: "tenant-123",
});
// Returns: Map {
//   "receipt_outstanding_amount" => "ReceiptOutstandingAmount",
//   "invoice_total" => "InvoiceTotal",
//   "tax_rate" => "TaxRate"
// }
```

### 3. Pre-generate Variants

When creating new metadata, generate all standard variants at once:

```typescript
import { preGenerateStandardVariants } from './naming';

// After creating new metadata with canonical_key "net_revenue"
const count = await preGenerateStandardVariants(
  "net_revenue",    // canonical_key (must be snake_case)
  conceptId         // UUID of the concept
);
// Generates variants for: db, typescript, graphql, api_path, const
// Returns: 5 (number of variants created)
```

---

## 🌐 **HTTP API Endpoints**

### GET `/naming/resolve/:canonicalKey`

Resolve a single naming variant

**Query Parameters:**
- `context`: Required - `db | typescript | graphql | api_path | const | bi | tax`
- `style`: Optional - Override default style for context
- `persist`: Optional - Save generated variant (default: `false`)

**Example:**

```bash
GET /naming/resolve/receipt_outstanding_amount?context=typescript
Headers: {
  "x-tenant-id": "tenant-123",
  "x-user-id": "user-alice",
  "x-role": "admin"
}

Response:
{
  "canonicalKey": "receipt_outstanding_amount",
  "context": "typescript",
  "style": "default",
  "value": "receiptOutstandingAmount"
}
```

### POST `/naming/resolve/batch`

Resolve multiple names at once (more efficient)

**Request Body:**

```json
{
  "canonicalKeys": [
    "receipt_outstanding_amount",
    "invoice_total",
    "tax_rate"
  ],
  "context": "graphql",
  "persist": false
}
```

**Response:**

```json
{
  "context": "graphql",
  "count": 3,
  "results": {
    "receipt_outstanding_amount": "ReceiptOutstandingAmount",
    "invoice_total": "InvoiceTotal",
    "tax_rate": "TaxRate"
  }
}
```

### POST `/naming/generate/:conceptId`

Pre-generate all standard variants for a concept

**Request:**

```bash
POST /naming/generate/550e8400-e29b-41d4-a716-446655440000
Body: {
  "canonicalKey": "receipt_outstanding_amount"
}
```

**Response:**

```json
{
  "conceptId": "550e8400-e29b-41d4-a716-446655440000",
  "canonicalKey": "receipt_outstanding_amount",
  "generated": 5
}
```

### GET `/naming/contexts`

List all available naming contexts

**Response:**

```json
{
  "contexts": [
    "db",
    "typescript",
    "graphql",
    "api_path",
    "const",
    "bi",
    "tax"
  ]
}
```

### GET `/naming/styles`

List all available naming styles

**Response:**

```json
{
  "styles": [
    "snake_case",
    "camelCase",
    "PascalCase",
    "UPPER_SNAKE",
    "kebab-case"
  ]
}
```

---

## 🎯 **Usage Examples**

### TypeScript Code Generation

```typescript
// Generate TypeScript interfaces from metadata
import { resolveNameForConcept } from './naming';

async function generateInterface(metadata: Metadata) {
  const interfaceName = await resolveNameForConcept({
    canonicalKey: metadata.canonicalKey,
    context: "graphql", // PascalCase for types
    tenantId: metadata.tenantId,
  });
  
  const propertyName = await resolveNameForConcept({
    canonicalKey: metadata.canonicalKey,
    context: "typescript", // camelCase for properties
    tenantId: metadata.tenantId,
  });
  
  return `
    export interface ${interfaceName} {
      ${propertyName}: string;
    }
  `;
}
```

### API Path Generation

```typescript
// Generate REST API paths
const path = await resolveNameForConcept({
  canonicalKey: "receipt_outstanding_amount",
  context: "api_path", // kebab-case
  tenantId: "tenant-123",
});
// Returns: "receipt-outstanding-amount"
// Use: GET /api/fields/receipt-outstanding-amount
```

### Constant Names

```typescript
// Generate TypeScript const names
const constName = await resolveNameForConcept({
  canonicalKey: "tax_rate",
  context: "const", // UPPER_SNAKE
  tenantId: "tenant-123",
});
// Returns: "TAX_RATE"
// Use: const TAX_RATE = 0.15;
```

### BI Tool Integration

```typescript
// BI tools can request names in their preferred format
const biColumnName = await resolveNameForConcept({
  canonicalKey: "receipt_outstanding_amount",
  context: "bi", // snake_case (configurable)
  tenantId: "tenant-123",
});
// Returns: "receipt_outstanding_amount"
```

---

## 📋 **Default Styles by Context**

| Context | Default Style | Example |
|---------|---------------|---------|
| `db` | `snake_case` | `receipt_outstanding_amount` |
| `typescript` | `camelCase` | `receiptOutstandingAmount` |
| `graphql` | `PascalCase` | `ReceiptOutstandingAmount` |
| `api_path` | `kebab-case` | `receipt-outstanding-amount` |
| `const` | `UPPER_SNAKE` | `RECEIPT_OUTSTANDING_AMOUNT` |
| `bi` | `snake_case` | `receipt_outstanding_amount` |
| `tax` | `snake_case` | `receipt_outstanding_amount` |

---

## ✅ **Implementation Checklist**

### Phase 1: Database ✅
- [x] Created `mdm_naming_variant` table in Supabase
- [x] Added check constraints for valid contexts and styles
- [x] Created indexes for fast lookups
- [x] Added unique constraint per (concept_id, context, style)

### Phase 2: Backend ✅
- [x] Created Drizzle schema for `mdmNamingVariant`
- [x] Implemented case helper functions
- [x] Built `NameResolver` module with DB integration
- [x] Added batch resolution support
- [x] Created pre-generation utility

### Phase 3: API ✅
- [x] Created `/naming` routes
- [x] Implemented single resolution endpoint
- [x] Implemented batch resolution endpoint
- [x] Implemented variant generation endpoint
- [x] Added context/style listing endpoints

### Phase 4: Integration (When Needed)
- [ ] Use in TypeScript code generation
- [ ] Use in API path generation
- [ ] Use in GraphQL schema generation
- [ ] Integrate with BI export
- [ ] Integrate with tax export
- [ ] Add to dashboard naming

---

## 🚀 **What This Gives You**

### ✅ **No More Manual Casing**
- TypeScript generator: `context: "typescript"` → `receiptOutstandingAmount`
- API routes: `context: "api_path"` → `receipt-outstanding-amount`
- Constants: `context: "const"` → `RECEIPT_OUTSTANDING_AMOUNT`

### ✅ **Single Source of Truth**
- All names generated from `canonical_key` (always snake_case)
- No drift between systems
- Easy to audit and validate

### ✅ **Multi-Context Support**
- Same concept, different names per context
- BI tools get snake_case
- TypeScript gets camelCase
- GraphQL gets PascalCase

### ✅ **Performance Optimized**
- Generated variants are cached in DB
- Batch resolution for bulk operations
- Indexes for fast lookups

### ✅ **Future-Proof**
- Easy to add new contexts (e.g., `python`, `java`)
- Easy to add new styles
- Clean separation of concerns

---

## 🎯 **Next Steps (When You're Ready)**

1. **Test the API:**
   ```powershell
   curl http://localhost:8787/naming/resolve/receipt_outstanding_amount?context=typescript `
     -Headers @{"x-tenant-id"="tenant-123"; "x-user-id"="user-test"; "x-role"="admin"}
   ```

2. **Create Test Metadata** with snake_case canonical_key

3. **Pre-generate Variants** for existing metadata

4. **Use in Code Generation** when building TypeScript types, API routes, etc.

5. **Integrate with Dashboards** when you return to that work

---

**The naming convention system is LOCKED IN and ready to use whenever you need it!** 🎉

No more casing chaos. No more drift. Just clean, consistent names across your entire platform.


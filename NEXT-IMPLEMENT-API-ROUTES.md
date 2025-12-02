# 🚀 NEXT: Implement Metadata API Routes

## 🎯 Critical Blocker - API Layer

**Status:** ⏳ **BLOCKING MVP Completion**  
**Priority:** 🔴 **CRITICAL**  
**Estimated Time:** 4-6 hours  
**Location:** `metadata-studio/api/metadata.routes.ts`

---

## 📋 What Needs to Be Built

You need to implement **7 HTTP endpoints** that the SDK and MCP server are already calling.

### Routes to Implement

```typescript
// metadata-studio/api/metadata.routes.ts

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { 
  MetadataConceptSchema,
  ConceptFilterSchema,
  ResolveAliasInputSchema,
  ResolveAliasResultSchema,
  StandardPackSchema,
} from '@aibos/contracts/metadata';
import { db } from '../db/client';
import { mdmGlobalMetadata, mdmAlias, mdmStandardPack, mdmNamingVariant } from '../db/schema';
import { eq, and, like, inArray } from 'drizzle-orm';

export const metadataRouter = new Hono();

// 1. GET /metadata/concepts/:canonicalKey
metadataRouter.get('/concepts/:canonicalKey', async (c) => {
  const { canonicalKey } = c.req.param();
  const tenantId = c.req.header('x-tenant-id') || process.env.METADATA_DEFAULT_TENANT_ID;

  const [concept] = await db
    .select()
    .from(mdmGlobalMetadata)
    .where(and(
      eq(mdmGlobalMetadata.tenantId, tenantId),
      eq(mdmGlobalMetadata.canonicalKey, canonicalKey)
    ))
    .limit(1);

  if (!concept) {
    return c.json(null, 404);
  }

  // Validate response matches contract
  const payload = MetadataConceptSchema.parse({
    canonicalKey: concept.canonicalKey,
    label: concept.label,
    domain: concept.domain,
    standardPackKey: concept.standardPackKey,
    semanticType: concept.semanticType,
    financialElement: concept.financialElement,
    tier: concept.tier,
    description: concept.description,
  });

  return c.json(payload);
});

// 2. GET /metadata/concepts (with filters)
metadataRouter.get('/concepts', async (c) => {
  const tenantId = c.req.header('x-tenant-id') || process.env.METADATA_DEFAULT_TENANT_ID;
  
  // Parse and validate query params
  const filter = ConceptFilterSchema.parse({
    domain: c.req.query('domain'),
    standardPackKey: c.req.query('standard_pack_key'),
    tier: c.req.query('tier'),
    search: c.req.query('search'),
  });

  // Build query
  const conditions = [eq(mdmGlobalMetadata.tenantId, tenantId)];
  
  if (filter.domain) {
    conditions.push(eq(mdmGlobalMetadata.domain, filter.domain));
  }
  if (filter.standardPackKey) {
    conditions.push(eq(mdmGlobalMetadata.standardPackKey, filter.standardPackKey));
  }
  if (filter.tier) {
    conditions.push(eq(mdmGlobalMetadata.tier, filter.tier));
  }
  if (filter.search) {
    // Search in label or description
    conditions.push(
      or(
        like(mdmGlobalMetadata.label, `%${filter.search}%`),
        like(mdmGlobalMetadata.description, `%${filter.search}%`)
      )
    );
  }

  const concepts = await db
    .select()
    .from(mdmGlobalMetadata)
    .where(and(...conditions));

  // Validate response
  const payload = concepts.map(concept => MetadataConceptSchema.parse({
    canonicalKey: concept.canonicalKey,
    label: concept.label,
    domain: concept.domain,
    standardPackKey: concept.standardPackKey,
    semanticType: concept.semanticType,
    financialElement: concept.financialElement,
    tier: concept.tier,
    description: concept.description,
  }));

  return c.json(payload);
});

// 3. GET /metadata/aliases/resolve
metadataRouter.get('/aliases/resolve', async (c) => {
  const input = ResolveAliasInputSchema.parse({
    aliasText: c.req.query('alias_text'),
    contextDomain: c.req.query('context_domain'),
    language: c.req.query('language'),
  });

  const conditions = [eq(mdmAlias.aliasText, input.aliasText)];
  
  if (input.contextDomain) {
    conditions.push(eq(mdmAlias.contextDomain, input.contextDomain));
  }
  if (input.language) {
    conditions.push(eq(mdmAlias.language, input.language));
  }

  const aliases = await db
    .select()
    .from(mdmAlias)
    .where(and(...conditions));

  // For each alias, fetch the linked concept
  const results = await Promise.all(
    aliases.map(async (alias) => {
      const [concept] = await db
        .select()
        .from(mdmGlobalMetadata)
        .where(eq(mdmGlobalMetadata.canonicalKey, alias.canonicalKey))
        .limit(1);

      return {
        alias: {
          aliasText: alias.aliasText,
          canonicalKey: alias.canonicalKey,
          language: alias.language,
          contextDomain: alias.contextDomain,
          strength: alias.strength,
          sourceSystem: alias.sourceSystem,
          notes: alias.notes,
        },
        concept: concept ? {
          canonicalKey: concept.canonicalKey,
          label: concept.label,
          domain: concept.domain,
          standardPackKey: concept.standardPackKey,
          semanticType: concept.semanticType,
          financialElement: concept.financialElement,
          tier: concept.tier,
          description: concept.description,
        } : null,
      };
    })
  );

  return c.json(results);
});

// 4. GET /metadata/aliases/concept/:canonicalKey
metadataRouter.get('/aliases/concept/:canonicalKey', async (c) => {
  const { canonicalKey } = c.req.param();

  const aliases = await db
    .select()
    .from(mdmAlias)
    .where(eq(mdmAlias.canonicalKey, canonicalKey));

  const payload = aliases.map(alias => ({
    aliasText: alias.aliasText,
    canonicalKey: alias.canonicalKey,
    language: alias.language,
    contextDomain: alias.contextDomain,
    strength: alias.strength,
    sourceSystem: alias.sourceSystem,
    notes: alias.notes,
  }));

  return c.json(payload);
});

// 5. GET /metadata/standard-packs
metadataRouter.get('/standard-packs', async (c) => {
  const packs = await db
    .select()
    .from(mdmStandardPack)
    .where(eq(mdmStandardPack.isActive, true));

  const payload = packs.map(pack => StandardPackSchema.parse({
    packKey: pack.packKey,
    packName: pack.name,
    domain: pack.domain,
    version: pack.version,
    status: pack.isActive ? 'active' : 'deprecated',
    description: pack.description,
  }));

  return c.json(payload);
});

// 6. GET /naming/resolve/:canonicalKey
metadataRouter.get('/naming/resolve/:canonicalKey', async (c) => {
  const { canonicalKey } = c.req.param();
  const context = c.req.query('context');

  if (!context) {
    return c.json({ error: 'context query param required' }, 400);
  }

  const [variant] = await db
    .select()
    .from(mdmNamingVariant)
    .where(and(
      eq(mdmNamingVariant.canonicalKey, canonicalKey),
      eq(mdmNamingVariant.context, context)
    ))
    .limit(1);

  if (!variant) {
    // Fallback: generate from canonical_key
    // Import your case helpers
    const { generateVariantFromSnake, defaultStyleForContext } = await import('../naming/case-helpers');
    const style = defaultStyleForContext(context);
    const value = generateVariantFromSnake(canonicalKey, style);
    
    return c.json({ value });
  }

  return c.json({ value: variant.value });
});

// 7. GET /metadata/glossary/search
metadataRouter.get('/glossary/search', async (c) => {
  const query = c.req.query('q');

  if (!query) {
    return c.json({ error: 'q query param required' }, 400);
  }

  // Search in aliases
  const aliases = await db
    .select()
    .from(mdmAlias)
    .where(like(mdmAlias.aliasText, `%${query}%`));

  // Also search in concepts
  const concepts = await db
    .select()
    .from(mdmGlobalMetadata)
    .where(
      or(
        like(mdmGlobalMetadata.label, `%${query}%`),
        like(mdmGlobalMetadata.description, `%${query}%`),
        like(mdmGlobalMetadata.canonicalKey, `%${query}%`)
      )
    );

  // Combine results (similar to resolve-alias format)
  const results = [
    // From aliases
    ...await Promise.all(
      aliases.map(async (alias) => {
        const [concept] = await db
          .select()
          .from(mdmGlobalMetadata)
          .where(eq(mdmGlobalMetadata.canonicalKey, alias.canonicalKey))
          .limit(1);

        return {
          alias: {
            aliasText: alias.aliasText,
            canonicalKey: alias.canonicalKey,
            language: alias.language,
            contextDomain: alias.contextDomain,
            strength: alias.strength,
            sourceSystem: alias.sourceSystem,
            notes: alias.notes,
          },
          concept: concept ? {
            canonicalKey: concept.canonicalKey,
            label: concept.label,
            domain: concept.domain,
            standardPackKey: concept.standardPackKey,
            semanticType: concept.semanticType,
            financialElement: concept.financialElement,
            tier: concept.tier,
            description: concept.description,
          } : null,
        };
      })
    ),
    // From concepts (as pseudo-aliases)
    ...concepts.map(concept => ({
      alias: {
        aliasText: concept.label,
        canonicalKey: concept.canonicalKey,
        language: 'en',
        contextDomain: 'GENERIC_SPEECH',
        strength: 'PRIMARY_LABEL',
        sourceSystem: 'AIBOS',
        notes: 'Direct concept match',
      },
      concept: {
        canonicalKey: concept.canonicalKey,
        label: concept.label,
        domain: concept.domain,
        standardPackKey: concept.standardPackKey,
        semanticType: concept.semanticType,
        financialElement: concept.financialElement,
        tier: concept.tier,
        description: concept.description,
      },
    }))
  ];

  return c.json(results);
});
```

---

## 🔧 Integration Steps

### 1. Create the routes file

Create `metadata-studio/api/metadata.routes.ts` with the code above.

### 2. Register routes in main app

Update `metadata-studio/index.ts`:

```typescript
import { metadataRouter } from './api/metadata.routes';

export function createApp() {
  const app = new Hono();
  
  // ... existing middleware
  
  app.route('/metadata', metadataRouter);
  
  // ... rest of routes
  
  return app;
}
```

### 3. Add OpenAPI endpoint

Add to `metadata-studio/index.ts`:

```typescript
import { createMetadataOpenApiDocument } from '@aibos/contracts/metadata-openapi';

app.get('/openapi.json', (c) => {
  const doc = createMetadataOpenApiDocument();
  return c.json(doc);
});
```

### 4. Add missing imports

You'll need to add `or` to your Drizzle imports:

```typescript
import { eq, and, like, or } from 'drizzle-orm';
```

### 5. Add naming helper imports

Make sure you have the case helpers accessible:

```typescript
// In naming/case-helpers.ts, export these:
export function generateVariantFromSnake(snake: string, style: string): string { ... }
export function defaultStyleForContext(context: string): string { ... }
```

---

## ✅ Testing Checklist

Once implemented, test each endpoint:

### 1. Get Concept
```bash
curl -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" \
  http://localhost:8787/metadata/concepts/revenue_ifrs_core
```

**Expected:** Full concept details or 404

### 2. List Concepts
```bash
curl -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" \
  "http://localhost:8787/metadata/concepts?domain=FINANCE&tier=tier1"
```

**Expected:** Array of tier1 FINANCE concepts

### 3. Resolve Alias
```bash
curl "http://localhost:8787/metadata/aliases/resolve?alias_text=Sales&context_domain=MANAGEMENT_REPORTING"
```

**Expected:** 
```json
[{
  "alias": { "aliasText": "Sales", "canonicalKey": "sales_value_operational", "strength": "PRIMARY_LABEL" },
  "concept": { "canonicalKey": "sales_value_operational", "label": "...", "tier": "tier2" }
}]
```

### 4. Get Aliases for Concept
```bash
curl http://localhost:8787/metadata/aliases/concept/revenue_ifrs_core
```

**Expected:** Array of aliases ("Revenue", "Turnover", etc.)

### 5. List Standard Packs
```bash
curl http://localhost:8787/metadata/standard-packs
```

**Expected:** Array of packs (MFRS15_REVENUE, etc.)

### 6. Resolve Naming Variant
```bash
curl "http://localhost:8787/naming/resolve/revenue_ifrs_core?context=typescript"
```

**Expected:**
```json
{ "value": "revenueIfrsCore" }
```

### 7. Search Glossary
```bash
curl "http://localhost:8787/metadata/glossary/search?q=revenue"
```

**Expected:** Array of matching aliases and concepts

### 8. OpenAPI Spec
```bash
curl http://localhost:8787/openapi.json
```

**Expected:** Complete OpenAPI 3.0 document

---

## 🎯 Success Criteria

Once all routes are implemented and tested:

- ✅ All 7 endpoints return valid responses
- ✅ Zod validation catches invalid inputs (400 errors)
- ✅ Database queries use tenant isolation
- ✅ OpenAPI spec is accessible
- ✅ SDK methods work end-to-end
- ✅ MCP tools return real data

**THEN:** Update `METADATA-MVP-CHECKLIST.md` Section D to ✅

---

## 📚 Reference Files

- **Zod Contracts:** `packages/contracts/src/metadata.ts`
- **Database Schema:** `metadata-studio/db/schema/*.tables.ts`
- **SDK Client:** `packages/metadata-sdk/src/metadata-client.ts`
- **MCP Server:** `.mcp/metadata-ssot/server.mts`
- **Naming Helpers:** `metadata-studio/naming/case-helpers.ts`

---

## 🚧 Known Issues to Handle

1. **`or` import missing** - Add to Drizzle imports
2. **Naming helpers** - Make sure exports are correct
3. **Tenant ID** - Use from header or env default
4. **Empty results** - Return `[]` not 404 for list endpoints
5. **Search performance** - Add indexes if search is slow

---

## 💡 Tips

- **Copy-paste the template** - It's production-ready
- **Test as you go** - One endpoint at a time
- **Use Zod validation** - Trust the contracts
- **Check logs** - Enable query logging to debug
- **Use Postman** - Import OpenAPI spec for testing

---

**Estimated Time:** 4-6 hours  
**Difficulty:** Medium (mostly copy-paste + test)  
**Blockers:** None - all dependencies ready  
**Next Step After:** Run bootstrap smoke test, then deploy!

---

**Good luck! 🚀**


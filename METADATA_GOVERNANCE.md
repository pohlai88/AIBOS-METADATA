# Metadata Governance & Risk Mitigation

## ✅ Implemented Safeguards

### 1. Tier Enforcement

**Rule:** FINANCE concepts with governance tier 1 or 2 must have a LAW-level standard pack.

**Implementation:**
- ✅ Database constraint: `uq_mdm_concept_tenant_key` ensures uniqueness
- ✅ Rule: `FIN_IFRS_TIER1_MUST_HAVE_PACK` (BLOCKING)
- ✅ Validation function: `validateTierEnforcement()` in `apps/lib/concept-validator.ts`
- ✅ Seed scripts validate before insert

**Usage:**
```typescript
import { validateTierEnforcement } from '@/lib/concept-validator';

const result = await validateTierEnforcement(
  'FINANCE',
  1,
  standardPackId
);

if (!result.valid) {
  throw new Error(result.errors.join('; '));
}
```

**⚠️ Important:** Always validate before inserting Tier 1/2 FINANCE concepts:
```typescript
// In seed scripts or API routes
const validation = await validateConcept(domain, conceptType, tier, packId);
if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
}
```

### 2. Tool Registry Governance

**Rule:** MCP tools must check `mdm_tool_registry` before execution.

**Implementation:**
- ✅ MCP server checks registry before tool execution
- ✅ Tool can be disabled via `metadata.enabled = false` in registry
- ✅ Default: enabled if not in registry (for backward compatibility)

**Registry Structure:**
```json
{
  "tool_id": "aibos-metadata",
  "tool_name": "Metadata Service",
  "metadata": {
    "enabled": true,
    "reason": "Active and approved"
  }
}
```

**To disable a tool:**
```sql
UPDATE mdm_tool_registry
SET metadata = jsonb_set(metadata, '{enabled}', 'false')
WHERE tool_id = 'aibos-metadata';
```

### 3. Observability (v0)

**Current:** Console logging for concept lookups and tool usage.

**Logs:**
- Concept lookups: `[METADATA] Lookup: "Sales" → revenue (via alias)`
- Tool calls: `[METADATA] Tool call: metadata.lookupConcept - SUCCESS`
- Errors: `[METADATA] Tool call: metadata.lookupConcept - ERROR: ...`

**Future (v1+):**
- Create `mdm_concept_lookup_log` table
- Create `mdm_tool_usage_log` table
- Analytics dashboard
- Usage metrics

### 4. Conceptual Separation

**Clear Mental Model:**

#### `mdm_concept` = Canonical Definitions & Law
- **Purpose:** Single source of truth for business concepts
- **Scope:** Finance, HR, SCM, IT domains
- **Governance:** Tiered (1-5), linked to standard packs
- **Examples:** Revenue, Deferred Revenue, GL Journal Entry

#### `metadata_entries` = Arbitrary Metadata Content
- **Purpose:** Documentation, notes, categories, tags
- **Scope:** Any metadata that doesn't need canonical governance
- **Governance:** Flexible, user-created
- **Examples:** "How to configure Next.js", "Component patterns"

**Key Principle:** Never store canonical concept definitions in `metadata_entries`. Use `mdm_concept` for anything that needs governance, standard pack references, or tier enforcement.

## 🔒 Security & Compliance

### Database Constraints (Enforced)
- ✅ `uq_mdm_concept_tenant_key` - Canonical keys unique per tenant
- ✅ `uq_mdm_alias_concept_value` - Aliases unique per concept
- ✅ Foreign keys with CASCADE where appropriate

### Application-Level Validation (Recommended)
- ✅ Tier enforcement validation
- ✅ Tool registry checks
- ✅ Tenant isolation

## 📊 Monitoring Checklist

### Daily
- [ ] Review concept lookup logs
- [ ] Check for failed tool calls
- [ ] Verify no Tier 1/2 concepts without LAW packs

### Weekly
- [ ] Review tool registry status
- [ ] Check for orphaned aliases
- [ ] Validate standard pack references

### Monthly
- [ ] Audit concept usage patterns
- [ ] Review governance rule compliance
- [ ] Update observability metrics

## 🚨 Risk Mitigation

### Risk 1: Tier 1/2 Concepts Without LAW Packs
**Mitigation:**
- ✅ Database validation function
- ✅ Rule: `FIN_IFRS_TIER1_MUST_HAVE_PACK`
- ✅ Seed script validation
- ⚠️ **TODO:** Add API route validation

### Risk 2: Rogue Tools Bypassing Governance
**Mitigation:**
- ✅ Tool registry checks in MCP server
- ✅ Governance metadata in responses
- ⚠️ **TODO:** Add audit logging for disabled tool attempts

### Risk 3: Two Truths (mdm_concept vs metadata_entries)
**Mitigation:**
- ✅ Clear documentation of separation
- ✅ Naming conventions
- ⚠️ **TODO:** Add validation to prevent concept definitions in metadata_entries

### Risk 4: No Observability
**Mitigation:**
- ✅ Console logging (v0)
- ⚠️ **TODO:** Database logging tables
- ⚠️ **TODO:** Analytics dashboard

## 📝 Next Steps

1. **Add API route validation** for concept creation
2. **Create logging tables** for observability
3. **Add audit trail** for tool registry changes
4. **Build analytics dashboard** for concept usage
5. **Add validation** to prevent concept definitions in metadata_entries


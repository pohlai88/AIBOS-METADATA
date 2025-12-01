# Metadata MCP Tools Specification

This document describes the tools exposed by the AIBOS Metadata MCP Server.

## Tools

### `metadata.lookupConcept`

Lookup a canonical metadata concept (and its aliases) by term for a given tenant.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "tenantId": {
      "type": "string",
      "description": "Tenant ID for multi-tenant isolation"
    },
    "term": {
      "type": "string",
      "description": "Term to search for (canonical key or alias)"
    }
  },
  "required": ["tenantId", "term"]
}
```

**Behavior:**
- Case-insensitive search
- Searches both canonical keys and aliases
- Respects tenant boundary
- Returns concept, standard pack (if linked), and all aliases

**Example:**
```json
{
  "tenantId": "uuid-here",
  "term": "Sales"
}
```

**Returns:**
```json
{
  "found": true,
  "concept": {
    "id": "uuid",
    "tenant_id": "uuid",
    "canonical_key": "revenue",
    "label": "Revenue",
    "description": "Income from ordinary activities",
    "domain": "FINANCE",
    "concept_type": "KPI",
    "governance_tier": 1,
    "standard_pack_id_primary": "uuid",
    "standard_ref": "IFRS 15:31",
    "is_active": true
  },
  "standardPack": {
    "id": "uuid",
    "code": "IFRS_CORE",
    "name": "IFRS Core Standards",
    "domain": "FINANCE",
    "authority_level": "LAW",
    "version": "2024.1",
    "status": "ACTIVE"
  },
  "aliases": [
    {
      "id": "uuid",
      "concept_id": "uuid",
      "alias_value": "Sales",
      "alias_type": "LEXICAL",
      "source_system": null,
      "is_preferred_for_display": true
    }
  ],
  "governance": {
    "toolId": "aibos-metadata",
    "domain": "metadata_governance",
    "registryTable": "mdm_tool_registry",
    "category": "info",
    "severity": "info"
  }
}
```

### `metadata.listStandardPacks`

List metadata standard packs (e.g., IFRS, IAS 2, IAS 16) optionally filtered by domain.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "domain": {
      "type": "string",
      "description": "Optional domain filter",
      "enum": ["FINANCE", "HR", "SCM", "IT", "OTHER"]
    }
  },
  "required": []
}
```

**Behavior:**
- Returns all standard packs if no domain is specified
- Filters by domain if provided
- Ordered by code (ascending)

**Example:**
```json
{
  "domain": "FINANCE"
}
```

**Returns:**
```json
{
  "count": 4,
  "packs": [
    {
      "id": "uuid",
      "code": "GLOBAL_TAX",
      "name": "Global Tax Standards",
      "domain": "FINANCE",
      "authority_level": "LAW",
      "version": "2024.1",
      "status": "ACTIVE",
      "notes": "Global tax compliance and reporting standards"
    }
  ],
  "domain": "FINANCE",
  "governance": {
    "toolId": "aibos-metadata",
    "domain": "metadata_governance",
    "registryTable": "mdm_tool_registry",
    "category": "info",
    "severity": "info"
  }
}
```

## Implementation Notes

- The server uses Neon Postgres (not Supabase)
- All queries are case-insensitive for better discoverability
- Tenant isolation is enforced at the database query level
- Governance metadata is included in all responses for auditability


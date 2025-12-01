# AIBOS Metadata MCP Server

Metadata governance server providing concept lookup and standard pack listing.

## Tools

### `metadata.lookupConcept`

Look up a concept by term (canonical key or alias).

**Parameters:**
- `tenantId` (string, required) - Tenant ID for multi-tenant isolation
- `term` (string, required) - Term to search for (canonical key like 'revenue' or alias like 'Sales', 'REV', etc.)

**Returns:**
- Concept details
- Associated standard pack (if any)
- All aliases for the concept

**Example:**
```json
{
  "tenantId": "uuid-here",
  "term": "Sales"
}
```

### `metadata.listStandardPacks`

List standard packs (IFRS, IAS, etc.).

**Parameters:**
- `domain` (string, optional) - Filter by domain: FINANCE, HR, SCM, IT, or OTHER

**Returns:**
- List of standard packs with their details

**Example:**
```json
{
  "domain": "FINANCE"
}
```

## Setup

1. Ensure `DATABASE_URL` is set in your `.env` file
2. Install dependencies: `pnpm install`
3. Start server: `pnpm start`

## Configuration

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "metadata": {
      "command": "node",
      "args": [".mcp/metadata/server.mjs"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```



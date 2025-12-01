# AIBOS Accounting Knowledge Base MCP Server

## Overview

A dedicated MCP server for tracking accounting-related knowledge, solutions, training materials, UI/UX improvements, upgrades, and bugs. This serves as a centralized knowledge base that will be used for future training, UI/UX improvements, upgrades, and bug tracking.

## Purpose

This MCP server enables you (and AI agents) to:
- **Record Solutions**: Document accounting workflows, problem-solving guides, and best practices
- **Store Training Materials**: Create tutorials, educational content, and onboarding materials
- **Track UI/UX**: Document design patterns, user experience improvements, and interface notes
- **Manage Upgrades**: Record migration guides, version changes, and upgrade procedures
- **Track Bugs**: Document bug reports, fixes, workarounds, and known issues

## Features

✅ **Categorization**: Organize knowledge by type (SOLUTION, TRAINING, UI_UX, UPGRADE, BUG)
✅ **Tagging**: Flexible tagging system for cross-referencing
✅ **Concept Linking**: Link entries to metadata concepts (`mdm_concept`) for governance
✅ **Standard Pack Linking**: Link entries to accounting standards (IFRS, IAS, etc.)
✅ **Status Tracking**: DRAFT → REVIEW → APPROVED → ARCHIVED workflow
✅ **Priority Levels**: LOW, MEDIUM, HIGH, CRITICAL
✅ **Versioning**: Track versions of knowledge entries
✅ **Rich Search**: Search by category, query, tags, status, or related concepts
✅ **Governance Integration**: Respects tool registry and provides governance metadata

## Setup

### 1. Database Schema

The schema has been created. To verify:

```bash
cd apps
pnpm db:setup-accounting-knowledge
```

### 2. MCP Server Configuration

The server is configured in `.cursor/mcp.json`:

```json
{
  "aibos-accounting-knowledge": {
    "command": "node",
    "args": [".mcp/accounting-knowledge/server.mjs"],
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```

### 3. Dependencies

Dependencies are installed in `.mcp/accounting-knowledge/`:
- `@modelcontextprotocol/sdk`
- `@neondatabase/serverless`

## Available Tools

### `accounting.recordKnowledge`

Record a new knowledge entry.

**Example Usage:**
```
Record a solution for handling deferred revenue:
- category: "SOLUTION"
- title: "Revenue Recognition for SaaS Subscriptions"
- content: "## Overview\n\nWhen dealing with SaaS subscriptions..."
- tags: ["revenue", "subscription", "IFRS15"]
- relatedConceptId: "uuid-of-revenue-concept"
- status: "APPROVED"
- priority: "HIGH"
```

### `accounting.searchKnowledge`

Search the knowledge base.

**Example Usage:**
```
Search for training materials on FX accounting:
- query: "FX"
- category: "TRAINING"
- status: "APPROVED"
```

### `accounting.getKnowledge`

Get a specific knowledge entry by ID.

## Database Schema

### Tables

1. **`accounting_knowledge_category`**
   - Categories: SOLUTION, TRAINING, UI_UX, UPGRADE, BUG

2. **`accounting_knowledge`**
   - Main knowledge entries
   - Links to `mdm_concept` and `mdm_standard_pack`
   - Full-text search support via GIN indexes
   - JSONB metadata for category-specific data

### Indexes

- Category index
- Status index
- Tags (GIN) index
- Concept link index
- Standard pack link index
- Metadata (GIN) index

## Usage Examples

### Recording a Solution

```json
{
  "category": "SOLUTION",
  "title": "How to Handle Multi-Currency Transactions",
  "description": "Step-by-step guide for processing FX transactions",
  "content": "# Multi-Currency Transactions\n\n## Overview\n\n...",
  "tags": ["FX", "currency", "IAS21"],
  "relatedConceptId": "fx-transaction-concept-id",
  "relatedStandardPackId": "ias21-pack-id",
  "status": "APPROVED",
  "priority": "HIGH"
}
```

### Recording a Bug

```json
{
  "category": "BUG",
  "title": "Revenue calculation incorrect for partial periods",
  "description": "Revenue recognition fails when subscription starts mid-month",
  "content": "## Issue\n\nWhen a subscription starts on day 15...",
  "tags": ["bug", "revenue", "subscription"],
  "status": "DRAFT",
  "priority": "CRITICAL",
  "metadata": {
    "reportedBy": "user@example.com",
    "affectedVersion": "1.2.0",
    "fixedInVersion": "1.2.1"
  }
}
```

### Recording UI/UX Improvement

```json
{
  "category": "UI_UX",
  "title": "Improve Revenue Dashboard Loading State",
  "description": "Add skeleton loaders for better perceived performance",
  "content": "## Current State\n\nDashboard shows blank screen...",
  "tags": ["ui", "performance", "dashboard"],
  "status": "REVIEW",
  "priority": "MEDIUM"
}
```

## Governance

- **Tool Registry**: Checks `mdm_tool_registry` before execution
- **Governance Metadata**: All responses include governance context
- **Concept Linking**: Links to `mdm_concept` for domain governance
- **Standard Pack Linking**: Links to `mdm_standard_pack` for compliance

## Future Enhancements

- Full-text search with PostgreSQL `tsvector`
- Knowledge entry relationships (related entries)
- Comments/annotations on entries
- Export/import functionality
- Integration with documentation generator
- AI-powered suggestions for related entries
- Version history and diff tracking
- Approval workflow automation

## Files

- `.mcp/accounting-knowledge/server.mjs` - MCP server implementation
- `.mcp/accounting-knowledge/package.json` - Server dependencies
- `.mcp/accounting-knowledge/README.md` - Detailed documentation
- `apps/lib/accounting-knowledge-schema.sql` - Database schema
- `apps/lib/setup-accounting-knowledge.ts` - Setup script

## Next Steps

1. **Test the MCP Server**: Restart Cursor to load the new MCP server
2. **Record Initial Knowledge**: Start documenting solutions, bugs, and improvements
3. **Link to Concepts**: Connect knowledge entries to metadata concepts for governance
4. **Build UI**: Create a UI to browse and manage the knowledge base
5. **Integrate with Workflows**: Use the knowledge base in accounting workflows

---

**Status**: ✅ Ready to use
**Last Updated**: 2025-01-27


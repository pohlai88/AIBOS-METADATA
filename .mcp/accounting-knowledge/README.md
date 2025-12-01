# AIBOS Accounting Knowledge MCP Server

A Model Context Protocol (MCP) server for managing accounting knowledge entries, including solutions, training materials, UI/UX notes, upgrades, and bug tracking.

## Overview

This MCP server provides tools for:
- **Searching and filtering** accounting knowledge by category, status, priority, and tags
- **Retrieving full knowledge entries** by ID or slug
- **Creating new knowledge entries** with proper categorization
- **Updating lifecycle status** (DRAFT → REVIEW → APPROVED → ARCHIVED)

## Prerequisites

- Node.js 18+
- pnpm 8+
- Neon database with the accounting knowledge schema
- `DATABASE_URL` environment variable

## Installation

```bash
cd .mcp/accounting-knowledge
pnpm install
```

## Configuration

Set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgres://user:password@host.neon.tech/dbname"
```

## Usage

### Standalone

```bash
node server.mjs
```

### With Claude Desktop

Add to your MCP configuration (`.cursor/mcp.json` or Claude Desktop config):

```json
{
  "mcpServers": {
    "aibos-accounting-knowledge": {
      "command": "node",
      "args": [
        "D:\\Metadata-01\\.mcp\\accounting-knowledge\\server.mjs"
      ],
      "env": {
        "DATABASE_URL": "postgres://user:password@host.neon.tech/dbname"
      }
    }
  }
}
```

## Available Tools

### 1. `list-accounting-knowledge`

List knowledge entries with optional filters:
- `category` (SOLUTION, TRAINING, UI_UX, UPGRADE, BUG)
- `status` (DRAFT, REVIEW, APPROVED, ARCHIVED)
- `priority` (LOW, MEDIUM, HIGH, CRITICAL)
- `search` (text search in title/content)
- `limit` (1-50, default 10)

### 2. `get-accounting-knowledge`

Get full details of a knowledge entry:
- `id` (UUID) or `slug` (if configured)

### 3. `create-accounting-knowledge`

Create a new knowledge entry:
- `category` (required)
- `title` (required, min 3 chars)
- `content` (required, min 10 chars, markdown)
- `description` (optional)
- `tags` (optional array)
- `status` (optional, defaults to DRAFT)
- `priority` (optional)

### 4. `update-accounting-knowledge-status`

Update lifecycle status:
- `id` (required, UUID)
- `status` (optional)
- `priority` (optional)

## Database Schema

Requires the following tables:
- `accounting_knowledge_category` (with seeded categories)
- `accounting_knowledge` (main knowledge table)

See the main documentation for the complete schema definition.

## Categories

- **SOLUTION**: Problem-solving guides and solutions
- **TRAINING**: Training materials and documentation
- **UI_UX**: User interface and experience notes
- **UPGRADE**: Upgrade guides and migration notes
- **BUG**: Bug reports and fixes

## Status Lifecycle

- **DRAFT**: Initial creation, not yet reviewed
- **REVIEW**: Under review by team
- **APPROVED**: Approved and ready for use
- **ARCHIVED**: No longer active but kept for reference

## License

MIT

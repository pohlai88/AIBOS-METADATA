# Metadata Studio

**Nexus Metadata Studio** - Centralized metadata management, lineage tracking, governance, and observability for the AIBOS Platform.

## Overview

Metadata Studio is the central metadata repository and governance layer for the AIBOS Platform. It provides:

- **Metadata Management**: Centralized storage and retrieval of metadata entities
- **Data Lineage**: Upstream and downstream lineage tracking at table and column level
- **Impact Analysis**: Understand the impact of changes across the data ecosystem
- **Business Glossary**: Manage business terms and definitions
- **Data Quality**: Profile data and track quality metrics
- **Usage Analytics**: Track entity usage and access patterns
- **Governance**: Multi-tier governance with audit readiness
- **Standard Packs**: Predefined metadata templates (SOT Packs) for consistency

## Directory Structure

```
metadata-studio/
├── api/                    # Hono routes for HTTP endpoints
├── schemas/                # Zod schemas (Single Source of Truth)
├── services/               # Business logic layer
├── db/                     # Database repositories
├── mcp/                    # MCP tools for AI agent integration
├── bootstrap/              # Initialization scripts
├── events/                 # Internal event system
├── tests/                  # Test suites
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── conformance/       # Conformance tests
├── index.ts               # Main entry point
└── package.json           # Package configuration
```

## Key Components

### Schemas (SSOT)

All data structures are defined using Zod schemas in `schemas/`:

- `mdm-global-metadata.schema.ts` - Core metadata entities
- `observability.schema.ts` - Governance, profiling, usage
- `lineage.schema.ts` - Lineage graph structures
- `glossary.schema.ts` - Business glossary terms
- `tags.schema.ts` - Tag management
- `standard-pack.schema.ts` - Standard metadata packs
- `kpi.schema.ts` - KPI definitions

### Services

Business logic is implemented in `services/`:

- `metadata.service.ts` - CRUD operations for metadata
- `lineage.service.ts` - Lineage tracking and graph building
- `impact-analysis.service.ts` - Impact analysis
- `glossary.service.ts` - Glossary management
- `tags.service.ts` - Tag operations
- `quality.service.ts` - Data profiling and quality scoring
- `usage.service.ts` - Usage tracking and analytics

### API Routes

RESTful endpoints using Hono framework in `api/`:

- `/metadata/*` - Metadata CRUD operations
- `/lineage/*` - Lineage queries
- `/impact/*` - Impact analysis
- `/glossary/*` - Glossary management
- `/tags/*` - Tag operations
- `/quality/*` - Quality profiles and scores
- `/usage/*` - Usage statistics

### MCP Integration

MCP (Model Context Protocol) tools for AI agent integration in `mcp/`:

- `metadata-studio.mcp.json` - MCP manifest
- `tools/` - MCP tool implementations wrapping services

### Bootstrap

Initialization scripts in `bootstrap/`:

1. `01-load-standard-packs.ts` - Load predefined standard packs
2. `02-load-glossary.ts` - Load core business terms
3. `03-verify-governance-tiers.ts` - Verify governance configuration

### Events

Internal event system for real-time updates:

- `on-metadata-changed.ts` - Handle metadata changes
- `on-lineage-updated.ts` - Handle lineage updates
- `on-profile-computed.ts` - Handle profile computation

## Testing Strategy

### Unit Tests (`tests/unit/`)
Test individual functions and components in isolation.

### Integration Tests (`tests/integration/`)
- `lineage-coverage.test.ts` - Lineage coverage validation
- `alias-resolution.test.ts` - Entity alias resolution
- `sot-pack-conformance.test.ts` - Standard pack conformance

### Conformance Tests (`tests/conformance/`)
- `tier1-audit-readiness.test.ts` - Tier1 audit requirements
- `profiling-coverage.test.ts` - Data profiling coverage

## Governance Tiers

### Tier 1 (Critical)
- Complete metadata required
- Full lineage tracking
- Data quality profiling
- Ownership assigned
- Glossary terms mapped
- Audit ready

### Tier 2 (Important)
- Core metadata required
- Lineage tracked where available
- Quality monitoring

### Tier 3 (Standard)
- Basic metadata
- Optional lineage
- On-demand profiling

## Usage

### Bootstrap

```bash
npm run bootstrap
```

### Run Tests

```bash
npm test                      # All tests
npm run test:unit             # Unit tests only
npm run test:integration      # Integration tests only
npm run test:conformance      # Conformance tests only
```

## Development Guidelines

1. **Schemas First**: Define all data structures in Zod schemas before implementation
2. **Service Layer**: Business logic goes in services, not routes
3. **Repository Pattern**: Database operations in `db/` repositories
4. **MCP Tools**: Wrap existing services for agent consumption
5. **Event-Driven**: Use events for cross-cutting concerns
6. **Test Coverage**: Add tests for all new functionality

## Anti-Drift Rules

✅ **DO:**
- Create code only under `metadata-studio/` following the directory structure
- Place Zod schemas in `schemas/`
- Place repositories in `db/`
- Place business logic in `services/`
- Place routes in `api/`
- Wrap services in `mcp/tools/` for agent access
- Add tests to `tests/` subfolders

❌ **DON'T:**
- Mix concerns across layers
- Bypass the service layer
- Create files outside the defined structure
- Skip schema validation

## Dependencies

- `hono` - Web framework for API routes
- `zod` - Schema validation and type safety
- `jest` - Testing framework

## License

UNLICENSED - AIBOS Platform Team


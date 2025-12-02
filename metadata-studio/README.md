# Metadata Studio

GRCD-compliant metadata management workspace with multi-tenant support.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set up Database Connection

Create a `.env` file in the `metadata-studio/` directory:

```bash
DATABASE_URL=postgres://user:password@host:5432/your_db_name
```

**Example for local PostgreSQL:**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/metadata_studio
```

**Example for Supabase:**
```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 3. Generate Migrations

```bash
pnpm db:generate
```

This creates SQL migration files in `db/migrations/`:
- `0000_mdm_standard_pack.sql`
- `0001_mdm_global_metadata.sql`
- `0002_mdm_business_rule.sql`

### 4. Run Migrations

```bash
pnpm db:migrate
```

You should see:
```
Running metadata-studio migrations...
Metadata-studio migrations completed.
```

### 5. Verify Tables

Connect to your database and verify these tables exist:
- ✅ `mdm_standard_pack` - Global SoT standards (IFRS, IAS, MFRS, HL7, GS1)
- ✅ `mdm_global_metadata` - Canonical metadata registry per tenant
- ✅ `mdm_business_rule` - Soft-configuration engine for fast frontlines

## Database Schema

### Core Tables

#### `mdm_standard_pack`
Global registry of standards (IFRS/MFRS/HL7/GS1/etc.)
- Unique `pack_id` constraint
- Indexed by category + tier
- Tracks primary SoT packs per category

#### `mdm_global_metadata`
Canonical metadata registry per tenant
- Unique `canonical_key` per tenant
- Links to standard packs via `standard_pack_id`
- Governance tier (tier1-tier5)
- Multi-tenant isolation

#### `mdm_business_rule`
Soft-configuration engine with versioning
- JSONB configuration validated by Zod
- Environment support (live/sandbox)
- Governance lane (kernel_only/governed/draft)
- Multi-version support per environment

## Available Scripts

```bash
# Database operations
pnpm db:generate    # Generate migrations from schema
pnpm db:migrate     # Run pending migrations
pnpm db:push        # Generate + migrate in one step
pnpm db:studio      # Open Drizzle Studio UI

# Development
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm start          # Run production build

# Testing
pnpm test           # Run all tests
pnpm test:unit      # Run unit tests
pnpm test:integration    # Run integration tests
pnpm test:conformance    # Run conformance tests

# Code quality
pnpm lint           # Lint code
pnpm format         # Format code with Prettier
```

## Architecture

```
metadata-studio/
├── db/
│   ├── schema/           # Drizzle table definitions
│   │   ├── metadata.tables.ts
│   │   ├── standard-pack.tables.ts
│   │   └── business-rule.tables.ts
│   ├── migrations/       # Generated SQL migrations
│   └── client.ts         # Typed Drizzle client
├── schemas/              # Zod validation schemas
│   ├── business-rule.schema.ts
│   ├── business-rule-finance.schema.ts
│   └── business-rule-config-dispatcher.ts
├── scripts/
│   └── migrate.ts        # Migration runner
└── drizzle.config.ts     # Drizzle Kit configuration
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3100)

## Tech Stack

- **Database:** PostgreSQL (via Drizzle ORM)
- **Schema Definition:** Drizzle Kit
- **Validation:** Zod
- **API Framework:** Hono (coming soon)
- **TypeScript:** 5.5+
- **Node.js:** 20+
- **Package Manager:** pnpm 9+

## Next Steps

After migrations are running:
1. Implement services layer (`services/*.service.ts`)
2. Create API routes (`api/*.routes.ts`)
3. Add MCP tools (`mcp/tools/*.tools.ts`)
4. Set up bootstrap/seeding (`bootstrap/*.ts`)

## License

PROPRIETARY - AIBOS Team


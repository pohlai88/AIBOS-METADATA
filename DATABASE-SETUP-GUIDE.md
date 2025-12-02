# 🗄️ Database Setup Guide

## Current Status

❌ **DATABASE_URL is not configured**

You need to set up your database connection before you can:
- Verify the schema
- Run the approval workflow
- Test the event system

---

## Quick Setup (3 Steps)

### Step 1: Create `.env` file

Create `metadata-studio/.env` with this content:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/aibos_metadata

# Server Configuration
PORT=8787
NODE_ENV=development

# Event Bus Configuration
EVENT_BUS_TYPE=local
```

**Replace `your_password` with your actual PostgreSQL password!**

---

### Step 2: Create Database (if it doesn't exist)

```powershell
# Option A: Using psql (if installed)
psql -U postgres -c "CREATE DATABASE aibos_metadata;"

# Option B: Using Docker (if you prefer containers)
docker run -d `
  --name aibos-postgres `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=aibos_metadata `
  -p 5432:5432 `
  postgres:16

# Option C: Using pgAdmin or another GUI tool
# Just create a new database named "aibos_metadata"
```

---

### Step 3: Run Migrations

```powershell
# Generate migration from Drizzle schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate
```

---

## Verify Setup

After completing the steps above, verify your schema:

```powershell
# Option 1: TypeScript script (no psql needed)
pnpm exec tsx metadata-studio/scripts/verify-approval-schema.ts

# Option 2: SQL script (requires psql)
psql -U postgres -d aibos_metadata -f metadata-studio/db/migrations/VERIFY-mdm-approval-schema.sql

# Option 3: Drizzle Studio (visual interface)
pnpm db:studio
# Opens at http://localhost:4983
```

---

## Common Database URLs

### Local PostgreSQL (default)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/aibos_metadata
```

### Docker Container
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/aibos_metadata
```

### Remote PostgreSQL
```env
DATABASE_URL=postgresql://username:password@your-host.com:5432/aibos_metadata
```

### Connection with SSL
```env
DATABASE_URL=postgresql://username:password@your-host.com:5432/aibos_metadata?sslmode=require
```

---

## Troubleshooting

### Error: "DATABASE_URL env var is required"
➡️ **Solution:** Create `metadata-studio/.env` file with DATABASE_URL

### Error: "database does not exist"
➡️ **Solution:** Create the database first (see Step 2 above)

### Error: "password authentication failed"
➡️ **Solution:** Check your password in DATABASE_URL

### Error: "connection refused"
➡️ **Solution:** Ensure PostgreSQL is running:
```powershell
# Check if PostgreSQL is running
docker ps  # if using Docker

# Or check Windows services
Get-Service postgresql*
```

---

## Next Steps

Once your database is set up and migrations are applied:

1. ✅ Run schema verification
2. ✅ Start the dev server: `pnpm dev`
3. ✅ Test the approval flow (see `APPROVAL-FLOW-WALKTHROUGH.md`)
4. ✅ Verify events are emitted correctly

---

## Full Example (Docker + Setup)

```powershell
# 1. Start PostgreSQL in Docker
docker run -d `
  --name aibos-postgres `
  -e POSTGRES_PASSWORD=mypassword `
  -e POSTGRES_DB=aibos_metadata `
  -p 5432:5432 `
  postgres:16

# 2. Create .env file
@"
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/aibos_metadata
PORT=8787
NODE_ENV=development
EVENT_BUS_TYPE=local
"@ | Out-File -FilePath metadata-studio/.env -Encoding UTF8

# 3. Run migrations
cd metadata-studio
pnpm db:generate
pnpm db:migrate

# 4. Verify schema
pnpm exec tsx scripts/verify-approval-schema.ts

# 5. Start server
pnpm dev
```

---

**Once setup is complete, you're ready to test the event-driven approval workflow!** 🚀


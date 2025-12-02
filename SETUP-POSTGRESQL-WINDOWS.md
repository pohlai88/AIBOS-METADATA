# 🐘 PostgreSQL Setup for Windows

## Quick Install

### Method 1: Using Chocolatey (Fastest)

```powershell
# Install Chocolatey if not already installed
# Visit: https://chocolatey.org/install

# Install PostgreSQL
choco install postgresql -y

# Refresh environment variables
refreshenv
```

### Method 2: Official Installer

1. **Download:** https://www.postgresql.org/download/windows/
2. **Run installer:** Select all components (Server, pgAdmin, Command Line Tools)
3. **Set password:** Remember the postgres user password
4. **Add to PATH:** Installer should do this automatically

### Method 3: Docker (If you prefer containers)

```powershell
# Pull PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run -d `
  --name aibos-postgres `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=aibos_metadata `
  -p 5432:5432 `
  postgres:16

# Connect via psql
docker exec -it aibos-postgres psql -U postgres -d aibos_metadata
```

---

## Verify Installation

```powershell
# Check psql is available
psql --version

# Should output: psql (PostgreSQL) 16.x
```

---

## Connect to Your Database

```powershell
# Replace 'your_db' with your actual database name
psql -U postgres -d your_db

# Or if you have a custom user:
psql -U your_username -d your_db -h localhost -p 5432
```

---

## Common Connection Strings

```env
# .env file
DATABASE_URL=postgresql://postgres:password@localhost:5432/aibos_metadata
```

---

## After Installation

Run the verification script:

```powershell
psql -U postgres -d aibos_metadata -f metadata-studio/db/migrations/VERIFY-mdm-approval-schema.sql
```

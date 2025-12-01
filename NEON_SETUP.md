# Neon Database Setup Guide

## ✅ Neon Project Created

**Project Name:** `aibos-metadata`  
**Project ID:** `weathered-cell-72326440`  
**Region:** `aws-us-east-1`

## 🔗 Connection String

Your Neon database connection string:

```
postgresql://neondb_owner:npg_yYQ37jpOxkbd@ep-super-hall-ah9h386q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**⚠️ Important:** Add this to your `.env` file (which is gitignored for security).

## 📝 Environment Variables

Create a `.env` file in the root directory with:

```env
DATABASE_URL=postgresql://neondb_owner:npg_yYQ37jpOxkbd@ep-super-hall-ah9h386q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_API_KEY=your_neon_api_key_here
```

## 🛠️ Neon CLI Commands

### Get Connection String

```bash
neonctl connection-string
```

### List Projects

```bash
neonctl projects list
```

### List Branches

```bash
neonctl branches list --project-id weathered-cell-72326440
```

### Create Database

```bash
neonctl databases create --project-id weathered-cell-72326440 --name your_database_name
```

## 📦 Installed Packages

- `@neondatabase/serverless` - Neon serverless Postgres client
- `@types/pg` - TypeScript types for Postgres

## 💻 Usage in Next.js

### Server Components / API Routes

```typescript
import { sql } from "@/lib/db";

export async function getData() {
  const result = await sql`SELECT * FROM your_table`;
  return result;
}
```

### Server Actions

```typescript
"use server";

import { sql } from "@/lib/db";

export async function createRecord(data: any) {
  await sql`INSERT INTO your_table (column) VALUES (${data.value})`;
}
```

## 🔐 Security Notes

- ✅ Never commit `.env` file to git
- ✅ Use environment variables in Vercel for production
- ✅ Connection string includes credentials - keep it secure
- ✅ Use SSL mode (already configured with `?sslmode=require`)

## 🚀 Next Steps

1. Create your database schema
2. Set up migrations (consider using Drizzle ORM or Prisma)
3. Add database queries to your Next.js app
4. Configure Vercel environment variables for production

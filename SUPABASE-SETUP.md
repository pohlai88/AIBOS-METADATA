# 🚀 Supabase Configuration for AIBOS-METADATA

## ✅ Your Supabase Project

**Project URL:** https://cnlutbuzjqtuicngldak.supabase.co

## 📝 Step 1: Get Your Database Password

1. Go to: https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/settings/database
2. Find the "Connection string" section
3. Click "Connection pooling" tab
4. Copy the password (you'll need this!)

## 📝 Step 2: Create `.env` File

Create `metadata-studio/.env` with this content:

```env
# Supabase Database Connection (Connection Pooling - Recommended)
DATABASE_URL=postgresql://postgres.cnlutbuzjqtuicngldak:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Or use Direct Connection (if pooling doesn't work)
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.cnlutbuzjqtuicngldak.supabase.co:5432/postgres

# Server Configuration
PORT=8787
NODE_ENV=development

# Event Bus
EVENT_BUS_TYPE=local
```

**Replace `[YOUR-PASSWORD]` with your actual Supabase database password!**

## 📝 Step 3: I'll Create the `mdm_approval` Table for You!

Running migration now...


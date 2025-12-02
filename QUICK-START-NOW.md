# 🚀 QUICK START - DO THIS NOW!

## ⚠️ Server Failed: Missing DATABASE_URL

**Error:** `DATABASE_URL env var is required for metadata-studio`

---

## ✅ Fix It (2 Steps)

### Step 1: Get Your Supabase Password

1. Go to: https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/settings/database
2. Scroll to **"Connection string"** section
3. Click **"URI"** tab
4. You'll see something like:
   ```
   postgresql://postgres.cnlutbuzjqtuicngldak:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
5. **Copy the password** (the part after `:` and before `@`)

### Step 2: Create `.env` File

**Option A: Manual (Recommended)**

Create a new file: `metadata-studio\.env`

Paste this content (replace `YOUR-PASSWORD`):

```env
DATABASE_URL=postgresql://postgres.cnlutbuzjqtuicngldak:YOUR-PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
PORT=8787
NODE_ENV=development
EVENT_BUS_TYPE=local
```

**Option B: PowerShell Script**

Run this in PowerShell:

```powershell
.\CREATE-ENV-FILE-NOW.ps1
```

---

## ✅ Then Restart the Server

```powershell
# Stop current server (if running)
# Press Ctrl+C in the terminal

# Start again
cd metadata-studio
pnpm dev
```

**Expected output:**

```
[EventSystem] Initializing event system...
[EventSystem] Event bus initialized (local) ✅
[ProfileSubscriber] Registered subscriber for metadata.profile.due
metadata-studio listening on http://localhost:8787
```

---

## 🧪 Then Test!

Once the server shows "listening on http://localhost:8787", run:

```powershell
# Test health endpoint
curl http://localhost:8787/healthz
```

**Expected response:**

```json
{ "status": "ok", "service": "metadata-studio" }
```

---

## 🎯 Full Test Flow

After the server is running, follow:

- **TEST-APPROVAL-WORKFLOW-NOW.md** - Quick test commands
- **APPROVAL-FLOW-WALKTHROUGH.md** - Detailed walkthrough with explanations

---

**🔑 KEY ACTION:** Get your Supabase password and create the `.env` file!

# BFF Admin Config - Configuration Guide

## 🔒 Configuration Principle: Locality

This service follows the **"Centralized Management, Local Access"** pattern:

| Concern | Where It Lives | Why |
|---------|----------------|-----|
| **DB Credentials** | Local `.env` | Security isolation |
| **JWT Secret** | Local `.env` | Service-specific tokens |
| **Connection Pool** | Local `env.ts` | Tuned for this workload |
| **Shared Code** | `packages/*` | Reusable, not config |

---

## ⚙️ Required Environment Variables

### Minimum to Start

```bash
# Create .env file in apps/bff-admin-config/
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aibos_admin_config
JWT_SECRET=your-super-secret-key-minimum-32-characters
```

### Full Configuration

```bash
# ==========================================
# DATABASE (Required)
# ==========================================
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Pool Settings (Optional - have defaults)
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=20
DB_CONNECT_TIMEOUT=10

# ==========================================
# AUTHENTICATION (Required)
# ==========================================
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRES_IN=3600        # 1 hour (default)
JWT_REFRESH_EXPIRES_IN=604800  # 7 days (default)

# ==========================================
# SERVICE (Optional - have defaults)
# ==========================================
NODE_ENV=development       # development | test | production
PORT=3001
LOG_LEVEL=info            # debug | info | warn | error
SERVICE_NAME=bff-admin-config
SERVICE_VERSION=1.0.0

# ==========================================
# CORS (Optional)
# ==========================================
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# ==========================================
# EMAIL (Optional - console in dev)
# ==========================================
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASSWORD=password
SMTP_FROM=noreply@example.com

# ==========================================
# INTER-SERVICE (Optional)
# ==========================================
EVENT_BUS_URL=amqp://localhost:5672
BFF_PAYMENT_CYCLE_URL=http://localhost:3002
BFF_METADATA_URL=http://localhost:3003
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│            Secret Management                  │
│    (Vault / AWS Secrets / K8s Secrets)       │
└─────────────────────┬────────────────────────┘
                      │ Inject at deploy time
                      ▼
┌──────────────────────────────────────────────┐
│           bff-admin-config                    │
│  ┌────────────────────────────────────────┐  │
│  │ .env (local to this service)           │  │
│  │ - DATABASE_URL                         │  │
│  │ - JWT_SECRET                           │  │
│  │ - SMTP_*                               │  │
│  └──────────────────┬─────────────────────┘  │
│                     │                         │
│  ┌──────────────────▼─────────────────────┐  │
│  │ config/env.ts (Zod validation)         │  │
│  │ - Validates all vars at startup        │  │
│  │ - Provides typed getConfig()           │  │
│  │ - Fails fast with clear errors         │  │
│  └──────────────────┬─────────────────────┘  │
│                     │                         │
│  ┌──────────────────▼─────────────────────┐  │
│  │ config/database.ts                     │  │
│  │ - Uses config for connection           │  │
│  │ - Lazy initialization                  │  │
│  │ - Health checks                        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## 🧪 Validation at Startup

When the service starts, `loadEnv()` validates ALL environment variables:

**Success:**
```
✅ Environment loaded:
   Service: bff-admin-config@1.0.0
   Port: 3001
   Database: postgresql://postgres:****@localhost:5432/aibos_admin_config
   CORS: http://localhost:3000
```

**Failure (clear error):**
```
❌ Environment validation failed:
  - DATABASE_URL: Required
  - JWT_SECRET: JWT_SECRET must be at least 32 characters

📋 Required environment variables:
   DATABASE_URL=postgresql://user:pass@host:5432/db
   JWT_SECRET=your-32-char-minimum-secret-key
```

---

## 🔄 Usage in Code

```typescript
import { getConfig, getDatabase } from "./config";

// Typed configuration access
const config = getConfig();

console.log(config.service.name);       // "bff-admin-config"
console.log(config.database.poolSize);  // 10
console.log(config.auth.jwtSecret);     // "your-secret..."
console.log(config.isProduction);       // false

// Database access (lazy init)
const db = getDatabase();
const users = await db.select().from(users);
```

---

## 🐳 Docker / Kubernetes

```yaml
# docker-compose.yml
services:
  bff-admin-config:
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/admin_config
      - JWT_SECRET=${JWT_SECRET}  # From .env or secrets
    env_file:
      - ./apps/bff-admin-config/.env

# Kubernetes Secret
apiVersion: v1
kind: Secret
metadata:
  name: bff-admin-config-secrets
data:
  DATABASE_URL: <base64>
  JWT_SECRET: <base64>
```

---

## ❌ What NOT to Do

| ❌ Don't | ✅ Do |
|----------|-------|
| Put DB credentials in shared package | Keep in local `.env` |
| Hardcode secrets in code | Use environment variables |
| Share JWT secrets across services | Each service has its own |
| Commit `.env` to git | Use `.env.example` |
| Access `process.env` directly | Use typed `getConfig()` |

---

## 🚀 Quick Setup

```powershell
# Option 1: Use setup script (from repo root)
.\scripts\setup-env.ps1

# Option 2: Manual
cp env.example .env
# Then edit .env with your values
```

## 📚 Related Files

| File | Committed? | Purpose |
|------|-----------|---------|
| `env.example` | ✅ Yes | Template with placeholder values |
| `.env` | ❌ No | Your actual secrets (local only) |
| `src/config/env.ts` | ✅ Yes | Zod schema & validation |
| `src/config/database.ts` | ✅ Yes | Database connection |
| `src/config/index.ts` | ✅ Yes | Module exports |


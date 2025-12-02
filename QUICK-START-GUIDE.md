# Quick Start Guide - Complete Admin Config in 4 Hours ⚡

**Current Status**: 95% Complete  
**Remaining**: Database setup + API testing + Frontend integration

---

## ⏱️ Time Breakdown

- **Step 1**: Database Setup (30 min)
- **Step 2**: Backend Testing (30 min)
- **Step 3**: Frontend Integration (3 hours)
- **Total**: ~4 hours

---

## 🔧 Step 1: Database Setup (30 minutes)

### 1.1 Create .env File

```bash
cd apps/api
cp .env.example .env
```

### 1.2 Edit .env

Open `apps/api/.env` and set:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/aibos

# JWT Secret - Generate a secure random string
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Generate a secure JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 1.3 Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql

# Create database
psql -U postgres
CREATE DATABASE aibos;
\q
```

**Option B: Use Neon (Cloud PostgreSQL)**
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string to `.env`

### 1.4 Generate & Run Migrations

```bash
cd apps/api

# Generate migration files from Drizzle schemas
pnpm db:generate

# Apply migrations to database
pnpm db:migrate
```

**Expected output**:
```
✓ Created tables:
  - iam_tenants
  - iam_users
  - iam_user_tenant_memberships
  - iam_audit_events
  - iam_invite_tokens
  - iam_password_reset_tokens
```

### 1.5 Verify Tables Created

```bash
# Open Drizzle Studio to view database
pnpm db:studio
```

Browse to `http://localhost:4983` to see your tables.

---

## 🧪 Step 2: Backend API Testing (30 minutes)

### 2.1 Start Backend Server

```bash
cd apps/api
pnpm dev
```

**Expected output**:
```
🚀 Server running on http://localhost:3001
✓ Database connected
✓ CORS enabled for http://localhost:3000
```

### 2.2 Test Health Check

```bash
curl http://localhost:3001/health
```

**Expected**: `{"status":"ok"}`

### 2.3 Test API Endpoints

**Install Bruno (Recommended)** or use Postman/curl

#### Test 1: Login (Should Fail - No Users Yet)

```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Expected**: `{"error":"User not found"}`

#### Test 2: Create First User (Direct DB)

For now, we'll create a test user manually. Later, you can use the invite flow.

```bash
# Open Drizzle Studio
pnpm db:studio
```

1. Go to `iam_tenants` table
2. Click "Add Row"
3. Fill in:
   - `id`: `tenant-1`
   - `name`: `Test Organization`
   - `slug`: `test-org`
   - `status`: `active`

4. Go to `iam_users` table
5. Click "Add Row"
6. Fill in:
   - `id`: `user-1`
   - `email`: `admin@test.com`
   - `displayName`: `Test Admin`
   - `passwordHash`: (We'll update this via API)
   - `status`: `active`

7. Go to `iam_user_tenant_memberships` table
8. Click "Add Row"
9. Fill in:
   - `userId`: `user-1`
   - `tenantId`: `tenant-1`
   - `role`: `org_admin`

#### Test 3: Test Login with Real User

Once you have a user with a proper password hash, test login.

**Note**: The backend is ready, but you'll need to implement a "seed" script or use the invite flow to create the first user properly.

---

## 🎨 Step 3: Frontend Integration (3 hours)

### 3.1 Setup Environment Variables

```bash
cd apps/web
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/admin
```

### 3.2 Create Auth Context (30 min)

Create `apps/web/contexts/AuthContext.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // TODO: Implement session check
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### 3.3 Add AuthProvider to Layout (5 min)

Update `apps/web/app/layout.tsx`:

```typescript
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider defaultTheme="system">
              {children}
              <FloatingThemeToggle />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 3.4 Wire Up Login Page (30 min)

Update `apps/web/app/(auth)/login/page.tsx`:

Replace the TODO comment with:

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// In the component:
const { login } = useAuth();
const router = useRouter();

// In the form submit handler:
try {
  setIsLoading(true);
  await login(data.email, data.password);
  router.push("/dashboard");
} catch (error) {
  setError("email", { message: "Invalid credentials" });
} finally {
  setIsLoading(false);
}
```

### 3.5 Wire Up Users Page (1 hour)

Update `apps/web/app/(dashboard)/admin/users/page.tsx`:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api-client";
import { useDemoMode } from "@/lib/demo-mode";
import { demoUsers } from "@/lib/demo-data";
import { EmptyStates } from "@/components/EmptyStates";

export default function UsersPage() {
  const { isDemoMode } = useDemoMode();
  const queryClient = useQueryClient();

  // Fetch real users from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
    enabled: !isDemoMode, // Only fetch if not in demo mode
  });

  // Use demo data if in demo mode, otherwise use API data
  const users = isDemoMode ? demoUsers : (data?.users || []);

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      usersApi.invite(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Show success toast
    },
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      usersApi.deactivate(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Show success toast
    },
  });

  // Rest of the component remains the same...
  // Just replace the demo data with `users` variable
}
```

### 3.6 Wire Up Organization Page (30 min)

Similar pattern for `apps/web/app/(dashboard)/admin/organization/page.tsx`:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["organization"],
  queryFn: () => organizationApi.get(),
  enabled: !isDemoMode,
});

const updateMutation = useMutation({
  mutationFn: (data) => organizationApi.update(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["organization"] });
  },
});
```

### 3.7 Wire Up Audit Page (30 min)

Update `apps/web/app/(dashboard)/admin/audit/page.tsx`:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["audit", filters],
  queryFn: () => auditApi.list(filters),
  enabled: !isDemoMode,
});
```

### 3.8 Wire Up Profile Page (30 min)

Update `apps/web/app/(dashboard)/settings/profile/page.tsx`:

```typescript
const { data: user, isLoading } = useQuery({
  queryKey: ["me"],
  queryFn: () => meApi.get(),
  enabled: !isDemoMode,
});

const updateMutation = useMutation({
  mutationFn: (data) => meApi.update(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["me"] });
  },
});
```

---

## 🧪 Step 4: End-to-End Testing (1 hour)

### Test Checklist:

#### Auth Flow
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Forgot password (send email)
- [ ] Reset password with token
- [ ] Logout

#### User Management
- [ ] List users
- [ ] Search users
- [ ] Filter by role/status
- [ ] Invite user (send email)
- [ ] View user details
- [ ] Deactivate user
- [ ] Reactivate user

#### Organization
- [ ] View organization details
- [ ] Update organization name
- [ ] Update organization logo
- [ ] Update contact email

#### Profile
- [ ] View current user profile
- [ ] Update display name
- [ ] Update avatar
- [ ] Change password

#### Audit Log
- [ ] View audit events
- [ ] Filter by action
- [ ] Filter by date range
- [ ] Filter by user

---

## 🎯 Success Criteria

✅ **Backend**:
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Database has 6 tables
- [ ] Can create/read/update records

✅ **Frontend**:
- [ ] Login works
- [ ] Protected routes redirect to login
- [ ] API calls fetch real data
- [ ] Mutations update data
- [ ] Toasts show success/error
- [ ] Loading states display

✅ **Integration**:
- [ ] Frontend → Backend communication works
- [ ] JWT authentication works
- [ ] CORS properly configured
- [ ] Error handling works

---

## 🐛 Troubleshooting

### Issue: Database connection fails
**Solution**: Check `DATABASE_URL` in `.env` is correct

### Issue: CORS errors
**Solution**: Ensure `FRONTEND_URL` in backend `.env` is `http://localhost:3000`

### Issue: JWT errors
**Solution**: Ensure `JWT_SECRET` is set in backend `.env`

### Issue: "User not found" on login
**Solution**: Create a test user via Drizzle Studio or implement seed script

### Issue: TypeScript errors
**Solution**: Run `pnpm type-check` in both `apps/api` and `apps/web`

---

## 📚 Reference

### API Endpoints Reference

See `apps/api/README.md` for complete API documentation.

### Database Schema

See `business-engine/admin-config/infrastructure/persistence/drizzle/schema/` for table definitions.

### Frontend Components

See `apps/web/components/` for reusable UI components.

---

## 🎉 Completion Checklist

- [ ] Database setup complete
- [ ] Backend server running
- [ ] API endpoints tested
- [ ] Frontend environment configured
- [ ] Auth context created
- [ ] Login page wired
- [ ] Users page wired
- [ ] Organization page wired
- [ ] Profile page wired
- [ ] Audit page wired
- [ ] End-to-end tests passing

**When all checked**: 🎊 **ADMIN CONFIG 100% COMPLETE!** 🎊

---

## 🚀 Next: Payment Cycle Module

Once Admin Config is complete, start Payment Cycle using the same patterns!

**See**: `business-engine/payment-cycle/GRCD-PAYMENT-CYCLE-FRONTEND.md` for requirements.

---

**Need help?** Check:
- `SESSION-SUMMARY.md` - What we built
- `business-engine/admin-config/COMPLETION-SUMMARY.md` - Technical details
- `apps/api/README.md` - API documentation


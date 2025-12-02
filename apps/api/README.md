# AI-BOS Backend API Server

Backend API for Admin Config & Payment Cycle

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens

### 3. Run Database Migrations
```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Start Development Server
```bash
pnpm dev
```

Server will start on `http://localhost:3001`

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm type-check` - Type check TypeScript
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes directly (dev only)

## API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Login with email/password
- `POST /api/admin/auth/logout` - Logout
- `POST /api/admin/auth/forgot-password` - Request password reset
- `POST /api/admin/auth/reset-password` - Reset password with token

### Organization
- `GET /api/admin/organization` - Get current organization
- `PATCH /api/admin/organization` - Update organization (admin only)

### Users
- `GET /api/admin/users` - List users in organization
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users/invite` - Invite user (admin only)
- `PATCH /api/admin/users/:id` - Update user (admin only)
- `POST /api/admin/users/:id/deactivate` - Deactivate user (admin only)
- `POST /api/admin/users/:id/reactivate` - Reactivate user (admin only)

### Current User
- `GET /api/admin/me` - Get current user profile
- `PATCH /api/admin/me` - Update current user profile
- `PATCH /api/admin/me/password` - Change password

### Audit
- `GET /api/admin/audit` - Get audit log

### Health
- `GET /health` - Health check

## Database Schema

Tables created by migrations:
- `iam_tenants` - Organizations/tenants
- `iam_users` - User accounts
- `iam_user_tenant_memberships` - User-tenant relationships and roles
- `iam_audit_events` - Audit trail (immutable)
- `iam_invite_tokens` - User invite tokens
- `iam_password_reset_tokens` - Password reset tokens

All tables use `iam_` prefix for isolation from other modules (e.g., `mdm_` for metadata).

## Architecture

- **Framework**: Hono (fast, lightweight)
- **ORM**: Drizzle (type-safe SQL)
- **Validation**: Zod
- **Auth**: JWT (jsonwebtoken)
- **Password**: bcrypt

## Development Notes

### Testing API Endpoints

Use Bruno, Postman, or curl:

```bash
# Login
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get users (requires JWT)
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| JWT_SECRET | Yes | - | Secret for JWT signing |
| PORT | No | 3001 | Server port |
| NODE_ENV | No | development | Environment mode |
| FRONTEND_URL | No | http://localhost:3000 | Frontend URL for CORS |

### CORS

CORS is configured to allow requests from `FRONTEND_URL` (default: `http://localhost:3000`).

For production, update this to your production frontend URL.

## Production Deployment

1. Build the server:
```bash
pnpm build
```

2. Set production environment variables

3. Run migrations:
```bash
pnpm db:migrate
```

4. Start server:
```bash
pnpm start
```

## Troubleshooting

### Database Connection Errors
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Verify network connectivity

### JWT Errors
- Ensure `JWT_SECRET` is set
- Check token expiration (default: 7 days)

### Migration Errors
- Run `pnpm db:generate` first
- Check database permissions
- Verify schema path in `drizzle.config.ts`


# BFF Payment Cycle

Backend-for-Frontend service for **Payment Cycle Orchestration** (MVP2).

## Overview

This BFF handles the complete payment lifecycle:

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → DISBURSED_AWAITING_SLIP → COMPLETED
                          ↓
                      REJECTED → (edit) → DRAFT
```

## Features

- **Payment Request Management**: Create, update, cancel payment requests
- **Approval Workflow**: Multi-step approval chain support
- **Disbursement Tracking**: Record payments with treasury details
- **Slip Upload**: Bank slip/receipt uploads with location reference
- **Full Audit Trail**: Hash-chained audit events for every action

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment config
cp env.example .env
# Edit .env with your Supabase credentials

# Generate database migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development server
pnpm dev
```

## API Endpoints

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments (with job-based lanes) |
| POST | `/payments` | Create payment request |
| GET | `/payments/:id` | Get payment detail with timeline |
| PATCH | `/payments/:id` | Update payment (draft/rejected only) |
| DELETE | `/payments/:id` | Cancel payment |

### Approval Workflow

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/:id/submit` | Submit for approval |
| POST | `/payments/:id/approve` | Approve payment |
| POST | `/payments/:id/reject` | Reject payment (requires reason) |
| GET | `/payments/:id/approvals` | Get approval chain |

### Disbursement

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/:id/disburse` | Record disbursement |
| POST | `/payments/:id/slip` | Upload payment slip |
| POST | `/payments/:id/complete` | Complete payment |
| GET | `/payments/:id/disbursement` | Get disbursement details |
| GET | `/payments/:id/slips` | Get uploaded slips |

## Job-Based Lanes

The `/payments` endpoint supports job-based filtering:

- `?lane=my-requests` - Payments I created
- `?lane=need-approval` - Payments awaiting my approval
- `?lane=ready-disburse` - Approved payments ready for treasury

## State Machine

Valid state transitions:

```
DRAFT           → SUBMITTED, CANCELLED
SUBMITTED       → UNDER_REVIEW, DRAFT, CANCELLED
UNDER_REVIEW    → APPROVED, REJECTED, DRAFT
APPROVED        → DISBURSED_AWAITING_SLIP, CANCELLED
REJECTED        → DRAFT, CANCELLED
DISBURSED_AWAITING_SLIP → COMPLETED
COMPLETED       → (terminal)
CANCELLED       → (terminal)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `PORT` | No | Server port (default: 3002) |
| `STORAGE_BUCKET` | No | Supabase storage bucket (default: payment-slips) |

## Architecture

```
src/
├── config/         # Environment, database, DI container
├── db/schema/      # Drizzle ORM schemas
├── middleware/     # Auth, role-based access
├── repositories/   # Data access layer
├── routes/         # HTTP route handlers
├── services/       # Business logic
├── openapi/        # API documentation
└── index.ts        # Entry point
```

## Related Documents

- [GRCD-PAYMENT-CYCLE.md](../../business-engine/payment-cycle/GRCD-PAYMENT-CYCLE.md) - Backend requirements
- [GRCD-PAYMENT-CYCLE-FRONTEND.md](../../business-engine/payment-cycle/GRCD-PAYMENT-CYCLE-FRONTEND.md) - UI/UX requirements


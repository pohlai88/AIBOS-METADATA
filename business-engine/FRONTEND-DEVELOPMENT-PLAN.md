# 🚀 AI-BOS Frontend Development Plan

**Version:** 1.0.0  
**Status:** Planning  
**Last Updated:** 2025-12-02  
**Scope:** MVP1 (Admin/Identity) + MVP2 (Payment Cycle)

---

## 📋 Executive Summary

This document outlines the complete frontend development plan for AI-BOS, covering:

- **MVP1:** Organization Admin & Personal User Management
- **MVP2:** Payment Cycle Orchestrator

Both MVPs share a common design system, component library, and architectural patterns to ensure consistency and maintainability.

---

## 🏗️ Technical Architecture

### Stack Selection

| Layer         | Technology               | Rationale                                 |
| ------------- | ------------------------ | ----------------------------------------- |
| **Framework** | Next.js 14+ (App Router) | SSR, file-based routing, RSC support      |
| **Language**  | TypeScript               | Type safety, IDE support                  |
| **Styling**   | Tailwind CSS + shadcn/ui | Utility-first, accessible components      |
| **State**     | Zustand + TanStack Query | Light global state + server state caching |
| **Forms**     | React Hook Form + Zod    | Validation aligned with backend contracts |
| **Charts**    | Recharts                 | Timeline visualization                    |
| **Auth**      | NextAuth.js              | JWT/session handling                      |
| **Testing**   | Vitest + Playwright      | Unit + E2E testing                        |

### Directory Structure

```
apps/
└── web/                              # Next.js application
    ├── app/                          # App Router
    │   ├── (auth)/                   # Auth group (public)
    │   │   ├── login/
    │   │   ├── forgot-password/
    │   │   └── reset-password/
    │   ├── (dashboard)/              # Protected group
    │   │   ├── layout.tsx            # Dashboard shell
    │   │   ├── admin/
    │   │   │   ├── organization/
    │   │   │   ├── users/
    │   │   │   │   └── [id]/
    │   │   │   └── audit/
    │   │   ├── payments/             # MVP2
    │   │   │   ├── page.tsx          # Payment Hub
    │   │   │   ├── new/
    │   │   │   └── [id]/
    │   │   └── settings/
    │   │       └── profile/
    │   └── api/                      # API routes (BFF)
    ├── components/
    │   ├── ui/                       # shadcn/ui primitives
    │   ├── shared/                   # Cross-module components
    │   ├── admin/                    # MVP1 components
    │   └── payments/                 # MVP2 components
    ├── hooks/
    ├── lib/
    │   ├── api/                      # API client
    │   ├── auth/                     # Auth utilities
    │   └── utils/
    ├── stores/                       # Zustand stores
    └── types/                        # TypeScript types
```

---

## 📊 Component Inventory

### Shared Components (Design System)

| Component          | Description                                  | Priority |
| ------------------ | -------------------------------------------- | -------- |
| `Button`           | Primary, secondary, danger variants          | P0       |
| `Input`            | Text, email, password with validation states | P0       |
| `Select`           | Dropdown with search                         | P0       |
| `Card`             | Content container with header/footer         | P0       |
| `Badge` / `Pill`   | Status indicators (colored)                  | P0       |
| `Avatar`           | User avatar with fallback                    | P0       |
| `Toast`            | Notification system                          | P0       |
| `Modal` / `Dialog` | Confirmation dialogs                         | P0       |
| `Table`            | Data table with sorting/filtering            | P0       |
| `Tabs`             | Tab navigation                               | P0       |
| `Tooltip`          | Role/status tooltips                         | P1       |
| `Timeline`         | Vertical event timeline                      | P1       |
| `EmptyState`       | Illustrated empty states                     | P1       |
| `LoadingState`     | Skeleton loaders                             | P1       |
| `ActionMenu`       | ⋯ dropdown menu                              | P1       |

### MVP1: Admin Components

| Component                  | Route                                   | Description                |
| -------------------------- | --------------------------------------- | -------------------------- |
| `LoginForm`                | `/auth/login`                           | Email/password form        |
| `ForgotPasswordForm`       | `/auth/forgot-password`                 | Email input for reset      |
| `ResetPasswordForm`        | `/auth/reset-password`                  | New password form          |
| `DashboardShell`           | Layout                                  | Top nav + side nav         |
| `TenantSwitcher`           | Top nav                                 | Multi-tenant selector      |
| `UserMenu`                 | Top nav                                 | Avatar dropdown            |
| `OrganizationSettingsForm` | `/admin/organization`                   | Org profile editor         |
| `UserDirectory`            | `/admin/users`                          | User table with lanes      |
| `UserLaneTabs`             | `/admin/users`                          | All/Active/Admins/Inactive |
| `InviteUserModal`          | `/admin/users`                          | Invite form dialog         |
| `UserDetailView`           | `/admin/users/:id`                      | User profile + controls    |
| `ChangeRoleDialog`         | `/admin/users/:id`                      | Role change confirmation   |
| `DeactivateUserDialog`     | `/admin/users/:id`                      | Deactivation with reason   |
| `AccessStoryBar`           | `/admin/users/:id`, `/settings/profile` | 🔒 Silent Killer           |
| `RecentActivity`           | `/admin/users/:id`                      | Simplified audit timeline  |
| `ProfileForm`              | `/settings/profile`                     | Personal info editor       |
| `PreferencesForm`          | `/settings/profile`                     | Locale/timezone            |
| `ChangePasswordForm`       | `/settings/profile`                     | Password change            |
| `AuditLogTable`            | `/admin/audit`                          | Event log viewer           |

### MVP2: Payment Components

| Component              | Route           | Description                        |
| ---------------------- | --------------- | ---------------------------------- |
| `PaymentHub`           | `/payments`     | Main payment list                  |
| `PaymentLaneTabs`      | `/payments`     | My Requests/Need Approval/Disburse |
| `PaymentTable`         | `/payments`     | Payment list table                 |
| `NewPaymentForm`       | `/payments/new` | Payment request form               |
| `PaymentDetailView`    | `/payments/:id` | 3-panel case view                  |
| `PaymentHeader`        | `/payments/:id` | Title + status + amount            |
| `OneLineStoryBar`      | `/payments/:id` | 🔒 Silent Killer                   |
| `PaymentOverview`      | `/payments/:id` | Key facts tab                      |
| `PaymentDetailsTab`    | `/payments/:id` | Full field list                    |
| `SlipsDocumentsTab`    | `/payments/:id` | Attachments viewer                 |
| `PaymentTimeline`      | `/payments/:id` | Audit event log                    |
| `ApprovalProgress`     | `/payments/:id` | Multi-step visualization           |
| `ApproveRejectButtons` | `/payments/:id` | Approval actions                   |
| `RejectReasonDialog`   | `/payments/:id` | Rejection with reason              |
| `DisbursementCard`     | `/payments/:id` | Treasury payment form              |
| `SlipUploadZone`       | `/payments/:id` | File upload with location_ref      |
| `PaymentComments`      | `/payments/:id` | Discussion thread                  |
| `PaymentFilters`       | `/payments`     | Status/category/date filters       |

---

## 🎯 Development Phases

### Phase 0: Foundation (Week 1-2)

**Goal:** Set up project infrastructure and design system.

| Task                                                       | Est. Hours | Owner |
| ---------------------------------------------------------- | ---------- | ----- |
| Initialize Next.js 14 project with TypeScript              | 4h         | -     |
| Configure Tailwind CSS + shadcn/ui                         | 4h         | -     |
| Set up ESLint, Prettier, Husky                             | 2h         | -     |
| Create base layout components                              | 8h         | -     |
| Implement shared UI primitives (Button, Input, Card, etc.) | 16h        | -     |
| Set up Zustand stores structure                            | 4h         | -     |
| Configure TanStack Query + API client                      | 8h         | -     |
| Set up Vitest + testing utilities                          | 4h         | -     |

**Deliverable:** Empty app with design system ready.

---

### Phase 1: MVP1 - Authentication (Week 3)

**Goal:** Implement auth shell (public routes).

| Task                                     | Est. Hours | Dependencies |
| ---------------------------------------- | ---------- | ------------ |
| Create auth layout (`/auth/*`)           | 4h         | Phase 0      |
| Implement `LoginForm` component          | 8h         | Phase 0      |
| Implement `ForgotPasswordForm` component | 4h         | Phase 0      |
| Implement `ResetPasswordForm` component  | 6h         | Phase 0      |
| Integrate NextAuth.js                    | 8h         | Backend API  |
| Add form validation with Zod             | 4h         | Contracts    |
| Implement error handling + toasts        | 4h         | Phase 0      |
| Write unit tests for auth forms          | 6h         | -            |

**Deliverable:** Working auth flow with login/logout/password reset.

---

### Phase 2: MVP1 - Dashboard Shell (Week 4)

**Goal:** Implement protected dashboard layout.

| Task                                         | Est. Hours | Dependencies |
| -------------------------------------------- | ---------- | ------------ |
| Create dashboard layout (top nav + side nav) | 8h         | Phase 1      |
| Implement `TenantSwitcher` component         | 6h         | Phase 1      |
| Implement `UserMenu` dropdown                | 4h         | Phase 1      |
| Add route protection middleware              | 4h         | Phase 1      |
| Implement responsive sidebar                 | 6h         | Phase 1      |
| Add loading states + skeletons               | 4h         | Phase 0      |

**Deliverable:** Protected dashboard shell with navigation.

---

### Phase 3: MVP1 - Organization Settings (Week 5)

**Goal:** Implement organization profile management.

| Task                                 | Est. Hours | Dependencies |
| ------------------------------------ | ---------- | ------------ |
| Create `/admin/organization` page    | 4h         | Phase 2      |
| Implement `OrganizationSettingsForm` | 12h        | Phase 0      |
| Add logo upload functionality        | 6h         | -            |
| Implement "Last updated by" display  | 4h         | Audit API    |
| Add form persistence + save/reset    | 4h         | -            |
| Write unit tests                     | 4h         | -            |

**Deliverable:** Working organization settings page.

---

### Phase 4: MVP1 - User Management (Week 6-7)

**Goal:** Implement user directory and management.

| Task                                                  | Est. Hours | Dependencies   |
| ----------------------------------------------------- | ---------- | -------------- |
| Create `/admin/users` page                            | 4h         | Phase 2        |
| Implement `UserLaneTabs` (All/Active/Admins/Inactive) | 8h         | Phase 0        |
| Implement `UserDirectory` table                       | 12h        | Phase 0        |
| Implement `InviteUserModal`                           | 8h         | Phase 0        |
| Create `/admin/users/:id` page                        | 4h         | Phase 2        |
| Implement `UserDetailView` layout                     | 8h         | Phase 0        |
| Implement `AccessStoryBar` 🔒                         | 8h         | Membership API |
| Implement `RecentActivity` timeline                   | 6h         | Audit API      |
| Implement `ChangeRoleDialog`                          | 6h         | Phase 0        |
| Implement `DeactivateUserDialog` with safety rails    | 8h         | Phase 0        |
| Add role tooltips                                     | 2h         | Phase 0        |
| Write unit tests                                      | 8h         | -              |
| Write E2E tests for invite flow                       | 6h         | -              |

**Deliverable:** Full user management with invite/role/deactivate flows.

---

### Phase 5: MVP1 - My Profile (Week 8)

**Goal:** Implement personal profile settings.

| Task                                           | Est. Hours | Dependencies |
| ---------------------------------------------- | ---------- | ------------ |
| Create `/settings/profile` page                | 4h         | Phase 2      |
| Implement `ProfileForm` (name, avatar)         | 8h         | Phase 0      |
| Implement `PreferencesForm` (locale, timezone) | 6h         | Phase 0      |
| Implement `ChangePasswordForm`                 | 6h         | Phase 1      |
| Implement user-facing `AccessStoryBar`         | 4h         | Phase 4      |
| Write unit tests                               | 4h         | -            |

**Deliverable:** Working profile settings page.

---

### Phase 6: MVP1 - Audit Log (Week 8)

**Goal:** Implement compliance audit log.

| Task                       | Est. Hours | Dependencies |
| -------------------------- | ---------- | ------------ |
| Create `/admin/audit` page | 4h         | Phase 2      |
| Implement `AuditLogTable`  | 12h        | Audit API    |
| Add technical view toggle  | 4h         | -            |
| Add date range filters     | 4h         | Phase 0      |
| Write tests                | 4h         | -            |

**Deliverable:** Basic audit log viewer.

---

### Phase 7: MVP2 - Payment Hub (Week 9-10)

**Goal:** Implement payment list and navigation.

| Task                                                        | Est. Hours | Dependencies |
| ----------------------------------------------------------- | ---------- | ------------ |
| Create `/payments` page                                     | 4h         | Phase 2      |
| Implement `PaymentLaneTabs` (My Requests/Approval/Disburse) | 8h         | Phase 0      |
| Implement `PaymentTable` with status pills                  | 12h        | Phase 0      |
| Implement `PaymentFilters` (status, category, date)         | 8h         | Phase 0      |
| Add smart empty states                                      | 4h         | Phase 0      |
| Add search functionality                                    | 4h         | -            |
| Write unit tests                                            | 6h         | -            |

**Deliverable:** Payment hub with lane navigation.

---

### Phase 8: MVP2 - New Payment Request (Week 10)

**Goal:** Implement payment creation flow.

| Task                                        | Est. Hours | Dependencies |
| ------------------------------------------- | ---------- | ------------ |
| Create `/payments/new` page                 | 4h         | Phase 7      |
| Implement `NewPaymentForm` layout           | 8h         | Phase 0      |
| Add category dropdown with semantic labels  | 4h         | Metadata API |
| Add file upload zone                        | 6h         | -            |
| Implement Save as Draft / Send for Approval | 6h         | -            |
| Add inline validation                       | 4h         | Contracts    |
| Write unit tests                            | 4h         | -            |

**Deliverable:** Working payment request form.

---

### Phase 9: MVP2 - Payment Detail (Week 11-12)

**Goal:** Implement payment case view (3-panel layout).

| Task                                               | Est. Hours | Dependencies |
| -------------------------------------------------- | ---------- | ------------ |
| Create `/payments/:id` page                        | 4h         | Phase 7      |
| Implement `PaymentHeader` (title, status, amount)  | 6h         | Phase 0      |
| Implement `OneLineStoryBar` 🔒                     | 8h         | Audit API    |
| Implement `PaymentOverview` tab                    | 6h         | -            |
| Implement `PaymentDetailsTab` (editable for draft) | 8h         | -            |
| Implement `SlipsDocumentsTab`                      | 8h         | -            |
| Implement `PaymentTimeline` sidebar                | 10h        | Audit API    |
| Implement `ApprovalProgress` visualization         | 10h        | Approval API |
| Implement `PaymentComments` thread                 | 8h         | -            |
| Write unit tests                                   | 8h         | -            |

**Deliverable:** Complete payment detail view.

---

### Phase 10: MVP2 - Approval Flow (Week 13)

**Goal:** Implement approver actions.

| Task                                     | Est. Hours | Dependencies |
| ---------------------------------------- | ---------- | ------------ |
| Implement approve mode (`?mode=approve`) | 6h         | Phase 9      |
| Implement `ApproveRejectButtons`         | 6h         | Phase 0      |
| Implement `RejectReasonDialog`           | 6h         | Phase 0      |
| Add focus strip for approvers            | 4h         | -            |
| Handle approval chain reset on edit      | 6h         | -            |
| Write E2E tests for approval flow        | 8h         | -            |

**Deliverable:** Working approval flow with reset logic.

---

### Phase 11: MVP2 - Disbursement Flow (Week 14)

**Goal:** Implement treasury disbursement and slip upload.

| Task                                         | Est. Hours | Dependencies |
| -------------------------------------------- | ---------- | ------------ |
| Implement disburse mode (`?mode=disburse`)   | 6h         | Phase 9      |
| Implement `DisbursementCard` form            | 8h         | Phase 0      |
| Implement `SlipUploadZone` with location_ref | 8h         | -            |
| Handle DISBURSED_AWAITING_SLIP state         | 4h         | -            |
| Handle COMPLETED terminal state              | 4h         | -            |
| Write E2E tests for disbursement flow        | 8h         | -            |

**Deliverable:** Complete disbursement flow with slip upload.

---

### Phase 12: Polish & QA (Week 15-16)

**Goal:** Final polish, testing, and documentation.

| Task                                 | Est. Hours | Dependencies |
| ------------------------------------ | ---------- | ------------ |
| Accessibility audit (WCAG 2.1)       | 12h        | All phases   |
| Performance optimization             | 8h         | All phases   |
| Mobile responsiveness review         | 8h         | All phases   |
| Cross-browser testing                | 6h         | All phases   |
| E2E test coverage for critical paths | 16h        | All phases   |
| Documentation (Storybook)            | 12h        | All phases   |
| Bug fixes and refinements            | 16h        | All phases   |

**Deliverable:** Production-ready application.

---

## 📅 Timeline Summary

```
Week 1-2:   Phase 0 - Foundation
Week 3:     Phase 1 - Authentication
Week 4:     Phase 2 - Dashboard Shell
Week 5:     Phase 3 - Organization Settings
Week 6-7:   Phase 4 - User Management
Week 8:     Phase 5 & 6 - My Profile + Audit Log
─────────── MVP1 COMPLETE ───────────
Week 9-10:  Phase 7 - Payment Hub
Week 10:    Phase 8 - New Payment Request
Week 11-12: Phase 9 - Payment Detail
Week 13:    Phase 10 - Approval Flow
Week 14:    Phase 11 - Disbursement Flow
Week 15-16: Phase 12 - Polish & QA
─────────── MVP2 COMPLETE ───────────
```

**Total Duration:** ~16 weeks  
**Total Estimated Hours:** ~500-550 hours

---

## 🎨 Design Tokens

### Color Palette

```css
:root {
  /* Primary */
  --primary-50: #f0f9ff;
  --primary-500: #0ea5e9;
  --primary-700: #0369a1;

  /* Status Colors */
  --status-draft: #6b7280; /* Gray - Neutral */
  --status-review: #3b82f6; /* Blue - Info */
  --status-approved: #22c55e; /* Green - Success */
  --status-awaiting: #f59e0b; /* Orange - Warning */
  --status-completed: #14b8a6; /* Teal - Strong Success */
  --status-rejected: #ef4444; /* Red - Danger */

  /* Role Colors */
  --role-platform-admin: #8b5cf6; /* Purple */
  --role-org-admin: #0ea5e9; /* Blue */
  --role-member: #22c55e; /* Green */
  --role-viewer: #6b7280; /* Gray */
}
```

### Typography Scale

```css
:root {
  --font-sans: "Inter", system-ui, sans-serif;

  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
}
```

---

## 🔑 Critical Success Factors

### 1. Silent Killers (Must-Have UX Features)

| Feature                      | Location                    | Impact                                        |
| ---------------------------- | --------------------------- | --------------------------------------------- |
| **Access Story Bar**         | User Detail, My Profile     | Eliminates "what can this user do?" confusion |
| **One-Line Story Bar**       | Payment Detail              | Single-glance payment status understanding    |
| **Job-Based Lanes**          | User Directory, Payment Hub | Reduces cognitive load for common tasks       |
| **Trust-First Deactivation** | User Detail                 | Prevents accidental lockouts                  |
| **Approval Progress**        | Payment Detail              | Clear visibility into approval chain          |

### 2. Non-Negotiable UX Requirements

- [ ] No technical jargon in user-facing messages
- [ ] All forms have inline validation with helpful microcopy
- [ ] Status changes are reflected immediately in UI
- [ ] Timeline/audit trail visible on detail views
- [ ] Last Org Admin safety rail prevents self-lockout
- [ ] Mobile-responsive design for all screens

### 3. Performance Targets

| Metric                         | Target |
| ------------------------------ | ------ |
| First Contentful Paint (FCP)   | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI)      | < 3.5s |
| Cumulative Layout Shift (CLS)  | < 0.1  |

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

- All form components with validation
- State management hooks
- Utility functions
- API client methods

### Integration Tests (Vitest + MSW)

- Form submission flows
- API error handling
- Authentication flows

### E2E Tests (Playwright)

| Flow                                                    | Priority |
| ------------------------------------------------------- | -------- |
| Login → Dashboard                                       | P0       |
| Invite User → Accept Invite                             | P0       |
| Change Role → Verify Update                             | P0       |
| Deactivate User (with safety rail)                      | P0       |
| Create Payment → Submit → Approve → Disburse → Complete | P0       |
| Reject Payment → Edit → Re-submit                       | P1       |
| Password Reset Flow                                     | P1       |

---

## 📦 API Contract Dependencies

### MVP1 Endpoints (Backend Required)

| Endpoint                      | Method    | Purpose                   |
| ----------------------------- | --------- | ------------------------- |
| `/auth/login`                 | POST      | User login                |
| `/auth/logout`                | POST      | Session invalidation      |
| `/auth/forgot-password`       | POST      | Password reset request    |
| `/auth/reset-password`        | POST      | Password reset with token |
| `/admin/organization`         | GET/PATCH | Org profile               |
| `/admin/users`                | GET       | User list with filters    |
| `/admin/users/:id`            | GET/PATCH | User detail + updates     |
| `/admin/users/invite`         | POST      | Send invite               |
| `/admin/users/:id/deactivate` | POST      | Deactivate user           |
| `/admin/users/:id/reactivate` | POST      | Reactivate user           |
| `/me`                         | GET/PATCH | Current user profile      |
| `/me/password`                | PATCH     | Change password           |
| `/admin/audit`                | GET       | Audit log                 |

### MVP2 Endpoints (Backend Required)

| Endpoint                 | Method    | Purpose                   |
| ------------------------ | --------- | ------------------------- |
| `/payments`              | GET       | Payment list with filters |
| `/payments`              | POST      | Create payment            |
| `/payments/:id`          | GET/PATCH | Payment detail            |
| `/payments/:id/submit`   | POST      | Submit for approval       |
| `/payments/:id/approve`  | POST      | Approve payment           |
| `/payments/:id/reject`   | POST      | Reject with reason        |
| `/payments/:id/disburse` | POST      | Record disbursement       |
| `/payments/:id/slip`     | POST      | Upload slip               |
| `/payments/:id/comments` | GET/POST  | Comments                  |
| `/payments/:id/timeline` | GET       | Audit timeline            |

---

## 🚦 Risk Mitigation

| Risk                                | Impact | Mitigation                                |
| ----------------------------------- | ------ | ----------------------------------------- |
| Backend API delays                  | High   | Use MSW for mocking, parallel development |
| Scope creep                         | Medium | Strict adherence to GRCD specs            |
| Performance issues with large lists | Medium | Virtual scrolling, pagination             |
| Cross-browser compatibility         | Low    | Early testing on target browsers          |
| Accessibility gaps                  | Medium | Regular audits with axe-core              |

---

## ✅ Definition of Done

A feature is considered **Done** when:

1. ✅ Code is reviewed and merged
2. ✅ Unit tests pass with >80% coverage
3. ✅ E2E tests pass for critical paths
4. ✅ No accessibility violations (axe-core)
5. ✅ Responsive design verified (mobile/tablet/desktop)
6. ✅ Documentation updated
7. ✅ Product owner sign-off

---

## 📊 Resource Requirements

### Team Composition (Recommended)

| Role                | Count | Responsibility                       |
| ------------------- | ----- | ------------------------------------ |
| Frontend Lead       | 1     | Architecture, code review, mentoring |
| Senior Frontend Dev | 2     | Core features, complex components    |
| Frontend Dev        | 2     | Feature development, testing         |
| UI/UX Designer      | 1     | Design system, prototypes            |
| QA Engineer         | 1     | Testing strategy, E2E tests          |

### Tools & Services

- Figma (design)
- GitHub (source control)
- Vercel (deployment)
- Sentry (error tracking)
- Datadog/Grafana (monitoring)

---

_End of Frontend Development Plan_

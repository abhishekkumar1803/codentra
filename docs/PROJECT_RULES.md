# Codentra — Project Rules & Engineering Standards

**Version:** 1.0  
**Last Updated:** 2025-06-25

---

## 1. Purpose

This document defines the engineering standards, conventions, and workflows for the Codentra platform. All contributors (human and AI) must follow these rules to ensure consistency, quality, and scalability.

---

## 2. Architecture Principles

### 2.1 Clean Architecture

- **Domain logic** lives in services, never in controllers or components.
- **Controllers** handle HTTP concerns only (request/response mapping).
- **Repositories** (Prisma) are accessed via services, not directly from controllers.
- **Dependencies point inward:** UI → API Client → Backend Services → Database.

### 2.2 SOLID Principles

| Principle                 | Application                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| **S**ingle Responsibility | One service per domain concern (e.g., `SubscriptionService`, not `UserService` handling payments) |
| **O**pen/Closed           | Extend via new modules/features, not by modifying shared core                                     |
| **L**iskov Substitution   | Interface-based abstractions for external services (Razorpay, Resend, Cloudinary)                 |
| **I**nterface Segregation | Small, focused DTOs and interfaces per use case                                                   |
| **D**ependency Inversion  | Inject dependencies via NestJS DI; mock in tests                                                  |

### 2.3 Feature-Based Architecture

Both frontend and backend organize code by **feature**, not by technical layer.

```
✅ features/auth/
✅ features/subscription/
❌ controllers/, services/, models/ (layer-based)
```

Each feature is self-contained with its own components, hooks, API calls, types, and tests.

### 2.4 Avoid Over-Engineering

- Build for current phase requirements; design interfaces for future scale.
- No premature microservices — monolithic NestJS API until 50k+ users.
- No event bus/Kafka until proven need.
- Use PostgreSQL for everything until read load demands caching layer.

---

## 3. Tech Stack Rules

### 3.1 Frontend (Next.js 15)

| Tool                  | Usage                                                    |
| --------------------- | -------------------------------------------------------- |
| TypeScript            | Strict mode enabled; no `any` without justification      |
| Tailwind CSS          | Utility-first; use `cn()` helper for conditional classes |
| Shadcn UI             | Base component library; extend, don't fork               |
| React Query           | All server state; no fetching in `useEffect`             |
| Zustand               | Client-only UI state (modals, sidebar, theme)            |
| React Hook Form + Zod | All form validation                                      |

### 3.2 Backend (NestJS)

| Tool              | Usage                                |
| ----------------- | ------------------------------------ |
| TypeScript        | Strict mode                          |
| Prisma            | ORM; migrations via `prisma migrate` |
| class-validator   | DTO validation                       |
| class-transformer | Response serialization               |
| Passport + JWT    | Authentication                       |
| @nestjs/throttler | Rate limiting                        |

### 3.3 Infrastructure

| Service         | Purpose             |
| --------------- | ------------------- |
| Vercel          | Frontend hosting    |
| Railway         | Backend hosting     |
| Neon PostgreSQL | Database            |
| Razorpay        | Payments            |
| Cloudinary      | File storage        |
| Resend          | Transactional email |

---

## 4. Feature Requirements Checklist

Every feature **must** include:

- [ ] **Validation** — Input validated on frontend (Zod) and backend (class-validator)
- [ ] **Error Handling** — Typed error responses; user-friendly messages on UI
- [ ] **Loading States** — Skeleton loaders or spinners during async operations
- [ ] **Empty States** — Meaningful UI when no data exists
- [ ] **Logging** — Structured logs on backend; no PII in logs
- [ ] **Proper Typings** — Shared types; no implicit `any`
- [ ] **Tests** — Unit tests for services; integration tests for critical flows

---

## 5. Naming Conventions

### 5.1 General

| Item             | Convention                | Example                        |
| ---------------- | ------------------------- | ------------------------------ |
| Files (frontend) | kebab-case                | `subscription-card.tsx`        |
| Files (backend)  | kebab-case                | `subscription.service.ts`      |
| Components       | PascalCase                | `SubscriptionCard`             |
| Functions        | camelCase                 | `getUserSubscription`          |
| Constants        | SCREAMING_SNAKE           | `MAX_RETRY_COUNT`              |
| Database tables  | snake_case (Prisma @@map) | `contest_participants`         |
| API routes       | kebab-case                | `/api/v1/contest-participants` |
| Environment vars | SCREAMING_SNAKE           | `DATABASE_URL`                 |

### 5.2 NestJS Modules

```
features/
  subscription/
    subscription.module.ts
    subscription.controller.ts
    subscription.service.ts
    dto/
      create-subscription.dto.ts
    guards/
    interfaces/
```

### 5.3 Next.js Routes

```
app/
  (marketing)/
    page.tsx              # Landing
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    dashboard/page.tsx
  (admin)/
    admin/page.tsx
```

---

## 6. API Design Rules

### 6.1 REST Conventions

- Base path: `/api/v1`
- Use nouns, not verbs: `GET /contests`, not `GET /getContests`
- HTTP methods: GET (read), POST (create), PATCH (update), DELETE (remove)
- Pagination: `?page=1&limit=20`
- Sorting: `?sort=createdAt&order=desc`
- Filtering: `?status=ACTIVE&type=DSA`

### 6.2 Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }  // optional
}

// Error
{
  "success": false,
  "error": {
    "code": "SUBSCRIPTION_EXPIRED",
    "message": "Your subscription has expired.",
    "details": []  // validation errors
  }
}
```

### 6.3 HTTP Status Codes

| Code | Usage                     |
| ---- | ------------------------- |
| 200  | Success (GET, PATCH)      |
| 201  | Created (POST)            |
| 204  | No content (DELETE)       |
| 400  | Validation error          |
| 401  | Unauthenticated           |
| 403  | Unauthorized (wrong role) |
| 404  | Not found                 |
| 409  | Conflict (duplicate)      |
| 429  | Rate limited              |
| 500  | Internal server error     |

---

## 7. Authentication & Authorization

### 7.1 Token Strategy

- **Access token:** JWT, 15-minute expiry, sent in `Authorization: Bearer` header.
- **Refresh token:** 7-day expiry, httpOnly secure cookie, rotated on use.
- **Google OAuth:** Authorization code flow; backend exchanges code for tokens.

### 7.2 Role-Based Access Control

| Role     | Permissions                                         |
| -------- | --------------------------------------------------- |
| `USER`   | Dashboard, contests, jobs, referrals, own profile   |
| `MENTOR` | USER permissions + assigned premium service reviews |
| `ADMIN`  | Full platform management                            |

### 7.3 Guards

- `JwtAuthGuard` — All authenticated routes.
- `RolesGuard` — Role-restricted routes.
- `SubscriptionGuard` — Membership-required features (Phase 2+).

---

## 8. Database Rules

- All tables use `uuid` primary keys (`@default(uuid())`).
- All tables have `createdAt` and `updatedAt` timestamps.
- Soft delete via `deletedAt` where applicable (users, contests).
- Foreign keys with explicit `onDelete` behavior documented in `DATABASE.md`.
- Indexes on frequently queried columns (see `DATABASE.md`).
- Migrations are immutable — never edit applied migrations.

---

## 9. Error Handling

### 9.1 Backend

- Use custom exception classes extending `HttpException`.
- Global exception filter maps exceptions to standard response format.
- Log errors with correlation ID; never expose stack traces to clients.

### 9.2 Frontend

- React Query `onError` for toast notifications.
- Error boundaries for unexpected render errors.
- Form-level and field-level validation errors displayed inline.

---

## 10. Logging Standards

### 10.1 Backend (Structured JSON)

```json
{
  "level": "info",
  "timestamp": "2025-06-25T10:00:00Z",
  "correlationId": "uuid",
  "service": "subscription",
  "action": "create_subscription",
  "userId": "uuid",
  "message": "Subscription created successfully"
}
```

### 10.2 What to Log

- Authentication events (login, logout, failed attempts)
- Payment events (created, succeeded, failed, webhook received)
- Admin actions (user ban, contest creation)
- Errors with context

### 10.3 What NOT to Log

- Passwords, tokens, payment card details
- Full request bodies containing PII

---

## 11. Security Checklist

- [ ] All inputs validated and sanitized
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] XSS prevented (React auto-escaping; CSP headers)
- [ ] CSRF protection on cookie-based endpoints
- [ ] Rate limiting on auth and payment endpoints
- [ ] Razorpay webhook signature verification
- [ ] Environment variables for all secrets
- [ ] HTTPS everywhere
- [ ] Dependency vulnerability scanning (npm audit)

---

## 12. Git Workflow

### 12.1 Branching

- `main` — Production-ready code
- `develop` — Integration branch
- `feature/<name>` — Feature branches
- `fix/<name>` — Bug fixes

### 12.2 Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add Google OAuth login
fix(subscription): handle Razorpay webhook retry
docs: update API contract for contests
test(payment): add webhook idempotency tests
```

### 12.3 Pull Requests

- One feature per PR
- Must pass CI (lint, type-check, tests)
- Requires review before merge
- Update `TASKS.md` and `CHANGELOG.md` in the same PR

---

## 13. Testing Standards

| Layer         | Tool             | Coverage Target          |
| ------------- | ---------------- | ------------------------ |
| Backend unit  | Jest             | Services: 80%+           |
| Backend e2e   | Jest + Supertest | Critical flows           |
| Frontend unit | Vitest           | Utils, hooks: 80%+       |
| Frontend e2e  | Playwright       | Auth, subscription flows |

### 13.1 Critical Test Flows

1. User registration (email + Google)
2. Login and token refresh
3. Subscription creation and webhook processing
4. Subscription cancellation
5. Admin user management

---

## 14. Environment Management

### 14.1 Environments

| Environment | Frontend             | Backend                  | Database        |
| ----------- | -------------------- | ------------------------ | --------------- |
| Development | localhost:3000       | localhost:3001           | Local/Neon dev  |
| Staging     | staging.codentra.com | api-staging.codentra.com | Neon staging    |
| Production  | codentra.com         | api.codentra.com         | Neon production |

### 14.2 Environment Files

- `.env.example` — Committed template with placeholder values
- `.env.local` / `.env` — Never committed

---

## 15. Documentation Maintenance

| Document                   | Update When                  |
| -------------------------- | ---------------------------- |
| `PRD.md`                   | Scope or requirements change |
| `DATABASE.md`              | Schema changes               |
| `API_CONTRACT.md`          | Endpoint changes             |
| `TASKS.md`                 | Task status changes          |
| `CHANGELOG.md`             | Every shipped feature/fix    |
| `BACKEND_ARCHITECTURE.md`  | Backend structure changes    |
| `FRONTEND_ARCHITECTURE.md` | Frontend structure changes   |
| `IMPLEMENTATION_PLAN.md`   | Phase timeline changes       |

---

## 16. Per-Feature Implementation Workflow

When building a feature (post-approval):

1. **Database** — Add/update Prisma model; run migration; update `DATABASE.md`
2. **Backend** — Module, controller, service, DTOs, guards; update `API_CONTRACT.md`
3. **Frontend** — Feature folder, pages, components, hooks, API layer
4. **Validation** — Zod schemas (frontend) + class-validator DTOs (backend)
5. **UI States** — Loading, empty, error states
6. **Tests** — Unit + integration tests
7. **Docs** — Update `TASKS.md` and `CHANGELOG.md`

---

## 17. Code Review Checklist

- [ ] Follows feature-based architecture
- [ ] Types are explicit; no unnecessary `any`
- [ ] Validation on both frontend and backend
- [ ] Error handling with user-friendly messages
- [ ] Loading and empty states implemented
- [ ] No secrets in code
- [ ] Tests added for new logic
- [ ] Documentation updated
- [ ] Mobile responsive
- [ ] Accessible (keyboard, screen reader)

---

## 18. Performance Guidelines

- Paginate all list endpoints (default limit: 20, max: 100).
- Use React Query `staleTime` appropriately (e.g., 5 min for user profile).
- Lazy load heavy components (admin charts, code editors).
- Optimize images via Next.js `Image` component and Cloudinary transforms.
- Database queries: select only needed fields; avoid N+1 with Prisma `include`.

---

## 19. Mobile Responsiveness

- Mobile-first Tailwind breakpoints: `sm`, `md`, `lg`, `xl`.
- Touch-friendly tap targets (min 44×44px).
- Collapsible navigation on mobile.
- Test on iOS Safari and Android Chrome.

---

## 20. Approval Gate

**No application code shall be written until architecture documents are approved.**

Upon approval, Phase 1 implementation begins following this document and `IMPLEMENTATION_PLAN.md`.

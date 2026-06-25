# Codentra — Implementation Plan

**Version:** 1.0  
**Last Updated:** 2025-06-25  
**Status:** Pending Approval

---

## 1. Overview

This document outlines the five-phase implementation plan for Codentra. Each phase builds on the previous, delivering incremental value while maintaining production quality.

### 1.1 Principles

- **One feature at a time:** Complete database → backend → frontend → tests → docs for each feature.
- **Phase gates:** Do not start next phase until current phase is fully complete and tested.
- **Quality over speed:** Every feature includes validation, error handling, loading/empty states, logging, and tests.
- **No scope creep:** Features outside the current phase are documented but not implemented.

### 1.2 Timeline Summary

| Phase | Duration | Target Completion | Version |
|-------|----------|-------------------|---------|
| Phase 1 | 6 weeks | Week 6 | v0.1.0 |
| Phase 2 | 6 weeks | Week 12 | v0.2.0 |
| Phase 3 | 6 weeks | Week 18 | v0.3.0 |
| Phase 4 | 6 weeks | Week 24 | v0.4.0 |
| Phase 5 | 6+ weeks | Week 30+ | v1.0.0 |

---

## 2. Phase 1 — Foundation

**Goal:** Ship a functional SaaS foundation with auth, payments, and dashboards.  
**Duration:** 6 weeks  
**Version:** v0.1.0

### 2.1 Deliverables

| # | Feature | Priority |
|---|---------|----------|
| 1 | Project setup (monorepo, CI, env) | P0 |
| 2 | Landing page | P0 |
| 3 | Authentication (email + Google) | P0 |
| 4 | Membership subscription (Razorpay) | P0 |
| 5 | User dashboard | P0 |
| 6 | Admin dashboard | P0 |

### 2.2 Week-by-Week Breakdown

#### Week 1: Project Setup & Landing Page

**Backend:**
- [ ] Initialize NestJS project with TypeScript strict mode
- [ ] Configure Prisma with Neon PostgreSQL
- [ ] Run initial migration (full schema)
- [ ] Set up common module (config, prisma, filters, interceptors, middleware)
- [ ] Health check endpoint
- [ ] Seed script (admin user)

**Frontend:**
- [ ] Initialize Next.js 15 with App Router
- [ ] Configure Tailwind CSS + Shadcn UI
- [ ] Set up shared lib (api-client, query-client, utils)
- [ ] Set up providers (Query, Theme, Auth)
- [ ] Build landing page (hero, features, pricing, footer)
- [ ] Mobile responsive testing
- [ ] SEO metadata

**DevOps:**
- [ ] ESLint + Prettier configuration
- [ ] Husky pre-commit hooks
- [ ] GitHub Actions CI (lint, type-check)
- [ ] `.env.example` files

**Exit Criteria:** Landing page deployed to Vercel preview; backend health check responds.

---

#### Week 2: Authentication (Backend)

**Backend:**
- [ ] Auth module (register, login, logout, refresh)
- [ ] JWT strategy (access + refresh tokens)
- [ ] Google OAuth strategy
- [ ] Password hashing (bcrypt)
- [ ] Forgot/reset password flow (Resend integration)
- [ ] JwtAuthGuard (global) + @Public() decorator
- [ ] RolesGuard + @Roles() decorator
- [ ] Activity log on auth events
- [ ] Rate limiting on auth endpoints
- [ ] Auth unit tests
- [ ] Auth e2e tests

**Exit Criteria:** All auth endpoints functional and tested via Postman/Insomnia.

---

#### Week 3: Authentication (Frontend)

**Frontend:**
- [ ] Auth feature module (components, hooks, api, schemas)
- [ ] Login page (email + Google)
- [ ] Register page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Google OAuth callback page
- [ ] Auth provider (token management, auto-refresh)
- [ ] Next.js middleware (route protection)
- [ ] Form validation (Zod + React Hook Form)
- [ ] Loading and error states
- [ ] Auth e2e tests (Playwright)

**Exit Criteria:** User can register, login (email + Google), logout, reset password.

---

#### Week 4: Subscription & Payments

**Backend:**
- [ ] Subscriptions module (create, verify, cancel, get)
- [ ] Payments module (history, record keeping)
- [ ] Razorpay integration service
- [ ] Webhook handler (idempotent, signature verification)
- [ ] Subscription status management
- [ ] Payment confirmation email (Resend)
- [ ] Activity log on payment events
- [ ] Subscription integration tests

**Frontend:**
- [ ] Subscription feature module
- [ ] Pricing/checkout page with Razorpay modal
- [ ] Subscription status component
- [ ] Cancel subscription dialog
- [ ] Payment history page
- [ ] Loading, empty, error states
- [ ] Subscription e2e tests (Razorpay sandbox)

**Exit Criteria:** User can subscribe for ₹49/month, payment verified, subscription active.

---

#### Week 5: User Dashboard

**Backend:**
- [ ] Users module (profile update, avatar upload)
- [ ] Cloudinary integration for avatar upload
- [ ] GET /auth/me with subscription data

**Frontend:**
- [ ] Dashboard layout (sidebar, header, mobile nav)
- [ ] Dashboard home page (welcome, subscription status, quick links)
- [ ] Profile settings page (name, avatar)
- [ ] Subscription management page
- [ ] Payment history page
- [ ] Empty states (no subscription CTA)
- [ ] Loading skeletons
- [ ] Mobile responsive dashboard

**Exit Criteria:** Authenticated user has a functional dashboard with profile and subscription management.

---

#### Week 6: Admin Dashboard & Phase 1 Polish

**Backend:**
- [ ] Admin module (metrics, user list, user detail, subscriptions, payments)
- [ ] Activity logs module (query, filter)
- [ ] Admin endpoints with RolesGuard

**Frontend:**
- [ ] Admin layout with role check
- [ ] Admin overview (metrics cards)
- [ ] Users list (search, filter, paginate)
- [ ] User detail page
- [ ] Subscriptions list
- [ ] Payments list
- [ ] Activity logs page
- [ ] Admin e2e tests

**Polish:**
- [ ] End-to-end testing of all Phase 1 flows
- [ ] Bug fixes and UX improvements
- [ ] Performance audit (Lighthouse)
- [ ] Security review
- [ ] Deploy to production (Vercel + Railway + Neon)
- [ ] Update TASKS.md and CHANGELOG.md

**Exit Criteria:** Phase 1 complete. Admin can manage users. Production deployment live.

---

### 2.3 Phase 1 Dependencies

```
Project Setup
    ├── Landing Page
    ├── Auth (Backend) → Auth (Frontend)
    │       └── Subscription (requires auth)
    │               └── User Dashboard (requires auth + subscription)
    │                       └── Admin Dashboard (requires auth + admin role)
```

### 2.4 Phase 1 Success Criteria

- [ ] Landing page loads in < 2s on 4G
- [ ] User can register and login (email + Google)
- [ ] User can subscribe and cancel subscription
- [ ] User dashboard shows profile and subscription status
- [ ] Admin dashboard shows metrics and user management
- [ ] All Phase 1 endpoints documented in API_CONTRACT.md
- [ ] E2E tests pass for critical flows
- [ ] Deployed to production

---

## 3. Phase 2 — Core Engagement

**Goal:** Drive user engagement with contests, quizzes, and leaderboards.  
**Duration:** 6 weeks (Weeks 7–12)  
**Version:** v0.2.0

### 3.1 Deliverables

| # | Feature | Priority |
|---|---------|----------|
| 1 | Contest module (DSA, CP, Quiz) | P0 |
| 2 | Contest participation flow | P0 |
| 3 | Leaderboards (contest + global) | P0 |
| 4 | Notifications (in-app + email) | P1 |
| 5 | Subscription guard for contests | P0 |
| 6 | Admin contest management | P0 |

### 3.2 Week-by-Week Breakdown

#### Week 7–8: Contests (Backend + Frontend)
- Contest CRUD (admin)
- Contest listing with filters (type, status)
- Contest detail page
- Join contest flow
- Participant tracking
- Contest status lifecycle (DRAFT → SCHEDULED → LIVE → ENDED)

#### Week 9: Quizzes
- Quiz-specific contest type
- MCQ question structure (metadata JSON)
- Quiz submission and scoring
- Quiz results page

#### Week 10: Leaderboards
- Leaderboard service (compute ranks after contest)
- Global leaderboards (weekly, monthly, all-time)
- Contest-specific leaderboards
- Leaderboard pages with pagination

#### Week 11: Notifications
- Notification module (create, list, mark read)
- In-app notification bell + dropdown
- Email notifications for contest reminders (Resend)
- Notification preferences (future)

#### Week 12: Polish & Deploy
- SubscriptionGuard on contest endpoints
- Admin contest management UI
- E2E tests for contest flows
- Performance testing with simulated load
- Deploy v0.2.0

### 3.3 Phase 2 Success Criteria

- [ ] User with active subscription can join contests
- [ ] Leaderboards update after contest ends
- [ ] Notifications delivered for contest events
- [ ] Admin can create and manage contests

---

## 4. Phase 3 — Career & Community

**Goal:** Add career-focused features for job discovery and referrals.  
**Duration:** 6 weeks (Weeks 13–18)  
**Version:** v0.3.0

### 4.1 Deliverables

| # | Feature | Priority |
|---|---------|----------|
| 1 | Jobs board | P0 |
| 2 | Referral board | P0 |
| 3 | System design challenges | P1 |
| 4 | Admin job management | P0 |

### 4.2 Week-by-Week Breakdown

#### Week 13–14: Jobs Board
- Jobs module (CRUD, list, filter, search)
- Jobs listing page with filters (remote, company, search)
- Job detail page with apply link
- Admin job creation and management

#### Week 15–16: Referral Board
- Referrals module (CRUD, list, filter)
- Referral listing page
- Create referral form
- Close/manage own referrals
- Admin moderation

#### Week 17: System Design Challenges
- System design contest type
- Submission flow (text/diagram upload via Cloudinary)
- Peer review mechanism (basic)

#### Week 18: Polish & Deploy
- E2E tests for jobs and referrals
- Deploy v0.3.0

### 4.3 Phase 3 Success Criteria

- [ ] Users can browse and filter jobs
- [ ] Users can post and manage referrals
- [ ] System design challenges available
- [ ] Admin can manage jobs

---

## 5. Phase 4 — Premium Services

**Goal:** Launch monetizable premium career services.  
**Duration:** 6 weeks (Weeks 19–24)  
**Version:** v0.4.0

### 5.1 Deliverables

| # | Feature | Priority |
|---|---------|----------|
| 1 | Resume review service | P0 |
| 2 | Mock interview booking | P0 |
| 3 | Career guidance call booking | P0 |
| 4 | LinkedIn review service | P1 |
| 5 | Premium services dashboard | P0 |
| 6 | Mentor assignment workflow | P1 |

### 5.2 Week-by-Week Breakdown

#### Week 19–20: Resume & LinkedIn Review
- Resume review service (upload, payment, review workflow)
- LinkedIn review service
- Cloudinary integration for resume upload
- Reviewer assignment (admin/mentor)
- Feedback delivery

#### Week 21–22: Mock Interview & Career Call
- Mock interview booking (schedule, payment, meeting link)
- Career guidance call booking
- Calendar/scheduling UI
- Email confirmations and reminders

#### Week 23: Premium Dashboard
- User services page (all bookings, status tracking)
- Service status components (pending, scheduled, completed)
- Payment integration for each service type

#### Week 24: Polish & Deploy
- Mentor role and basic mentor view
- E2E tests for premium flows
- Deploy v0.4.0

### 5.3 Phase 4 Success Criteria

- [ ] Users can purchase and track all premium services
- [ ] Payment flow works for each service type
- [ ] Mentors can view assigned services
- [ ] Email notifications for service status changes

---

## 6. Phase 5 — Scale & Polish

**Goal:** Optimize for scale, add advanced features, prepare for 100k users.  
**Duration:** 6+ weeks (Weeks 25–30+)  
**Version:** v1.0.0

### 6.1 Deliverables

| # | Feature | Priority |
|---|---------|----------|
| 1 | Redis caching (leaderboards) | P1 |
| 2 | Advanced analytics dashboard | P1 |
| 3 | Mentor portal | P1 |
| 4 | PWA support | P2 |
| 5 | Performance optimization | P0 |
| 6 | Security audit | P0 |
| 7 | Load testing (100k users) | P0 |

### 6.2 Key Activities

#### Week 25–26: Performance & Caching
- Redis integration for leaderboard caching
- Database query optimization
- API response caching
- Frontend bundle optimization
- Image CDN optimization

#### Week 27–28: Analytics & Mentor Portal
- Advanced admin analytics (charts, trends, cohort analysis)
- Mentor portal (assigned services, schedule, feedback)
- User growth tracking

#### Week 29: Security & Load Testing
- OWASP security audit
- Penetration testing
- Load testing with k6 (simulate 10k concurrent users)
- Fix identified issues

#### Week 30+: Launch Preparation
- PWA manifest and service worker
- Final bug fixes
- Documentation review
- Production hardening
- v1.0.0 release

### 6.3 Phase 5 Success Criteria

- [ ] API handles 10k concurrent users
- [ ] Lighthouse performance score ≥ 90
- [ ] Security audit passed
- [ ] Mentor portal functional
- [ ] v1.0.0 released to production

---

## 7. Per-Feature Implementation Workflow

For every feature in every phase, follow this sequence:

```
1. Database Model
   ├── Update prisma/schema.prisma (if needed)
   ├── Run migration
   └── Update DATABASE.md

2. Backend API
   ├── Create feature module
   ├── Controller + Service + DTOs
   ├── Guards and validation
   ├── Unit tests
   └── Update API_CONTRACT.md

3. Frontend UI
   ├── Create feature folder
   ├── API layer + React Query hooks
   ├── Components with all states
   ├── Page(s)
   └── Zod schemas

4. Quality Assurance
   ├── Validation (frontend + backend)
   ├── Error handling
   ├── Loading states
   ├── Empty states
   ├── Logging
   ├── E2E tests (critical flows)
   └── Mobile responsive check

5. Documentation
   ├── Update TASKS.md (mark complete)
   └── Update CHANGELOG.md
```

---

## 8. Risk Register

| Risk | Phase | Impact | Mitigation |
|------|-------|--------|------------|
| Razorpay integration delays | 1 | High | Week 1 spike; sandbox testing |
| Google OAuth approval delays | 1 | Medium | Email auth as primary; Google as enhancement |
| Contest content scarcity | 2 | Medium | Admin tools ready; seed 5 contests before launch |
| Mentor availability | 4 | Medium | Start with admin-as-mentor; recruit mentors in Phase 3 |
| Database performance at scale | 5 | Medium | Indexes designed upfront; read replicas at 10k users |
| Scope creep | All | High | Strict phase gates; PRD change control process |

---

## 9. Team & Responsibilities

| Role | Responsibility |
|------|---------------|
| Lead Architect / CTO | Architecture decisions, code review, documentation |
| Backend Developer | NestJS modules, Prisma, integrations |
| Frontend Developer | Next.js pages, components, state management |
| DevOps | CI/CD, deployment, monitoring |
| QA | E2E tests, manual testing, bug reports |

*Note: In early stages, one developer may cover multiple roles.*

---

## 10. Definition of Done

A feature is **done** when:

- [ ] Database model created and migrated
- [ ] Backend API implemented with validation and error handling
- [ ] Frontend UI implemented with loading, empty, and error states
- [ ] Typed end-to-end (no `any` without justification)
- [ ] Structured logging on backend
- [ ] Unit tests for service logic
- [ ] E2E test for critical user flow (where applicable)
- [ ] Mobile responsive
- [ ] `API_CONTRACT.md` updated
- [ ] `TASKS.md` updated
- [ ] `CHANGELOG.md` updated
- [ ] Code reviewed and merged

A phase is **done** when all its features meet the Definition of Done and success criteria are met.

---

## 11. Approval Required

**This implementation plan requires approval before any code is written.**

Upon approval:
1. Phase 1, Week 1 begins immediately.
2. Project setup and landing page are the first deliverables.
3. Weekly progress updates via `TASKS.md`.
4. Phase gate reviews before proceeding to next phase.

---

## 12. Post-Approval First Steps

1. Initialize backend (`nest new backend`)
2. Initialize frontend (`npx create-next-app@latest frontend`)
3. Copy `prisma/schema.prisma` to backend
4. Configure environment variables
5. Run initial migration
6. Begin landing page development

**Estimated time to first deployable preview:** 5–7 days.

# Codentra — Task Tracker

**Last Updated:** 2025-06-25 (Phase 1 — Subscription complete)

---

## Status Legend

| Status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in_progress` | Currently being worked on |
| `completed` | Done and verified |
| `blocked` | Waiting on dependency |

---

## Phase 0 — Architecture & Planning

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-01 | Write PRD.md | completed | v1.0 |
| P0-02 | Write PROJECT_RULES.md | completed | v1.0 |
| P0-03 | Write DATABASE.md | completed | Full schema documented |
| P0-04 | Create prisma/schema.prisma | completed | All entities defined |
| P0-05 | Write API_CONTRACT.md | completed | Phase 1 endpoints defined |
| P0-06 | Write BACKEND_ARCHITECTURE.md | completed | |
| P0-07 | Write FRONTEND_ARCHITECTURE.md | completed | |
| P0-08 | Write IMPLEMENTATION_PLAN.md | completed | |
| P0-09 | Stakeholder approval | completed | Phase 1 started |

---

## Phase 1 — Foundation (Weeks 1–6)

### 1.1 Project Setup

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-01 | Initialize NestJS backend monorepo | completed | apps/api |
| P1-02 | Initialize Next.js 15 frontend | completed | apps/web |
| P1-03 | Configure Prisma + Neon connection | completed | Schema in apps/api/prisma |
| P1-04 | Run initial database migration | pending | Requires DATABASE_URL |
| P1-05 | Configure ESLint, Prettier, Husky | completed | |
| P1-06 | Set up CI pipeline (lint, type-check, test) | pending | |
| P1-07 | Create .env.example files | completed | |
| P1-08 | Seed development data (admin user) | pending | After migration |

### 1.2 Landing Page

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-10 | Design landing page layout | completed | Hero, features, pricing, CTA |
| P1-11 | Build hero section | completed | |
| P1-12 | Build features section | completed | 8 feature cards |
| P1-13 | Build pricing section | completed | ₹49/month plan |
| P1-14 | Build footer (links, social) | completed | |
| P1-15 | Mobile responsive testing | completed | Mobile-first Tailwind |
| P1-16 | SEO metadata and Open Graph | completed | |
| P1-17 | Landing page tests | pending | |

### 1.3 Authentication

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-20 | Auth module (backend) | completed | Register, login, refresh, logout |
| P1-21 | JWT strategy + guards | completed | Access + refresh tokens |
| P1-22 | Google OAuth integration | completed | Backend + frontend callback |
| P1-23 | Email/password registration | completed | bcrypt hashing |
| P1-24 | Forgot/reset password flow | completed | Dev token logging (Resend pending) |
| P1-25 | Auth pages (login, register) | completed | Forms with Zod validation |
| P1-26 | Auth callback page (Google) | completed | /callback/google |
| P1-27 | Protected route middleware | completed | Next.js middleware |
| P1-28 | Auth API client (React Query) | completed | Token refresh on 401 |
| P1-29 | Auth Zustand store (UI state) | completed | Session persist + cookie sync |
| P1-30 | Auth e2e tests | pending | |

### 1.4 Membership Subscription

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-40 | Subscription module (backend) | completed | Create, cancel, get me |
| P1-41 | Razorpay integration service | completed | Mock mode for local dev |
| P1-42 | Payment module (backend) | completed | GET /payments/me |
| P1-43 | Webhook handler (idempotent) | completed | webhook_events table |
| P1-44 | Subscription verification endpoint | cancelled | Webhook-authoritative (per arch review) |
| P1-45 | Subscription cancellation | completed | |
| P1-46 | Pricing/checkout page (frontend) | completed | /subscribe + Razorpay modal |
| P1-47 | Subscription status component | completed | |
| P1-48 | Payment confirmation email (Resend) | pending | |
| P1-49 | Subscription integration tests | pending | |

### 1.5 User Dashboard

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-50 | Dashboard layout (sidebar, header) | pending | |
| P1-51 | Dashboard home page | pending | Profile, subscription, activity |
| P1-52 | Profile settings page | pending | Name, avatar upload |
| P1-53 | Subscription management page | pending | View, cancel |
| P1-54 | Payment history page | pending | |
| P1-55 | Empty states (no subscription) | pending | CTA to subscribe |
| P1-56 | Loading skeletons | pending | |
| P1-57 | Dashboard responsive design | pending | |

### 1.6 Admin Dashboard

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-60 | Admin module (backend) | pending | Metrics, user management |
| P1-61 | RolesGuard (ADMIN only) | pending | |
| P1-62 | Activity log service | pending | |
| P1-63 | Admin layout (frontend) | pending | |
| P1-64 | Admin overview page (metrics) | pending | Users, revenue, churn |
| P1-65 | Admin users list page | pending | Search, filter, paginate |
| P1-66 | Admin user detail page | pending | Subscription, payments |
| P1-67 | Admin subscriptions page | pending | |
| P1-68 | Admin payments page | pending | |
| P1-69 | Admin activity logs page | pending | |
| P1-70 | Admin route protection | pending | |

---

## Phase 2 — Core Engagement (Weeks 7–12)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P2-01 | Contest module (backend) | pending | CRUD, join, participants |
| P2-02 | Contest listing & detail pages | pending | |
| P2-03 | Quiz module | pending | |
| P2-04 | Leaderboard service | pending | |
| P2-05 | Leaderboard pages | pending | |
| P2-06 | Notification module | pending | |
| P2-07 | Notification UI (bell, list) | pending | |
| P2-08 | SubscriptionGuard for contests | pending | |
| P2-09 | Admin contest management | pending | |

---

## Phase 3 — Career & Community (Weeks 13–18)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-01 | Jobs module (backend) | pending | |
| P3-02 | Jobs board pages | pending | |
| P3-03 | Referrals module (backend) | pending | |
| P3-04 | Referrals board pages | pending | |
| P3-05 | System design challenges | pending | |
| P3-06 | Admin job management | pending | |

---

## Phase 4 — Premium Services (Weeks 19–24)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P4-01 | Resume review service | pending | |
| P4-02 | Mock interview service | pending | |
| P4-03 | Career call service | pending | |
| P4-04 | LinkedIn review service | pending | |
| P4-05 | Cloudinary file upload integration | pending | |
| P4-06 | Premium services UI | pending | |
| P4-07 | Mentor assignment workflow | pending | |

---

## Phase 5 — Scale & Polish (Weeks 25+)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P5-01 | Redis caching (leaderboards) | pending | |
| P5-02 | Advanced analytics dashboard | pending | |
| P5-03 | Mentor portal | pending | |
| P5-04 | PWA support | pending | |
| P5-05 | Performance optimization | pending | |
| P5-06 | Security audit | pending | |

---

## Current Sprint

**Sprint:** Phase 1 — Foundation  
**Goal:** Landing Page ✅ → Authentication ✅ → Subscription ✅ → Dashboards (next)  
**Blockers:** None

---

## Notes

- Update this file after completing each feature.
- Mark tasks `in_progress` when starting work.
- Link PR numbers in Notes column when applicable.

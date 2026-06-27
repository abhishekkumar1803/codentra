# Codentra — Task Tracker

**Last Updated:** 2026-06-27 (Staging Judge0 setup)

---

## Feedback Polish (Pre–Phase 5)

| ID    | Task                                                | Status    | Notes                               |
| ----- | --------------------------------------------------- | --------- | ----------------------------------- |
| FB-01 | Landing animations + scrolling code hero background | completed | Marquee panels, scroll-reveal cards |
| FB-02 | Smooth scroll + animated UI polish                  | completed | globals.css                         |
| FB-03 | Auth-aware navbar (no Login when logged in)         | completed | sessionReady + hydration fix        |
| FB-04 | Leaderboard by contest filter                       | completed | /leaderboards → By contest          |
| FB-05 | Hide/show problem + full-width editor               | completed | Problem solver CTA                  |
| FB-06 | Profile rating graphs (Codeforces-style)            | completed | DSA + CP charts                     |
| FB-07 | Codentra rating tiers (DSA + CP separate)           | completed | Starter→Legend, Rookie→Champion     |
| FB-08 | Submission code + verdict details view              | completed | AC/WA with test case info           |
| FB-09 | Starter template only on open (not old solution)    | completed | Explicit init from starterCode      |
| FB-10 | Hidden test cases + reveal after contest ends       | completed | verdictDetails + allTestCases       |
| FB-11 | Failed sample test case shown on WA                 | completed | Run/submit feedback                 |
| FB-12 | Admin contest problem + test case manager           | completed | DSA/CP admin form section           |

## Status Legend

| Status        | Meaning                   |
| ------------- | ------------------------- |
| `pending`     | Not started               |
| `in_progress` | Currently being worked on |
| `completed`   | Done and verified         |
| `blocked`     | Waiting on dependency     |

---

## Screenshot Parity Phases (from prior build)

| Phase  | Scope                                                                | Status    |
| ------ | -------------------------------------------------------------------- | --------- |
| **3A** | Marketing: FAQ, /pricing, auth-aware navbar & hero, footer links     | completed |
| **3B** | Dashboard UX: full sidebar, DSA/CP ratings, global rank, quick links | completed |
| **3C** | DSA coding: problems schema, judge (mock), solver UI, submissions    | completed |
| **4**  | Premium services: catalog, booking, /services + My bookings          | completed |
| **5**  | Mentor portal, employer placeholder, contest standings polish        | completed |

---

## Phase 0 — Architecture & Planning

| ID    | Task                           | Status    | Notes                     |
| ----- | ------------------------------ | --------- | ------------------------- |
| P0-01 | Write PRD.md                   | completed | v1.0                      |
| P0-02 | Write PROJECT_RULES.md         | completed | v1.0                      |
| P0-03 | Write DATABASE.md              | completed | Full schema documented    |
| P0-04 | Create prisma/schema.prisma    | completed | All entities defined      |
| P0-05 | Write API_CONTRACT.md          | completed | Phase 1 endpoints defined |
| P0-06 | Write BACKEND_ARCHITECTURE.md  | completed |                           |
| P0-07 | Write FRONTEND_ARCHITECTURE.md | completed |                           |
| P0-08 | Write IMPLEMENTATION_PLAN.md   | completed |                           |
| P0-09 | Stakeholder approval           | completed | Phase 1 started           |

---

## Phase 1 — Foundation (Weeks 1–6)

### 1.1 Project Setup

| ID    | Task                                        | Status    | Notes                                                |
| ----- | ------------------------------------------- | --------- | ---------------------------------------------------- |
| P1-01 | Initialize NestJS backend monorepo          | completed | apps/api                                             |
| P1-02 | Initialize Next.js 15 frontend              | completed | apps/web                                             |
| P1-03 | Configure Prisma + Neon connection          | completed | Schema in apps/api/prisma                            |
| P1-04 | Run initial database migration              | completed | `pnpm db:push` (dev workflow)                        |
| P1-05 | Configure ESLint, Prettier, Husky           | completed |                                                      |
| P1-06 | Set up CI pipeline (lint, type-check, test) | completed | `.github/workflows/ci.yml`                           |
| P1-07 | Create .env.example files                   | completed |                                                      |
| P1-08 | Seed development data (admin user)          | completed | `pnpm db:seed` — admin + demo users, sample contests |

### 1.2 Landing Page

| ID     | Task                                  | Status    | Notes                                    |
| ------ | ------------------------------------- | --------- | ---------------------------------------- |
| P1-10  | Design landing page layout            | completed | Hero, features, pricing, CTA             |
| P1-11  | Build hero section                    | completed |                                          |
| P1-12  | Build features section                | completed | 8 feature cards                          |
| P1-13  | Build pricing section                 | completed | ₹49/month plan                           |
| P1-14  | Build footer (links, social)          | completed |                                          |
| P1-15  | Mobile responsive testing             | completed | Mobile-first Tailwind                    |
| P1-16  | SEO metadata and Open Graph           | completed |                                          |
| P1-17  | Landing page tests                    | completed | Vitest unit tests for features constants |
| P3A-01 | FAQ page (/faq)                       | completed | Accordion matching prior build           |
| P3A-02 | Standalone pricing page (/pricing)    | completed | Membership + premium services cards      |
| P3A-03 | Auth-aware marketing navbar           | completed | Dashboard + Contests when logged in      |
| P3A-04 | Personalized hero for logged-in users | completed | Welcome back + Continue Competing CTA    |

### 1.3 Authentication

| ID    | Task                          | Status    | Notes                                                |
| ----- | ----------------------------- | --------- | ---------------------------------------------------- |
| P1-20 | Auth module (backend)         | completed | Register, login, refresh, logout                     |
| P1-21 | JWT strategy + guards         | completed | Access + refresh tokens                              |
| P1-22 | Google OAuth integration      | completed | Backend + frontend callback                          |
| P1-23 | Email/password registration   | completed | bcrypt hashing                                       |
| P1-24 | Forgot/reset password flow    | completed | Dev token logging (Resend pending)                   |
| P1-25 | Auth pages (login, register)  | completed | Forms with Zod validation                            |
| P1-26 | Auth callback page (Google)   | completed | /callback/google                                     |
| P1-27 | Protected route middleware    | completed | Next.js middleware                                   |
| P1-28 | Auth API client (React Query) | completed | Token refresh on 401                                 |
| P1-29 | Auth Zustand store (UI state) | completed | Session persist + cookie sync                        |
| P1-30 | Auth e2e tests                | completed | Jest unit tests (hash.util); Playwright e2e deferred |

### 1.4 Membership Subscription

| ID    | Task                                | Status    | Notes                                   |
| ----- | ----------------------------------- | --------- | --------------------------------------- |
| P1-40 | Subscription module (backend)       | completed | Create, cancel, get me                  |
| P1-41 | Razorpay integration service        | completed | Mock mode for local dev                 |
| P1-42 | Payment module (backend)            | completed | GET /payments/me                        |
| P1-43 | Webhook handler (idempotent)        | completed | webhook_events table                    |
| P1-44 | Subscription verification endpoint  | cancelled | Webhook-authoritative (per arch review) |
| P1-45 | Subscription cancellation           | completed |                                         |
| P1-46 | Pricing/checkout page (frontend)    | completed | /subscribe + Razorpay modal             |
| P1-47 | Subscription status component       | completed |                                         |
| P1-48 | Payment confirmation email (Resend) | completed | EmailService with RESEND_MOCK dev mode  |
| P1-49 | Subscription integration tests      | completed | Jest unit tests for SubscriptionService |

### 1.5 User Dashboard

| ID     | Task                                               | Status    | Notes                             |
| ------ | -------------------------------------------------- | --------- | --------------------------------- |
| P1-50  | Dashboard layout (sidebar, header)                 | completed | Collapsible mobile sidebar        |
| P1-51  | Dashboard home page                                | completed | Stats + subscription overview     |
| P1-52  | Profile settings page                              | completed | Bio, skills, social links, avatar |
| P1-53  | Subscription management page                       | completed | /dashboard/settings/subscription  |
| P1-54  | Payment history page                               | completed | In subscription settings          |
| P1-55  | Empty states (no subscription)                     | completed | CTA on dashboard + checkout       |
| P1-56  | Loading skeletons                                  | completed | Skeleton component                |
| P1-57  | Dashboard responsive design                        | completed | Mobile-first sidebar              |
| P3B-01 | Full sidebar nav (Quizzes, Services, Back to site) | completed | Match prior build                 |
| P3B-02 | DSA/CP ratings + global rank on dashboard          | completed | Profile ratings + leaderboard     |
| P3B-03 | Quick links card on dashboard                      | completed |                                   |
| P3B-04 | Leaderboard filter labels (Global, This month)     | completed |                                   |

### 1.6 Admin Dashboard

| ID    | Task                          | Status    | Notes                                             |
| ----- | ----------------------------- | --------- | ------------------------------------------------- |
| P1-60 | Admin module (backend)        | completed | Dashboard metrics, users, subscriptions, payments |
| P1-61 | RolesGuard (ADMIN only)       | completed | Used on all /admin/\* endpoints                   |
| P1-62 | Activity log service          | completed | Logs auth + admin actions                         |
| P1-63 | Admin layout (frontend)       | completed | /admin layout with nav tabs                       |
| P1-64 | Admin overview page (metrics) | completed | /admin — users, revenue, churn                    |
| P1-65 | Admin users list page         | completed | Search, filter, paginate                          |
| P1-66 | Admin user detail page        | completed | Subscription, payments, role toggle               |
| P1-67 | Admin subscriptions page      | completed | /admin/subscriptions                              |
| P1-68 | Admin payments page           | completed | /admin/payments                                   |
| P1-69 | Admin activity logs page      | completed | /admin/activity-logs                              |
| P1-70 | Admin route protection        | completed | AdminGuard + middleware auth                      |

---

## Phase 2 — Core Engagement (Weeks 7–12)

| ID     | Task                                      | Status    | Notes                                             |
| ------ | ----------------------------------------- | --------- | ------------------------------------------------- |
| P2-01  | Contest module (backend)                  | completed | List, detail, join, participants, admin CRUD      |
| P2-02  | Contest listing & detail pages            | completed | /contests list + filters, detail + register       |
| P2-03  | Quiz module                               | completed | Schema, API, admin CRUD, take + results pages     |
| P2-04  | Leaderboard service                       | completed | Global weekly/monthly/all-time + contest-specific |
| P2-05  | Leaderboard pages                         | completed | /leaderboards with period filters + my rank       |
| P2-06  | Notification module                       | completed | List, mark read, mark all read                    |
| P2-07  | Notification UI (bell, list)              | completed | Header bell dropdown with unread badge            |
| P2-08  | SubscriptionGuard for contests            | completed | @RequireSubscription on join + quiz endpoints     |
| P2-09  | Admin contest management                  | completed | /admin/contests CRUD + quiz question editor       |
| P3C-01 | Problem + test case + submission schema   | completed | Prisma models                                     |
| P3C-02 | Problems API (run, submit, list)          | completed | Mock judge for local dev                          |
| P3C-03 | Contest detail problems list              | completed |                                                   |
| P3C-04 | Problem solver page (editor, run, submit) | completed | /contests/[slug]/problems/[problemSlug]           |
| P3C-05 | Submission history on problem page        | completed |                                                   |
| P3C-06 | Seed Sum Two Numbers DSA problem          | completed | Weekly DSA Challenge contest                      |

---

## Phase 3 — Career & Community (Weeks 13–18)

| ID    | Task                       | Status    | Notes                                           |
| ----- | -------------------------- | --------- | ----------------------------------------------- |
| P3-01 | Jobs module (backend)      | completed | GET /jobs, GET /jobs/:id, admin CRUD            |
| P3-02 | Jobs board pages           | completed | /jobs list + filters, /jobs/[id] detail         |
| P3-03 | Referrals module (backend) | completed | CRUD + /referrals/me                            |
| P3-04 | Referrals board pages      | completed | /referrals board, /referrals/new                |
| P3-05 | System design challenges   | completed | Submission flow, /contests/[slug]/system-design |
| P3-06 | Admin job management       | completed | /admin/jobs CRUD                                |

---

## Phase 4 — Premium Services (Weeks 19–24)

| ID    | Task                               | Status    | Notes                                 |
| ----- | ---------------------------------- | --------- | ------------------------------------- |
| P4-01 | Resume review service              | completed | Backend + mock booking flow           |
| P4-02 | Mock interview service             | completed |                                       |
| P4-03 | Career call service                | completed |                                       |
| P4-04 | LinkedIn review service            | completed |                                       |
| P4-05 | Cloudinary file upload integration | completed | Avatar upload; resume URL in booking  |
| P4-06 | Premium services UI (/services)    | completed | Booking modal with details + payment  |
| P4-07 | Mentor assignment workflow         | pending   | Admin assigns mentor (manual for now) |
| P4-08 | My bookings page                   | completed | /services/bookings                    |

---

## Phase 5 — Scale & Polish (Weeks 25+)

| ID    | Task                                    | Status    | Notes                  |
| ----- | --------------------------------------- | --------- | ---------------------- |
| P5-01 | Redis caching (leaderboards)            | pending   |                        |
| P5-02 | Advanced analytics dashboard            | pending   |                        |
| P5-03 | Mentor portal (/mentor)                 | completed | Assigned sessions view |
| P5-04 | PWA support                             | pending   |                        |
| P5-05 | Performance optimization                | pending   |                        |
| P5-06 | Security audit                          | pending   |                        |
| P5-07 | Employer portal placeholder (/employer) | completed | Coming soon page       |

---

## Staging Environment (prod mirror)

| ID     | Task                                      | Status      | Notes                                              |
| ------ | ----------------------------------------- | ----------- | -------------------------------------------------- |
| STG-01 | Neon staging DB + migrate deploy          | in_progress | Railway `railway-start.sh` runs migrations       |
| STG-02 | Railway API deploy                        | in_progress | Dockerfile + `railway.toml`                        |
| STG-03 | Vercel web (`codentra-web.vercel.app`)    | in_progress | `NEXT_PUBLIC_API_URL` → Railway                    |
| STG-04 | Upstash Redis on Railway                  | in_progress | Async submission queue                             |
| STG-05 | Judge0 VM + Railway env vars              | in_progress | See `docs/JUDGE0_STAGING_SETUP.md`                 |
| STG-06 | One-time `db:seed` on staging Neon        | pending     | Never run in production                            |
| STG-07 | Razorpay test mode (replace mock)         | in_progress | See `docs/RAZORPAY_STAGING_SETUP.md`               |
| STG-08 | CI deploy-staging + smoke tests           | pending     | `.github/workflows/deploy-staging.yml`             |

---

## Current Sprint

**Sprint:** Staging prod mirror — Payments (Razorpay test mode)  
**Goal:** Wire Razorpay test keys + webhook on Railway; verify /subscribe checkout on Vercel  
**Blockers:** None — code is built; needs Razorpay dashboard + env vars

### Feedback round 2 (completed)

| Item                             | Status    | Notes                                          |
| -------------------------------- | --------- | ---------------------------------------------- |
| Services booking popup           | completed | Modal form per service type → pay & book       |
| Quizzes separate from contests   | completed | `/quizzes` page; contests exclude QUIZ type    |
| LeetCode-style judging           | completed | Pretest/hidden verdicts, TLE, no hidden reveal |
| Landing hero subtitle contrast   | completed | Backdrop panel on subtitle text                |
| Leaderboards Global + By contest | completed | Removed weekly/monthly sub-filters             |
| Profile contest activity graph   | completed | Bar chart + GET /users/me/contest-history      |
| Referrals actionable UX          | completed | Express interest, details, company filters     |

---

## Notes

- Update this file after completing each feature.
- Mark tasks `in_progress` when starting work.
- Link PR numbers in Notes column when applicable.
- **Seed credentials:** `admin@codentra.dev` / `Admin123!` (ADMIN), `demo@codentra.dev` / `Admin123!` (USER with subscription)

# Codentra — Changelog

All notable changes to the Codentra platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **Judge0 staging deploy** — `infra/judge0/deploy-staging.sh`, `smoke-test.sh`, `judge0.staging.conf.example`, and `docs/JUDGE0_STAGING_SETUP.md` (Oracle free + Hetzner VM, Railway env wiring).
- **LeetCode-style contest judge** — Monaco editor, Judge0 CE (env-based `JUDGE0_API_URL`), local Docker stack at `infra/judge0`, BullMQ async submissions.
- **Feedback polish** — Animated landing (scrolling code hero, scroll-reveal), auth session fix for navbar, contest leaderboard filter, Codentra rating tiers + history graphs on profile, problem solver improvements (starter-only code, hidden test cases, verdict details), admin problem/test-case manager for DSA/CP contests.
- **Screenshot parity rebuild** — FAQ (/faq), pricing (/pricing), auth-aware marketing navbar/hero/CTA, full dashboard sidebar (Quizzes, Services, Mentor, Employer, Back to site).
- **Dashboard ratings** — DSA/CP ratings on profile, global rank on overview, quick links card.
- **DSA problem solving** — Problem/test case/submission schema, mock judge, `/contests/[slug]/problems/[problemSlug]` solver with run/submit and submission history; seed "Sum Two Numbers" on Weekly DSA Challenge.
- **Premium services** — Services module (catalog, book, my bookings), `/services` and `/services/bookings` pages with mock Razorpay payment.
- **Mentor portal** — GET /mentor/assignments, `/mentor` dashboard for MENTOR/ADMIN roles.
- **Employer placeholder** — `/employer` coming-soon page for admins.
- **Phase 1 — Landing Page** — Hero, features (8 cards), pricing (₹49/month), CTA, navbar, footer, SEO metadata.
- **Phase 1 — Authentication (backend)** — NestJS auth module with register, login, Google OAuth, JWT access + refresh tokens (httpOnly cookie), forgot/reset password, global guards/filters/interceptors.
- **Phase 1 — Authentication (frontend)** — Login, register, forgot/reset password pages; Google OAuth callback; React Query hooks; Zustand auth store; API client with auto-refresh; route middleware.
- **Phase 1 — Membership Subscription** — Razorpay integration (mock mode for dev), subscription/payment modules, idempotent webhooks, /subscribe checkout page, subscription status component.
- **Phase 1 — User Dashboard** — Users module (profile, stats, password, avatar), dashboard shell with sidebar/header, overview, profile, settings, subscription management.
- **Infrastructure** — docker-compose.yml (PostgreSQL 16), docs/LOCAL_SETUP.md, docs/REBUILD_PROMPT.md, Cursor rules.
- **Phase 2 — Contest module (backend)** — GET /contests, GET /contests/:slug, POST /contests/:id/join, GET /contests/:id/participants, admin CRUD at /admin/contests.
- **Phase 2 — Contest pages (frontend)** — /contests listing with type/status filters, contest detail with register CTA, participants leaderboard, sidebar nav, route protection.
- **Phase 2 — Quiz module** — quiz_questions/options/answers schema, GET/POST quiz endpoints, admin question CRUD, /contests/[slug]/quiz take page and results page.
- **Phase 2 — Leaderboards** — Leaderboard service (global + contest), GET /leaderboards, GET /leaderboards/me, /leaderboards page.
- **Phase 2 — Notifications** — Notification module (list, mark read), in-app bell dropdown, CONTEST_RESULT on quiz submit.
- **Phase 2 — SubscriptionGuard** — @RequireSubscription decorator + guard on contest join and quiz endpoints.
- **Phase 2 — Admin contest management** — /admin/contests list, create, edit, delete, quiz question editor.
- **Phase 1 — Admin dashboard** — Backend admin module (metrics, users, subscriptions, payments, activity logs), frontend /admin pages with AdminGuard.
- **Phase 1 — Activity logs** — ActivityLogsService wired to auth and admin actions.
- **Phase 1 — Email (Resend)** — EmailService with mock mode; subscription confirmation on activation.
- **Phase 1 — Dev seed** — `pnpm db:seed` creates admin, demo user, sample contests.
- **Phase 1 — CI** — GitHub Actions workflow (lint, typecheck, test, build).
- **Phase 1 — Tests** — Jest (API) + Vitest (web) unit tests.
- **Phase 3 — Jobs board** — Jobs module, /jobs pages, subscription-gated, admin CRUD at /admin/jobs.
- **Phase 3 — Referrals board** — Referrals module, /referrals listing + create, manage own posts.
- **Phase 3 — System design** — system_design_submissions schema, submit flow at /contests/[slug]/system-design.
- **packages/ui** — Button, Card, Input, Label components.
- **PRD.md** — Product Requirements Document v1.0 with user personas, feature scope, success metrics, and release plan.
- **PROJECT_RULES.md** — Engineering standards covering Clean Architecture, SOLID, feature-based structure, naming conventions, API design, security, testing, and git workflow.
- **DATABASE.md** — Complete database schema documentation with 15 tables, enums, indexes, and scaling strategy.
- **prisma/schema.prisma** — Canonical Prisma schema with all entities: Users, Roles, Subscriptions, Payments, Contests, Participants, Leaderboards, Jobs, Referrals, Premium Services, Notifications, Activity Logs.
- **API_CONTRACT.md** — REST API specification for all Phase 1–5 endpoints with request/response formats and error codes.
- **BACKEND_ARCHITECTURE.md** — NestJS backend architecture with folder structure, modules, guards, interceptors, and middleware.
- **FRONTEND_ARCHITECTURE.md** — Next.js 15 frontend architecture with feature modules, routing, state management, and API layer.
- **IMPLEMENTATION_PLAN.md** — Five-phase implementation plan with timelines, dependencies, and deliverables.
- **TASKS.md** — Task tracker with Phase 0–5 breakdown.

### Status

- Phase 0 complete. Phase 1 complete (v0.1.0). Phase 2 complete (v0.2.0). Phase 3 complete (v0.3.0). Phase 4 core complete (v0.4.0 scope). Screenshot parity rebuild complete.

---

## Version Plan

| Version | Phase   | Target   | Highlights                              |
| ------- | ------- | -------- | --------------------------------------- |
| 0.1.0   | Phase 1 | Week 6   | Landing, Auth, Subscription, Dashboards |
| 0.2.0   | Phase 2 | Week 12  | Contests, Quizzes, Leaderboards         |
| 0.3.0   | Phase 3 | Week 18  | Jobs, Referrals, System Design          |
| 0.4.0   | Phase 4 | Week 24  | Premium Services                        |
| 1.0.0   | Phase 5 | Week 30+ | Production launch                       |

---

## Release Template

Use the following template for future releases:

- **Added** — New features
- **Changed** — Changes to existing features
- **Fixed** — Bug fixes
- **Security** — Security improvements
- **Removed** — Removed features

---

## [0.0.0] — 2025-06-25

### Added

- Initial project scaffolding with documentation structure.
- Architecture planning documents (pre-implementation).

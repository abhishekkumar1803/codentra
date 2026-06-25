# Codentra — Changelog

All notable changes to the Codentra platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Phase 1 — Landing Page** — Hero, features (8 cards), pricing (₹49/month), CTA, navbar, footer, SEO metadata.
- **Phase 1 — Authentication (backend)** — NestJS auth module with register, login, Google OAuth, JWT access + refresh tokens (httpOnly cookie), forgot/reset password, global guards/filters/interceptors.
- **Phase 1 — Authentication (frontend)** — Login, register, forgot/reset password pages; Google OAuth callback; React Query hooks; Zustand auth store; API client with auto-refresh; route middleware.
- **Phase 1 — Membership Subscription** — Razorpay integration (mock mode for dev), subscription/payment modules, idempotent webhooks, /subscribe checkout page, subscription status component.
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
- Phase 0 complete. Phase 1 in progress: Landing Page, Authentication, and Subscription shipped.

---

## Version Plan

| Version | Phase | Target | Highlights |
|---------|-------|--------|------------|
| 0.1.0 | Phase 1 | Week 6 | Landing, Auth, Subscription, Dashboards |
| 0.2.0 | Phase 2 | Week 12 | Contests, Quizzes, Leaderboards |
| 0.3.0 | Phase 3 | Week 18 | Jobs, Referrals, System Design |
| 0.4.0 | Phase 4 | Week 24 | Premium Services |
| 1.0.0 | Phase 5 | Week 30+ | Production launch |

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

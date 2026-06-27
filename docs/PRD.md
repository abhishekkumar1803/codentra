# Codentra — Product Requirements Document

**Version:** 1.0  
**Last Updated:** 2025-06-25  
**Status:** Draft — Pending Approval

---

## 1. Executive Summary

**Codentra** is a developer growth platform where engineers learn, compete, and advance their careers. The platform combines competitive programming, system design challenges, technical quizzes, job discovery, referral networking, and premium career services into a single membership-based SaaS product.

**Tagline:** Learn. Compete. Grow.

**Target Market:** Software engineers in India (initial), expanding to global developers.

**Business Model:** ₹49/month membership + à la carte premium services.

---

## 2. Problem Statement

Developers preparing for technical interviews and career growth face fragmented tools:

- Contest platforms focus only on DSA, not system design or career services.
- Job boards lack community-driven referrals.
- Career coaching is expensive and hard to discover.
- Progress tracking across learning, competition, and career is nonexistent.

Codentra unifies these into one platform with measurable growth tracking.

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

| Goal                           | Target (12 months)        |
| ------------------------------ | ------------------------- |
| Registered users               | 10,000                    |
| Paying subscribers             | 2,000                     |
| Monthly recurring revenue      | ₹98,000+                  |
| Premium service bookings/month | 200                       |
| Contest participation rate     | 40% of active subscribers |

### 3.2 Product Goals

- Ship Phase 1 (auth, subscription, dashboards) in 6 weeks.
- Achieve < 2s page load on 4G mobile.
- 99.9% uptime for core flows (auth, payments, contests).
- NPS ≥ 40 among active subscribers.

### 3.3 Key Metrics

- **Activation:** User completes signup + views dashboard.
- **Conversion:** Free visitor → paid subscriber.
- **Retention:** Monthly churn < 8%.
- **Engagement:** Contests joined per user per month.
- **Revenue:** ARPU, LTV, premium attach rate.

---

## 4. User Personas

### 4.1 Aspirant Developer (Primary)

- **Profile:** 0–3 years experience, preparing for FAANG/startup interviews.
- **Needs:** Structured DSA practice, mock interviews, resume feedback.
- **Willingness to pay:** High for bundled value at ₹49/month.

### 4.2 Competitive Programmer

- **Profile:** Active on Codeforces/LeetCode, seeks regular contests and rankings.
- **Needs:** Timed contests, leaderboards, rating growth.
- **Willingness to pay:** Medium; motivated by competition and rankings.

### 4.3 Career Switcher

- **Profile:** 3–8 years experience, exploring new roles or companies.
- **Needs:** Job board, referrals, career guidance calls.
- **Willingness to pay:** High for premium services.

### 4.4 Platform Admin

- **Profile:** Internal team managing content, users, and services.
- **Needs:** Admin dashboard, user management, contest creation, analytics.

---

## 5. Feature Scope

### 5.1 Membership Plan — ₹49/month

Includes access to:

| Feature                  | Description                                    | Phase |
| ------------------------ | ---------------------------------------------- | ----- |
| DSA Contests             | Timed algorithmic challenges with auto-grading | 2     |
| CP Contests              | Competitive programming with rating system     | 2     |
| System Design Challenges | Architecture problems with peer/expert review  | 3     |
| Tech Quizzes             | MCQ-based assessments by topic                 | 2     |
| Jobs Board               | Curated job listings                           | 3     |
| Referral Board           | Community referral requests and offers         | 3     |
| Leaderboards             | Global, weekly, and contest-specific rankings  | 2     |

### 5.2 Premium Services (À la carte)

| Service              | Description                        | Phase |
| -------------------- | ---------------------------------- | ----- |
| Resume Review        | Expert feedback on resume (async)  | 4     |
| Mock Interview       | 45–60 min live session with mentor | 4     |
| Career Guidance Call | 30 min career strategy session     | 4     |
| LinkedIn Review      | Profile optimization feedback      | 4     |

### 5.3 Platform Features (All Phases)

| Feature                 | Description                                       | Phase |
| ----------------------- | ------------------------------------------------- | ----- |
| Landing Page            | Marketing site with pricing, features, CTA        | 1     |
| Authentication          | Google OAuth + Email/Password                     | 1     |
| Membership Subscription | Razorpay recurring billing                        | 1     |
| User Dashboard          | Personal hub: subscription, activity, quick links | 1     |
| Admin Dashboard         | User management, analytics, content moderation    | 1     |
| Notifications           | In-app + email notifications                      | 2     |
| Activity Logs           | Audit trail for user and admin actions            | 1     |

---

## 6. User Stories

### 6.1 Phase 1 — Foundation

#### Landing Page

- As a visitor, I want to understand what Codentra offers so I can decide to sign up.
- As a visitor, I want to see pricing (₹49/month) and feature list clearly.
- As a visitor, I want a responsive experience on mobile and desktop.

#### Authentication

- As a user, I want to sign up/login with Google so I can onboard quickly.
- As a user, I want to sign up/login with email and password as an alternative.
- As a user, I want to reset my password via email.
- As a user, I want my session to persist securely across visits.

#### Membership Subscription

- As a user, I want to subscribe for ₹49/month via Razorpay.
- As a user, I want to see my subscription status (active, expired, cancelled).
- As a user, I want to cancel my subscription without contacting support.
- As a user, I want email confirmation on successful payment.

#### User Dashboard

- As a subscriber, I want a dashboard showing my profile, subscription, and recent activity.
- As a subscriber, I want quick navigation to upcoming features (contests, jobs).
- As a non-subscriber, I want a clear CTA to subscribe.

#### Admin Dashboard

- As an admin, I want to view total users, subscribers, and revenue metrics.
- As an admin, I want to search, view, and manage user accounts.
- As an admin, I want to view payment and subscription history.
- As an admin, I want to view activity logs for audit purposes.

### 6.2 Phase 2 — Core Engagement (Future)

- Join and participate in DSA/CP contests and quizzes.
- View personal and global leaderboards.
- Receive notifications for contest reminders and results.

### 6.3 Phase 3 — Career & Community (Future)

- Browse and apply to jobs.
- Post and respond to referral requests.
- Participate in system design challenges.

### 6.4 Phase 4 — Premium Services (Future)

- Purchase and track resume reviews, mock interviews, career calls, LinkedIn reviews.

### 6.5 Phase 5 — Scale & Polish (Future)

- Advanced analytics, mentor portal, mobile PWA, internationalization.

---

## 7. Non-Functional Requirements

### 7.1 Scalability

- Support 100 → 100,000 users without architectural rewrite.
- Stateless API servers behind load balancer.
- Database connection pooling (PgBouncer via Neon).
- CDN for static assets (Vercel + Cloudinary).

### 7.2 Performance

- API p95 latency < 300ms for read endpoints.
- API p95 latency < 500ms for write endpoints.
- Lighthouse performance score ≥ 90 on landing page.
- React Query caching to minimize redundant API calls.

### 7.3 Security

- JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie).
- bcrypt password hashing (cost factor 12).
- Rate limiting on auth and payment endpoints.
- Input validation on all endpoints (class-validator).
- CORS restricted to frontend domain.
- Razorpay webhook signature verification.
- No secrets in client-side code.

### 7.4 Reliability

- Idempotent payment webhook handling.
- Graceful degradation when third-party services are down.
- Structured logging with correlation IDs.
- Health check endpoints for monitoring.

### 7.5 Maintainability

- Feature-based folder structure (frontend and backend).
- Shared TypeScript types where possible.
- Comprehensive API contract documentation.
- Conventional commits and semantic versioning.

### 7.6 Accessibility & Responsiveness

- WCAG 2.1 AA compliance target.
- Mobile-first responsive design.
- Keyboard navigation support.
- Screen reader friendly components (Shadcn/Radix).

---

## 8. Technical Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 15    │────▶│   NestJS API    │────▶│  Neon PostgreSQL │
│   (Vercel)      │     │   (Railway)     │     │  (via Prisma)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ├── Razorpay (Payments)
        │                       ├── Resend (Email)
        │                       └── Cloudinary (Storage)
        │
        └── Google OAuth, React Query, Zustand
```

See `BACKEND_ARCHITECTURE.md`, `FRONTEND_ARCHITECTURE.md`, and `DATABASE.md` for details.

---

## 9. Out of Scope (v1)

- Native mobile apps (iOS/Android).
- Real-time code execution sandbox (Phase 2+).
- Multi-currency pricing.
- Team/enterprise plans.
- AI-powered code review.
- Video hosting (use external meeting links for Phase 4).

---

## 10. Risks & Mitigations

| Risk                            | Impact   | Mitigation                                          |
| ------------------------------- | -------- | --------------------------------------------------- |
| Razorpay integration complexity | High     | Early spike; webhook idempotency; sandbox testing   |
| Low initial contest content     | Medium   | Seed contests before launch; admin tools in Phase 2 |
| Subscription churn              | High     | Onboarding emails; engagement features in Phase 2   |
| Database scaling                | Medium   | Neon autoscaling; read replicas at 10k+ users       |
| Security breach                 | Critical | OWASP best practices; regular dependency audits     |

---

## 11. Release Plan

| Phase   | Timeline    | Deliverables                                   |
| ------- | ----------- | ---------------------------------------------- |
| Phase 1 | Weeks 1–6   | Landing, Auth, Subscription, Dashboards        |
| Phase 2 | Weeks 7–12  | Contests, Quizzes, Leaderboards, Notifications |
| Phase 3 | Weeks 13–18 | Jobs, Referrals, System Design                 |
| Phase 4 | Weeks 19–24 | Premium Services                               |
| Phase 5 | Weeks 25+   | Scale, Analytics, Mentor Portal                |

See `IMPLEMENTATION_PLAN.md` for detailed breakdown.

---

## 12. Approval

This PRD requires stakeholder approval before implementation begins. Upon approval, development follows the per-feature workflow defined in `PROJECT_RULES.md`.

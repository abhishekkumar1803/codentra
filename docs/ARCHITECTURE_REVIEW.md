# Codentra — Architecture Review

**Reviewer Role:** Staff Engineer (Design Review)  
**Version:** 1.0  
**Date:** 2025-06-25  
**Documents Reviewed:** `PRD.md`, `PROJECT_RULES.md`, `DATABASE.md`, `prisma/schema.prisma`, `API_CONTRACT.md`, `BACKEND_ARCHITECTURE.md`, `FRONTEND_ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `TASKS.md`

---

## Executive Summary

The Codentra architecture is **well-structured for a seed-stage SaaS** — feature-based modules, sensible monolith-first approach, clear phase gates, and good documentation discipline. The team clearly thought about scale paths (100 → 100k users) without jumping to microservices.

However, the design has a **Phase 1 vs. full-schema mismatch**, several **auth/payment inconsistencies** that would cause production bugs, and **missing data models** for core product features (contest problems, submissions, webhooks). The payment flow has a **dual-source-of-truth risk** between client verify and webhooks.

**Overall verdict:** Approve with modifications. Address P0 items before Phase 1 implementation; defer or simplify over-engineered pieces.

| Severity                  | Count | Action             |
| ------------------------- | ----- | ------------------ |
| P0 — Block implementation | 8     | Fix before coding  |
| P1 — Fix in Phase 1       | 12    | Fix during Phase 1 |
| P2 — Address before scale | 15    | Track in backlog   |
| P3 — Nice to have         | 10    | Defer              |

---

## 1. Over-Engineering

Items that add complexity without proportional value at the current stage.

### 1.1 Full Schema Migration in Week 1

**Issue:** `IMPLEMENTATION_PLAN.md` instructs running the **entire 15-table schema** in Week 1, but Phase 1 only needs ~6 tables (users, refresh_tokens, subscriptions, payments, activity_logs, notifications).

**Impact:** Larger migration surface, harder to iterate, empty tables with unused relations, cognitive overhead for new contributors.

**Recommendation:** Split migrations by phase. Phase 1 migration: auth + billing + admin only. Add contest/job/service tables when those phases start.

**Severity:** P1

---

### 1.2 Four Premium Service Tables

**Issue:** `ResumeReview`, `MockInterview`, `CareerCall`, and `LinkedInReview` are structurally 90% identical (userId, paymentId, mentorId/reviewerId, status, feedback, scheduledAt).

**Impact:** Four services to maintain, four admin views, duplicated API patterns.

**Recommendation:** Consolidate into a single `service_bookings` table with `type` enum and a `metadata` JSONB column for type-specific fields (resumeUrl, linkedinUrl, durationMinutes). Extract to separate tables only if query patterns diverge significantly.

**Severity:** P2 (before Phase 4)

---

### 1.3 Dual Leaderboard Storage

**Issue:** Both `contest_participants` (score, rank) and `leaderboard_entries` (score, rank) store ranking data.

**Impact:** Two sources of truth; sync logic required; risk of inconsistent ranks.

**Recommendation:** For contest leaderboards, compute from `contest_participants` at query time (indexed by contest_id + score DESC) until contest volume justifies materialization. Use `leaderboard_entries` only for global periodic leaderboards (weekly/monthly/all-time).

**Severity:** P2 (before Phase 2)

---

### 1.4 Excessive Cross-Cutting Infrastructure for Phase 1

**Issue:** Backend plans CorrelationIdMiddleware, RequestLoggerMiddleware, LoggingInterceptor, TransformInterceptor, and TimeoutInterceptor all at once.

**Impact:** Boilerplate before business value; harder debugging when things fail.

**Recommendation:** Phase 1 minimum: global exception filter, validation pipe, JwtAuthGuard, basic request logging. Add correlation IDs and timeout interceptor in Week 6 polish or Phase 2.

**Severity:** P2

---

### 1.5 Dual Auth State (Zustand + React Query)

**Issue:** `FRONTEND_ARCHITECTURE.md` stores access token in Zustand `auth-store` AND user profile in React Query `['auth', 'me']`.

**Impact:** State sync bugs; token updated but profile stale, or vice versa.

**Recommendation:** Single source of truth: React Query for user session (`/auth/me`), access token in a module-level variable or httpOnly cookie (see Auth section). Zustand only for UI chrome (sidebar, theme).

**Severity:** P1

---

### 1.6 `develop` Branch + Full CI Matrix

**Issue:** `PROJECT_RULES.md` mandates `main` + `develop` branching, Husky, GitHub Actions, 80% coverage targets, Playwright E2E — for a 1–2 person team shipping Phase 1.

**Impact:** Process overhead slows iteration.

**Recommendation:** Start with `main` + feature branches. Add `develop` when team exceeds 2 engineers. Target 60% service coverage in Phase 1; 80% by Phase 3.

**Severity:** P3

---

### 1.7 Activity Logs in Phase 1

**Issue:** Full audit trail with IP, user-agent, JSON metadata in Phase 1.

**Impact:** Useful for admin, but adds a write on every auth/payment action; table grows immediately.

**Recommendation:** Keep for Phase 1 (admin dashboard depends on it), but **only log security-sensitive events** (login, payment, admin actions). Do not log every read operation.

**Severity:** P3

---

### 1.8 What's Appropriately Scoped (Not Over-Engineered)

These are correct decisions — do not simplify:

- Monolithic NestJS API (not microservices)
- Feature-based folder structure
- Razorpay integration abstraction layer
- React Query for server state
- Prisma ORM
- Phase-gated delivery

---

## 2. Missing Requirements

Gaps between PRD promises and architectural support.

### 2.1 Contest Content Model (Critical)

**Issue:** PRD promises DSA contests, CP contests, quizzes, and system design challenges. Schema has `contests` but **no tables for problems, questions, test cases, submissions, or code runs**.

**Impact:** Phase 2 cannot start without a major schema addition. CP "rating system" has no data model.

**Recommendation:** Add to `DATABASE.md` before Phase 2:

- `problems` (title, difficulty, type, time_limit, memory_limit)
- `contest_problems` (contest_id, problem_id, points, order)
- `submissions` (user_id, problem_id, contest_id, code, language, status, score)
- `quiz_questions` + `quiz_options` + `quiz_answers`
- `user_ratings` (for CP ELO/rating)

**Severity:** P0 (document now, implement Phase 2)

---

### 2.2 Email Verification Flow

**Issue:** `users.email_verified` exists; PRD mentions email login but **no verification endpoint, token model, or user story**.

**Impact:** Unverified users can register and potentially subscribe; deliverability/spam risk.

**Recommendation:** Add `email_verification_tokens` table. Block subscription until `emailVerified = true` (or allow subscribe but restrict features). Add `POST /auth/verify-email` and `POST /auth/resend-verification`.

**Severity:** P1

---

### 2.3 OAuth Account Linking

**Issue:** No strategy when `user@example.com` registers with email, then tries Google OAuth with the same email (or vice versa).

**Impact:** Duplicate accounts or login failures; support burden.

**Recommendation:** Document merge policy: if Google email matches existing user, link `google_id` after password confirmation OR auto-link if emails match and Google email is verified.

**Severity:** P0

---

### 2.4 Password Reset Token Storage

**Issue:** `POST /auth/reset-password` accepts a token, but **no database model** for reset tokens (expiry, used_at, user_id).

**Impact:** Cannot implement securely.

**Recommendation:** Add `password_reset_tokens` table (token_hash, user_id, expires_at, used_at).

**Severity:** P0

---

### 2.5 Webhook Idempotency Store

**Issue:** API contract says webhooks must be idempotent, but **no `webhook_events` table** to track processed Razorpay event IDs.

**Impact:** Duplicate webhook delivery activates subscription twice or creates duplicate payments.

**Recommendation:** Add `webhook_events` (id, provider, event_id UNIQUE, payload, processed_at).

**Severity:** P0

---

### 2.6 Subscription Access Rules

**Issue:** No definition of what `CANCELLED`, `PAST_DUE`, and `EXPIRED` mean for feature access. `SubscriptionGuard` only checks `ACTIVE`.

**Impact:** Users cancelled mid-period may lose access immediately; PAST_DUE users may retain access indefinitely.

**Recommendation:** Document and implement:

- `ACTIVE` → full access
- `CANCELLED` → access until `current_period_end`
- `PAST_DUE` → 3-day grace, then restrict
- `EXPIRED` → no access

Update `SubscriptionGuard` accordingly.

**Severity:** P1

---

### 2.7 Premium Service Pricing

**Issue:** PRD lists premium services but **no prices** defined. Payment flow cannot be built in Phase 4.

**Recommendation:** Add pricing table to PRD (e.g., Resume Review ₹299, Mock Interview ₹999).

**Severity:** P1 (before Phase 4)

---

### 2.8 Referral Application Flow

**Issue:** PRD says "Request Referrals" but schema only supports **posting** referrals, not applying/responding.

**Recommendation:** Add `referral_applications` (referral_id, applicant_id, message, status) in Phase 3.

**Severity:** P2

---

### 2.9 Legal & Compliance

**Missing:**

- Terms of Service / Privacy Policy acceptance at registration
- Account deletion (GDPR/DPDPA right to erasure)
- Data export
- GST invoice generation for Indian payments
- Refund policy

**Severity:** P1 (ToS/Privacy at launch); P2 (GST, deletion)

---

### 2.10 Operational Requirements

**Missing:**

- Error monitoring (Sentry)
- Uptime monitoring
- Database backup/restore runbook
- Incident response plan
- Feature flags for gradual rollout

**Severity:** P1 (Sentry before production); P2 (rest)

---

### 2.11 Shared Type Package

**Issue:** `PROJECT_RULES.md` mentions shared TypeScript types but no `packages/types` or OpenAPI codegen plan.

**Impact:** Frontend/backend type drift.

**Recommendation:** Generate types from OpenAPI spec (`@nestjs/swagger` → `openapi-typescript`) or shared `packages/types` in monorepo.

**Severity:** P1

---

## 3. Future Scaling Bottlenecks

### 3.1 SubscriptionGuard Database Hit on Every Request

**Issue:** `SubscriptionGuard` queries DB for every membership-gated endpoint.

**Impact:** At 10k concurrent users in contests, this adds 10k+ queries/minute.

**Recommendation:** Include `subscriptionStatus` and `subscriptionExpiresAt` in JWT claims (short-lived). Re-validate on critical actions (payment, contest submit). Cache in Redis with 5-min TTL at scale.

**Severity:** P1 (design now; implement before Phase 2)

---

### 3.2 In-Memory Rate Limiting

**Issue:** `@nestjs/throttler` defaults to in-memory storage.

**Impact:** Ineffective with multiple Railway instances; limits reset per instance.

**Recommendation:** Use Redis-backed throttler storage when scaling beyond 1 instance. Acceptable for Phase 1 single instance.

**Severity:** P2

---

### 3.3 Synchronous Webhook & Email Processing

**Issue:** No job queue (BullMQ, Inngest, etc.) for webhooks, emails, or leaderboard recomputation.

**Impact:** Slow webhook responses cause Razorpay retries; email failures block API responses.

**Recommendation:** Phase 1: process webhooks synchronously but fast (< 2s). Phase 2: add job queue for emails and leaderboard updates.

**Severity:** P2

---

### 3.4 Admin Metrics Full Table Scans

**Issue:** `GET /admin/dashboard` implies `COUNT(*)` on users, subscriptions, payments.

**Impact:** Slow at 100k users.

**Recommendation:** Use incremental counters or daily aggregated `platform_metrics` table updated by cron/webhook.

**Severity:** P2

---

### 3.5 Activity Logs Table Growth

**Issue:** Unbounded append-only table; partitioning mentioned but not planned.

**Impact:** Queries slow; storage costs rise.

**Recommendation:** 90-day retention with pg_cron cleanup. Archive to S3/R2 after. Consider omitting `user_agent` (large) or hash it.

**Severity:** P2

---

### 3.6 Leaderboard Recomputation

**Issue:** Materialized `leaderboard_entries` for weekly/monthly/all-time requires batch jobs touching all users.

**Impact:** O(n) writes per period boundary.

**Recommendation:** Incremental score updates on contest completion rather than full recompute. Redis sorted sets for top-100 reads.

**Severity:** P2 (Phase 2)

---

### 3.7 Notification Fan-Out

**Issue:** Contest reminders require notifying all participants — row-per-user inserts.

**Impact:** 10k participants = 10k INSERTs.

**Recommendation:** Batch insert; consider email digest instead of per-user in-app for large contests.

**Severity:** P2

---

### 3.8 Cross-Origin Latency

**Issue:** Frontend (Vercel) → Backend (Railway) are separate origins. Every API call has extra DNS + TLS + CORS overhead.

**Impact:** Adds 50–150ms per request vs. same-origin BFF.

**Recommendation:** Acceptable at current scale. Consider Next.js API routes as BFF proxy if latency becomes issue. Not needed for Phase 1.

**Severity:** P3

---

### 3.9 Prisma Connection Pool Exhaustion

**Issue:** Serverless-adjacent deployments (Railway scaling) + Prisma can exhaust DB connections.

**Recommendation:** Use Neon's pooled connection string. Set `connection_limit` in Prisma. Document in `DATABASE.md`.

**Severity:** P1

---

### 3.10 Subscription History Loss

**Issue:** `subscriptions.user_id` is UNIQUE — one row per user, updated on resubscribe.

**Impact:** Cannot answer "how many times did this user subscribe?" or analyze churn patterns.

**Recommendation:** Remove UNIQUE on user_id; add `subscription_history` or allow multiple subscription rows with only one `ACTIVE` at a time (partial unique index: `UNIQUE(user_id) WHERE status IN ('ACTIVE', 'CANCELLED', 'PAST_DUE')`).

**Severity:** P1

---

## 4. Security Concerns

### 4.1 Client-Side Payment Verification Endpoint (Critical)

**Issue:** `POST /subscriptions/verify` accepts `razorpayPaymentId`, `razorpaySubscriptionId`, and `razorpaySignature` from the **client**.

**Impact:** Attacker can forge verification requests. Even with signature check, exposing this endpoint to clients is unnecessary attack surface.

**Recommendation:** **Remove client verify endpoint.** Treat Razorpay webhooks as the sole source of truth for payment confirmation. Client polls `GET /subscriptions/me` after checkout success callback. Optionally add a lightweight `POST /subscriptions/confirm` that only checks Razorpay API server-side (no client signature).

**Severity:** P0

---

### 4.2 Auth Token Storage Inconsistency

**Issue:** `FRONTEND_ARCHITECTURE.md` middleware checks `access_token` **cookie**, but architecture stores access token in **memory** (Zustand) and refresh token in **httpOnly cookie**.

**Impact:** Middleware-based route protection will not work. Server Components cannot access in-memory token.

**Recommendation:** Choose one strategy:

- **Option A (recommended):** Access token in httpOnly cookie (same-site), no JS access. Middleware works. Simpler.
- **Option B:** Access token in memory, all protected pages are client components, middleware only checks refresh cookie existence.

Document cookie attributes: `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Domain=.codentra.com`.

**Severity:** P0

---

### 4.3 Google OAuth `redirectUri` from Client

**Issue:** `POST /auth/google` accepts `redirectUri` from request body.

**Impact:** Open redirect vulnerability if not validated against allowlist.

**Recommendation:** Server-side allowlist only. Ignore client-provided URI or validate against `['https://codentra.com/auth/callback/google', 'http://localhost:3000/auth/callback/google']`.

**Severity:** P0

---

### 4.4 JWT Does Not Check User Status

**Issue:** Guards validate JWT but docs don't mention checking `isActive`, `deletedAt`, or role changes.

**Impact:** Banned users retain access until token expires. Promoted/demoted roles stale in JWT.

**Recommendation:** JwtStrategy loads user from DB on each request (acceptable for Phase 1) or include `tokenVersion` in JWT invalidated on role/status change.

**Severity:** P1

---

### 4.5 No CSRF Protection on Cookie Auth

**Issue:** Refresh token in httpOnly cookie + `POST /auth/refresh` without CSRF token.

**Impact:** CSRF attack refreshes session or logs out user.

**Recommendation:** `SameSite=Lax` (minimum). Add CSRF double-submit token for cookie-authenticated POST endpoints. Or use `SameSite=Strict` for refresh cookie.

**Severity:** P1

---

### 4.6 XSS → Token Theft

**Issue:** Access token in JavaScript memory (Zustand) is stealable via XSS.

**Recommendation:** httpOnly cookies for tokens. Implement CSP headers (`default-src 'self'`). Sanitize user-generated content (referrals, feedback).

**Severity:** P1

---

### 4.7 Stored Payment Signature

**Issue:** `payments.razorpay_signature` column stores webhook signatures.

**Impact:** No business value; sensitive data in DB; compliance risk.

**Recommendation:** Remove column. Verify signature in transit; do not persist.

**Severity:** P1

---

### 4.8 Resume/File Access Control

**Issue:** Resume URLs stored as Cloudinary public URLs.

**Impact:** Anyone with URL accesses private resumes.

**Recommendation:** Cloudinary authenticated URLs with expiry. Private folder. Backend generates signed URL on demand.

**Severity:** P1 (Phase 4, but design now)

---

### 4.9 Referral Email Exposure

**Issue:** `referrals.contact_email` may be exposed in public API listings.

**Impact:** Email harvesting, spam.

**Recommendation:** Mask email in public listings. Reveal only to authenticated subscribers via apply flow. Rate-limit referral creation.

**Severity:** P1 (Phase 3)

---

### 4.10 Admin Role Escalation

**Issue:** `PATCH /admin/users/:id` can change `role` with no secondary confirmation or audit of who made the change.

**Recommendation:** Log admin ID in activity_logs metadata. Prevent admins from self-demoting last admin. Consider super-admin role.

**Severity:** P1

---

### 4.11 Missing Security Headers

**Issue:** Helmet mentioned in checklist but not configured in architecture.

**Recommendation:** Helmet with CSP, HSTS, X-Frame-Options, X-Content-Type-Options in `main.ts`.

**Severity:** P1

---

### 4.12 No Account Lockout

**Issue:** Rate limiting on login (10/min per IP) but no per-account lockout.

**Impact:** Distributed brute force across IPs.

**Recommendation:** Lock account after 10 failed attempts in 15 minutes. Unlock via email or time.

**Severity:** P2

---

## 5. Database Design Issues

### 5.1 Subscription Created as ACTIVE Before Payment

**Issue:** Backend architecture example creates subscription with `status: 'ACTIVE'` immediately on `create()`, before payment confirmation.

**Impact:** Free access without payment if webhook/verify fails.

**Recommendation:** Create with `status: 'PENDING'` or don't create local record until webhook `subscription.activated` fires.

**Severity:** P0

---

### 5.2 Subscription One-Row-Per-User

**Issue:** `subscriptions.user_id @unique` prevents subscription history.

**Recommendation:** See §3.10. Use partial unique index for active subscriptions.

**Severity:** P1

---

### 5.3 Soft Delete + Email UNIQUE Conflict

**Issue:** `users.email` is UNIQUE. Soft-deleted users (`deleted_at IS NOT NULL`) still hold email.

**Impact:** User cannot re-register with same email after account deletion.

**Recommendation:** On soft delete, anonymize email to `deleted_{uuid}@deleted.codentra.com`. Or use partial unique index: `UNIQUE(email) WHERE deleted_at IS NULL`.

**Severity:** P1

---

### 5.4 LeaderboardEntry Missing Uniqueness

**Issue:** No unique constraint on `(user_id, period, contest_id, period_start)`.

**Impact:** Duplicate leaderboard rows for same user/period.

**Recommendation:** Add `@@unique([userId, period, contestId, periodStart])`.

**Severity:** P1 (Phase 2)

---

### 5.5 Missing Indexes

| Table                  | Missing Index                          | Query                      |
| ---------------------- | -------------------------------------- | -------------------------- |
| `subscriptions`        | `(status, current_period_end)`         | Cron: expire subscriptions |
| `payments`             | `(user_id, created_at DESC)`           | Payment history            |
| `users`                | `(is_active) WHERE deleted_at IS NULL` | Admin active users         |
| `contest_participants` | `(user_id, created_at DESC)`           | User contest history       |

**Severity:** P2

---

### 5.6 Payment onDelete RESTRICT

**Issue:** Cannot delete users with payment history due to `onDelete: Restrict`.

**Impact:** GDPR deletion requests fail.

**Recommendation:** Anonymize user (null PII fields) instead of hard delete. Keep payments for legal/tax retention (7 years India).

**Severity:** P1

---

### 5.7 Salary Stored as Paise/Year

**Issue:** `jobs.salary_min/max` in paise per year is unconventional and error-prone (₹12 LPA = 1,200,000,00 paise?).

**Recommendation:** Store in **rupees per annum** (integer, lakhs × 100000) or separate `salary_currency` + `salary_period` enum. Document clearly.

**Severity:** P2

---

### 5.8 ip_address Type Mismatch

**Issue:** `DATABASE.md` specifies `INET`; Prisma schema uses `String?`.

**Recommendation:** Align to `String` in Prisma (Prisma lacks native INET) with validation regex, or use `@db.Inet` if supported.

**Severity:** P3

---

### 5.9 No `updatedAt` on Notifications

**Issue:** `notifications` table has only `createdAt`.

**Impact:** Minor — no tracking of when notification was modified.

**Severity:** P3

---

## 6. Authentication Concerns

### 6.1 Cross-Domain Cookie Configuration

**Issue:** Frontend (`codentra.com`) and API (`api.codentra.com`) are different origins. Refresh cookie must be set with `Domain=.codentra.com` by the API.

**Impact:** Cookies won't be sent if domain/path misconfigured.

**Recommendation:** Document exact cookie setup. Test in staging before production. Consider same-site proxy if issues arise.

**Severity:** P0

---

### 6.2 Refresh Token Rotation Not Specified

**Issue:** Docs say "rotated on use" but no implementation detail (invalidate old token, detect reuse).

**Impact:** Stolen refresh token usable for 7 days.

**Recommendation:** On refresh: revoke old token, issue new pair. If revoked token is reused, revoke all user tokens (breach detection).

**Severity:** P1

---

### 6.3 No Session Invalidation on Password Change

**Issue:** Password reset succeeds but existing refresh tokens remain valid.

**Recommendation:** On password change/reset, revoke all `refresh_tokens` for user.

**Severity:** P1

---

### 6.4 Register Returns Tokens Before Email Verification

**Issue:** User gets full session immediately on register with `emailVerified: false`.

**Recommendation:** Either require verification before issuing tokens, or issue limited-scope token (profile setup only, no subscribe).

**Severity:** P1

---

### 6.5 Admin Role Check Only in Frontend Layout

**Issue:** `AdminLayout` checks `user?.role !== 'ADMIN'` client-side. Backend has RolesGuard but frontend check is bypassable.

**Recommendation:** Backend RolesGuard is sufficient for security. Frontend check is UX only — document this distinction. Add middleware redirect for `/admin` routes.

**Severity:** P2

---

## 7. Payment Handling Concerns

### 7.1 Dual Source of Truth: Verify vs Webhook

**Issue:** Both `POST /subscriptions/verify` (client-triggered) and `POST /webhooks/razorpay` (server-triggered) can activate subscriptions.

**Impact:** Race conditions, duplicate payment records, inconsistent state if one fails.

**Recommendation:**

```
Client checkout success → poll GET /subscriptions/me
Webhook subscription.activated → create/update subscription + payment (AUTHORITATIVE)
Webhook subscription.charged → create payment record for renewals
Remove or deprecate client verify endpoint
```

**Severity:** P0

---

### 7.2 No Renewal Payment Flow

**Issue:** Schema supports recurring subscriptions but no documented flow for `subscription.charged` webhook creating new `payments` row each month.

**Recommendation:** Document monthly renewal: webhook creates new Payment row, extends `current_period_end`.

**Severity:** P1

---

### 7.3 PAST_DUE Handling Missing

**Issue:** `PAST_DUE` status exists but no webhook handler for `payment.failed` or grace period logic.

**Recommendation:** On `payment.failed`: set `PAST_DUE`, send email, start 3-day grace timer (cron). After grace: set `EXPIRED`.

**Severity:** P1

---

### 7.4 Cancel Does Not Specify Razorpay API Call

**Issue:** `POST /subscriptions/cancel` documented but doesn't specify calling `razorpay.subscriptions.cancel()`.

**Impact:** Local status cancelled but Razorpay continues charging.

**Recommendation:** Always cancel on Razorpay first, then update local state on webhook `subscription.cancelled`.

**Severity:** P0

---

### 7.5 No Reconciliation Process

**Issue:** No daily job to reconcile Razorpay subscription state with local DB.

**Recommendation:** Nightly cron: fetch active Razorpay subscriptions, compare with local, alert on mismatch.

**Severity:** P2

---

### 7.6 Premium Service Payment Flow Undefined

**Issue:** For resume review: upload file → pay → create service? Or pay → upload? Order matters.

**Recommendation:** Document: create Payment (PENDING) → Razorpay order → on success create service booking → allow upload. Prevent upload without payment.

**Severity:** P1 (Phase 4)

---

### 7.7 No Refund API

**Issue:** `PaymentStatus.REFUNDED` exists but no refund endpoint or webhook handler.

**Recommendation:** Add `POST /admin/payments/:id/refund` and handle `refund.processed` webhook.

**Severity:** P2

---

### 7.8 GST / Tax Compliance

**Issue:** No tax fields on payments. Indian businesses typically need GST invoices.

**Recommendation:** Add `tax_amount`, `gstin` (optional user field), invoice PDF generation via Razorpay invoices or custom.

**Severity:** P2 (before monetization scale)

---

## 8. Cost Optimization Opportunities

### 8.1 Infrastructure Stack Cost (Early Stage)

| Service         | Est. Monthly Cost (2k users) | Optimization                                                                         |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| Neon PostgreSQL | $19–50                       | Use free tier for dev; scale plan only when needed                                   |
| Railway (API)   | $5–20                        | Start with 1 small instance; no auto-scale until traffic warrants                    |
| Vercel          | $0–20                        | Hobby plan sufficient for Phase 1                                                    |
| Cloudinary      | $0–25                        | **Defer to Phase 5 for avatars** — use Next.js `Image` + Vercel Blob or upload to R2 |
| Resend          | $0–20                        | Free tier: 3k emails/month — sufficient early                                        |
| Razorpay        | 2% per transaction           | Pass-through; no optimization                                                        |

**Estimated Phase 1 infra:** $0–30/month (within free tiers).

**Severity:** P2

---

### 8.2 Cloudinary for Avatars Only (Phase 1)

**Issue:** Cloudinary integrated in Phase 1 for avatar upload only.

**Recommendation:** Use **Vercel Blob** (included) or store URL from Google OAuth avatar without upload feature in Phase 1. Add Cloudinary when resume upload needed in Phase 4.

**Savings:** ~$25/month + simpler integration.

**Severity:** P1

---

### 8.3 Activity Logs in PostgreSQL

**Issue:** Storing high-volume logs in Neon increases storage costs.

**Recommendation:** Keep 90 days in Postgres for admin UI. Forward to **Axiom** or **Better Stack** free tier for long-term search. Cheaper than DB storage at scale.

**Severity:** P2

---

### 8.4 Separate Staging Database

**Issue:** Plan includes Neon staging branch.

**Recommendation:** Use **Docker Postgres locally** for dev. One Neon project with branch-per-PR only when team > 2. Saves ~$19/month.

**Severity:** P2

---

### 8.5 Redis Deferred Too Long

**Issue:** Redis planned for Phase 5 but needed for rate limiting and subscription caching by Phase 2.

**Recommendation:** Use **Upstash Redis** free tier (10k commands/day) from Phase 2. Pay-as-you-go after.

**Severity:** P2

---

### 8.6 Batch Email Sending

**Issue:** Individual Resend API calls for contest reminders.

**Recommendation:** Batch notifications into digest emails. Reduces Resend API calls and cost.

**Severity:** P3

---

### 8.7 Admin Metrics: Live Queries vs Materialized

**Issue:** Real-time `COUNT(*)` on every admin dashboard load.

**Recommendation:** Compute metrics once per hour via cron; store in `platform_stats` table. Admin dashboard reads cached values.

**Savings:** Reduces DB load; avoids read replica need.

**Severity:** P2

---

### 8.8 CI Pipeline Cost

**Issue:** Playwright E2E on every PR push.

**Recommendation:** Run E2E on merge to `main` only. PR checks: lint + type-check + unit tests.

**Savings:** Faster CI, lower GitHub Actions minutes.

**Severity:** P3

---

## 9. Recommended Actions Before Implementation

### P0 — Must Fix in Documentation Before Coding

| #   | Action                                                                                    | Owner                   |
| --- | ----------------------------------------------------------------------------------------- | ----------------------- |
| 1   | Remove `POST /subscriptions/verify` as client-trusted endpoint; webhook as sole activator | API + Backend docs      |
| 2   | Fix subscription creation flow: PENDING until webhook confirms                            | Backend + DB docs       |
| 3   | Document cross-domain cookie strategy (Domain, SameSite, Secure)                          | Frontend + Backend docs |
| 4   | Add `webhook_events` table for idempotency                                                | DATABASE.md + schema    |
| 5   | Add `password_reset_tokens` table                                                         | DATABASE.md + schema    |
| 6   | Document OAuth account linking policy                                                     | PRD + API docs          |
| 7   | Document Razorpay cancel flow (API call + webhook)                                        | API + Backend docs      |
| 8   | Add contest/problems/submissions schema (document only)                                   | DATABASE.md             |

### P1 — Fix During Phase 1

| #   | Action                                                             |
| --- | ------------------------------------------------------------------ |
| 1   | Split Phase 1 migration (auth + billing only)                      |
| 2   | Fix auth token storage strategy (httpOnly cookie for access token) |
| 3   | Validate Google redirectUri server-side                            |
| 4   | Add email verification flow                                        |
| 5   | Subscription guard: handle CANCELLED grace period                  |
| 6   | JwtStrategy: check isActive, deletedAt                             |
| 7   | Refresh token rotation + reuse detection                           |
| 8   | Revoke tokens on password change                                   |
| 9   | Remove razorpay_signature from payments table                      |
| 10  | Defer Cloudinary to Phase 4; use Google avatar URL                 |
| 11  | Add shared types strategy (OpenAPI codegen)                        |
| 12  | Add Sentry before production deploy                                |

---

## 10. Architecture Decision Records (ADRs) to Create

| ADR     | Decision                                                    |
| ------- | ----------------------------------------------------------- |
| ADR-001 | Webhook-authoritative payment activation (no client verify) |
| ADR-002 | httpOnly cookie auth (access + refresh) vs Bearer token     |
| ADR-003 | Phase-split database migrations                             |
| ADR-004 | Single `service_bookings` table vs four premium tables      |
| ADR-005 | Subscription history model (multiple rows per user)         |
| ADR-006 | Contest leaderboard: computed vs materialized               |

---

## 11. Review Conclusion

The Codentra architecture provides a **solid foundation** with clear documentation, appropriate monolith-first thinking, and realistic phase planning. The primary risks are:

1. **Payment flow bugs** from dual verify/webhook paths
2. **Auth cookie misconfiguration** across Vercel/Railway
3. **Schema front-loading** slowing Phase 1
4. **Missing contest/submission models** blocking Phase 2

None of these are architectural dead-ends — they are fixable with documentation updates and minor schema additions before coding begins.

**Recommendation:** Update docs to address P0 items, then proceed with Phase 1 implementation.

---

## Appendix: Document Consistency Issues

| Issue                                          | Location A                    | Location B                               |
| ---------------------------------------------- | ----------------------------- | ---------------------------------------- |
| Access token in cookie vs memory               | `middleware.ts` checks cookie | Auth design uses Bearer header           |
| Subscription ACTIVE on create                  | Backend service example       | Should be PENDING                        |
| ip_address INET vs String                      | DATABASE.md                   | prisma/schema.prisma                     |
| Notifications in Phase 1 vs Phase 2            | PRD §5.3 (Phase 2)            | IMPLEMENTATION_PLAN (Phase 1 admin only) |
| Landing page at `/` and `(marketing)/page.tsx` | FRONTEND_ARCHITECTURE         | Duplicate route risk                     |
| `develop` branch required                      | PROJECT_RULES.md              | IMPLEMENTATION_PLAN (not mentioned)      |

These should be reconciled when updating documentation.

# Codentra — Production Launch Plan

**Goal:** Ship to real paying users with reliable contests, subscriptions, services, and ops visibility.  
**Last updated:** 2026-06-25  
**Current state:** Feature-complete for MVP demo; several systems still in **mock/dev mode**.

---

## Executive summary

| Area | Dev today | Required for launch |
|------|-----------|---------------------|
| Hosting | Local Docker Postgres | Managed Postgres + API + Web on separate services |
| Payments | `RAZORPAY_MOCK=true` | Live Razorpay + webhooks + reconciliation |
| Code judge | Mock (sum-two-integers only) | Real sandbox (Judge0 / Piston / custom) |
| Email | `RESEND_MOCK=true` | Resend live + templates |
| Auth | JWT + refresh cookie | Harden cookies, OAuth prod URLs, CSRF |
| DB | `db:push` | Versioned migrations + backups + connection pooling |
| Observability | Console logs | Structured logging, errors, metrics, alerts |
| CI | Lint/typecheck/test/build | + staging deploy + smoke tests |

**Recommended launch sequence:** Staging → closed beta (50–100 users) → public launch.

---

## Target architecture (production)

```
                    ┌─────────────────┐
                    │   Cloudflare    │  DNS, WAF, CDN (optional)
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌─────────▼─────────┐
     │  Vercel         │          │  Railway / Render   │
     │  apps/web       │  HTTPS   │  apps/api (NestJS)  │
     │  Next.js 15     │◄────────►│  PORT 3001          │
     └────────┬────────┘          └─────────┬───────────┘
              │                             │
              │                    ┌────────┴────────┐
              │                    │                 │
              │             ┌──────▼──────┐   ┌──────▼──────┐
              │             │ Neon / RDS  │   │ Upstash     │
              │             │ PostgreSQL  │   │ Redis       │
              │             └─────────────┘   └─────────────┘
              │
     External: Razorpay · Resend · Cloudinary · Google OAuth · Judge0
```

**Why this split:** Vercel excels at Next.js; NestJS long-running API fits Railway, Render, Fly.io, or AWS ECS better than serverless for webhooks + judge callbacks.

---

## Phase 0 — Blockers (must fix before any real user)

### P0-1 Real code execution (judge)

**Today:** `mock-judge.util.ts` only evaluates “add two integers”.  
**Risk:** Every contest problem is fake for users.

**Action:**
1. Integrate **Judge0 API**, **Piston**, or self-hosted isolate (go-judge).
2. Add `JUDGE_PROVIDER`, API keys, queue for submissions.
3. Map verdicts: AC, WA, TLE, RE, CE — align with existing `SubmissionVerdict` + `verdictDetails`.
4. Support PYTHON, CPP, JAVA, JAVASCRIPT with compile/run per language.
5. Rate-limit submits per user/problem (e.g. 1/10s).
6. Async judge: `PENDING` → worker updates submission (optional v1: sync with 5s timeout).

**Acceptance:** Admin-created problems with arbitrary test cases pass/fail correctly in staging.

---

### P0-2 Live Razorpay (membership + services)

**Today:** `RAZORPAY_MOCK=true` auto-activates subscriptions and service bookings.

**Action:**
1. Create Razorpay **live** account; complete KYC.
2. Create subscription **plan** (₹49/month) → set `RAZORPAY_PLAN_ID`.
3. Set env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_MOCK=false`.
4. Web frontend: `NEXT_PUBLIC_RAZORPAY_KEY_ID` (live key).
5. Configure webhook URL: `https://api.codentra.com/api/v1/webhooks/razorpay` (must be publicly reachable).
6. Test events: `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `payment.failed`.
7. Idempotency: verify `webhook.controller` handles duplicate events (already partially implemented — add tests).
8. **Services bookings:** separate one-time Razorpay orders per service (currently mock order IDs).
9. Admin: payments page shows real transactions; reconciliation export (CSV).

**Acceptance:** Real ₹49 payment activates subscription; cancel flows work; failed payment does not grant access.

---

### P0-3 Database migrations & backups

**Today:** `pnpm db:push` (schema sync, no migration history).

**Action:**
1. Switch to `prisma migrate deploy` for production.
2. Run `prisma migrate dev` locally to baseline current schema → commit `prisma/migrations/`.
3. Neon (recommended) or Supabase/RDS:
   - Connection pooling (`?pgbouncer=true` or Neon pooler URL for API).
   - Direct URL for migrations only.
4. Automated daily backups + point-in-time recovery (Neon Pro / RDS).
5. Never run `db:seed` in production (seed only staging).
6. Document rollback procedure.

**Acceptance:** Deploy to fresh DB using migrations only; restore tested from backup.

---

### P0-4 Auth & session hardening

**Today:** Access token in memory + refresh httpOnly cookie; middleware checks `access_token` cookie (known gap per `ARCHITECTURE_REVIEW.md`).

**Action:**
1. Pick one strategy (recommend **httpOnly cookies for both** access + refresh, SameSite=Lax, Secure in prod).
2. Implement BFF proxy at `apps/web/src/app/api/proxy/[...path]/route.ts` OR align middleware with actual token storage.
3. Production secrets: `JWT_SECRET`, `JWT_REFRESH_SECRET` — 64+ char random, stored in host secret manager.
4. Google OAuth: production redirect URIs for `codentra.com` + staging domain.
5. CSRF: double-submit cookie or SameSite=Strict on state-changing routes.
6. Rate limit: login, register, forgot-password (e.g. 5/min/IP).
7. Password policy + bcrypt rounds verified (12 ✓).

**Acceptance:** Login/logout/refresh works across page reload; no token in localStorage; OWASP basic checklist passed.

---

### P0-5 Environment & secrets management

**Action:**
1. Create **staging** and **production** env sets (never share DB between them).
2. Use host secret managers (Vercel Env, Railway Variables, Doppler, or 1Password).
3. Audit `apps/api/.env.example` + `apps/web/.env.example` — document every var.
4. `NODE_ENV=production`, `CORS_ORIGIN=https://codentra.com`.
5. Disable all mock flags in prod: `RAZORPAY_MOCK=false`, `RESEND_MOCK=false`.

---

## Phase 1 — Infrastructure & deployment

### 1.1 Domains & DNS

| Record | Target |
|--------|--------|
| `codentra.com` | Vercel (web) |
| `www` | Redirect → apex |
| `api.codentra.com` | Railway/Render (API) |
| `staging.codentra.com` | Vercel preview/staging |
| `api-staging.codentra.com` | Staging API |

Enable HTTPS everywhere; HSTS header on web.

---

### 1.2 Web deployment (Vercel)

```bash
# Build command (monorepo)
pnpm build --filter=@codentra/web

# Root directory: apps/web
# Env: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_RAZORPAY_KEY_ID, NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

- Enable preview deployments per PR.
- Production branch: `main`.
- Edge middleware for auth routes (already in `middleware.ts`).

---

### 1.3 API deployment (Railway / Render / Fly)

```bash
pnpm build --filter=@codentra/api
node apps/api/dist/main.js   # or nest start --prod
```

- Health check: `GET /api/v1/health` (extend to include DB ping).
- Webhook route needs **raw body** for Razorpay signature (verify `webhook.controller` raw body middleware).
- Min 1 instance; scale horizontally when CPU > 70%.
- Set `PORT` from host.

---

### 1.4 CI/CD pipeline (extend `.github/workflows/ci.yml`)

| Step | On PR | On merge to main |
|------|-------|------------------|
| typecheck, lint, test, build | ✓ | ✓ |
| Deploy staging | — | ✓ auto |
| Smoke test staging | — | ✓ |
| Deploy production | — | manual approval |
| `prisma migrate deploy` | — | ✓ before API boot |

Add workflow: `deploy-staging.yml`, `deploy-production.yml`.

---

### 1.5 Redis (Phase 1 — high value)

**Use cases:**
- Leaderboard cache (P5-01 in TASKS.md)
- Rate limiting (auth, submit, run)
- Session blacklist on logout (optional)
- Judge job queue (if async)

**Provider:** Upstash Redis (serverless, pay-per-request) or Railway Redis.

---

## Phase 2 — Integrations (production config)

### 2.1 Email (Resend)

- Verify domain `codentra.com` (SPF, DKIM, DMARC).
- Set `RESEND_API_KEY`, `RESEND_FROM=noreply@codentra.com`, `RESEND_MOCK=false`.
- Templates: welcome, subscription confirmed, payment failed, contest reminder, referral interest, password reset.
- Test deliverability (Gmail, Outlook, Yahoo).

---

### 2.2 Cloudinary (avatars + resumes)

- Production cloud name + API keys.
- Upload presets with size limits (avatar 2MB, resume link validation).
- Folder structure: `avatars/{userId}`, `resumes/{bookingId}`.

---

### 2.3 Google OAuth

- Google Cloud Console → OAuth consent screen (production verification if needed).
- Authorized origins + redirect URIs for prod/staging.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`.

---

## Phase 3 — Observability (logging, metrics, alerts)

### 3.1 Structured logging

**Today:** `console.log` in email mock, Nest default logger.

**Action:**
1. Add **Pino** or **Winston** JSON logger in NestJS.
2. Fields: `requestId`, `userId`, `method`, `path`, `statusCode`, `durationMs`.
3. Redact: passwords, tokens, payment payloads.
4. Ship logs to **Axiom**, **Better Stack**, or **Datadog**.

---

### 3.2 Error tracking

1. **Sentry** on API + Web (`@sentry/nestjs`, `@sentry/nextjs`).
2. Source maps uploaded on deploy.
3. Alert on: unhandled 500s, webhook failures, judge timeouts.

---

### 3.3 Metrics & uptime

| Metric | Tool |
|--------|------|
| Uptime | Better Uptime / UptimeRobot on `/health` |
| API latency p95 | Host metrics or Sentry performance |
| DB connections | Neon dashboard |
| Payment success rate | Custom counter + Razorpay dashboard |
| Submission judge latency | Custom histogram |

**Dashboards:** Grafana Cloud free tier or host-native (Railway metrics).

---

### 3.4 Alerting rules (minimum)

- API health check fails > 2 min → PagerDuty/Slack.
- 5xx rate > 1% over 5 min → Slack.
- Razorpay webhook signature failures → immediate.
- DB connection pool exhausted → immediate.
- Disk/CPU > 80% → warning.

---

## Phase 4 — Security & compliance (India launch)

### 4.1 Application security

- [ ] Helmet headers (CSP, X-Frame-Options) on API
- [ ] CORS allowlist production domain only
- [ ] Input validation on all DTOs (class-validator ✓)
- [ ] SQL injection: Prisma parameterized ✓
- [ ] File upload: type/size validation
- [ ] Admin routes: `@Roles(ADMIN)` audit
- [ ] Subscription guard on member routes ✓
- [ ] Dependency audit: `pnpm audit` in CI
- [ ] Secret scanning: GitHub secret scanning enabled

### 4.2 Legal & trust pages

Required before marketing spend:

| Page | Purpose |
|------|---------|
| Terms of Service | Membership, contests, refunds |
| Privacy Policy | Data collection, Razorpay, OAuth |
| Refund / Cancellation | ₹49/month cancel anytime |
| Contact / Support | support@codentra.com |

**India-specific:**
- GST invoice if applicable (consult CA; Razorpay can issue tax invoices).
- Display registered business name on footer + checkout.

---

## Phase 5 — Feature readiness checklist

### Must work for launch

| Feature | Status | Production task |
|---------|--------|-----------------|
| Auth (email + Google) | ✓ dev | OAuth prod URLs, rate limits |
| Subscription ₹49 | mock | Live Razorpay |
| Contests (DSA/CP) | ✓ UI | Real judge |
| Virtual join / upsolve | ✓ | Load test submissions |
| Quizzes | ✓ | — |
| Leaderboards | ✓ | Redis cache at scale |
| Jobs board | ✓ | Moderation workflow |
| Referrals | ✓ | Spam/report abuse flow |
| Services booking | mock pay | Live orders + mentor assign (P4-07) |
| Admin panel | ✓ | Audit logs, role review |
| Notifications | ✓ | Email for critical events |
| Profile / ratings | ✓ | — |

### Post-launch (v1.1)

- Mentor assignment automation (P4-07)
- Employer portal (placeholder today)
- PWA (P5-04)
- Advanced analytics (P5-02)
- Redis leaderboard cache (P5-01)

---

## Phase 6 — Performance & load

### Before launch tests

1. **k6** or **Artillery** scripts:
   - 100 concurrent users browse contests
   - 50 simultaneous quiz submissions
   - 20 code submits/min (judge bottleneck)
2. DB: index review (`contest_participants`, `leaderboard_entries`, `code_submissions`).
3. Next.js: image optimization, bundle analyze.
4. API: pagination limits enforced (already 20–50 on lists).

### Targets (initial)

| Endpoint | p95 |
|----------|-----|
| GET /contests | < 300ms |
| GET /leaderboards | < 500ms (cache < 100ms) |
| POST submit | < 10s (judge dependent) |
| POST /auth/login | < 200ms |

---

## Phase 7 — Operational runbooks

Document in `docs/RUNBOOKS.md`:

1. **Deploy production** — merge → migrate → deploy API → deploy web → smoke test.
2. **Rollback** — previous API image + DB migration revert policy.
3. **Incident: payments down** — enable maintenance banner, Razorpay status page.
4. **Incident: judge down** — disable submit, allow run on samples only.
5. **User data export/delete** — GDPR-style request process.
6. **Contest goes live** — cron or manual status transition (consider scheduled job).

### Scheduled jobs (add)

| Job | Frequency | Purpose |
|-----|-----------|---------|
| Contest status | every 1 min | SCHEDULED→LIVE→ENDED |
| Leaderboard recompute | on submit + nightly | consistency |
| Subscription expiry check | daily | downgrade expired |
| DB backup verify | weekly | restore drill |

Implement via **BullMQ** + Redis or host cron hitting internal endpoints.

---

## Phase 8 — Launch timeline (suggested 6–8 weeks)

```
Week 1–2  │ P0: Migrations, staging env, auth hardening, Sentry
Week 2–3  │ P0: Judge integration + problem admin QA
Week 3–4  │ P0: Razorpay live (test mode → live), Resend, Cloudinary
Week 4–5  │ Load tests, security pass, legal pages, Redis rate limits
Week 5–6  │ Closed beta (50 users), fix feedback
Week 6–7  │ Production deploy, monitoring alerts tuned
Week 7–8  │ Public launch + marketing
```

---

## Environment variable checklist (production)

### API (`apps/api`)

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://codentra.com
DATABASE_URL=postgresql://...pooler...
DATABASE_URL_DIRECT=postgresql://...direct...   # migrations only
JWT_SECRET=<64-char>
JWT_REFRESH_SECRET=<64-char>
FRONTEND_URL=https://codentra.com
RAZORPAY_MOCK=false
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_PLAN_ID=plan_...
RESEND_MOCK=false
RESEND_API_KEY=re_...
RESEND_FROM=Codentra <noreply@codentra.com>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
REDIS_URL=redis://...
JUDGE0_API_URL=...
JUDGE0_API_KEY=...
SENTRY_DSN=...
```

### Web (`apps/web`)

```env
NEXT_PUBLIC_APP_URL=https://codentra.com
NEXT_PUBLIC_API_URL=https://api.codentra.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
SENTRY_DSN=...
```

---

## Cost estimate (early stage, ~500 users)

| Service | Monthly (approx) |
|---------|------------------|
| Vercel Pro | $20 |
| Railway/Render API | $20–50 |
| Neon Postgres | $0–25 |
| Upstash Redis | $0–10 |
| Resend | $0–20 |
| Cloudinary | $0 |
| Razorpay | % per transaction |
| Judge0 / Piston | $20–100 |
| Sentry | $0–26 |
| Domain + Cloudflare | $15 |
| **Total** | **~$75–250/mo** + payment fees |

---

## Pre-launch smoke test script

Run against staging after every deploy:

1. Register new user → verify email path (if enabled)
2. Subscribe with Razorpay test card → dashboard unlocks
3. Join live contest → open problem → run → submit → see verdict
4. Virtual join ended contest → upsolve submit
5. Take quiz → view results → notification bell
6. Post referral → express interest from second user
7. Book service → payment → appears in My bookings
8. Admin: create contest, add problem + test cases
9. Cancel subscription → access revoked on expiry
10. Webhook replay → no duplicate charges

---

## Priority matrix

| Priority | Item | Owner | Est. |
|----------|------|-------|------|
| **P0** | Judge integration | Backend | 1–2 wk |
| **P0** | Razorpay live + webhooks | Backend + Ops | 3–5 d |
| **P0** | Prisma migrations + Neon | Backend | 2–3 d |
| **P0** | Auth/cookie hardening | Full-stack | 3–5 d |
| **P0** | Staging + CI deploy | DevOps | 3–5 d |
| **P1** | Sentry + structured logs | Backend | 2–3 d |
| **P1** | Resend + Cloudinary live | Backend | 1–2 d |
| **P1** | Redis + rate limits | Backend | 2–3 d |
| **P1** | Legal pages | Product/Legal | 3–5 d |
| **P1** | Load testing | QA | 2–3 d |
| **P2** | Contest status cron | Backend | 1–2 d |
| **P2** | Mentor assignment flow | Product | 1 wk |
| **P2** | Analytics dashboard | Product | 2 wk |

---

## Next steps (this week)

1. Create **staging** environment (Neon branch + Vercel preview + Railway API).
2. Baseline **Prisma migrations** from current schema.
3. Spike **Judge0** integration behind `JUDGE_PROVIDER` env flag.
4. Apply for **Razorpay live** KYC in parallel.
5. Add **Sentry** to API and web (quick win for beta).
6. Fix **auth token strategy** before any external beta users.

---

*This document should be updated in `docs/TASKS.md` as production tasks are picked up.*

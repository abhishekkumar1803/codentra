# Codentra — Database Schema

**Version:** 1.0  
**Last Updated:** 2025-06-25  
**ORM:** Prisma  
**Database:** PostgreSQL (Neon)

---

## 1. Overview

This document describes the complete database schema for Codentra. The canonical schema lives in `prisma/schema.prisma`. This document provides entity relationships, indexing strategy, and design decisions.

### 1.1 Design Principles

- UUID primary keys for all tables (distributed-friendly, no enumeration attacks).
- `createdAt` / `updatedAt` on every table.
- Soft deletes (`deletedAt`) on user-facing entities where recovery is needed.
- Monetary amounts stored in **paise** (integer) to avoid floating-point errors.
- Enum types for fixed value sets (status, role, type).
- JSON columns only for flexible metadata, not core relational data.

### 1.2 Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──────▶│ Subscription │◀──────│ Payment  │
└──────────┘       └──────────────┘       └──────────┘
     │                    │                     │
     │                    │                     │
     ▼                    ▼                     ▼
┌──────────────┐   ┌──────────────┐    ┌─────────────────┐
│ Contest      │   │ Notification │    │ ResumeReview    │
│ Participant  │   └──────────────┘    │ MockInterview   │
└──────────────┘                        │ CareerCall      │
     │                                  │ LinkedInReview  │
     ▼                                  └─────────────────┘
┌──────────────┐
│ Leaderboard  │
│ Entry        │
└──────────────┘

┌──────────┐   ┌──────────┐   ┌──────────────┐   ┌─────────────┐
│  Job     │   │ Referral │   │ ActivityLog  │   │ RefreshToken│
└──────────┘   └──────────┘   └──────────────┘   └─────────────┘
```

---

## 2. Enums

### Role
| Value | Description |
|-------|-------------|
| `USER` | Standard platform user |
| `MENTOR` | Can conduct reviews and interviews |
| `ADMIN` | Full platform administration |

### SubscriptionStatus
| Value | Description |
|-------|-------------|
| `ACTIVE` | Subscription is current |
| `PAST_DUE` | Payment failed, grace period |
| `CANCELLED` | User cancelled, active until period end |
| `EXPIRED` | Subscription period ended |

### PaymentType
| Value | Description |
|-------|-------------|
| `SUBSCRIPTION` | Monthly membership |
| `RESUME_REVIEW` | Premium resume review |
| `MOCK_INTERVIEW` | Premium mock interview |
| `CAREER_CALL` | Premium career guidance |
| `LINKEDIN_REVIEW` | Premium LinkedIn review |

### PaymentStatus
| Value | Description |
|-------|-------------|
| `PENDING` | Order created, awaiting payment |
| `SUCCESS` | Payment completed |
| `FAILED` | Payment failed |
| `REFUNDED` | Payment refunded |

### ContestType
| Value | Description |
|-------|-------------|
| `DSA` | Data structures & algorithms |
| `COMPETITIVE_PROGRAMMING` | CP contests with rating |
| `SYSTEM_DESIGN` | Architecture challenges |
| `QUIZ` | MCQ technical quizzes |

### ContestStatus
| Value | Description |
|-------|-------------|
| `DRAFT` | Not visible to users |
| `SCHEDULED` | Published, not yet started |
| `LIVE` | Currently running |
| `ENDED` | Finished |

### ParticipantStatus
| Value | Description |
|-------|-------------|
| `REGISTERED` | Signed up, not started |
| `IN_PROGRESS` | Actively participating |
| `SUBMITTED` | Completed submission |
| `DISQUALIFIED` | Removed from contest |

### LeaderboardPeriod
| Value | Description |
|-------|-------------|
| `CONTEST` | Single contest ranking |
| `WEEKLY` | Weekly global ranking |
| `MONTHLY` | Monthly global ranking |
| `ALL_TIME` | All-time global ranking |

### JobType
| Value | Description |
|-------|-------------|
| `REMOTE` | Fully remote |
| `HYBRID` | Hybrid work |
| `ONSITE` | On-site only |

### ReferralStatus
| Value | Description |
|-------|-------------|
| `OPEN` | Accepting applications |
| `CLOSED` | No longer accepting |

### ServiceStatus
| Value | Description |
|-------|-------------|
| `PENDING` | Awaiting scheduling/payment |
| `SCHEDULED` | Scheduled for future |
| `IN_REVIEW` | Being reviewed (async services) |
| `COMPLETED` | Service delivered |
| `CANCELLED` | Cancelled by user or admin |

### NotificationType
| Value | Description |
|-------|-------------|
| `CONTEST_REMINDER` | Upcoming contest |
| `CONTEST_RESULT` | Contest results available |
| `SUBSCRIPTION` | Subscription events |
| `PAYMENT` | Payment events |
| `SERVICE_UPDATE` | Premium service status change |
| `SYSTEM` | Platform announcements |

---

## 3. Tables

### 3.1 users

Core user account table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| name | VARCHAR(255) | NOT NULL | Display name |
| avatar_url | TEXT | NULLABLE | Profile image URL |
| password_hash | TEXT | NULLABLE | bcrypt hash (null for OAuth-only) |
| google_id | VARCHAR(255) | UNIQUE, NULLABLE | Google OAuth subject ID |
| role | Role | NOT NULL, DEFAULT 'USER' | User role |
| email_verified | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account active flag |
| last_login_at | TIMESTAMPTZ | NULLABLE | Last login timestamp |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:**
- `idx_users_email` ON (email)
- `idx_users_google_id` ON (google_id) WHERE google_id IS NOT NULL
- `idx_users_role` ON (role)

---

### 3.2 refresh_tokens

JWT refresh token storage for secure session management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | Token owner |
| token_hash | TEXT | NOT NULL | Hashed refresh token |
| expires_at | TIMESTAMPTZ | NOT NULL | Expiration time |
| revoked_at | TIMESTAMPTZ | NULLABLE | Revocation time |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:**
- `idx_refresh_tokens_user_id` ON (user_id)
- `idx_refresh_tokens_token_hash` ON (token_hash)

**onDelete:** CASCADE when user deleted.

---

### 3.3 subscriptions

Monthly membership subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL | One active sub per user |
| status | SubscriptionStatus | NOT NULL, DEFAULT 'ACTIVE' | |
| razorpay_subscription_id | VARCHAR(255) | UNIQUE, NULLABLE | Razorpay sub ID |
| razorpay_plan_id | VARCHAR(255) | NULLABLE | Razorpay plan ID |
| current_period_start | TIMESTAMPTZ | NOT NULL | Billing period start |
| current_period_end | TIMESTAMPTZ | NOT NULL | Billing period end |
| cancelled_at | TIMESTAMPTZ | NULLABLE | When user cancelled |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:**
- `idx_subscriptions_user_id` ON (user_id)
- `idx_subscriptions_status` ON (status)
- `idx_subscriptions_razorpay_id` ON (razorpay_subscription_id)

**onDelete:** CASCADE when user deleted.

---

### 3.4 payments

All payment transactions (subscriptions and premium services).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | Payer |
| subscription_id | UUID | FK → subscriptions.id, NULLABLE | Linked subscription |
| type | PaymentType | NOT NULL | Payment category |
| amount | INTEGER | NOT NULL | Amount in paise |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'INR' | |
| status | PaymentStatus | NOT NULL, DEFAULT 'PENDING' | |
| razorpay_order_id | VARCHAR(255) | UNIQUE, NULLABLE | |
| razorpay_payment_id | VARCHAR(255) | UNIQUE, NULLABLE | |
| razorpay_signature | TEXT | NULLABLE | Webhook verification |
| metadata | JSONB | NULLABLE | Extra payment context |
| paid_at | TIMESTAMPTZ | NULLABLE | Successful payment time |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:**
- `idx_payments_user_id` ON (user_id)
- `idx_payments_status` ON (status)
- `idx_payments_razorpay_order` ON (razorpay_order_id)
- `idx_payments_type` ON (type)

**onDelete:** RESTRICT (preserve payment history).

---

### 3.5 contests

All contest types (DSA, CP, System Design, Quiz).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| title | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| description | TEXT | NOT NULL | |
| type | ContestType | NOT NULL | |
| status | ContestStatus | NOT NULL, DEFAULT 'DRAFT' | |
| start_time | TIMESTAMPTZ | NOT NULL | |
| end_time | TIMESTAMPTZ | NOT NULL | |
| duration_minutes | INTEGER | NOT NULL | Contest duration |
| max_participants | INTEGER | NULLABLE | Null = unlimited |
| created_by_id | UUID | FK → users.id, NOT NULL | Admin who created |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:**
- `idx_contests_slug` ON (slug)
- `idx_contests_type_status` ON (type, status)
- `idx_contests_start_time` ON (start_time)

---

### 3.6 contest_participants

User participation in contests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| contest_id | UUID | FK → contests.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| status | ParticipantStatus | NOT NULL, DEFAULT 'REGISTERED' | |
| score | INTEGER | NOT NULL, DEFAULT 0 | |
| rank | INTEGER | NULLABLE | Final rank after contest ends |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| submitted_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Unique:** (contest_id, user_id)

**Indexes:**
- `idx_participants_contest_id` ON (contest_id)
- `idx_participants_user_id` ON (user_id)
- `idx_participants_contest_score` ON (contest_id, score DESC)

**onDelete:** CASCADE for contest; RESTRICT for user.

---

### 3.7 leaderboard_entries

Materialized leaderboard rankings (updated after contests or periodically).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| contest_id | UUID | FK → contests.id, NULLABLE | Null for global leaderboards |
| period | LeaderboardPeriod | NOT NULL | |
| score | INTEGER | NOT NULL, DEFAULT 0 | |
| rank | INTEGER | NOT NULL | |
| period_start | TIMESTAMPTZ | NULLABLE | For weekly/monthly |
| period_end | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:**
- `idx_leaderboard_period_rank` ON (period, rank)
- `idx_leaderboard_contest` ON (contest_id, rank) WHERE contest_id IS NOT NULL
- `idx_leaderboard_user` ON (user_id)

---

### 3.8 jobs

Curated job listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| title | VARCHAR(255) | NOT NULL | |
| company | VARCHAR(255) | NOT NULL | |
| description | TEXT | NOT NULL | |
| location | VARCHAR(255) | NULLABLE | |
| job_type | JobType | NOT NULL | |
| salary_min | INTEGER | NULLABLE | In paise/year |
| salary_max | INTEGER | NULLABLE | In paise/year |
| apply_url | TEXT | NOT NULL | External apply link |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| posted_by_id | UUID | FK → users.id, NOT NULL | Admin |
| deleted_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:**
- `idx_jobs_active` ON (is_active) WHERE is_active = true
- `idx_jobs_company` ON (company)

---

### 3.9 referrals

Community referral board posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| referrer_id | UUID | FK → users.id, NOT NULL | User posting referral |
| company | VARCHAR(255) | NOT NULL | |
| role_title | VARCHAR(255) | NOT NULL | |
| description | TEXT | NOT NULL | |
| requirements | TEXT | NULLABLE | |
| status | ReferralStatus | NOT NULL, DEFAULT 'OPEN' | |
| contact_email | VARCHAR(255) | NULLABLE | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:**
- `idx_referrals_status` ON (status)
- `idx_referrals_referrer` ON (referrer_id)
- `idx_referrals_company` ON (company)

---

### 3.10 resume_reviews

Premium resume review service bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| payment_id | UUID | FK → payments.id, UNIQUE, NOT NULL | |
| reviewer_id | UUID | FK → users.id, NULLABLE | Mentor/admin |
| status | ServiceStatus | NOT NULL, DEFAULT 'PENDING' | |
| resume_url | TEXT | NOT NULL | Cloudinary URL |
| feedback | TEXT | NULLABLE | Reviewer feedback |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.11 mock_interviews

Premium mock interview bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| payment_id | UUID | FK → payments.id, UNIQUE, NOT NULL | |
| mentor_id | UUID | FK → users.id, NULLABLE | Assigned mentor |
| status | ServiceStatus | NOT NULL, DEFAULT 'PENDING' | |
| scheduled_at | TIMESTAMPTZ | NULLABLE | |
| duration_minutes | INTEGER | NOT NULL, DEFAULT 60 | |
| meeting_link | TEXT | NULLABLE | |
| feedback | TEXT | NULLABLE | Post-interview feedback |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.12 career_calls

Premium career guidance call bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| payment_id | UUID | FK → payments.id, UNIQUE, NOT NULL | |
| mentor_id | UUID | FK → users.id, NULLABLE | |
| status | ServiceStatus | NOT NULL, DEFAULT 'PENDING' | |
| scheduled_at | TIMESTAMPTZ | NULLABLE | |
| duration_minutes | INTEGER | NOT NULL, DEFAULT 30 | |
| meeting_link | TEXT | NULLABLE | |
| notes | TEXT | NULLABLE | |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.13 linkedin_reviews

Premium LinkedIn profile review service.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| payment_id | UUID | FK → payments.id, UNIQUE, NOT NULL | |
| reviewer_id | UUID | FK → users.id, NULLABLE | |
| status | ServiceStatus | NOT NULL, DEFAULT 'PENDING' | |
| linkedin_url | TEXT | NOT NULL | |
| feedback | TEXT | NULLABLE | |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

---

### 3.14 notifications

In-app notifications for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| type | NotificationType | NOT NULL | |
| title | VARCHAR(255) | NOT NULL | |
| body | TEXT | NOT NULL | |
| metadata | JSONB | NULLABLE | Deep link data |
| read_at | TIMESTAMPTZ | NULLABLE | Null = unread |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:**
- `idx_notifications_user_unread` ON (user_id, read_at) WHERE read_at IS NULL
- `idx_notifications_user_created` ON (user_id, created_at DESC)

**onDelete:** CASCADE when user deleted.

---

### 3.15 activity_logs

Audit trail for user and system actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NULLABLE | Null for system actions |
| action | VARCHAR(100) | NOT NULL | e.g., 'user.login', 'subscription.created' |
| entity_type | VARCHAR(50) | NULLABLE | e.g., 'contest', 'payment' |
| entity_id | UUID | NULLABLE | Related entity ID |
| metadata | JSONB | NULLABLE | Additional context |
| ip_address | INET | NULLABLE | Client IP |
| user_agent | TEXT | NULLABLE | Client user agent |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:**
- `idx_activity_logs_user_id` ON (user_id)
- `idx_activity_logs_action` ON (action)
- `idx_activity_logs_created` ON (created_at DESC)
- `idx_activity_logs_entity` ON (entity_type, entity_id)

**Retention:** 90 days in hot storage; archive to cold storage after.

---

## 4. Relationships Summary

| Parent | Child | Relationship | onDelete |
|--------|-------|--------------|----------|
| User | RefreshToken | 1:N | CASCADE |
| User | Subscription | 1:1 | CASCADE |
| User | Payment | 1:N | RESTRICT |
| User | ContestParticipant | 1:N | RESTRICT |
| User | LeaderboardEntry | 1:N | CASCADE |
| User | Referral | 1:N | RESTRICT |
| User | Notification | 1:N | CASCADE |
| User | ActivityLog | 1:N | SET NULL |
| Subscription | Payment | 1:N | SET NULL |
| Contest | ContestParticipant | 1:N | CASCADE |
| Contest | LeaderboardEntry | 1:N | CASCADE |
| Payment | ResumeReview | 1:1 | RESTRICT |
| Payment | MockInterview | 1:1 | RESTRICT |
| Payment | CareerCall | 1:1 | RESTRICT |
| Payment | LinkedInReview | 1:1 | RESTRICT |

---

## 5. Indexing Strategy

### 5.1 Query Patterns

| Query | Index Used |
|-------|-----------|
| Login by email | `idx_users_email` |
| OAuth by google_id | `idx_users_google_id` |
| Active subscriptions | `idx_subscriptions_status` |
| User payment history | `idx_payments_user_id` |
| Upcoming contests | `idx_contests_start_time` |
| Contest leaderboard | `idx_participants_contest_score` |
| Unread notifications | `idx_notifications_user_unread` |
| Admin activity audit | `idx_activity_logs_created` |

### 5.2 Scaling Considerations (10k–100k users)

- **Connection pooling:** PgBouncer via Neon (transaction mode).
- **Read replicas:** Enable at 10k+ concurrent users for leaderboard queries.
- **Partitioning:** `activity_logs` by month at 1M+ rows.
- **Caching:** Redis for leaderboard top-100 at 50k+ users (Phase 5).

---

## 6. Migration Strategy

1. All schema changes via `prisma migrate dev` (development) and `prisma migrate deploy` (production).
2. Never edit applied migration files.
3. Destructive changes require data migration scripts in separate files.
4. Seed script (`prisma/seed.ts`) for development data (admin user, sample contests).

---

## 7. Data Seeding (Development)

| Entity | Seed Data |
|--------|-----------|
| Admin user | admin@codentra.com |
| Sample contests | 2 DSA, 1 Quiz (DRAFT) |
| Sample jobs | 5 active listings |

---

## 8. Prisma Schema Location

Canonical schema: `prisma/schema.prisma`

Run commands:
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

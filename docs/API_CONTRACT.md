# Codentra — API Contract

**Version:** 1.0  
**Base URL:** `https://api.codentra.com/api/v1`  
**Last Updated:** 2025-06-25

---

## 1. Conventions

### 1.1 Authentication

Protected endpoints require:

```
Authorization: Bearer <access_token>
```

Refresh token sent via httpOnly cookie: `refresh_token`

### 1.2 Response Envelope

**Success:**

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "Email is required" }]
  }
}
```

### 1.3 Pagination

Query params: `?page=1&limit=20&sort=createdAt&order=desc`

### 1.4 Error Codes

| Code                    | HTTP | Description                  |
| ----------------------- | ---- | ---------------------------- |
| `VALIDATION_ERROR`      | 400  | Invalid request body/params  |
| `UNAUTHORIZED`          | 401  | Missing or invalid token     |
| `FORBIDDEN`             | 403  | Insufficient permissions     |
| `NOT_FOUND`             | 404  | Resource not found           |
| `CONFLICT`              | 409  | Duplicate resource           |
| `SUBSCRIPTION_REQUIRED` | 403  | Active subscription required |
| `RATE_LIMITED`          | 429  | Too many requests            |
| `INTERNAL_ERROR`        | 500  | Server error                 |

---

## 2. Health

### GET /health

Public health check.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-06-25T10:00:00Z",
    "version": "1.0.0"
  }
}
```

---

## 3. Authentication

### POST /auth/register

Register with email and password.

**Auth:** Public  
**Rate limit:** 5/min per IP

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Validation:**

- `email`: valid email, max 255
- `password`: min 8 chars, 1 uppercase, 1 number, 1 special
- `name`: min 2, max 255

**Response 201:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "emailVerified": false
    },
    "accessToken": "jwt",
    "expiresIn": 900
  }
}
```

**Errors:** `CONFLICT` (email exists), `VALIDATION_ERROR`

---

### POST /auth/login

Login with email and password.

**Auth:** Public  
**Rate limit:** 10/min per IP

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "...", "role": "USER" },
    "accessToken": "jwt",
    "expiresIn": 900
  }
}
```

Sets `refresh_token` httpOnly cookie.

**Errors:** `UNAUTHORIZED` (invalid credentials)

---

### POST /auth/google

Google OAuth login/register.

**Auth:** Public

**Request:**

```json
{
  "code": "google_auth_code",
  "redirectUri": "https://codentra.com/auth/callback/google"
}
```

**Response 200:** Same as login.

---

### POST /auth/refresh

Refresh access token.

**Auth:** Refresh token cookie

**Response 200:**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "expiresIn": 900
  }
}
```

**Errors:** `UNAUTHORIZED` (invalid/expired refresh token)

---

### POST /auth/logout

Revoke refresh token.

**Auth:** Required

**Response 204:** No content

---

### POST /auth/forgot-password

Request password reset email.

**Auth:** Public  
**Rate limit:** 3/hour per email

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "If the email exists, a reset link has been sent." }
}
```

---

### POST /auth/reset-password

Reset password with token.

**Auth:** Public

**Request:**

```json
{
  "token": "reset_token",
  "password": "NewSecurePass123!"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { "message": "Password reset successful." }
}
```

---

### GET /auth/me

Get current authenticated user.

**Auth:** Required

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://...",
    "role": "USER",
    "emailVerified": true,
    "subscription": {
      "status": "ACTIVE",
      "currentPeriodEnd": "2025-07-25T00:00:00Z"
    },
    "createdAt": "2025-06-01T00:00:00Z"
  }
}
```

---

## 4. Users

### PATCH /users/me

Update current user profile.

**Auth:** Required

**Request:**

```json
{
  "name": "Jane Doe",
  "avatarUrl": "https://res.cloudinary.com/..."
}
```

**Response 200:** Updated user object.

---

### POST /users/me/avatar

Upload avatar (returns Cloudinary URL).

**Auth:** Required  
**Content-Type:** multipart/form-data

**Request:** `file` (image, max 2MB)

**Response 200:**

```json
{
  "success": true,
  "data": { "avatarUrl": "https://res.cloudinary.com/..." }
}
```

---

## 5. Subscriptions

### GET /subscriptions/me

Get current user's subscription.

**Auth:** Required

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACTIVE",
    "currentPeriodStart": "2025-06-25T00:00:00Z",
    "currentPeriodEnd": "2025-07-25T00:00:00Z",
    "cancelledAt": null,
    "createdAt": "2025-06-25T00:00:00Z"
  }
}
```

**Response 200 (no subscription):**

```json
{
  "success": true,
  "data": null
}
```

---

### POST /subscriptions

Create subscription (initiates Razorpay checkout).

**Auth:** Required

**Request:**

```json
{
  "planId": "plan_membership_monthly"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "subscriptionId": "uuid",
    "razorpaySubscriptionId": "sub_xxx",
    "razorpayKeyId": "rzp_xxx",
    "amount": 4900,
    "currency": "INR"
  }
}
```

---

### POST /subscriptions/verify

Verify Razorpay payment after checkout.

**Auth:** Required

**Request:**

```json
{
  "razorpayPaymentId": "pay_xxx",
  "razorpaySubscriptionId": "sub_xxx",
  "razorpaySignature": "signature"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "subscription": { "id": "uuid", "status": "ACTIVE", "...": "..." }
  }
}
```

---

### POST /subscriptions/cancel

Cancel subscription (active until period end).

**Auth:** Required

**Response 200:**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "status": "CANCELLED",
      "cancelledAt": "2025-06-25T10:00:00Z",
      "currentPeriodEnd": "2025-07-25T00:00:00Z"
    }
  }
}
```

---

## 6. Payments

### GET /payments/me

Get current user's payment history.

**Auth:** Required

**Query:** `?page=1&limit=20&type=SUBSCRIPTION`

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "SUBSCRIPTION",
      "amount": 4900,
      "currency": "INR",
      "status": "SUCCESS",
      "paidAt": "2025-06-25T00:00:00Z",
      "createdAt": "2025-06-25T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5 }
}
```

---

### POST /webhooks/razorpay

Razorpay webhook handler.

**Auth:** Razorpay signature verification  
**Content-Type:** application/json

**Events handled:**

- `subscription.activated`
- `subscription.charged`
- `subscription.cancelled`
- `subscription.completed`
- `payment.failed`

**Response 200:** `{ "success": true }`

---

## 7. Contests

### GET /contests

List contests.

**Auth:** Required (subscription for LIVE contests in Phase 2)  
**Query:** `?page=1&limit=20&type=DSA&status=SCHEDULED`

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Weekly DSA Challenge",
      "slug": "weekly-dsa-challenge",
      "type": "DSA",
      "status": "SCHEDULED",
      "startTime": "2025-07-01T10:00:00Z",
      "endTime": "2025-07-01T12:00:00Z",
      "durationMinutes": 120,
      "participantCount": 45
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 10 }
}
```

---

### GET /contests/:slug

Get contest details.

**Auth:** Required

**Response 200:** Full contest object with participant count.

---

### POST /contests/:id/join

Join a contest.

**Auth:** Required + Subscription

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "contestId": "uuid",
    "status": "REGISTERED",
    "joinedAt": "2025-06-25T10:00:00Z"
  }
}
```

---

### GET /contests/:id/participants

List contest participants (ranked).

**Auth:** Required

**Query:** `?page=1&limit=50`

---

## 8. Leaderboards

### GET /leaderboards

Get global leaderboard.

**Auth:** Required  
**Query:** `?period=WEEKLY&page=1&limit=50`

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "uuid",
      "userName": "John Doe",
      "avatarUrl": "https://...",
      "score": 1500
    }
  ],
  "meta": { "period": "WEEKLY", "page": 1, "limit": 50, "total": 200 }
}
```

---

### GET /leaderboards/me

Get current user's ranking across periods.

**Auth:** Required

---

## 9. Jobs

### GET /jobs

List active jobs.

**Auth:** Required + Subscription

**Query:** `?page=1&limit=20&jobType=REMOTE&search=engineer`

---

### GET /jobs/:id

Get job details.

**Auth:** Required + Subscription

---

## 10. Referrals

### GET /referrals

List open referrals.

**Auth:** Required + Subscription

**Query:** `?page=1&limit=20&status=OPEN&company=Google`

---

### POST /referrals

Create referral post.

**Auth:** Required + Subscription

**Request:**

```json
{
  "company": "Google",
  "roleTitle": "Software Engineer",
  "description": "Looking to refer for L4 SWE role...",
  "requirements": "3+ years experience",
  "contactEmail": "referrer@example.com"
}
```

---

### PATCH /referrals/:id

Update referral (owner or admin).

**Auth:** Required

---

### DELETE /referrals/:id

Close/delete referral.

**Auth:** Required (owner or admin)

---

## 11. Premium Services

### POST /services/resume-review

Book resume review.

**Auth:** Required

**Request:** multipart/form-data with `resume` file

**Response 201:** Payment checkout details + service booking.

---

### POST /services/mock-interview

Book mock interview.

**Auth:** Required

**Request:**

```json
{
  "preferredDate": "2025-07-01T10:00:00Z",
  "notes": "Focus on system design"
}
```

---

### POST /services/career-call

Book career guidance call.

**Auth:** Required

---

### POST /services/linkedin-review

Book LinkedIn review.

**Auth:** Required

**Request:**

```json
{
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```

---

### GET /services/me

Get user's premium service bookings.

**Auth:** Required

**Query:** `?type=RESUME_REVIEW&status=PENDING`

---

## 12. Notifications

### GET /notifications

Get user notifications.

**Auth:** Required

**Query:** `?page=1&limit=20&unreadOnly=true`

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "SUBSCRIPTION",
      "title": "Subscription Activated",
      "body": "Your membership is now active.",
      "readAt": null,
      "createdAt": "2025-06-25T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "unreadCount": 2 }
}
```

---

### PATCH /notifications/:id/read

Mark notification as read.

**Auth:** Required

**Response 200:** Updated notification.

---

### POST /notifications/read-all

Mark all notifications as read.

**Auth:** Required

**Response 200:** `{ "success": true, "data": { "markedCount": 5 } }`

---

## 13. Admin

All admin endpoints require `role: ADMIN`.

### GET /admin/dashboard

Platform metrics.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeSubscribers": 340,
    "monthlyRevenue": 166600,
    "newUsersThisMonth": 89,
    "churnRate": 0.05
  }
}
```

---

### GET /admin/users

List all users.

**Query:** `?page=1&limit=20&search=john&role=USER&status=active`

---

### GET /admin/users/:id

Get user details with subscription and payment history.

---

### PATCH /admin/users/:id

Update user (role, isActive).

**Request:**

```json
{
  "role": "MENTOR",
  "isActive": true
}
```

---

### GET /admin/subscriptions

List all subscriptions.

**Query:** `?page=1&limit=20&status=ACTIVE`

---

### GET /admin/payments

List all payments.

**Query:** `?page=1&limit=20&status=SUCCESS&type=SUBSCRIPTION`

---

### GET /admin/activity-logs

View activity logs.

**Query:** `?page=1&limit=50&action=user.login&userId=uuid&from=2025-06-01&to=2025-06-25`

---

### POST /admin/contests

Create contest (Phase 2).

**Request:**

```json
{
  "title": "Weekly DSA Challenge",
  "description": "...",
  "type": "DSA",
  "startTime": "2025-07-01T10:00:00Z",
  "endTime": "2025-07-01T12:00:00Z",
  "durationMinutes": 120
}
```

---

### POST /admin/jobs

Create job listing (Phase 3).

---

## 14. Phase 1 Endpoint Summary

| Method | Endpoint              | Auth     | Phase |
| ------ | --------------------- | -------- | ----- |
| GET    | /health               | Public   | 1     |
| POST   | /auth/register        | Public   | 1     |
| POST   | /auth/login           | Public   | 1     |
| POST   | /auth/google          | Public   | 1     |
| POST   | /auth/refresh         | Cookie   | 1     |
| POST   | /auth/logout          | Required | 1     |
| POST   | /auth/forgot-password | Public   | 1     |
| POST   | /auth/reset-password  | Public   | 1     |
| GET    | /auth/me              | Required | 1     |
| PATCH  | /users/me             | Required | 1     |
| POST   | /users/me/avatar      | Required | 1     |
| GET    | /subscriptions/me     | Required | 1     |
| POST   | /subscriptions        | Required | 1     |
| POST   | /subscriptions/verify | Required | 1     |
| POST   | /subscriptions/cancel | Required | 1     |
| GET    | /payments/me          | Required | 1     |
| POST   | /webhooks/razorpay    | Webhook  | 1     |
| GET    | /admin/dashboard      | Admin    | 1     |
| GET    | /admin/users          | Admin    | 1     |
| GET    | /admin/users/:id      | Admin    | 1     |
| PATCH  | /admin/users/:id      | Admin    | 1     |
| GET    | /admin/subscriptions  | Admin    | 1     |
| GET    | /admin/payments       | Admin    | 1     |
| GET    | /admin/activity-logs  | Admin    | 1     |

---

## 15. Webhook Security

Razorpay webhooks verified via HMAC SHA256:

```
expected_signature = hmac_sha256(webhook_secret, raw_body)
```

Reject requests where `X-Razorpay-Signature` does not match.

All webhook handlers must be **idempotent** — check if event already processed before mutating state.

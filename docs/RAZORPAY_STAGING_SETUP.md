# Razorpay Setup — Complete Guide

**Goal:** Enable real ₹49/month membership checkout on Codentra (staging first, production later).  
**Time:** ~30–45 minutes first time.  
**Cost:** **₹0** in test mode. Live mode = ~2–3% per successful payment only (no monthly fee).

**Staging URLs (yours):**

| Service | URL |
| ------- | --- |
| Web | https://codentra-web.vercel.app |
| API | https://codentraapi-staging.up.railway.app |
| Webhook | `https://codentraapi-staging.up.railway.app/api/v1/webhooks/razorpay` |
| Checkout page | https://codentra-web.vercel.app/subscribe |

---

## Part 0 — How Codentra payments work (read this first)

```
1. User clicks "Subscribe Now" on /subscribe
2. Browser → POST /api/v1/subscriptions (Railway API)
3. API creates Razorpay subscription → returns key + subscription id
4. Razorpay checkout modal opens in browser
5. User pays (card / UPI / netbanking)
6. Razorpay → POST webhook to Railway API
7. API sets subscription status = ACTIVE
8. Frontend polls every 2s → redirects to dashboard
```

**Key points:**

- Codentra **already has all code built** — you only configure Razorpay + env vars.
- **Mock mode** (`RAZORPAY_MOCK=true`) skips payment and auto-activates — good for local dev only.
- **Real mode** requires webhook — without it, payment succeeds but subscription stays PENDING forever.
- Frontend gets Razorpay key from **API response** — no Vercel Razorpay env var needed for membership.
- **Premium services** (`/services`) still use mock payment — this guide covers **membership only**.

---

## Part 1 — Create Razorpay account (Test Mode)

### 1.1 Sign up

1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with email or Google
3. Complete basic profile (name, phone)

### 1.2 Stay in Test Mode

Top-left of dashboard shows **Test Mode** / **Live Mode** toggle.

- **Test Mode** = fake money, test cards, free — use this for staging
- **Live Mode** = real payments, requires KYC — use only for production launch

**Keep Test Mode ON for now.**

### 1.3 Generate API keys (test)

1. Dashboard → **Account & Settings** (gear icon)
2. **API Keys** → **Generate Key** (under Test Mode)
3. A popup shows:
   - **Key Id** — starts with `rzp_test_...`
   - **Key Secret** — shown **once** — copy immediately
4. Store both in a password manager — you will paste them into Railway

> If you lose the secret, regenerate a new key pair in the dashboard.

---

## Part 2 — Create subscription plan (₹49/month)

Codentra uses Razorpay **Subscriptions** (recurring billing), not one-time payments.

1. Dashboard → **Subscriptions** (left sidebar)
2. If prompted, enable Subscriptions product (free in test mode)
3. **Plans** tab → **+ New Plan**
4. Fill in:

   | Field | Value |
   | ----- | ----- |
   | Plan name | `Codentra Membership` |
   | Description | `Monthly access to contests, quizzes, jobs` |
   | Billing amount | `49` |
   | Currency | INR |
   | Billing interval | Every **1** **Month(s)** |
   | Billing cycle | Unlimited (or set max cycles if you prefer) |

5. **Create Plan**
6. Open the plan → copy **Plan ID** (format: `plan_xxxxxxxxxxxx`)

This Plan ID becomes `RAZORPAY_PLAN_ID` on Railway.

> **Common mistake:** Creating the plan in **Live Mode** but using **test** API keys — plan IDs are mode-specific. Always create plans in the same mode as your keys.

---

## Part 3 — Configure Railway (staging API)

Open [Railway](https://railway.app) → your project → **API service** → **Variables**.

### 3.1 Set these variables

| Variable | Value | Notes |
| -------- | ----- | ----- |
| `RAZORPAY_MOCK` | `false` | **Critical** — must be false for real checkout |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | From Part 1.3 |
| `RAZORPAY_KEY_SECRET` | your test secret | Never expose to frontend |
| `RAZORPAY_PLAN_ID` | `plan_...` | From Part 2 |
| `RAZORPAY_WEBHOOK_SECRET` | *(Part 4)* | Add after webhook is created |
| `MEMBERSHIP_AMOUNT_PAISE` | `4900` | ₹49 × 100 paise |

### 3.2 Remove mock override

If `RAZORPAY_MOCK=true` exists, **delete it or set to `false`**.

### 3.3 Redeploy

Railway → **Deploy** (or push to `staging` branch if auto-deploy is on).

Wait until deploy is healthy:  
`https://codentraapi-staging.up.railway.app/api/v1/health` → should return OK.

---

## Part 4 — Configure Razorpay webhook

Webhooks tell Codentra when payment succeeded — without this, users pay but stay locked out.

### 4.1 Create webhook

1. Razorpay Dashboard → **Account & Settings** → **Webhooks**
2. **+ Add New Webhook**
3. **Webhook URL** (paste exactly):

   ```
   https://codentraapi-staging.up.railway.app/api/v1/webhooks/razorpay
   ```

4. **Alert email** — your email (optional but recommended)
5. **Active Events** — enable these 5:

   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.completed`
   - `payment.failed`

6. **Create Webhook**
7. Copy the **Webhook Secret** shown after creation

### 4.2 Add secret to Railway

1. Railway → API Variables → add/update:
   ```
   RAZORPAY_WEBHOOK_SECRET=<paste webhook secret>
   ```
2. **Redeploy** again

### 4.3 Verify webhook is reachable

Razorpay Dashboard → Webhooks → your webhook → **Send Test Webhook** (if available).

Or after a test payment, check **Logs** tab — expect **HTTP 200**.

---

## Part 5 — Test end-to-end on staging

### 5.1 Use a user without subscription

The seed user `demo@codentra.dev` may already have a subscription. Either:

- Register a **new account** on https://codentra-web.vercel.app/register, or
- Use admin panel to cancel demo user's subscription first

### 5.2 Subscribe flow

1. Log in → go to https://codentra-web.vercel.app/subscribe
2. Click **Subscribe Now**
3. **Expected:** Razorpay popup opens (card / UPI / netbanking tabs)
4. **Wrong:** Instant redirect to dashboard = still in mock mode

### 5.3 Pay with test card

| Field | Value |
| ----- | ----- |
| Card number | `4111 1111 1111 1111` |
| Expiry | any future date (e.g. `12/30`) |
| CVV | any 3 digits (e.g. `123`) |
| Name | any name |
| OTP (if asked) | `123456` |

More test cards: [Razorpay test docs](https://razorpay.com/docs/payments/payments/test-card-details/)

### 5.4 Pay with test UPI (optional)

In Razorpay modal → **UPI** tab → enter `success@razorpay` → Pay.

### 5.5 Confirm success

After payment:

1. Page shows **"Confirming your payment..."** (polls every 2 seconds)
2. Redirects to **Dashboard** within ~10–30 seconds
3. Check **Settings → Subscription** → status **Active**
4. Try joining a contest — should work (subscription required)
5. Razorpay Dashboard → **Transactions** → test payment visible

### 5.6 Test cancel

1. **Dashboard → Settings → Subscription** → Cancel
2. Status → **Cancelled**
3. Contest join should fail with subscription required message

### 5.7 Test payment history

**Dashboard → Settings → Subscription** — payment history section should show ₹49 SUCCESS entry.

---

## Part 6 — Local development (optional)

For local dev on your Mac, keep mock mode — no Razorpay account needed:

**`apps/api/.env`:**

```env
RAZORPAY_MOCK=true
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PLAN_ID=plan_membership_monthly
MEMBERSHIP_AMOUNT_PAISE=4900
```

Run `pnpm dev` → `/subscribe` auto-activates without payment popup.

To test real Razorpay locally:

1. Set test keys + `RAZORPAY_MOCK=false`
2. Use [ngrok](https://ngrok.com) to expose localhost:3001
3. Set webhook URL to `https://YOUR-NGROK.ngrok.io/api/v1/webhooks/razorpay`

---

## Part 7 — Production (when you launch)

Do this **after** staging works and you're ready for real money.

### 7.1 Complete Razorpay KYC

1. Dashboard → switch to **Live Mode**
2. **Account & Settings → Business Settings** → complete KYC:
   - PAN
   - Bank account (for settlements)
   - Business type (individual / proprietorship / company)
   - Website URL: `https://codentra-web.vercel.app` (or custom domain)

KYC usually takes 1–3 business days.

### 7.2 Create live plan + keys

Repeat Part 1 and Part 2 in **Live Mode**:

- New live API keys (`rzp_live_...`)
- New live plan ID (`plan_...` — different from test plan)

### 7.3 Production Railway env vars

Same variables as staging, but with **live** values:

```env
RAZORPAY_MOCK=false
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_PLAN_ID=plan_...        # live plan
RAZORPAY_WEBHOOK_SECRET=...      # live webhook secret
MEMBERSHIP_AMOUNT_PAISE=4900
```

### 7.4 Production webhook URL

When you have a production API domain (e.g. `api.codentra.com`):

```
https://api.codentra.com/api/v1/webhooks/razorpay
```

Create a **separate webhook** in Live Mode (don't reuse test webhook URL).

### 7.5 Pricing reminder (live)

| Item | Cost |
| ---- | ---- |
| Razorpay account | Free |
| Setup / AMC | ₹0 |
| Per ₹49 payment | ~₹1–1.50 in fees (~2% + subscription fee + GST on fee) |
| You receive | ~₹47–48 per payment |

---

## Troubleshooting

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| No Razorpay popup; instant active | Mock mode on | `RAZORPAY_MOCK=false` + real keys on Railway, redeploy |
| Popup opens, stuck on "Confirming..." | Webhook missing/failing | Check Razorpay webhook logs; verify URL + secret |
| Webhook 401 | Wrong `RAZORPAY_WEBHOOK_SECRET` | Re-copy secret from Razorpay → Railway → redeploy |
| `Plan not found` | Plan/key mode mismatch | Test plan with test keys; live plan with live keys |
| `SUBSCRIPTION_EXISTS` | User already subscribed | Cancel in admin or use new test account |
| Razorpay modal doesn't load | Ad blocker / script blocked | Disable ad blocker; check browser console |
| Payment OK but contests locked | Webhook delayed | Wait 30s; check webhook logs for `subscription.activated` |
| API error on subscribe | Invalid keys | Regenerate test keys; verify no extra spaces in Railway vars |

### Debug webhook logs

1. Razorpay → **Webhooks** → your webhook → **Logs**
2. Look for status **200** = success
3. **401** = bad webhook secret
4. **4xx/5xx** = API error — check Railway deploy logs

### Debug Railway logs

Railway → API service → **Deployments** → latest → **View Logs**

Look for startup message and any Razorpay API errors on `POST /subscriptions`.

### Quick API sanity check

From terminal (replace values):

```bash
# Health
curl -s https://codentraapi-staging.up.railway.app/api/v1/health

# Subscribe requires auth — test via browser /subscribe instead
```

---

## Security checklist

```
[ ] Never commit RAZORPAY_KEY_SECRET or WEBHOOK_SECRET to git
[ ] Test keys on staging only
[ ] Live keys on production only
[ ] Webhook secret set whenever RAZORPAY_MOCK=false
[ ] Backup Razorpay keys in password manager
```

---

## Full setup checklist

Copy this and tick as you go:

```
RAZORPAY ACCOUNT
[ ] Signed up at dashboard.razorpay.com
[ ] Test Mode enabled
[ ] Test API keys generated (rzp_test_...)
[ ] Plan created: Codentra Membership ₹49/month
[ ] Plan ID copied (plan_...)

RAILWAY (staging API)
[ ] RAZORPAY_MOCK=false
[ ] RAZORPAY_KEY_ID set
[ ] RAZORPAY_KEY_SECRET set
[ ] RAZORPAY_PLAN_ID set
[ ] MEMBERSHIP_AMOUNT_PAISE=4900
[ ] Redeployed

WEBHOOK
[ ] Webhook URL: .../api/v1/webhooks/razorpay
[ ] Events: activated, charged, cancelled, completed, payment.failed
[ ] RAZORPAY_WEBHOOK_SECRET set on Railway
[ ] Redeployed again

TEST
[ ] /subscribe opens Razorpay modal (not instant activate)
[ ] Test card payment succeeds
[ ] Subscription shows Active
[ ] Contest join works
[ ] Cancel subscription works
[ ] Webhook logs show 200
```

---

## Code reference (already implemented)

| What | File |
| ---- | ---- |
| Razorpay service | `apps/api/src/features/razorpay/razorpay.service.ts` |
| Subscription logic | `apps/api/src/features/subscription/subscription.service.ts` |
| Webhook handler | `apps/api/src/features/webhook/webhook.controller.ts` |
| Checkout UI | `apps/web/src/features/subscription/components/checkout-card.tsx` |
| Razorpay modal | `apps/web/src/features/subscription/lib/razorpay.ts` |
| Env template | `apps/api/.env.example` |

---

## Related docs

- [LOCAL_SETUP.md](./LOCAL_SETUP.md) — mock mode for local dev
- [PRODUCTION_LAUNCH_PLAN.md](./PRODUCTION_LAUNCH_PLAN.md) — P0-2 live Razorpay
- [API_CONTRACT.md](./API_CONTRACT.md) — `/subscriptions` and webhook API
- [TASKS.md](./TASKS.md) — STG-07

---

_Last updated: 2026-06-27_

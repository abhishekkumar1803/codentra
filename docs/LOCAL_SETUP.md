# Codentra — Local Development Setup

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local PostgreSQL)

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Start PostgreSQL
docker compose up -d

# 4. Database setup
pnpm --filter @codentra/api db:push

# 5. Start dev servers (cleans stale .next cache)
pnpm dev:clean
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API health | http://localhost:3001/api/v1/health |

## Database

Default `DATABASE_URL` (docker-compose):

```
postgresql://codentra:codentra@localhost:5432/codentra
```

Update `apps/api/.env` if using Neon or another provider.

## Troubleshooting

### Register/login fails — failed OPTIONS preflight / "Something went wrong"

The API is **not running**. The browser preflight to `http://localhost:3001` fails because the NestJS server crashes on startup when it cannot connect to PostgreSQL.

Verify:

```bash
curl http://localhost:3001/api/v1/health
```

If this fails, fix the database first (see below), then restart with `pnpm dev:clean`.

**Without Docker:** use a free [Neon](https://neon.tech) database — paste the connection string into `apps/api/.env` as `DATABASE_URL`, then run `pnpm db:push`.

### API: `Can't reach database server at localhost:5432`

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then run `docker compose up -d` and verify with `docker compose ps`.

Or use Neon (see above).

### Web: `__webpack_modules__[moduleId] is not a function`

Usually caused by stale `.next` cache or broken workspace package resolution. Run:

```bash
pnpm dev:clean
```

Workspace packages (`@codentra/ui`, `@codentra/types`) resolve from `src/` directly — do not rely on empty `dist/` folders.

### API: `Configuration key "JWT_SECRET" does not exist`

Copy missing vars from `apps/api/.env.example` into `apps/api/.env`.

## Razorpay dev mode

Set `RAZORPAY_MOCK=true` in `apps/api/.env` to auto-activate subscriptions without Razorpay keys.

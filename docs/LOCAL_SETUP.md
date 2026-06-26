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

# 3. Start PostgreSQL + Redis
docker compose up -d

# 4. Start Judge0 CE (code execution sandbox)
pnpm judge:up
# Verify: curl http://localhost:2358/about

# 5. Environment — ensure Judge0 URL is set (not hardcoded in code)
# apps/api/.env:
#   JUDGE_PROVIDER=judge0
#   JUDGE0_API_URL=http://localhost:2358

# 6. Database setup
pnpm --filter @codentra/api db:push

# 7. Start dev servers (cleans stale .next cache)
pnpm dev:clean
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API health | http://localhost:3001/api/v1/health |
| Judge0 CE | http://localhost:2358 (`JUDGE0_API_URL`) |
| Judge0 docs | http://localhost:2358/docs |

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

## Judge0 CE (code execution)

Codentra runs user code via **Judge0 CE**. The API URL is read from `JUDGE0_API_URL` only — never hardcoded.

```bash
pnpm judge:up      # start local Judge0 (infra/judge0)
pnpm judge:down    # stop
pnpm judge:logs    # tail server + worker logs
```

Required in `apps/api/.env`:

```env
JUDGE_PROVIDER=judge0
JUDGE0_API_URL=http://localhost:2358
```

**Production:** set `JUDGE0_API_URL` to your production Judge0 host (e.g. `https://judge.codentra.com`). Optional `JUDGE0_API_KEY` if auth is enabled on that instance.

### Judge0: `/box/main.cpp` error on macOS

Judge0 responds but returns `Internal Error` / `rb_sysopen - /box/main.cpp`. This is a **Docker Desktop + cgroup** issue on Mac, not your code.

1. Quit Docker Desktop
2. Add `"DeprecatedCgroupv1": true` to `~/Library/Group Containers/group.com.docker/settings-store.json`
3. Apple Silicon: enable **Rosetta** in Docker Desktop → Settings
4. Restart Docker → `pnpm judge:down && pnpm judge:up`

Details: [infra/judge0/README.md](../infra/judge0/README.md)

### Judge0 not reachable

```bash
curl http://localhost:2358/about
docker compose -f infra/judge0/docker-compose.yml ps
```

Judge0 needs `privileged: true` (Docker Desktop on Mac/Linux). First boot can take 30–60s after `pnpm judge:up`.

**Docker Hub login required** — the Judge0 image is ~2GB. If `pnpm judge:up` fails with `unauthorized: authentication required`, run `docker login` (free Docker Hub account + PAT), then retry.

Set `JUDGE_PROVIDER=mock` to skip Judge0 and use the in-process mock judge for UI-only work.

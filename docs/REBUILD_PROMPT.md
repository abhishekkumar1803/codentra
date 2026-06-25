# Codentra — Complete Rebuild Prompt

*Purpose:* Rebuild Codentra from scratch on a personal machine when you cannot transfer the work codebase (compliance).  
*How to use:* Copy sections into Cursor chat on your personal laptop. Work *one step at a time* — do not skip phases.

> This file is the single source of truth for rebuilding Codentra. See the full step-by-step prompts, tech stack, schema, routes, and env vars in the project chat export or maintain this file as the canonical copy.

## Quick reference

| Phase | Scope | Steps |
|-------|-------|-------|
| 0 + 1 | Foundation | Steps 0–7 |
| 2 | Contests & Leaderboards | Steps 8–11 |
| 3 | Jobs & Referrals | Steps 12–13 |
| 4 | Premium Services | Steps 14–15 |
| 5 | Scale & Polish | Steps 16–17 |
| Verify | Full QA | Step 18 |

## Local setup

```bash
nvm use 20
corepack enable
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:push
pnpm db:seed
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Admin | admin@codentra.com / Admin@123456 |

## Core rules

- Monorepo: pnpm + Turborepo
- Backend: NestJS feature modules at `apps/api/src/features/`
- Frontend: Next.js 15 App Router at `apps/web/src/features/`
- API prefix `/api/v1`, BFF proxy at `/api/proxy/*`
- JWT in httpOnly cookies via BFF
- `@RequireSubscription()` for member routes
- Update `docs/TASKS.md` and `docs/CHANGELOG.md` after each feature
- Build phases in order — never skip ahead

For the complete step-by-step prompts (Steps 0–18), Cursor rules, full API/route lists, and schema enums — refer to the version pasted in chat or expand this file as needed.

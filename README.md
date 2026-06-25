# Codentra

Developer growth platform — **Learn. Compete. Grow.**

## Monorepo Structure

```
codentra/
├── apps/
│   ├── api/          # NestJS backend (@codentra/api)
│   └── web/          # Next.js 15 frontend (@codentra/web)
├── packages/
│   ├── config/       # Shared ESLint, Prettier, TypeScript configs
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI utilities and components
├── docs/             # Architecture and planning documents
└── turbo.json        # Turborepo pipeline config
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Build shared packages
pnpm build

# Start all apps in development
pnpm dev
```

| App | URL | Description |
|-----|-----|-------------|
| Web | http://localhost:3000 | Next.js frontend |
| API | http://localhost:3001/api/v1/health | NestJS backend |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages and apps |
| `pnpm typecheck` | Type-check all packages and apps |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting |

## Environment Variables

Copy example env files before running:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

## Database (API)

Prisma schema lives in `apps/api/prisma/`.

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
```

## Git Hooks

- **pre-commit:** Prettier check + ESLint
- **commit-msg:** Conventional Commits via commitlint

## Documentation

See [`docs/`](./docs/) for architecture, API contract, and implementation plan.

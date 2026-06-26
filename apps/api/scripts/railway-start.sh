#!/usr/bin/env sh
set -eu

# Resolve apps/api directory whether invoked as scripts/railway-start.sh or apps/api/scripts/...
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[railway-start] Codentra API startup (cwd=$ROOT)"
echo "[railway-start] PORT=${PORT:-3001}"
echo "[railway-start] NODE_ENV=${NODE_ENV:-unset}"

missing=0
for var in DATABASE_URL JWT_SECRET; do
  eval "val=\${$var:-}"
  if [ -z "$val" ]; then
    echo "[railway-start] ERROR: $var is not set in Railway variables"
    missing=1
  else
    echo "[railway-start] OK: $var is set"
  fi
done
if [ "$missing" -eq 1 ]; then
  echo "[railway-start] Add variables in Railway → @codentra/api → Variables → staging"
  exit 1
fi

if [ "${SKIP_DB_MIGRATE:-false}" = "true" ]; then
  echo "[railway-start] SKIP_DB_MIGRATE=true — skipping migrations"
else
  if [ -n "${DATABASE_URL_DIRECT:-}" ]; then
    MIGRATE_URL="$DATABASE_URL_DIRECT"
    echo "[railway-start] Using DATABASE_URL_DIRECT for migrations"
  else
    MIGRATE_URL="$DATABASE_URL"
    echo "[railway-start] DATABASE_URL_DIRECT not set — using DATABASE_URL for migrations"
  fi

  PRISMA_BIN="$ROOT/../../node_modules/.bin/prisma"
  if [ ! -f "$PRISMA_BIN" ]; then
    PRISMA_BIN="npx prisma"
  fi

  echo "[railway-start] Running prisma migrate deploy..."
  if ! DATABASE_URL="$MIGRATE_URL" "$PRISMA_BIN" migrate deploy; then
    echo "[railway-start] ERROR: prisma migrate deploy failed"
    echo "[railway-start] Tip: set DATABASE_URL_DIRECT to Neon direct URL (no -pooler)"
    exit 1
  fi
fi

if [ ! -f "$ROOT/dist/main.js" ]; then
  echo "[railway-start] ERROR: dist/main.js not found at $ROOT/dist/main.js"
  exit 1
fi

echo "[railway-start] Starting NestJS on 0.0.0.0:${PORT:-3001}..."
exec node "$ROOT/dist/main.js"

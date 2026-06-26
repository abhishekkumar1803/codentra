#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

echo "[railway-start] Codentra API startup"
echo "[railway-start] PORT=${PORT:-3001}"
echo "[railway-start] NODE_ENV=${NODE_ENV:-unset}"

missing=0
for var in DATABASE_URL JWT_SECRET JWT_REFRESH_SECRET; do
  eval "val=\${$var:-}"
  if [ -z "$val" ]; then
    echo "[railway-start] ERROR: $var is not set in Railway variables"
    missing=1
  else
    echo "[railway-start] OK: $var is set"
  fi
done
if [ "$missing" -eq 1 ]; then
  exit 1
fi

if [ -n "${DATABASE_URL_DIRECT:-}" ]; then
  MIGRATE_URL="$DATABASE_URL_DIRECT"
  echo "[railway-start] Using DATABASE_URL_DIRECT for migrations"
else
  MIGRATE_URL="$DATABASE_URL"
  echo "[railway-start] DATABASE_URL_DIRECT not set — using DATABASE_URL for migrations"
fi

PRISMA_BIN="../../node_modules/.bin/prisma"
if [ ! -f "$PRISMA_BIN" ]; then
  PRISMA_BIN="npx prisma"
fi

echo "[railway-start] Running prisma migrate deploy..."
if ! DATABASE_URL="$MIGRATE_URL" "$PRISMA_BIN" migrate deploy; then
  echo "[railway-start] ERROR: prisma migrate deploy failed"
  exit 1
fi

if [ ! -f dist/main.js ]; then
  echo "[railway-start] ERROR: dist/main.js not found (build may have failed)"
  exit 1
fi

echo "[railway-start] Starting NestJS on 0.0.0.0:${PORT:-3001}..."
exec node dist/main.js

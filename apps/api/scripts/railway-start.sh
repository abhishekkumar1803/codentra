#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[railway-start] ERROR: DATABASE_URL is not set in Railway variables"
  exit 1
fi

MIGRATE_URL="${DATABASE_URL_DIRECT:-$DATABASE_URL}"
PRISMA_BIN="../../node_modules/.bin/prisma"
if [ ! -x "$PRISMA_BIN" ]; then
  PRISMA_BIN="npx prisma"
fi

echo "[railway-start] Running prisma migrate deploy..."
DATABASE_URL="$MIGRATE_URL" "$PRISMA_BIN" migrate deploy

echo "[railway-start] Starting API on port ${PORT:-3001}..."
exec node dist/main.js

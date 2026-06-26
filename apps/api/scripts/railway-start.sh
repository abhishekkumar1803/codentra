#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[railway-start] ERROR: DATABASE_URL is not set"
  exit 1
fi

# Neon: use direct URL for migrations when provided (pooler can fail migrate deploy)
MIGRATE_URL="${DATABASE_URL_DIRECT:-$DATABASE_URL}"
echo "[railway-start] Running prisma migrate deploy..."
DATABASE_URL="$MIGRATE_URL" pnpm exec prisma migrate deploy

echo "[railway-start] Starting API on port ${PORT:-3001}..."
exec node dist/main.js

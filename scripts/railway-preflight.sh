#!/usr/bin/env sh
# Simulate Railway deploy locally before pushing.
# Usage:
#   pnpm railway:preflight          # build + optional docker smoke test
#   pnpm railway:preflight --quick  # skip docker (faster)
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

QUICK=0
if [ "${1:-}" = "--quick" ]; then
  QUICK=1
fi

ENV_FILE="$ROOT/apps/api/.env"
if [ -f "$ENV_FILE" ]; then
  echo "==> Loading $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
else
  echo "WARN: $ENV_FILE not found — set DATABASE_URL and JWT_SECRET manually"
fi

echo ""
echo "=========================================="
echo "  Codentra Railway preflight"
echo "=========================================="
echo ""

fail=0

check_var() {
  var="$1"
  eval "val=\${$var:-}"
  if [ -z "$val" ]; then
    echo "  FAIL  $var is not set"
    fail=1
  else
    echo "  OK    $var"
  fi
}

echo "==> Step 1/5 — Required env vars (same as Railway staging)"
check_var DATABASE_URL
check_var JWT_SECRET

if [ -n "${DATABASE_URL:-}" ] && echo "$DATABASE_URL" | grep -q 'channel_binding=require'; then
  echo "  WARN  DATABASE_URL has channel_binding=require — remove for Railway/Docker"
fi

if [ -z "${DATABASE_URL_DIRECT:-}" ]; then
if [ -z "${DATABASE_URL_DIRECT:-}" ]; then
  echo "  WARN  DATABASE_URL_DIRECT not set — add Neon direct URL for migrations"
fi

echo "  NOTE  Do not set PORT on Railway — the platform assigns it automatically"
fi

if [ "$fail" -eq 1 ]; then
  echo ""
  echo "Fix apps/api/.env (then copy same values to Railway → Variables → staging)"
  exit 1
fi

echo ""
echo "==> Step 2/5 — Lockfile + API build (same as Docker build stage)"
pnpm install --frozen-lockfile
pnpm --filter @codentra/api build

echo ""
echo "==> Step 3/5 — Prisma migrate deploy (same as railway-start.sh)"
MIGRATE_URL="${DATABASE_URL_DIRECT:-$DATABASE_URL}"
if ! DATABASE_URL="$MIGRATE_URL" pnpm --filter @codentra/api exec prisma migrate deploy; then
  echo "FAIL: prisma migrate deploy failed"
  exit 1
fi
echo "  OK    migrations applied"

echo ""
echo "==> Step 4/5 — Production start smoke test (local, no Docker)"
PORT=18081
export PORT JUDGE_PROVIDER="${JUDGE_PROVIDER:-mock}" RAZORPAY_MOCK="${RAZORPAY_MOCK:-true}" RESEND_MOCK="${RESEND_MOCK:-true}"
export NODE_ENV=production

cd "$ROOT/apps/api"
node dist/main.js &
API_PID=$!
cd "$ROOT"

cleanup() {
  kill "$API_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "  Waiting for http://127.0.0.1:$PORT/api/v1/health ..."
ok=0
i=0
while [ "$i" -lt 30 ]; do
  if curl -sf "http://127.0.0.1:$PORT/api/v1/health" >/dev/null; then
    echo "  OK    health check passed"
    curl -s "http://127.0.0.1:$PORT/api/v1/health" | head -c 200
    echo ""
    ok=1
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$ok" -eq 0 ]; then
  echo "FAIL: API did not respond on port $PORT within 30s"
  echo "Check logs above for Failed to start API / Prisma / JWT errors"
  exit 1
fi

if [ "$QUICK" -eq 1 ]; then
  echo ""
  echo "=========================================="
  echo "  Preflight passed (--quick, Docker skipped)"
  echo "  Copy apps/api/.env vars to Railway, then push"
  echo "=========================================="
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo ""
  echo "WARN: Docker not installed — skipping Step 5 (Docker smoke test)"
  echo "Preflight passed (steps 1–4). Install Docker for full Railway simulation."
  exit 0
fi

echo ""
echo "==> Step 5/5 — Docker build + run (exact Railway image)"
IMAGE="codentra-api:preflight"
docker build -t "$IMAGE" "$ROOT"

CONTAINER="codentra-api-preflight"
docker rm -f "$CONTAINER" 2>/dev/null || true

docker run -d --name "$CONTAINER" \
  -p 18080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -e DATABASE_URL \
  -e DATABASE_URL_DIRECT="${DATABASE_URL_DIRECT:-}" \
  -e JWT_SECRET \
  -e JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-}" \
  -e JUDGE_PROVIDER="${JUDGE_PROVIDER:-mock}" \
  -e RAZORPAY_MOCK="${RAZORPAY_MOCK:-true}" \
  -e RESEND_MOCK="${RESEND_MOCK:-true}" \
  -e CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:3000}" \
  -e FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}" \
  -e REDIS_URL="${REDIS_URL:-}" \
  -e ENABLE_SUBMISSION_WORKER="${ENABLE_SUBMISSION_WORKER:-false}" \
  "$IMAGE"

echo "  Waiting for http://127.0.0.1:18080/api/v1/health ..."
docker_ok=0
j=0
while [ "$j" -lt 60 ]; do
  if curl -sf "http://127.0.0.1:18080/api/v1/health" >/dev/null; then
    echo "  OK    Docker health check passed"
    docker_ok=1
    break
  fi
  if ! docker ps -q -f name="$CONTAINER" | grep -q .; then
    echo "FAIL: container exited early. Logs:"
    docker logs "$CONTAINER" 2>&1 | tail -40
    docker rm -f "$CONTAINER" 2>/dev/null || true
    exit 1
  fi
  j=$((j + 1))
  sleep 2
done

if [ "$docker_ok" -eq 0 ]; then
  echo "FAIL: Docker health check timed out. Container logs:"
  docker logs "$CONTAINER" 2>&1 | tail -60
  docker rm -f "$CONTAINER" 2>/dev/null || true
  exit 1
fi

docker rm -f "$CONTAINER" >/dev/null

echo ""
echo "=========================================="
echo "  Preflight PASSED — safe to deploy"
echo "  1. Copy env vars to Railway (staging)"
echo "  2. git push origin staging"
echo "=========================================="

#!/usr/bin/env sh
# Smoke test Judge0 CE — Python print(1+2) should return Accepted.
#
# Usage:
#   ./smoke-test.sh
#   ./smoke-test.sh http://YOUR_VM_IP:2358 YOUR_AUTHN_TOKEN
#
set -eu

BASE_URL="${1:-http://127.0.0.1:2358}"
TOKEN="${2:-}"
BASE_URL="${BASE_URL%/}"

echo "==> Judge0 smoke test: $BASE_URL"

ABOUT_HEADERS=""
if [ -n "$TOKEN" ]; then
  ABOUT_HEADERS="-H X-Auth-Token: $TOKEN"
fi

if ! curl -sf $ABOUT_HEADERS "$BASE_URL/about" >/dev/null; then
  echo "FAIL: $BASE_URL/about unreachable"
  exit 1
fi

AUTH_HEADER=""
if [ -n "$TOKEN" ]; then
  AUTH_HEADER="-H X-Auth-Token: $TOKEN"
fi

RESPONSE="$(curl -sf -X POST "$BASE_URL/submissions?wait=true&base64_encoded=false" \
  -H "Content-Type: application/json" \
  $AUTH_HEADER \
  -d '{"source_code":"print(1+2)","language_id":71,"stdin":"","expected_output":"3\n"}')"

echo "$RESPONSE"

if echo "$RESPONSE" | grep -qE '"description"[[:space:]]*:[[:space:]]*"Accepted"'; then
  echo "PASS: Judge0 returned Accepted"
  exit 0
fi

if echo "$RESPONSE" | grep -q '"id": 13'; then
  echo "FAIL: Internal Error (status 13) — isolate sandbox failed (usually Docker cgroup v2)."
  echo "      Fix: use mrkushalsm/judge0:latest in docker-compose.yml — see docs/JUDGE0_STAGING_SETUP.md"
  exit 1
fi

echo "FAIL: expected Accepted verdict"
exit 1

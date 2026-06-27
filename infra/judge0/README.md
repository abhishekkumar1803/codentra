# Judge0 CE — Local Docker Stack

Codentra executes contest code through [Judge0 CE](https://github.com/judge0/judge0). This folder runs a **self-hosted** instance for development and staging.

**Full staging guides:** [Judge0](../docs/JUDGE0_STAGING_SETUP.md) · [Razorpay](../docs/RAZORPAY_STAGING_SETUP.md)

## Quick start (local)

```bash
# From repo root
pnpm judge:up
curl http://localhost:2358/about
pnpm judge:smoke
```

Point the API at this instance:

```env
JUDGE_PROVIDER=judge0
JUDGE0_API_URL=http://localhost:2358
```

## Services

| Container                 | Role                                 |
| ------------------------- | ------------------------------------ |
| `codentra-judge0-server`  | HTTP API on port **2358**            |
| `codentra-judge0-workers` | Submission workers (isolate sandbox) |
| `codentra-judge0-db`      | Judge0 metadata (Postgres)           |
| `codentra-judge0-redis`   | Judge0 job queue                     |

These are **separate** from Codentra's Postgres/Redis in the root `docker-compose.yml`.

## Staging / production (Linux VM)

Judge0 **must run on Linux** (isolate sandbox). Railway cannot host Judge0 — use a small VM and point the API at it.

| Provider | Size | Cost (approx) |
| -------- | ---- | ------------- |
| Oracle Always Free | 2 OCPU, 12 GB ARM | $0 |
| Hetzner CX22 | 2 vCPU, 4 GB | ~€4/mo |

### One-command deploy on the VM

```bash
git clone https://github.com/abhishekkumar1803/codentra.git
cd codentra/infra/judge0
chmod +x deploy-staging.sh smoke-test.sh
./deploy-staging.sh
```

The script installs Docker, generates `judge0.conf` with `AUTHN_TOKEN`, starts Judge0 on port **2358**, and prints Railway env vars.

### Railway env vars

```env
JUDGE_PROVIDER=judge0
JUDGE0_API_URL=http://YOUR_VM_PUBLIC_IP:2358
JUDGE0_API_KEY=<same as AUTHN_TOKEN in judge0.conf>
```

## Commands

```bash
pnpm judge:up
pnpm judge:down
pnpm judge:logs
pnpm judge:smoke
docker compose -f infra/judge0/docker-compose.yml ps
```

## Troubleshooting

### `unauthorized: authentication required` when pulling images

Docker Hub requires login (free account + PAT) to pull `judge0/judge0` (~2GB):

```bash
docker login
pnpm judge:up
```

### `No such file or directory @ rb_sysopen - /box/main.cpp`

Judge0's **isolate** sandbox cannot create `/box/` on **macOS Docker** unless cgroup v1 is enabled.

**Fix (Docker Desktop on Mac):**

1. Quit Docker Desktop completely.
2. Edit `"DeprecatedCgroupv1": true` in Docker settings JSON (see full steps in prior README section).
3. On Apple Silicon: enable **Rosetta** for x86/amd64 emulation.
4. `pnpm judge:down && pnpm judge:up`

**Alternative for Mac dev:** deploy Judge0 on a Linux VM (see [JUDGE0_STAGING_SETUP.md](../docs/JUDGE0_STAGING_SETUP.md)).

Only `db` and `redis` running means `server`/`workers` did not start — check `pnpm judge:logs`.

## Notes

- Images: `mrkushalsm/judge0:latest` (cgroup v1 + v2; official `judge0/judge0:1.13.1` fails on cgroup v2 hosts)
- `privileged: true` is required for the isolate sandbox
- Dev passwords in `judge0.conf` are for local use only — rotate for staging/production

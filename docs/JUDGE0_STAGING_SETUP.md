# Judge0 Staging Setup

**Goal:** Real code execution for Codentra contest problems on staging.  
**Time:** ~30–45 minutes first time (mostly Docker image pulls).  
**Cost:** **$0** (Oracle Always Free) or ~€4/mo (Hetzner CX22).

---

## How it fits together

```
User browser (codentra-web.vercel.app)
        │
        ▼
Railway API (staging)
        │  POST /submissions (X-Auth-Token)
        ▼
Judge0 VM (YOUR_IP:2358)
        ├── server   — HTTP API
        ├── workers  — isolate sandbox
        ├── postgres — internal
        └── redis    — internal
```

**Important:**

- Judge0 **cannot** run on Railway, Vercel, or macOS Docker reliably.
- Codentra API is already integrated — host Judge0 and set 3 env vars.
- If `JUDGE0_API_URL` is missing, the API falls back to **mock judge** (sum-two-numbers only).

---

## Free alternatives

| Option | Cost | Real execution? |
| ------ | ---- | --------------- |
| Mock judge (default) | $0 | No — seeded sum-two-numbers only |
| Oracle Always Free VM | $0 | Yes — same `deploy-staging.sh` |
| Hetzner CX22 | ~€4/mo | Yes — fastest signup |
| Local `pnpm judge:up` | $0 | Yes on Linux; Mac needs cgroup fix |

---

## Step 1 — Create a Linux VM

**Ubuntu 22.04 or 24.04 LTS.** Minimum: **2 vCPU, 4 GB RAM, 40 GB disk**.

### Option A — Oracle Cloud Always Free ($0)

1. [cloud.oracle.com/free](https://www.oracle.com/cloud/free/) → create account
2. **Compute → Instances → Create**
3. Image: **Ubuntu 24.04** (aarch64 / ARM)
4. Shape: **Ampere A1 Flex** — 2 OCPU, 12 GB RAM
5. Assign **public IPv4**, add SSH key
6. **Security List → Ingress:** TCP **22** (your IP), TCP **2358** (`0.0.0.0/0` — protected by `AUTHN_TOKEN`)
7. SSH: `ssh ubuntu@YOUR_VM_IP`

### Option B — Hetzner (~€4/mo, recommended if Oracle capacity fails)

1. [console.hetzner.cloud](https://console.hetzner.cloud) → **CX22** (2 vCPU, 4 GB)
2. Ubuntu 24.04, SSH key → note **IPv4**
3. SSH: `ssh root@YOUR_VM_IP`

---

## Step 2 — Deploy Judge0 on the VM

```bash
sudo apt update && sudo apt install -y git curl
cd /opt
sudo git clone https://github.com/abhishekkumar1803/codentra.git
cd codentra/infra/judge0
chmod +x deploy-staging.sh smoke-test.sh
sudo ./deploy-staging.sh
```

**What the script does:**

1. Installs Docker (via get.docker.com) if missing
2. Creates `judge0.conf` with random passwords + `AUTHN_TOKEN`
3. Pulls images and starts 4 containers on port **2358**
4. Runs smoke test (Python `print(1+2)` → Accepted)
5. Prints **Railway env vars** — copy and save these

First run: **5–15 minutes** (image download ~2 GB).

### Docker Hub pull fails (`unauthorized`)

```bash
docker login   # Docker Hub username + Personal Access Token
./deploy-staging.sh
```

### Manual deploy (alternative)

```bash
cp judge0.staging.conf.example judge0.conf
# Replace CHANGE_ME_* with: openssl rand -hex 24
set -a && . ./judge0.conf && set +a
export POSTGRES_PASSWORD REDIS_PASSWORD
docker compose up -d
```

---

## Step 3 — Firewall

On the VM:

```bash
ufw allow 22/tcp comment 'SSH'
ufw allow 2358/tcp comment 'Judge0 API'
ufw enable
```

Also open port **2358** in your cloud provider firewall (Oracle Security List / Hetzner Cloud Firewall).

---

## Step 4 — Connect Railway API

Railway → **API service** → **Variables**:

| Variable | Value |
| -------- | ----- |
| `JUDGE_PROVIDER` | `judge0` |
| `JUDGE0_API_URL` | `http://YOUR_VM_IP:2358` |
| `JUDGE0_API_KEY` | Same as `AUTHN_TOKEN` in `judge0.conf` |

Remove `JUDGE_PROVIDER=mock` if present. Save → Railway redeploys (~1–2 min).

Get token from VM:

```bash
grep AUTHN_TOKEN /opt/codentra/infra/judge0/judge0.conf
```

---

## Step 5 — Verify

### On the VM

```bash
curl http://127.0.0.1:2358/about
docker compose ps
./smoke-test.sh http://127.0.0.1:2358 "$(grep AUTHN_TOKEN judge0.conf | cut -d= -f2)"
```

### From your Mac

```bash
sh infra/judge0/smoke-test.sh http://YOUR_VM_IP:2358 YOUR_AUTHN_TOKEN
```

### End-to-end on Codentra

1. Open **https://codentra-web.vercel.app**
2. Login: `admin@codentra.dev` / `Admin123!`
3. Contests → coding problem → **Run** → **Submit**
4. Expect real verdict (not mock-only sum-two-numbers)

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Only db + redis running | `docker compose logs server workers` — need Linux + `privileged: true` |
| Smoke test status 13 | Workers can't create isolate — must be **Linux VM**, not Mac |
| Railway "Judge0 unreachable" | Open cloud firewall on **2358**; check public IP in `JUDGE0_API_URL` |
| Railway still uses mock | Set `JUDGE_PROVIDER=judge0` and non-empty `JUDGE0_API_URL`; redeploy |
| Key mismatch | `JUDGE0_API_KEY` must exactly match `AUTHN_TOKEN` |

---

## Security

- Always set `AUTHN_TOKEN` on internet-facing Judge0
- Never commit `judge0.conf` with real secrets
- Backup `judge0.conf` in a password manager
- Do not expose Postgres (5432) or Redis (6379) publicly

---

## Quick reference

| What | Where |
| ---- | ----- |
| Deploy script | `infra/judge0/deploy-staging.sh` |
| Smoke test | `infra/judge0/smoke-test.sh` |
| Config template | `infra/judge0/judge0.staging.conf.example` |
| Local dev | `pnpm judge:up` |
| API env vars | `JUDGE_PROVIDER`, `JUDGE0_API_URL`, `JUDGE0_API_KEY` |

---

## Checklist

```
[ ] Linux VM created (Ubuntu 24.04, 2+ vCPU, 4+ GB)
[ ] ./deploy-staging.sh succeeded
[ ] smoke-test.sh returns Accepted
[ ] Firewall: 2358 open (VM + cloud)
[ ] Railway: JUDGE_PROVIDER=judge0
[ ] Railway: JUDGE0_API_URL=http://VM_IP:2358
[ ] Railway: JUDGE0_API_KEY = AUTHN_TOKEN
[ ] Codentra web: Run + Submit works
[ ] judge0.conf backed up securely
```

---

_Last updated: 2026-06-27_

# Judge0 CE — Local Docker Stack

Codentra executes contest code through [Judge0 CE](https://github.com/judge0/judge0). This folder runs a **self-hosted** instance for development.

## Quick start

```bash
# From repo root
pnpm judge:up
curl http://localhost:2358/about
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

## Production

Deploy this stack (or Judge0's official release) on a dedicated host. Only change the API env:

```env
JUDGE0_API_URL=https://your-judge0-host.example.com
JUDGE0_API_KEY=your-auth-token   # if AUTHN_TOKEN is set in judge0.conf
```

No application code changes required.

## Commands

```bash
pnpm judge:up
pnpm judge:down
pnpm judge:logs
docker compose -f infra/judge0/docker-compose.yml ps
```

## Troubleshooting

### `unauthorized: authentication required` when pulling images

Docker Hub requires login (free account + PAT) to pull `judge0/judge0` (~2GB):

```bash
docker login
pnpm judge:up
```

If login still fails, remove stale credentials and retry:

```bash
rm ~/.docker/config.json   # or fix auths entry for index.docker.io
docker login
```

### `No such file or directory @ rb_sysopen - /box/main.cpp`

Judge0's **isolate** sandbox cannot create `/box/` on **macOS Docker** unless cgroup v1 is enabled. Your code is fine — the worker fails before compilation.

**Fix (Docker Desktop on Mac):**

1. Quit Docker Desktop completely.
2. Edit the settings file — **quote the path** (space in `Group Containers`):
   ```bash
   open -e "$HOME/Library/Group Containers/group.com.docker/settings-store.json"
   ```
   Or in Cursor/VS Code:
   ```bash
   code "$HOME/Library/Group Containers/group.com.docker/settings-store.json"
   ```
3. Add this line inside the JSON object:
   ```json
   "DeprecatedCgroupv1": true,
   ```
4. On **Apple Silicon**: Docker Desktop → Settings → General → enable **Rosetta** for x86/amd64 emulation.
5. Restart Docker Desktop completely to apply the changes.
6. Recreate Judge0:
   ```bash
   pnpm judge:down
   pnpm judge:up
   curl http://localhost:2358/about
   ```
7. Smoke test:
   ```bash
   curl -s -X POST "http://localhost:2358/submissions?wait=true&base64_encoded=false" \
     -H "Content-Type: application/json" \
     -d '{"source_code":"print(1+2)","language_id":71,"stdin":"","expected_output":"3\n"}'
   ```
   Should return `"status": {"id": 3, "description": "Accepted"}` — not status 13.

**Linux (Ubuntu):** add `systemd.unified_cgroup_hierarchy=0` to GRUB, then reboot.

**Alternative for Mac dev:** use hosted Judge0 CE and set `JUDGE0_API_URL` to that endpoint, or run Judge0 on a Linux VM/cloud instance.

```bash
docker compose -f infra/judge0/docker-compose.yml ps
curl http://localhost:2358/about
```

Only `db` and `redis` running means `server`/`workers` did not start — check `pnpm judge:logs`.

## Notes

- Images: `judge0/judge0:1.13.1`
- `privileged: true` is required for the isolate sandbox
- Dev passwords in `judge0.conf` are for local use only — rotate for production

## Description

Single PR that fixes deploy/API/CI for sandbox + live.

**Included:**
- Deploy/API/CI for sandbox and live: relative API URLs, frontend lint CI, resolution steps doc
- **Closes #450** – fix/local-compose (README, Docker Compose healthchecks, backend STATICFILES) is fully included in this branch
- **Closes #452** – removed `.env.production` (not needed; frontend uses relative API URLs for sandbox/live)

**Frontend and environment:** The frontend uses relative API URLs (`baseURL = ""`), so one image works for both environments: when running on **sandbox** (balancer.sandbox.k8s.phl.io) it calls that host; when running on **live** (balancerproject.org) it calls that host. No env-specific build or config required.

**Not closed:** #451 (sanitizer) – unrelated; left open.

**GitOps CD and manual deploy:** `Deploy: Downstream` now has explicit permissions and a `target` input for workflow_dispatch (`both` | `sandbox` | `live`). CD: push to `develop` → Containers: Publish → deploy PR to **cfp-sandbox-cluster**. Live: publish release → deploy PR to **cfp-live-cluster**. Manual: run **Deploy: Downstream** with a tag (and optional target) to open deploy PRs without waiting for develop/release. Jobs were failing due to missing permissions and token; BOT_GITHUB_TOKEN must have write access to both cluster repos (see docs/DEPLOY_RESOLUTION_STEPS.md).

**Other:** SPA catch-all always registered (serve index.html at request time or 404). Removed `.env.production` and unused `VITE_API_BASE_URL` from frontend `.env`.

## Related

- Closes #450
- Closes #452

## Reviewers

@chris (for deploy/secrets follow-up; see docs/DEPLOY_RESOLUTION_STEPS.md)

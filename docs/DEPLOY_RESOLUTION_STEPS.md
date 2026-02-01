# Resolution steps for current balancer environments

Use this as a **follow-up comment or PR body section** after merging the deploy/API/CI fix PR. It walks through fixing the current issues and ensuring future deploys are fully automated.

---

## Step 1 – GitHub Actions token

Deploy Downstream uses `BOT_GITHUB_TOKEN` to open PRs in `CodeForPhilly/cfp-sandbox-cluster` and `CodeForPhilly/cfp-live-cluster`. If workflows fail with permission or authentication errors, the token may be expired.

- **Action**: An org admin (e.g. **@chris** or repo admin) updates the `BOT_GITHUB_TOKEN` secret in the balancer-main repo: **Settings → Secrets and variables → Actions**.
- **Ping**: @chris (or the dev who manages GitHub secrets) to update the token.

---

## Step 2 – Re-run or trigger a new build

After merging this PR (and optionally after updating the token), get a green run of **Containers: Publish** and then **Deploy: Downstream**.

- **Action**: Either push to `develop` or use **Run workflow** on the **Containers: Publish** workflow (and then let **Deploy: Downstream** run after it). No manual image tag or deploy commits needed; everything stays in GitHub Actions.
- **Ping**: In the follow-up, mention that after merging, someone with merge rights can re-run the workflow or push a small commit to `develop` to trigger the pipeline.

---

## Step 3 – Sandbox (staging)

Deploy Downstream will open a PR in **CodeForPhilly/cfp-sandbox-cluster** to update the balancer image tag.

- **Action**: Review and merge that PR. GitOps/build-k8s-manifests will roll out the new image. Verify the app at **https://balancer.sandbox.k8s.phl.io** and that API calls go to `https://balancer.sandbox.k8s.phl.io/api/...` (relative URLs).
- **Ping**: Tag sandbox/staging reviewers (e.g. @Tai, @Sahil S) if you want them to verify staging before live.

---

## Step 4 – Live (production)

Live deploys automatically when a **release** is published (Containers: Publish runs, then Deploy: Downstream opens a PR to cfp-live-cluster). You can also **manually** open deploy PRs after merging to main:

- **Action**: In **Actions → Deploy: Downstream → Run workflow**, choose **workflow_dispatch**, enter the image tag (e.g. `v1.2.0` or `dev-abc1234`), and set **target** to `live` (or `both` for sandbox + live). This opens the deploy PR(s) in the GitOps repos. Then create a release from `main` if you want the usual release flow, or just merge the opened deploy PR. Verify **https://balancerproject.org** and that API calls go to `https://balancerproject.org/api/...`.
- **Ping**: @chris or release manager for creating the release and merging the live deploy PR.

---

## Step 5 – No manual deploy in the future

All deploy steps are driven by GitHub Actions: build on push to `develop` (and on release), then PRs to cluster repos. No manual image pushes or manual edits to cluster repos for routine deploys.

- **Ping**: In the follow-up, note that future fixes are **merge to develop → CI builds → merge deploy PRs** (and for live: **create release → merge live deploy PR**).

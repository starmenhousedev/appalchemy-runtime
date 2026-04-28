# Build Pipeline Setup

When a merchant taps **Publish** in the app, the backend now:

1. Creates a `Build` row in MySQL
2. Dispatches a GitHub Actions workflow on this RN repo via the GitHub API
3. The workflow runs `eas build` against EAS Build (Expo's hosted infra)
4. The workflow polls EAS until artifacts are ready
5. The workflow POSTs results back to `/api/webhooks/build-status` on your backend
6. The backend updates the `Build` row with download URLs
7. The mobile Publish screen polls every 15 s and renders the download buttons

This file lists what **you** need to set up so it actually runs end-to-end.

---

## What you need

| Account | Purpose | Cost |
|---|---|---|
| **Expo** ([expo.dev](https://expo.dev)) | EAS Build runs builds for you (Linux + macOS) | Free tier covers ~30 builds/mo. Paid plans from $19/mo. |
| **GitHub** repo for this RN project | Where the workflow lives | Free for public, free-with-limits for private |
| **Apple Developer** ($99/yr) | Required to ship iOS to App Store | Required for iOS only |
| **Google Play Console** ($25 one-time) | Required to ship Android to Play Store | Required for Play submission |

For **internal testing / sideload-only Android** you can skip Apple Developer and Google Play Console. Just download the APK and install it directly.

---

## One-time setup

### A. Expo

1. Sign up at [expo.dev](https://expo.dev), create a project, link this RN repo to it (run `eas init` once locally; commits an `extra.eas.projectId` to `app.json`).
2. Generate an access token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens). Copy it.

### B. GitHub repo

1. Push this RN project to a GitHub repo if it isn't already. The repo must contain `eas.json` (already in this project) and `.github/workflows/eas-build.yml` (already in this project).
2. Generate a fine-grained personal access token at [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta) with **Actions: Read and write** permission on this repo. Copy it.
3. In the repo's **Settings → Secrets and variables → Actions**, create three secrets:
   - `EXPO_TOKEN` — the token from step A.2
   - `APPENGINE_API_BASE` — `https://analytics.deodap.in` (your backend's public URL)
   - `APPENGINE_WEBHOOK_TOKEN` — generate a random 32-char string, save it for step C

### C. Backend `.env`

SSH into your AWS instance, edit `/var/www/analytics.deodap.in/appbuilder/.env`, and add:

```
GITHUB_OWNER=<github-username-or-org>
GITHUB_REPO=<repo-name>
GITHUB_TOKEN=<the PAT from step B.2>
GITHUB_WORKFLOW_FILE=eas-build.yml
GITHUB_REF=main
BUILD_WEBHOOK_TOKEN=<the same random string from step B.3>
```

Then `pm2 restart all`.

### D. iOS signing (when you're ready to ship to App Store)

1. Create an App Store Connect listing matching your iOS bundle id.
2. Run `eas credentials` locally — Expo can manage signing certs + provisioning profiles for you.

### E. Android signing (when you're ready to ship to Play Store)

1. Run `eas credentials` locally — Expo can generate a release keystore stored on EAS, or you can upload your own.
2. Create your Play Console app listing matching your Android `applicationId`.

---

## How to verify it works

### Smoke-test the dispatcher

From your local machine:

```bash
curl -X POST https://analytics.deodap.in/api/publish/build \
  -H "Authorization: Bearer <your JWT>" \
  -H "Content-Type: application/json" \
  -d '{"imported_theme_id": 1, "platform": "android", "version": "1.0.0"}'
```

Expected: HTTP 201 with a Build row whose `status` is `building` (the dispatch fired) or `failed` with an `error_log` (something is misconfigured — read the message).

### Watch the build run

Visit `https://github.com/<owner>/<repo>/actions`. You should see an **EAS Build & Publish** workflow running. Click in to watch the EAS jobs happen.

### Confirm the callback

After ~10–15 minutes the workflow finishes and POSTs back to your `/api/webhooks/build-status`. Check `pm2 logs --lines 100`. The Build row in MySQL should now have `status='completed'` and a populated `apk_url` / `aab_url` / `ipa_url`.

### Confirm the mobile app sees it

Open the **Publish** screen on the phone. You'll see download buttons next to the completed build. Tap to download the artifact in the device browser.

---

## Troubleshooting

- **Build dispatch fails with "GITHUB_TOKEN not configured"**: env vars not set or pm2 needs a restart. Run `pm2 restart all` after editing `.env`.
- **Build dispatch returns 404 from GitHub**: `GITHUB_OWNER` / `GITHUB_REPO` typo, or the PAT doesn't have access to that repo.
- **Workflow runs but EAS step says "Project not configured"**: run `eas init` locally and commit `app.json`.
- **Webhook callback shows "Invalid webhook token"**: `BUILD_WEBHOOK_TOKEN` in backend `.env` doesn't match the GitHub secret `APPENGINE_WEBHOOK_TOKEN`. They must be byte-identical.
- **Build artifact URL expires**: EAS artifact URLs are short-lived (default ~30 days). Mirror them to your own S3 bucket if you need long retention.

---

## Per-merchant customization (NOT yet implemented)

This pipeline currently builds **the AppEngineX builder app itself**. Every merchant who taps Publish gets the same app binary.

To produce a **custom-branded app per merchant** (Tapcart-style: their store name, icon, colors, splash, bundle id), the workflow needs an extra pre-build step that:

1. Reads merchant data from your backend by `imported_theme_id`
2. Patches `app.json` (`name`, `icon`, `splash`, `ios.bundleIdentifier`, `android.package`)
3. Replaces `assets/icon.png` and `assets/splash.png` with merchant uploads
4. Runs `eas build` with merchant-specific signing credentials

This is a half-day of extra glue once the basic pipeline is verified. Tell me when you're ready and I'll add the customization step.

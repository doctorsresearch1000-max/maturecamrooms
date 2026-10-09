# CRAK credentials for Cloudflare Pages builds

Build-time sitemap generation (`npm run generate:sitemap` inside `npm run pages:build`) calls the same `runSitemapPipeline()` as local audits. It requires CRAK credentials in **`process.env` during the build container**, not only at Worker runtime.

## Required variables (same names as runtime)

`isCrakConfigured()` is true when **both** of the following are non-empty (primary names):

| Required | Purpose |
|----------|---------|
| `CRAK_API_KEY` | Performers Ext API key |
| `CRAK_TOKEN` | Performers Ext token |

**Accepted aliases** (if you use legacy names instead of the primary pair):

| Instead of | Alias |
|------------|--------|
| `CRAK_API_KEY` | `CRAKREVENUE_API_KEY` |
| `CRAK_TOKEN` | `CRAKREVENUE_API_TOKEN` or `CRACKREVENUE_TOKEN` |

## Optional (same as runtime; defaults exist in code)

| Variable | Notes |
|----------|--------|
| `CRAK_CAM_API_BASE` | Defaults to Performers Ext URL in `config.ts` |
| `CRAK_BRANDS` | Defaults to `streamate` |
| `CRAK_LANDING_ID` | Optional; `CRACKREVENUE_LANDING_ID` alias |
| `CRAK_USER_AGENT` | Optional; default user-agent string in code |

Public site vars (`NEXT_PUBLIC_*`) are unrelated to CRAK auth.

## Which pipeline is building?

| Mechanism | Where CRAK must be configured |
|-----------|-------------------------------|
| **GitHub Actions** (`.github/workflows/deploy.yml`) | **GitHub** → repository **Secrets and variables → Actions** (`CRAK_API_KEY`, `CRAK_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optional CRAK_*). Dashboard secrets are **not** injected into Actions. |
| **Cloudflare Pages Git integration** | **Cloudflare** → Workers & Pages → **maturecamrooms** → Settings → **Environment variables**, scoped to the environment that is building (**Production** and/or **Preview**). |

Evidence of a GitHub Actions credential gap: the workflow log shows empty `env: CRAK_API_KEY:` / `CRAK_TOKEN:` lines before `npm run pages:build` — that means the corresponding **GitHub repository secrets are unset**, even if Cloudflare already has the same names.

Evidence of a Cloudflare Preview gap: a **preview branch** build (for example `cursor/mobile-brand-density-1244`) fails with CRAK missing while Production runtime works — variables are often configured for **Production only**. Preview deployments use the **Preview** environment scope.

## Cloudflare Pages configuration (Git integration)

1. Open **Workers & Pages** → project **maturecamrooms** → **Settings** → **Environment variables**.
2. For **each** CRAK variable, ensure the scope includes every environment that runs `npm run pages:build`:
   - **Production** (deploys from `main`)
   - **Preview** (deploys from other branches / PR previews), if preview builds are enabled
3. Use **encrypted** values; names must match what the app reads (`CRAK_API_KEY`, `CRAK_TOKEN`, …).
4. **Redeploy** after changing variables.

### Runtime works but build fails?

Cloudflare **Functions-only** secret bindings are often **runtime-only** and are **not** injected during the Pages **build** step. If `/api/crak/health` shows credentials at runtime but `npm run generate:sitemap` fails in the deployment build log:

- Add the **same variable names** under **Pages → Environment variables** (encrypted), not only under Functions-only secret bindings.
- Do not rename variables; reuse the names the app already reads via `readCrakRuntimeEnv()`.

### Avoid two deploy pipelines

This repository’s **authoritative** path is **GitHub Actions** (`deploy.yml`): build + `wrangler pages deploy`.

If Cloudflare **Git integration** is also connected, every push can trigger a **second** build that does not see GitHub secrets. Pick one:

- **Recommended:** Keep Actions; in Cloudflare → **Settings** → **Builds & deployments**, **pause** or **disconnect** automatic Git builds, and rely on Actions after GitHub secrets are set.
- **Alternative:** Use Cloudflare Git only; disable or ignore the GitHub deploy workflow; duplicate CRAK vars under **Production** and **Preview** in the Cloudflare dashboard.

`wrangler.toml` `[vars]` only supplies **public** runtime values (`NEXT_PUBLIC_*`). It does **not** replace CRAK build secrets and must not contain API keys.

## GitHub Actions (required for `deploy.yml`)

Add **repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Required |
|--------|----------|
| `CRAK_API_KEY` | Yes (or `CRAKREVENUE_API_KEY`) |
| `CRAK_TOKEN` | Yes (or alias token names) |
| `CLOUDFLARE_API_TOKEN` | Yes (Pages Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Yes |
| `CRAK_CAM_API_BASE`, `CRAK_BRANDS`, `CRAK_LANDING_ID` | Optional |

The workflow runs on `main` and `cursor/**` pushes. Preview branches deploy with `--branch=<ref>`.

## Local development

Copy `.env.example` to `.env.local`. `scripts/generate-sitemap.ts` loads `.env.local` when present; Cloudflare builds use dashboard / CI `process.env` only.

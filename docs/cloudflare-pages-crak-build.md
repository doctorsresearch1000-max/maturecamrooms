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

## Cloudflare Pages configuration

1. Open **Workers & Pages** → project **maturecamrooms** → **Settings** → **Environment variables**.
2. For **Production** (and **Preview** if you build preview branches), add:
   - `CRAK_API_KEY` (encrypt)
   - `CRAK_TOKEN` (encrypt)
   - Any optional CRAK vars you use in production today.
3. **Redeploy** `main` so a new build runs with these variables.

### Runtime works but build fails?

Cloudflare **Functions secrets / bindings** are often **runtime-only** and are **not** injected during the Pages **build** step. If `/api/crak/health` shows credentials at runtime but `npm run generate:sitemap` fails in the deployment build log:

- Add the **same variable names** under **Pages → Environment variables** (encrypted), not only under Functions-only secret bindings.
- Do not rename variables; reuse the names the app already reads via `readCrakRuntimeEnv()`.

## GitHub Actions (optional)

The workflow `.github/workflows/deploy.yml` runs `npm run pages:build` on push to `main`. That runner does **not** read Cloudflare Pages variables. To make that job succeed, add **repository secrets** with the **same names** (`CRAK_API_KEY`, `CRAK_TOKEN`, …) and wire them in the workflow `env` block—or rely on Cloudflare Git integration only and treat a red GitHub Actions build as expected until secrets are added.

## Local development

Copy `.env.example` to `.env.local`. `scripts/generate-sitemap.ts` loads `.env.local` when present; Cloudflare builds use dashboard / CI `process.env` only.

# MatureCamRooms

Next.js 15 (App Router, meets 14+ requirement) site for **maturecamrooms.com** — live mature / MILF cam discovery with SEO, lazy-loaded thumbnails, and sponsored affiliate monetization.

## Stack

- Next.js 15 + TypeScript + Tailwind CSS
- Edge runtime on listing pages
- JSON-LD (`WebPage`, `ItemList`, `VideoObject`)
- Cloudflare Pages via [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages)

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_NAME` | Brand name |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (no trailing slash) |
| `CRAK_API_KEY` | Performers Ext `x-api-key` header (server only; encrypt in Cloudflare) |
| `CRAK_TOKEN` | Performers Ext `token` query param (**server only**) |
| `CRAK_CAM_API_BASE` | Optional API URL (default performers-ext endpoint) |
| `CRAK_BRANDS` | Optional comma brands (default `streamate`) |
| `CRAK_LANDING_ID` | Affiliate landing / smartlink URL or numeric id |
| `CRAKREVENUE_API_KEY` / `CRAKREVENUE_API_TOKEN` | Legacy aliases (optional) |
| `NEXT_PUBLIC_CRAK_SMARTLINK` | Legacy smartlink fallback (optional) |
| `NEXT_PUBLIC_STRIPCHAT_AFFILIATE_ID` | Stripchat `userId` |
| `NEXT_PUBLIC_CHATURBATE_AFFILIATE_ID` | Chaturbate campaign id |
| `NEXT_PUBLIC_DEFAULT_TAGS` | Default mature filters (comma-separated) |

Set the same keys in **Cloudflare Pages → Settings → Environment variables**.

Verify Crak connectivity (no secrets returned): `GET /api/crak/health`

## Git sync (`main`)

```bash
git checkout main
git pull origin main
git push origin main
```

Remote: `https://github.com/doctorsresearch1000-max/maturecamrooms.git` (tracking branch `main`).

## Cloudflare Pages deploy

**Authoritative path:** GitHub Actions (`.github/workflows/deploy.yml`) builds with `npm run pages:build` and deploys via Wrangler on pushes to `main` and `cursor/**`.

### 1. GitHub Actions secrets (required)

Add **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `CRAK_API_KEY` | Build-time sitemap + runtime API |
| `CRAK_TOKEN` | Build-time sitemap + runtime API |
| `CLOUDFLARE_API_TOKEN` | Pages deploy (Edit permission) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID |

Optional: `CRAK_CAM_API_BASE`, `CRAK_BRANDS`, `CRAK_LANDING_ID`, or legacy `CRAKREVENUE_*` names.

Cloudflare dashboard variables are **not** available to GitHub Actions. Failed builds with empty `CRAK_API_KEY` in the Actions log mean these GitHub secrets are missing.

See [`docs/cloudflare-pages-crak-build.md`](docs/cloudflare-pages-crak-build.md) for Preview vs Production scoping and runtime-only binding pitfalls.

### 2. Cloudflare Pages project

- Build command (if Git integration stays connected): `npm run pages:build`
- Build output: `.vercel/output/static`
- Node **20**

To avoid **two competing builds**, pause or disconnect automatic Git builds in Cloudflare when using Actions, **or** disable the GitHub workflow and scope CRAK vars to both **Production** and **Preview** in the dashboard.

**Custom domains:** project → **Custom domains** → `maturecamrooms.com` / `www` (match `NEXT_PUBLIC_SITE_URL`).

### 3. Local / manual Wrangler deploy

```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=maturecamrooms --branch=<branch>
```

Requires `CRAK_*` in `.env.local` or the shell environment and `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.

## Affiliate rules

Outbound monetized links use `rel="nofollow sponsored"` via `src/lib/affiliate/links.ts`. Wire affiliate IDs in `.env.local` / Cloudflare before going live.

## Project layout

```
src/
  app/              # Routes (home, categories, legal)
  components/       # UI, SEO JSON-LD, cam cards
  lib/              # Site config, models, affiliate helpers
```

## GitHub Actions

- **Push to `main` or `cursor/**`:** `npm run pages:build` then Wrangler deploy (after repository secrets are configured).
- **Manual:** *Run workflow* from the Actions tab (`workflow_dispatch`).

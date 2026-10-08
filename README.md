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
| `CRAKREVENUE_API_KEY` | Crak Performers Ext API key (**server only**) |
| `CRAKREVENUE_API_TOKEN` | Crak Performers Ext token (**server only**) |
| `NEXT_PUBLIC_CRAK_SMARTLINK` | Legacy smartlink fallback (optional) |
| `NEXT_PUBLIC_STRIPCHAT_AFFILIATE_ID` | Stripchat `userId` |
| `NEXT_PUBLIC_CHATURBATE_AFFILIATE_ID` | Chaturbate campaign id |
| `NEXT_PUBLIC_DEFAULT_TAGS` | Default mature filters (comma-separated) |

Set the same keys in **Cloudflare Pages → Settings → Environment variables**.

## Git sync (`main`)

```bash
git checkout main
git pull origin main
git push origin main
```

Remote: `https://github.com/doctorsresearch1000-max/maturecamrooms.git` (tracking branch `main`).

## Cloudflare Pages deploy

### Option A — Git integration (recommended for production)

Use this when you want Cloudflare to build on every push to `main` (no GitHub Actions secrets required).

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Repository: `doctorsresearch1000-max/maturecamrooms`, branch **`main`**.
3. **Build settings**
   - Root directory: `/` (repo root is this project)
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Node.js version: **20**
4. **Environment variables** (Production + Preview): copy from `.env.example` and add affiliate IDs.
5. Save and deploy. Each green build gets a `*.pages.dev` URL.

**Custom domains**

1. Project → **Custom domains** → **Set up a domain**.
2. Add `maturecamrooms.com` (apex) and `www.maturecamrooms.com`.
3. Cloudflare will show DNS records (often CNAME `www` → `<project>.pages.dev` and apex flattening or A/AAAA if the zone is on Cloudflare).
4. Enable **Always Use HTTPS** and redirect `www` → apex (or the reverse) under **Rules** / **Bulk Redirects** if you want a single canonical host (match `NEXT_PUBLIC_SITE_URL`).

**Verify build status**

- Cloudflare: **Workers & Pages** → project **maturecamrooms** → **Deployments** (latest = Production when assigned).
- GitHub: **Actions** → workflow **Cloudflare Pages** → job **Verify pages build** must be green on every push.

> If you connect Cloudflare Git **and** run Wrangler deploy from Actions, you may deploy twice. Prefer Option A only, or disable Cloudflare’s auto-build and use Option B/C.

### Option B — GitHub Actions + Wrangler (manual)

The workflow `.github/workflows/deploy-cloudflare-pages.yml` runs **`verify` on every push** and **`deploy` only on manual *Run workflow***.

Add repository secrets:

| Secret | Value |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | API token with **Cloudflare Pages — Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from Cloudflare dashboard |

Then: **Actions** → **Cloudflare Pages** → **Run workflow**.

### Option C — Wrangler CLI (local)

```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=maturecamrooms
```

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

- **Push to `main`:** validates `npm run pages:build` (CI).
- **Manual deploy:** *Run workflow* after Cloudflare secrets are configured (Option B).

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
| `NEXT_PUBLIC_CRAK_SMARTLINK` | CrakRevenue smartlink base URL |
| `NEXT_PUBLIC_STRIPCHAT_AFFILIATE_ID` | Stripchat `userId` |
| `NEXT_PUBLIC_CHATURBATE_AFFILIATE_ID` | Chaturbate campaign id |
| `NEXT_PUBLIC_DEFAULT_TAGS` | Default mature filters (comma-separated) |

Set the same keys in **Cloudflare Pages → Settings → Environment variables**.

## Cloudflare Pages deploy

### Option A — Git integration (recommended)

1. Push this repo to `https://github.com/doctorsresearch1000-max/maturecamrooms.git`.
2. In Cloudflare Dashboard → **Workers & Pages** → **Create** → **Connect to Git**.
3. Select the `maturecamrooms` repository.
4. Build configuration:
   - **Framework preset:** Next.js (or None)
   - **Build command:** `npm run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Node version:** 18 or 20
5. Add environment variables from the table above.
6. Deploy.

### Option B — Wrangler CLI

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

## Git remote

```bash
git remote add origin https://github.com/doctorsresearch1000-max/maturecamrooms.git
git push -u origin main
```

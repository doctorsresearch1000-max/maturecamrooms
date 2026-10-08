#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

unset CLOUDFLARE_API_KEY CLOUDFLARE_EMAIL CLOUDFLARE_API_USER_SERVICE_KEY

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN (Pages Edit).}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID.}"

export NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME:-MatureCamRooms}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://maturecamrooms.com}"
export NEXT_PUBLIC_DEFAULT_TAGS="${NEXT_PUBLIC_DEFAULT_TAGS:-milf,mature,cougar,mom}"

npm ci
npm run pages:build

npx wrangler pages deploy .vercel/output/static \
  --project-name=maturecamrooms \
  --branch=main \
  --commit-dirty=true

echo "Deployed. Check: https://maturecamrooms.com/api/crak/health"

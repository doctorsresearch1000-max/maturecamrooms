/**
 * Build-time sitemap generation (same validated pipeline as local audit).
 * Writes public/sitemap.xml — served as a static asset (no CRAK calls per request).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // Build may inject env via CI / Cloudflare Pages dashboard.
  }
}

loadEnvLocal();

async function assertCrakBuildEnv(): Promise<void> {
  const { isCrakConfigured } = await import("../src/lib/crak/config");
  if (isCrakConfigured()) return;

  const { getCrakEnvPresence } = await import("../src/lib/crak/diagnostics");
  const presence = getCrakEnvPresence();
  const envSummary = Object.fromEntries(
    Object.entries(presence).map(([key, meta]) => [
      key,
      { present: meta.present, source: meta.source },
    ]),
  );

  const cfPagesGitBuild = Boolean(
    process.env.CF_PAGES || process.env.CF_PAGES_BRANCH,
  );
  const wranglerPublicOnly =
    Boolean(process.env.NEXT_PUBLIC_SITE_NAME) &&
    !presence.CRAK_API_KEY?.present;

  console.error(
    JSON.stringify(
      {
        error:
          "CRAK credentials missing during build-time sitemap generation",
        required:
          "CRAK_API_KEY + CRAK_TOKEN (or CRAKREVENUE_API_KEY + CRAKREVENUE_API_TOKEN / CRACKREVENUE_TOKEN)",
        cloudflare:
          cfPagesGitBuild
            ? "Cloudflare Pages Git build detected (CF_PAGES*). GitHub Actions secrets are NOT injected here. Add encrypted CRAK_API_KEY + CRAK_TOKEN under Workers & Pages → maturecamrooms → Settings → Environment variables for BOTH Production and Preview (preview branch builds need Preview scope). If the build log only lists NEXT_PUBLIC_* from wrangler.toml, CRAK is not scoped to this environment. Recommended: disable automatic Git builds and use .github/workflows/deploy.yml only (see docs/DEPLOY-DEFINITIVO.md)."
            : "Inject CRAK_API_KEY + CRAK_TOKEN at build time: Cloudflare Pages → Environment variables (Production and Preview), or GitHub Actions repository secrets when using .github/workflows/deploy.yml. Functions-only bindings are not available during npm run pages:build.",
        wranglerPublicVarsOnlyHint: wranglerPublicOnly,
        cfPagesGitBuild,
        documentation: "docs/DEPLOY-DEFINITIVO.md",
        env: envSummary,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(url: string, lastModified?: Date): string {
  const loc = escapeXml(url);
  const lastmod = lastModified
    ? `\n    <lastmod>${lastModified.toISOString()}</lastmod>`
    : "";
  return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
}

async function main() {
  await assertCrakBuildEnv();

  const {
    runSitemapPipeline,
    staticSitemapEntries,
    modelsToSitemapEntries,
    taxonomyToSitemapEntries,
  } = await import("../src/lib/seo/sitemap");

  const t0 = performance.now();
  const pipeline = await runSitemapPipeline();
  const entries = [
    ...staticSitemapEntries(),
    ...taxonomyToSitemapEntries(pipeline.taxonomyContext),
    ...modelsToSitemapEntries(pipeline.indexableModels),
  ];

  const body = entries
    .map((e) =>
      urlEntry(
        e.url,
        e.lastModified instanceof Date ? e.lastModified : undefined,
      ),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  const outDir = resolve(process.cwd(), "public");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "sitemap.xml");
  writeFileSync(outPath, xml, "utf8");

  const modelCount = entries.filter((e) => e.url.includes("/model/")).length;
  const elapsedMs = Math.round(performance.now() - t0);

  console.log(
    JSON.stringify(
      {
        written: outPath,
        totalUrls: entries.length,
        modelUrls: modelCount,
        resolvedModels: pipeline.resolve.stats.resolved,
        generationMs: elapsedMs,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

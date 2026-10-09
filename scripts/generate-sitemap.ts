/**
 * Build-time sitemap generation — catalog-backed, sharded urlsets + index.
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

  console.error(
    JSON.stringify(
      {
        error:
          "CRAK credentials missing during build-time sitemap generation",
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

function writeUrlset(path: string, urls: { url: string; lastModified?: Date }[]) {
  const body = urls
    .map((e) =>
      urlEntry(
        e.url,
        e.lastModified instanceof Date ? e.lastModified : undefined,
      ),
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  writeFileSync(path, xml, "utf8");
}

const MAX_URLS_PER_FILE = 5000;

async function main() {
  await assertCrakBuildEnv();

  const {
    runSitemapPipeline,
    staticSitemapEntries,
    modelsToSitemapEntries,
    taxonomyToSitemapEntries,
  } = await import("../src/lib/seo/sitemap");
  const { absoluteUrl } = await import("../src/lib/site");

  const t0 = performance.now();
  const pipeline = await runSitemapPipeline();
  const staticAndTaxonomy = [
    ...staticSitemapEntries(),
    ...taxonomyToSitemapEntries(pipeline.bundle),
  ];
  const modelEntries = modelsToSitemapEntries(pipeline.indexableModels);

  const outDir = resolve(process.cwd(), "public");
  mkdirSync(outDir, { recursive: true });

  const shardPaths: string[] = [];
  const toUrlRows = (
    entries: { url: string; lastModified?: Date | string }[],
  ) =>
    entries.map((e) => ({
      url: e.url,
      lastModified:
        e.lastModified instanceof Date
          ? e.lastModified
          : e.lastModified
            ? new Date(e.lastModified)
            : undefined,
    }));

  writeUrlset(
    resolve(outDir, "sitemap-static.xml"),
    toUrlRows(staticAndTaxonomy),
  );
  shardPaths.push(absoluteUrl("/sitemap-static.xml"));

  for (let i = 0; i < modelEntries.length; i += MAX_URLS_PER_FILE) {
    const chunk = modelEntries.slice(i, i + MAX_URLS_PER_FILE);
    const index = Math.floor(i / MAX_URLS_PER_FILE) + 1;
    const fileName = `sitemap-models-${index}.xml`;
    writeUrlset(resolve(outDir, fileName), toUrlRows(chunk));
    shardPaths.push(absoluteUrl(`/${fileName}`));
  }

  const indexBody = shardPaths
    .map(
      (loc) =>
        `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexBody}\n</sitemapindex>\n`;
  writeFileSync(resolve(outDir, "sitemap.xml"), indexXml, "utf8");

  const elapsedMs = Math.round(performance.now() - t0);
  const taxonomyCount = staticAndTaxonomy.length - 5;

  console.log(
    JSON.stringify(
      {
        written: resolve(outDir, "sitemap.xml"),
        shards: shardPaths.length,
        totalUrls: staticAndTaxonomy.length + modelEntries.length,
        modelUrls: modelEntries.length,
        taxonomyUrls: taxonomyCount,
        catalogModels: pipeline.catalog.models.length,
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

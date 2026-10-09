/**
 * Production-style sitemap pipeline audit (requires CRAK credentials in .env.local).
 * Usage: npx tsx scripts/sitemap-audit.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
    console.warn("No .env.local found; relying on process environment.");
  }
}

loadEnvLocal();

async function main() {
  const {
    runSitemapPipeline,
    staticSitemapEntries,
    modelsToSitemapEntries,
    taxonomyToSitemapEntries,
  } = await import("../src/lib/seo/sitemap");
  const { canonicalModelUrl } = await import("../src/lib/seo/canonical");
  const { canonicalProfileSlug } = await import("../src/lib/crak/sitemapCatalog");

  const t0 = performance.now();
  const { fetchBuildTimeCatalog } = await import("../src/lib/crak/buildTimeCatalog");
  const built = await fetchBuildTimeCatalog();
  const pipeline = await runSitemapPipeline(built.models);
  const staticEntries = staticSitemapEntries();
  const taxonomyEntries = taxonomyToSitemapEntries(pipeline.bundle);
  const modelEntries = modelsToSitemapEntries(pipeline.indexableModels);
  const allEntries = [...staticEntries, ...taxonomyEntries, ...modelEntries];
  const elapsedMs = Math.round(performance.now() - t0);

  const urls = allEntries.map((e) => e.url);
  const urlSet = new Set(urls);
  const duplicateCount = urls.length - urlSet.size;

  let canonicalMismatches = 0;
  for (const model of pipeline.indexableModels) {
    const expected = canonicalModelUrl(model.username);
    const slug = canonicalProfileSlug(model.username);
    if (expected !== canonicalModelUrl(slug)) canonicalMismatches += 1;
  }

  const catalog = pipeline.catalog;

  const report = {
    catalog_unique_models: catalog.models.length,
    model_urls_in_sitemap: modelEntries.length,
    taxonomy_urls: taxonomyEntries.length,
    combo_urls: pipeline.bundle.combos.length,
    static_urls: staticEntries.length,
    total_urls: allEntries.length,
    duplicate_urls: duplicateCount,
    canonical_slug_mismatches: canonicalMismatches,
    catalog_pages_fetched: catalog.pagesFetched,
    generation_time_ms: elapsedMs,
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

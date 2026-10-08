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
  const pipeline = await runSitemapPipeline();
  const staticEntries = staticSitemapEntries();
  const taxonomyEntries = taxonomyToSitemapEntries(pipeline.taxonomyContext);
  const modelEntries = modelsToSitemapEntries(pipeline.indexableModels);
  const allEntries = [...staticEntries, ...taxonomyEntries, ...modelEntries];
  const elapsedMs = Math.round(performance.now() - t0);

  const urls = allEntries.map((e) => e.url);
  const urlSet = new Set(urls);
  const duplicateCount = urls.length - urlSet.size;

  const modelUrls = modelEntries.map((e) => e.url);
  let canonicalMismatches = 0;
  for (const model of pipeline.indexableModels) {
    const expected = canonicalModelUrl(model.username);
    const slug = canonicalProfileSlug(model.username);
    if (expected !== canonicalModelUrl(slug)) canonicalMismatches += 1;
  }

  const stats = pipeline.resolve.stats;
  const catalog = pipeline.catalog;

  const report = {
    A_candidates_raw_rows_from_crak: catalog.rawPerformerRows,
    B_candidates_after_dedup: catalog.models.length,
    C_after_indexability_filter: stats.afterIndexability,
    D_successfully_resolved: stats.resolved,
    E_rejected: {
      not_indexable: stats.rejectedNotIndexable,
      unresolved_profile: stats.rejectedUnresolved,
      slug_mismatch: stats.rejectedSlugMismatch,
    },
    F_final_model_urls_in_sitemap: modelEntries.length,
    G_canonical_slug_mismatches_in_pipeline: canonicalMismatches,
    H_duplicate_urls_in_sitemap: duplicateCount,
    I_total_sitemap_urls: allEntries.length,
    J_generation_time_ms: elapsedMs,
    catalog_pages_fetched: catalog.pagesFetched,
    taxonomy_urls: taxonomyEntries.length,
    static_urls: staticEntries.length,
    closer_to_expected_605:
      stats.resolved >= 400
        ? "yes — substantially expanded vs prior ~43 resolved"
        : stats.resolved > 43
          ? "partial — more than legacy sitemap but below ~605 ceiling"
          : "no — similar to legacy scale",
    note_g_404_noindex:
      "404/noindex spot-check requires HTTP against deployed pages; this run validates pipeline + URL uniqueness/canonical construction only.",
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

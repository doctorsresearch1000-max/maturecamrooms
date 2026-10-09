import { readFileSync } from "node:fs";
import { resolve } from "node:path";
function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}
loadEnvLocal();

const { getFullCatalog } = await import("../src/lib/crak/fullCatalog.ts");
const { filterModelsByCategory } = await import("../src/lib/seo/filters.ts");
const { modelAgeBand } = await import("../src/lib/taxonomy/facetFilters.ts");
const { buildNicheCanonicalMap } = await import("../src/lib/taxonomy/liveMenuInventory.ts");
const { runSitemapPipeline } = await import("../src/lib/seo/sitemap.ts");

const t0 = performance.now();
const snap = await getFullCatalog();
const sitemapT0 = performance.now();
const pipeline = await runSitemapPipeline();
const sitemapMs = Math.round(performance.now() - sitemapT0);

const ageBands = { "30-39": 0, "40-49": 0, "50-59": 0, "60-plus": 0, other: 0 };
const brands = new Map();
for (const m of snap.models) {
  const band = modelAgeBand(m.age);
  if (band && band in ageBands) ageBands[band]++;
  else ageBands.other++;
  const b = m.catalogBrand ?? "unknown";
  brands.set(b, (brands.get(b) ?? 0) + 1);
}

const niches = {};
for (const s of ["mature", "milf", "cougar", "mom"]) {
  niches[s] = filterModelsByCategory(snap.models, s).length;
}

const overlap = buildNicheCanonicalMap(snap.models);

let roomMismatch = 0;
for (const m of snap.models.slice(0, 200)) {
  if (!m.roomUrl?.startsWith("https://")) continue;
  const host = new URL(m.roomUrl).hostname;
  if (m.catalogBrand === "streamate" && !host.includes("cam") && !host.includes("stream")) {
    roomMismatch++;
  }
}

const taxonomyEntries = (
  await import("../src/lib/seo/sitemap.ts")
).taxonomyToSitemapEntries(pipeline.bundle);
const modelEntries = (
  await import("../src/lib/seo/sitemap.ts")
).modelsToSitemapEntries(pipeline.indexableModels);

console.log(
  JSON.stringify(
    {
      catalogUnique: snap.models.length,
      catalogFetchMs: Math.round(performance.now() - t0),
      sitemapGenerationMs: sitemapMs,
      ageBands,
      brands: Object.fromEntries(brands),
      nicheCounts: niches,
      nicheCanonicalOverlapMap: overlap,
      roomUrlSampleMismatch: roomMismatch,
      sitemap: {
        modelUrls: modelEntries.length,
        taxonomyUrls: taxonomyEntries.length,
        combos: pipeline.bundle.combos.length,
      },
      pass625: snap.models.length >= 625,
      pass30_39: ageBands["30-39"] > 0,
      pass2000: snap.models.length >= 2000,
    },
    null,
    2,
  ),
);

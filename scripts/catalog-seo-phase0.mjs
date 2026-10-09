/**
 * FASE 0 measurement — catalog size, distributions, niche overlap.
 * Run: node --import tsx scripts/catalog-seo-phase0.mjs
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
    /* CI / shell env */
  }
}

loadEnvLocal();

const { fetchPerformers } = await import("../src/lib/crak/client.ts");
const { normalizePerformer } = await import("../src/lib/crak/normalize.ts");
const { mapPerformerTaxonomy, matureTagsQuery, matureAgeGroupsQuery } =
  await import("../src/lib/crak/taxonomy.ts");
const { resolveCrakBrands } = await import("../src/lib/crak/config.ts");
const { slugify } = await import("../src/lib/seo/slug.ts");
const { countryLabel } = await import("../src/lib/country.ts");

const PAGE_SIZE = 48;

function ageBand(age) {
  if (age == null || age < 30) return "under-30";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  return "60+";
}

function overlapRatio(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const id of setA) if (setB.has(id)) inter++;
  return inter / Math.min(setA.size, setB.size);
}

async function paginateCatalog({ live, maxPages = 50 }) {
  const bySlug = new Map();
  let pages = 0;
  let rawRows = 0;
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetchPerformers({
      page,
      size: PAGE_SIZE,
      sorting: "score",
      live,
      tags: matureTagsQuery(),
      ages: matureAgeGroupsQuery(),
      brands: resolveCrakBrands(),
      gender: "f",
      lang: "en",
    });
    const batch = res.performers ?? [];
    pages++;
    rawRows += batch.length;
    if (batch.length === 0) break;
    for (const p of batch) {
      const m = normalizePerformer(p);
      if (!m.thumbnailUrl) continue;
      const slug = slugify(m.username) || m.username;
      if (!bySlug.has(slug)) bySlug.set(slug, m);
    }
    if (batch.length < PAGE_SIZE) break;
  }
  return { models: [...bySlug.values()], pages, rawRows };
}

function countBy(models, keyFn) {
  const c = new Map();
  for (const m of models) {
    const k = keyFn(m);
    if (!k) continue;
    c.set(k, (c.get(k) ?? 0) + 1);
  }
  return Object.fromEntries([...c.entries()].sort((a, b) => b[1] - a[1]));
}

const offlineCatalog = await paginateCatalog({ live: false, maxPages: 50 });
const liveCatalog = await paginateCatalog({ live: true, maxPages: 20 });

const models = offlineCatalog.models;
const liveN = models.filter((m) => m.isLive).length;
const offN = models.length - liveN;

const tagSample = new Map();
for (const p of (await fetchPerformers({
  page: 1,
  size: 48,
  live: false,
  tags: matureTagsQuery(),
  ages: matureAgeGroupsQuery(),
  gender: "f",
})).performers ?? []) {
  for (const t of [
    ...(p.characteristicsTags ?? []),
    ...(p.autoTags ?? []),
    ...(p.customTags ?? []),
  ]) {
    const k = t.toLowerCase();
    tagSample.set(k, (tagSample.get(k) ?? 0) + 1);
  }
}

const nicheSetsResolved = {};
const { filterModelsByCategory } = await import("../src/lib/seo/filters.ts");
for (const slug of ["mature", "milf", "cougar", "mom"]) {
  nicheSetsResolved[slug] = filterModelsByCategory(models, slug).length;
}

const overlap = {};
for (const a of ["mature", "milf", "cougar", "mom"]) {
  for (const b of ["mature", "milf", "cougar", "mom"]) {
    if (a === b) continue;
    const setA = new Set(filterModelsByCategory(models, a).map((m) => m.id));
    const setB = new Set(filterModelsByCategory(models, b).map((m) => m.id));
    overlap[`${a}|${b}`] = Math.round(overlapRatio(setA, setB) * 1000) / 1000;
  }
}

console.log(
  JSON.stringify(
    {
      craK: {
        brands: resolveCrakBrands(),
        pagination: "page + size (max 48), sorting, live boolean, tags, ages, ethnicities, gender, lang, brands",
        offlineInListApi: "live=false returns offline-inclusive catalog rows",
      },
      catalogFetch: {
        pages: offlineCatalog.pages,
        rawRows: offlineCatalog.rawRows,
        uniqueWithThumb: models.length,
        liveInOfflinePass: liveN,
        offlineInOfflinePass: offN,
        liveOnlyPassUnique: liveCatalog.models.length,
      },
      distributions: {
        ageBand: countBy(models, (m) => ageBand(m.age)),
        ethnicity: countBy(models, (m) => m.ethnicity),
        hair: countBy(models, (m) => m.hair),
        bust: countBy(models, (m) => m.bustSize),
        figure: countBy(models, (m) => m.figure),
        country: countBy(models, (m) =>
          countryLabel(m.countryCode, m.country),
        ),
        language: countBy(models, (m) => (m.languages ?? []).join(",")),
      },
      nicheCountsCurrentRules: nicheSetsResolved,
      nicheOverlapRatio: overlap,
      topTagsSample: Object.fromEntries(
        [...tagSample.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25),
      ),
      mapPerformerTaxonomyIssues: [
        "COUGAR_SIGNALS includes 'mature' → most tags match cougar",
        "MILF age 35-49 overlaps mature age>=40",
        "default mature when empty → 100% mature",
      ],
    },
    null,
    2,
  ),
);

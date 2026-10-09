/**
 * One-off audit: live feed field coverage + niche overlap. Run: node scripts/audit-feed-taxonomy.mjs
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

const { getCrakFeed } = await import("../src/lib/crak/service.ts");
const { normalizePerformer } = await import("../src/lib/crak/normalize.ts");
const { filterModelsByCategory } = await import("../src/lib/seo/filters.ts");
const { mapPerformerTaxonomy } = await import("../src/lib/crak/taxonomy.ts");

async function fetchLivePool(maxPages = 12, size = 48) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const batch = await getCrakFeed({
      page,
      size,
      live: true,
      sorting: "score",
    });
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < size) break;
  }
  const byId = new Map();
  for (const m of all) byId.set(m.id, m);
  return [...byId.values()];
}

function ageBand(age) {
  if (age == null) return "unknown";
  if (age < 30) return "under-30";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  return "60+";
}

function overlapPct(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const id of setA) if (setB.has(id)) inter++;
  const denom = Math.min(setA.size, setB.size);
  return Math.round((inter / denom) * 100);
}

const pool = await fetchLivePool();
console.log(JSON.stringify({ liveUniqueModels: pool.length }, null, 2));

const fields = {
  displayName: 0,
  username: 0,
  isLive: 0,
  age: 0,
  country: 0,
  countryCode: 0,
  ethnicity: 0,
  hair: 0,
  languages: 0,
  tags: 0,
  primaryCategory: 0,
  figure: 0,
  bustSize: 0,
  height: 0,
  description: 0,
  viewers: 0,
};

for (const m of pool) {
  if (m.displayName) fields.displayName++;
  if (m.username) fields.username++;
  if (m.isLive) fields.isLive++;
  if (m.age != null) fields.age++;
  if (m.country) fields.country++;
  if (m.countryCode) fields.countryCode++;
  if (m.ethnicity) fields.ethnicity++;
  if (m.hair) fields.hair++;
  if (m.languages?.length) fields.languages++;
  if (m.tags?.length) fields.tags++;
  if (m.primaryCategory) fields.primaryCategory++;
  if (m.figure) fields.figure++;
  if (m.bustSize) fields.bustSize++;
  if (m.height) fields.height++;
  if (m.description) fields.description++;
  if (m.viewers != null) fields.viewers++;
}

const pct = (n) => Math.round((n / pool.length) * 100);
const fieldPct = Object.fromEntries(
  Object.entries(fields).map(([k, v]) => [k, { count: v, pct: pct(v) }]),
);
console.log("\nField coverage:", JSON.stringify(fieldPct, null, 2));

const ageBands = {};
const countries = {};
const ethnicities = {};
const hairs = {};
for (const m of pool) {
  const band = ageBand(m.age);
  ageBands[band] = (ageBands[band] ?? 0) + 1;
  if (m.country) {
    const c = m.country;
    countries[c] = (countries[c] ?? 0) + 1;
  }
  if (m.ethnicity) {
    const e = m.ethnicity;
    ethnicities[e] = (ethnicities[e] ?? 0) + 1;
  }
  if (m.hair) {
    const h = m.hair;
    hairs[h] = (hairs[h] ?? 0) + 1;
  }
}

console.log("\nAge bands:", ageBands);
console.log("\nTop countries:", Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 12));
console.log("\nEthnicities:", ethnicities);
console.log("\nHair:", hairs);

const niches = ["mature", "milf", "mom", "cougar"];
const nicheSets = {};
for (const n of niches) {
  nicheSets[n] = new Set(
    filterModelsByCategory(pool, n).map((m) => m.id),
  );
}

const overlap = {};
for (let i = 0; i < niches.length; i++) {
  for (let j = i + 1; j < niches.length; j++) {
    const a = niches[i];
    const b = niches[j];
    overlap[`${a}|${b}`] = {
      a: nicheSets[a].size,
      b: nicheSets[b].size,
      sharedPctOfSmaller: overlapPct(nicheSets[a], nicheSets[b]),
    };
  }
}
console.log("\nNiche counts:", Object.fromEntries(niches.map((n) => [n, nicheSets[n].size])));
console.log("\nNiche overlap (% of smaller set):", overlap);

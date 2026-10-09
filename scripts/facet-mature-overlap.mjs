import { fetchLiveMenuPool } from "../src/lib/taxonomy/fetchLivePool.ts";
import { filterModelsByCategory } from "../src/lib/seo/filters.ts";
import {
  filterModelsByAgeBand,
} from "../src/lib/taxonomy/facetFilters.ts";
import { countryLabel } from "../src/lib/country.ts";
import { slugify } from "../src/lib/seo/slug.ts";

const { pool } = await fetchLiveMenuPool();
const live = pool.filter((m) => m.isLive);
const mature = new Set(
  filterModelsByCategory(live, "mature").map((m) => m.id),
);

function overlap(ids) {
  const s = new Set(ids);
  let inter = 0;
  for (const id of s) if (mature.has(id)) inter++;
  const denom = Math.min(s.size, mature.size);
  return { n: s.size, pct: denom ? Math.round((inter / denom) * 100) : 0 };
}

console.log(JSON.stringify({ mature: mature.size, live: live.length }, null, 2));
for (const band of ["40-49", "50-59", "60-plus"]) {
  const o = overlap(filterModelsByAgeBand(live, band).map((m) => m.id));
  console.log("age", band, o);
}

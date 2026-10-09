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
const { fetchPerformers } = await import("../src/lib/crak/client.ts");

const bands = ["gc_30_39", "gc_40_49", "gc_50_59", "gc_60_plus", "gc_50_plus"];
for (const ages of bands) {
  const r = await fetchPerformers({
    page: 1,
    size: 12,
    live: false,
    ages,
    brands: "streamate",
    gender: "f",
  });
  console.log("probe", ages, "apiCount", r.count, "batch", r.performers?.length);
}

async function paginate(ages, maxP = 80) {
  const ids = new Set();
  for (let p = 1; p <= maxP; p++) {
    const r = await fetchPerformers({
      page: p,
      size: 48,
      live: false,
      ages,
      brands: "streamate",
      gender: "f",
    });
    const b = r.performers ?? [];
    for (const x of b) ids.add(x.itemId || x.name);
    if (b.length < 48) break;
  }
  return ids.size;
}

const perBand = {};
for (const ages of ["gc_30_39", "gc_40_49", "gc_50_59", "gc_60_plus"]) {
  perBand[ages] = await paginate(ages);
}

const all = new Map();
for (const ages of ["gc_30_39", "gc_40_49", "gc_50_59", "gc_60_plus"]) {
  for (let p = 1; p <= 80; p++) {
    const r = await fetchPerformers({
      page: p,
      size: 48,
      live: false,
      ages,
      brands: "streamate",
      gender: "f",
    });
    const b = r.performers ?? [];
    for (const x of b) {
      const id = x.itemId || x.name;
      if (!all.has(id))
        all.set(id, {
          age: x.characteristic?.age,
          systemSource: x.systemSource,
          roomUrl: x.roomUrl,
        });
    }
    if (b.length < 48) break;
  }
}

const ab = { "30-39": 0, "40-49": 0, "50-59": 0, "60+": 0, other: 0 };
for (const v of all.values()) {
  const a = v.age;
  if (typeof a === "number" && a >= 30 && a < 40) ab["30-39"]++;
  else if (typeof a === "number" && a < 50) ab["40-49"]++;
  else if (typeof a === "number" && a < 60) ab["50-59"]++;
  else if (typeof a === "number" && a >= 60) ab["60+"]++;
  else ab.other++;
}

console.log(JSON.stringify({ perBandPaginated: perBand, totalDeduped: all.size, ageBreakdown: ab }, null, 2));

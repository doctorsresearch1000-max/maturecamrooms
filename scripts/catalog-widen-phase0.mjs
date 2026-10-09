/**
 * FASE 0 — probe CRAK list API (no app logic changes).
 * Run: node --import tsx scripts/catalog-widen-phase0.mjs
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
    /* env from CI */
  }
}

loadEnvLocal();

const { fetchPerformers } = await import("../src/lib/crak/client.ts");
const { resolveCrakBrands } = await import("../src/lib/crak/config.ts");
const { slugify } = await import("../src/lib/seo/slug.ts");

const PAGE_SIZE = 48;
const MAX_PAGES_PROBE = 40;

const BRAND_CANDIDATES = [
  "streamate",
  "livejasmin",
  "imlive",
  "chaturbate",
  "stripchat",
  "bongacams",
  "camsoda",
  "myfreecams",
  "flirt4free",
  "jerkmate",
  "xlovecam",
  "cam4",
  "xcams",
];

const AGE_CANDIDATES = [
  "gc_30_39",
  "gc_30_39,gc_40_49,gc_50_plus",
  "gc_30_39,gc_40_49,gc_50_59,gc_60_plus",
  "gc_40_49,gc_50_plus",
  "gc_18_29",
  "gc_20_29",
  "30_39",
  "gc_50_59",
  "gc_60_plus",
];

const TAG_PROBE = ["milf", "mature", "housewife", "cougar", "granny"];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function countUniqueOffline({
  tags,
  ages,
  brands,
  gender,
  maxPages = MAX_PAGES_PROBE,
}) {
  const byId = new Map();
  let pages = 0;
  let raw = 0;
  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetchPerformers({
        page,
        size: PAGE_SIZE,
        sorting: "score",
        live: false,
        ...(tags !== undefined ? { tags } : {}),
        ...(ages ? { ages } : {}),
        ...(brands ? { brands } : {}),
        ...(gender ? { gender } : {}),
        lang: "en",
      });
      const batch = res.performers ?? [];
      pages++;
      raw += batch.length;
      for (const p of batch) {
        const id = p.itemId || p.nameClean || p.name;
        if (!id) continue;
        if (!byId.has(id)) {
          byId.set(id, {
            systemSource: p.systemSource,
            roomHost: p.roomUrl ? new URL(p.roomUrl).hostname : null,
            age: p.characteristic?.age,
          });
        }
      }
      if (batch.length < PAGE_SIZE) break;
      if (page % 5 === 0) await sleep(200);
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        unique: byId.size,
        pages,
        raw,
      };
    }
  }
  return { unique: byId.size, pages, raw };
}

async function probeOnePage(params) {
  try {
    const res = await fetchPerformers({
      page: 1,
      size: 12,
      sorting: "score",
      live: false,
      lang: "en",
      gender: "f",
      ...params,
    });
    return {
      ok: true,
      count: res.count,
      performers: (res.performers ?? []).length,
      sampleSource: (res.performers ?? [])[0]?.systemSource,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

console.log("=== Age param probe (page 1, streamate, no tags) ===");
const ageProbe = {};
for (const ages of AGE_CANDIDATES) {
  ageProbe[ages] = await probeOnePage({
    ages,
    brands: "streamate",
  });
  await sleep(150);
}

console.log("=== Brand probe (page 1, ages gc_30_39,gc_40_49,gc_50_plus, no tags) ===");
const brandProbe = {};
const wideAges = "gc_30_39,gc_40_49,gc_50_plus";
for (const brand of BRAND_CANDIDATES) {
  brandProbe[brand] = await probeOnePage({
    ages: wideAges,
    brands: brand,
  });
  await sleep(120);
}

console.log("=== Tag probe (page 1, single tag) ===");
const tagProbe = {};
for (const tag of TAG_PROBE) {
  tagProbe[tag] = await probeOnePage({
    tags: tag,
    ages: wideAges,
    brands: "streamate",
  });
  await sleep(100);
}

const configuredBrands = resolveCrakBrands();
console.log("\n=== Full counts (offline pagination) ===");

const configs = {};

configs.a_no_tags_wide_ages_streamate = await countUniqueOffline({
  tags: undefined,
  ages: wideAges,
  brands: "streamate",
  gender: "f",
});

configs.b_per_brand = {};
for (const brand of BRAND_CANDIDATES) {
  const r = await countUniqueOffline({
    ages: wideAges,
    brands: brand,
    gender: "f",
  });
  if (r.unique > 0 || !r.error) configs.b_per_brand[brand] = r;
  await sleep(300);
}

const allBrandsList = BRAND_CANDIDATES.filter(
  (b) => configs.b_per_brand[b]?.unique > 0,
);
const byIdAll = new Map();
let pagesAll = 0;
let rawAll = 0;
for (const brand of allBrandsList.length ? allBrandsList : ["streamate"]) {
  for (let page = 1; page <= MAX_PAGES_PROBE; page++) {
    const res = await fetchPerformers({
      page,
      size: PAGE_SIZE,
      sorting: "score",
      live: false,
      ages: wideAges,
      brands: brand,
      gender: "f",
      lang: "en",
    }).catch(() => null);
    if (!res) break;
    const batch = res.performers ?? [];
    pagesAll++;
    rawAll += batch.length;
    for (const p of batch) {
      const id = p.itemId || p.nameClean || p.name;
      if (id) byIdAll.set(id, { brand, systemSource: p.systemSource });
    }
    if (batch.length < PAGE_SIZE) break;
  }
  await sleep(200);
}
configs.c_all_brands_deduped = {
  unique: byIdAll.size,
  brandsMerged: allBrandsList,
  pages: pagesAll,
  raw: rawAll,
};

configs.d_gender_f = await countUniqueOffline({
  ages: wideAges,
  brands: configuredBrands,
  gender: "f",
});
configs.d_no_gender = await countUniqueOffline({
  ages: wideAges,
  brands: configuredBrands,
});

// Room URL hosts per brand (sample)
const roomByBrand = {};
for (const brand of allBrandsList.length ? allBrandsList : [configuredBrands]) {
  const res = await fetchPerformers({
    page: 1,
    size: 24,
    live: false,
    ages: wideAges,
    brands: brand,
    gender: "f",
  }).catch(() => null);
  const hosts = new Set();
  const sources = new Set();
  for (const p of res?.performers ?? []) {
    if (p.roomUrl) {
      try {
        hosts.add(new URL(p.roomUrl).hostname);
      } catch {
        hosts.add("invalid");
      }
    }
    if (p.systemSource) sources.add(p.systemSource);
  }
  roomByBrand[brand] = {
    hosts: [...hosts],
    systemSources: [...sources],
    sampleRoomUrl: res?.performers?.[0]?.roomUrl?.slice(0, 80),
  };
}

console.log(
  JSON.stringify(
    {
      configuredCrakBrands: configuredBrands,
      crakBrandsInSyncScript:
        "CRAK_BRANDS is synced by scripts/sync-pages-preview-crak-env.mjs when set in GHA env",
      apiNotes: {
        pagination: "page, size (max 48), sorting, live, tags, ages, ethnicities, gender f|m|c|t, brands, lang",
        listBrandsEndpoint: "none discovered — empirical brand string probe",
      },
      ageParamProbe: ageProbe,
      brandParamProbe: brandProbe,
      tagParamProbe: tagProbe,
      countConfigs: configs,
      roomUrlByBrandSample: roomByBrand,
      baselineCurrentQuery: await countUniqueOffline({
        tags: "milf,mature,housewife",
        ages: "gc_40_49,gc_50_plus",
        brands: configuredBrands,
        gender: "f",
      }),
    },
    null,
    2,
  ),
);

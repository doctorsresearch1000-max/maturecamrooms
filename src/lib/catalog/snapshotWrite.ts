import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { sortCatalogBrowse } from "@/lib/crak/fullCatalog";
import type { CamModel } from "@/lib/models/types";
import {
  buildCatalogMenuInventory,
  buildComboLandings,
} from "@/lib/taxonomy/catalogInventory";
import { filterModelsByCategory } from "@/lib/seo/filters";
import { FACET_SITEMAP_MIN_COUNT } from "@/lib/taxonomy/settings";
import {
  AGE_FACET_DEFS,
  bustSlug,
  countryFacetSlug,
  ethnicitySlug,
  figureSlug,
  filterModelsByAgeBand,
  filterModelsByBust,
  filterModelsByEthnicity,
  filterModelsByFigure,
  filterModelsByHair,
  filterModelsByLanguageSlug,
  hairSlug,
} from "@/lib/taxonomy/facetFilters";
import { slugify } from "@/lib/seo/slug";
import { countryLabel } from "@/lib/country";
import type {
  CatalogCard,
  CatalogManifest,
  CatalogMenuSnapshot,
} from "@/lib/catalog/types";

export const CATALOG_SNAPSHOT_PAGE_SIZE = 48;
const OUT_ROOT = "public/data/catalog";

export function toCatalogCard(model: CamModel): CatalogCard {
  return {
    id: model.id,
    username: model.username,
    displayName: model.displayName,
    thumbnailUrl: model.thumbnailUrl,
    isLive: false,
    primaryCategory: model.primaryCategory,
    age: model.age,
    score: model.score,
    catalogBrand: model.catalogBrand,
    platform: model.platform,
  };
}

function writePageFile(dir: string, page: number, cards: CatalogCard[]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, `page-${page}.json`),
    JSON.stringify(cards),
    "utf8",
  );
}

function writePagedModels(
  relDir: string,
  models: CamModel[],
  manifestKey: Record<string, { count: number; pages: number }>,
  slug: string,
) {
  const sorted = sortCatalogBrowse(models);
  const pages = Math.max(1, Math.ceil(sorted.length / CATALOG_SNAPSHOT_PAGE_SIZE));
  const count = sorted.length;
  if (count < FACET_SITEMAP_MIN_COUNT) return;
  manifestKey[slug] = { count, pages };
  const base = resolve(process.cwd(), OUT_ROOT, relDir, slug);
  for (let p = 1; p <= pages; p++) {
    const slice = sorted
      .slice((p - 1) * CATALOG_SNAPSHOT_PAGE_SIZE, p * CATALOG_SNAPSHOT_PAGE_SIZE)
      .map(toCatalogCard);
    writePageFile(base, p, slice);
  }
}

function nicheOverlapReport(models: CamModel[]) {
  const mature = new Set(
    filterModelsByCategory(models, "mature").map((m) => m.id),
  );
  const milf = new Set(filterModelsByCategory(models, "milf").map((m) => m.id));
  let inter = 0;
  for (const id of milf) if (mature.has(id)) inter++;
  const overlapMatureMilf =
    mature.size && milf.size
      ? inter / Math.min(mature.size, milf.size)
      : 0;
  let matureUnder40 = 0;
  for (const m of filterModelsByCategory(models, "mature")) {
    if (typeof m.age === "number" && m.age < 40) matureUnder40++;
  }
  const counts: Record<string, number> = {};
  for (const s of ["mature", "milf", "cougar", "mom"]) {
    counts[s] = filterModelsByCategory(models, s).length;
  }
  return { counts, matureUnder40, overlapMatureMilf };
}

export type WriteCatalogSnapshotResult = {
  manifest: CatalogManifest;
  menu: CatalogMenuSnapshot;
  bytesWritten: number;
};

export function writeCatalogSnapshot(models: CamModel[]): WriteCatalogSnapshotResult {
  const root = resolve(process.cwd(), OUT_ROOT);
  mkdirSync(root, { recursive: true });

  const sortedAll = sortCatalogBrowse(models);
  const allPages = Math.ceil(sortedAll.length / CATALOG_SNAPSHOT_PAGE_SIZE) || 1;
  const allDir = resolve(root, "all");
  mkdirSync(allDir, { recursive: true });
  for (let p = 1; p <= allPages; p++) {
    const slice = sortedAll
      .slice((p - 1) * CATALOG_SNAPSHOT_PAGE_SIZE, p * CATALOG_SNAPSHOT_PAGE_SIZE)
      .map(toCatalogCard);
    writePageFile(allDir, p, slice);
  }

  const manifest: CatalogManifest = {
    generatedAt: new Date().toISOString(),
    total: models.length,
    pageSize: CATALOG_SNAPSHOT_PAGE_SIZE,
    allPages,
    categories: {},
    ages: {},
    ethnicities: {},
    hairs: {},
    busts: {},
    figures: {},
    countries: {},
    languages: {},
    combos: {},
  };

  for (const cat of ["mature", "milf", "cougar", "mom"]) {
    const pool = filterModelsByCategory(models, cat);
    if (pool.length >= FACET_SITEMAP_MIN_COUNT) {
      writePagedModels("category", pool, manifest.categories, cat);
    } else if (pool.length > 0) {
      manifest.categories[cat] = { count: pool.length, pages: 0 };
    }
  }

  for (const def of AGE_FACET_DEFS) {
    writePagedModels(
      "age",
      filterModelsByAgeBand(models, def.slug),
      manifest.ages,
      def.slug,
    );
  }

  const ethMap = new Map<string, CamModel[]>();
  for (const m of models) {
    const s = ethnicitySlug(m);
    if (!s) continue;
    const list = ethMap.get(s) ?? [];
    list.push(m);
    ethMap.set(s, list);
  }
  for (const [slug, pool] of ethMap) {
    writePagedModels("ethnicity", pool, manifest.ethnicities, slug);
  }

  const hairMap = new Map<string, CamModel[]>();
  for (const m of models) {
    const s = hairSlug(m);
    if (!s) continue;
    const list = hairMap.get(s) ?? [];
    list.push(m);
    hairMap.set(s, list);
  }
  for (const [slug, pool] of hairMap) {
    writePagedModels("hair", pool, manifest.hairs, slug);
  }

  const bustMap = new Map<string, CamModel[]>();
  for (const m of models) {
    const s = bustSlug(m);
    if (!s) continue;
    const list = bustMap.get(s) ?? [];
    list.push(m);
    bustMap.set(s, list);
  }
  for (const [slug, pool] of bustMap) {
    writePagedModels("bust", pool, manifest.busts, slug);
  }

  const figMap = new Map<string, CamModel[]>();
  for (const m of models) {
    const s = figureSlug(m);
    if (!s) continue;
    const list = figMap.get(s) ?? [];
    list.push(m);
    figMap.set(s, list);
  }
  for (const [slug, pool] of figMap) {
    writePagedModels("figure", pool, manifest.figures, slug);
  }

  const countryMap = new Map<string, CamModel[]>();
  for (const m of models) {
    const s = countryFacetSlug(m);
    if (!s) continue;
    const list = countryMap.get(s) ?? [];
    list.push(m);
    countryMap.set(s, list);
  }
  for (const [slug, pool] of countryMap) {
    writePagedModels("country", pool, manifest.countries, slug);
  }

  const langMap = new Map<string, CamModel[]>();
  for (const m of models) {
    for (const lang of m.languages ?? []) {
      const s = slugify(lang);
      if (!s) continue;
      const list = langMap.get(s) ?? [];
      list.push(m);
      langMap.set(s, list);
    }
  }
  for (const [slug, pool] of langMap) {
    writePagedModels("language", pool, manifest.languages, slug);
  }

  const combos = buildComboLandings(models, FACET_SITEMAP_MIN_COUNT);
  const combosMeta: Record<
    string,
    { title: string; description: string; h1: string; intro: string; count: number }
  > = {};
  for (const combo of combos) {
    const pool = combo.match(models);
    writePagedModels("combo", pool, manifest.combos, combo.slug);
    combosMeta[combo.slug] = {
      title: combo.title,
      description: combo.description,
      h1: combo.h1,
      intro: combo.intro,
      count: combo.count,
    };
  }
  writeFileSync(
    resolve(root, "combos-meta.json"),
    JSON.stringify(combosMeta),
    "utf8",
  );

  const menuInv = buildCatalogMenuInventory(models, models.length > 0);
  const nicheReport = nicheOverlapReport(models);
  const menuSnapshot: CatalogMenuSnapshot = {
    generatedAt: manifest.generatedAt,
    catalogCount: models.length,
    menu: {
      niches: menuInv.niches,
      ageBands: menuInv.ageBands,
      ethnicities: menuInv.ethnicities,
      hairs: menuInv.hairs,
      busts: menuInv.busts,
      figures: menuInv.figures,
      countries: menuInv.countries,
      languages: menuInv.languages,
      segments: menuInv.segments,
      headerChips: menuInv.headerChips,
      nicheCanonicalTo: menuInv.nicheCanonicalTo,
    },
    nicheReport,
  };

  writeFileSync(resolve(root, "manifest.json"), JSON.stringify(manifest), "utf8");
  writeFileSync(resolve(root, "menu.json"), JSON.stringify(menuSnapshot), "utf8");

  return {
    manifest,
    menu: menuSnapshot,
    bytesWritten: 0,
  };
}

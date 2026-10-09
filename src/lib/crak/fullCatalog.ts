import { withCache } from "@/lib/crak/cache";
import { fetchPerformers } from "@/lib/crak/client";
import { isCrakConfigured } from "@/lib/crak/config";
import {
  CATALOG_AGE_API_BANDS,
  CATALOG_FETCH_BACKOFF_MS,
  CATALOG_FETCH_MAX_RETRIES,
  CATALOG_MAX_PAGES_PER_QUERY,
  CATALOG_MAX_TOTAL_CANDIDATES,
  CATALOG_PAGE_SIZE,
  CATALOG_SNAPSHOT_CACHE_KEY,
  CATALOG_SNAPSHOT_TTL_MS,
  resolveCatalogBrands,
} from "@/lib/crak/catalogWidenConfig";
import { normalizePerformer } from "@/lib/crak/normalize";
import { canonicalProfileSlug } from "@/lib/crak/sitemapCatalog";
import type { CamModel } from "@/lib/models/types";

export type FullCatalogSnapshot = {
  models: CamModel[];
  pagesFetched: number;
  rawPerformerRows: number;
  fetchedAt: number;
  queriesRun: number;
};

let lastGoodSnapshot: FullCatalogSnapshot | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPerformersWithRetry(
  params: Parameters<typeof fetchPerformers>[0],
): Promise<Awaited<ReturnType<typeof fetchPerformers>>> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= CATALOG_FETCH_MAX_RETRIES; attempt++) {
    try {
      return await fetchPerformers(params);
    } catch (err) {
      lastErr = err;
      if (attempt < CATALOG_FETCH_MAX_RETRIES) {
        await sleep(CATALOG_FETCH_BACKOFF_MS * attempt);
      }
    }
  }
  throw lastErr;
}

async function loadFullCatalog(): Promise<FullCatalogSnapshot> {
  const bySlug = new Map<string, CamModel>();
  let pagesFetched = 0;
  let rawPerformerRows = 0;
  let queriesRun = 0;
  const brands = resolveCatalogBrands();

  for (const brand of brands) {
    for (const ageBand of CATALOG_AGE_API_BANDS) {
      if (bySlug.size >= CATALOG_MAX_TOTAL_CANDIDATES) break;
      queriesRun += 1;

      for (let page = 1; page <= CATALOG_MAX_PAGES_PER_QUERY; page++) {
        if (bySlug.size >= CATALOG_MAX_TOTAL_CANDIDATES) break;

        const res = await fetchPerformersWithRetry({
          page,
          size: CATALOG_PAGE_SIZE,
          sorting: "score",
          live: false,
          ages: ageBand,
          brands: brand,
          gender: "f",
          lang: "en",
        });

        const batch = res.performers ?? [];
        pagesFetched += 1;
        rawPerformerRows += batch.length;
        if (batch.length === 0) break;

        for (const performer of batch) {
          if (bySlug.size >= CATALOG_MAX_TOTAL_CANDIDATES) break;
          const model = normalizePerformer(performer, { catalogBrand: brand });
          if (!model.username || !model.thumbnailUrl) continue;
          const slug = canonicalProfileSlug(model.username);
          if (!slug) continue;
          const existing = bySlug.get(slug);
          if (!existing) {
            bySlug.set(slug, model);
            continue;
          }
          if (!existing.catalogBrand && model.catalogBrand) {
            bySlug.set(slug, { ...existing, catalogBrand: model.catalogBrand });
          }
        }

        if (batch.length < CATALOG_PAGE_SIZE) break;
      }
    }
  }

  const snapshot: FullCatalogSnapshot = {
    models: [...bySlug.values()],
    pagesFetched,
    rawPerformerRows,
    fetchedAt: Date.now(),
    queriesRun,
  };
  lastGoodSnapshot = snapshot;
  return snapshot;
}

export async function getFullCatalog(): Promise<FullCatalogSnapshot> {
  if (!isCrakConfigured()) {
    return (
      lastGoodSnapshot ?? {
        models: [],
        pagesFetched: 0,
        rawPerformerRows: 0,
        fetchedAt: 0,
        queriesRun: 0,
      }
    );
  }

  try {
    return await withCache(
      CATALOG_SNAPSHOT_CACHE_KEY,
      CATALOG_SNAPSHOT_TTL_MS,
      loadFullCatalog,
    );
  } catch (err) {
    if (lastGoodSnapshot) return lastGoodSnapshot;
    throw err;
  }
}

export function sortCatalogBrowse(models: CamModel[]): CamModel[] {
  return [...models].sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    return (b.score ?? 0) - (a.score ?? 0);
  });
}

export function pageCatalog(
  models: CamModel[],
  page: number,
  limit: number,
): { models: CamModel[]; hasMore: boolean; page: number } {
  const sorted = sortCatalogBrowse(models);
  const start = (Math.max(1, page) - 1) * limit;
  const slice = sorted.slice(start, start + limit);
  return {
    models: slice,
    hasMore: start + limit < sorted.length,
    page: Math.max(1, page),
  };
}

import { withCache } from "@/lib/crak/cache";
import { fetchPerformers } from "@/lib/crak/client";
import { isCrakConfigured, resolveCrakBrands } from "@/lib/crak/config";
import { normalizePerformer } from "@/lib/crak/normalize";
import {
  matureAgeGroupsQuery,
  matureTagsQuery,
} from "@/lib/crak/taxonomy";
import { canonicalProfileSlug } from "@/lib/crak/sitemapCatalog";
import {
  CRAK_REQUEST_PAGE_SIZE,
  SITEMAP_MAX_CANDIDATES,
  SITEMAP_MAX_PAGES,
} from "@/lib/seo/config";
import type { CamModel } from "@/lib/models/types";

export type FullCatalogSnapshot = {
  models: CamModel[];
  pagesFetched: number;
  rawPerformerRows: number;
  fetchedAt: number;
};

const CATALOG_CACHE_KEY = "full-catalog:mature-offline:v2";
const CATALOG_TTL_MS = 8 * 60 * 1000;

let lastGoodSnapshot: FullCatalogSnapshot | null = null;

async function loadFullCatalog(): Promise<FullCatalogSnapshot> {
  const bySlug = new Map<string, CamModel>();
  let pagesFetched = 0;
  let rawPerformerRows = 0;

  for (let page = 1; page <= SITEMAP_MAX_PAGES; page++) {
    if (bySlug.size >= SITEMAP_MAX_CANDIDATES) break;

    const res = await fetchPerformers({
      page,
      size: CRAK_REQUEST_PAGE_SIZE,
      sorting: "score",
      live: false,
      tags: matureTagsQuery(),
      ages: matureAgeGroupsQuery(),
      brands: resolveCrakBrands(),
      gender: "f",
      lang: "en",
    });

    const batch = res.performers ?? [];
    pagesFetched += 1;
    rawPerformerRows += batch.length;
    if (batch.length === 0) break;

    for (const performer of batch) {
      if (bySlug.size >= SITEMAP_MAX_CANDIDATES) break;
      const model = normalizePerformer(performer);
      if (!model.username || !model.thumbnailUrl) continue;
      const slug = canonicalProfileSlug(model.username);
      if (!slug || bySlug.has(slug)) continue;
      bySlug.set(slug, model);
    }

    if (batch.length < CRAK_REQUEST_PAGE_SIZE) break;
  }

  const snapshot: FullCatalogSnapshot = {
    models: [...bySlug.values()],
    pagesFetched,
    rawPerformerRows,
    fetchedAt: Date.now(),
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
      }
    );
  }

  try {
    return await withCache(CATALOG_CACHE_KEY, CATALOG_TTL_MS, loadFullCatalog);
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

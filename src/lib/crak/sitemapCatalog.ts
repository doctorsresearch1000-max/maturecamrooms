import { withCache } from "@/lib/crak/cache";
import { fetchPerformers } from "@/lib/crak/client";
import { isCrakConfigured, resolveCrakBrands } from "@/lib/crak/config";
import { normalizePerformer } from "@/lib/crak/normalize";
import {
  matureAgeGroupsQuery,
  matureTagsQuery,
} from "@/lib/crak/taxonomy";
import {
  CRAK_REQUEST_PAGE_SIZE,
  SITEMAP_MAX_CANDIDATES,
  SITEMAP_MAX_PAGES,
} from "@/lib/seo/config";
import { slugify } from "@/lib/seo/slug";
import type { CamModel } from "@/lib/models/types";

export function canonicalProfileSlug(username: string): string {
  const slug = slugify(username);
  return slug || username.trim().toLowerCase();
}

export type SitemapCatalogResult = {
  models: CamModel[];
  pagesFetched: number;
  rawPerformerRows: number;
};

/**
 * Offline-inclusive mature catalog for sitemap + taxonomy inventory.
 * Paginates CRAK list API with bounded pages/candidates.
 */
const SITEMAP_CATALOG_CACHE_KEY = "sitemap-catalog:mature-offline:v1";
const SITEMAP_CATALOG_TTL_MS = 120_000;

async function loadSitemapCatalogCandidates(): Promise<SitemapCatalogResult> {
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
      if (!model.thumbnailUrl) continue;
      const slug = canonicalProfileSlug(model.username);
      if (!slug || bySlug.has(slug)) continue;
      bySlug.set(slug, model);
    }

    if (batch.length < CRAK_REQUEST_PAGE_SIZE) break;
  }

  return {
    models: [...bySlug.values()],
    pagesFetched,
    rawPerformerRows,
  };
}

export async function fetchSitemapCatalogCandidates(): Promise<SitemapCatalogResult> {
  if (!isCrakConfigured()) {
    return { models: [], pagesFetched: 0, rawPerformerRows: 0 };
  }

  return withCache(SITEMAP_CATALOG_CACHE_KEY, SITEMAP_CATALOG_TTL_MS, () =>
    loadSitemapCatalogCandidates(),
  );
}

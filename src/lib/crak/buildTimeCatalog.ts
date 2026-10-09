import { fetchPerformers } from "@/lib/crak/client";
import {
  CATALOG_AGE_API_BANDS,
  CATALOG_FETCH_BACKOFF_MS,
  CATALOG_FETCH_MAX_RETRIES,
  CATALOG_MAX_PAGES_PER_QUERY,
  CATALOG_MAX_TOTAL_CANDIDATES,
  CATALOG_PAGE_SIZE,
  resolveCatalogBrands,
} from "@/lib/crak/catalogWidenConfig";
import { catalogAgeGroupsQuery } from "@/lib/crak/taxonomy";
import { normalizePerformer } from "@/lib/crak/normalize";
import { canonicalProfileSlug } from "@/lib/crak/sitemapCatalog";
import type { CamModel } from "@/lib/models/types";

const NICHE_TAG_PASSES = ["cougar", "mom", "housewife"] as const;

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

function mergePerformer(
  bySlug: Map<string, CamModel>,
  performer: Parameters<typeof normalizePerformer>[0],
  catalogBrand: string,
): void {
  if (bySlug.size >= CATALOG_MAX_TOTAL_CANDIDATES) return;
  const model = normalizePerformer(performer, { catalogBrand });
  if (!model.username || !model.thumbnailUrl) return;
  const slug = canonicalProfileSlug(model.username);
  if (!slug) return;
  const existing = bySlug.get(slug);
  if (!existing) {
    bySlug.set(slug, model);
    return;
  }
  if (!existing.catalogBrand && model.catalogBrand) {
    bySlug.set(slug, { ...existing, catalogBrand: model.catalogBrand });
  }
}

async function paginateInto(
  bySlug: Map<string, CamModel>,
  params: Omit<Parameters<typeof fetchPerformers>[0], "page" | "size">,
  catalogBrand: string,
): Promise<{ pages: number; raw: number }> {
  let pages = 0;
  let raw = 0;
  for (let page = 1; page <= CATALOG_MAX_PAGES_PER_QUERY; page++) {
    if (bySlug.size >= CATALOG_MAX_TOTAL_CANDIDATES) break;
    const res = await fetchPerformersWithRetry({
      ...params,
      page,
      size: CATALOG_PAGE_SIZE,
      sorting: "score",
      live: false,
      gender: "f",
      lang: "en",
    });
    const batch = res.performers ?? [];
    pages++;
    raw += batch.length;
    if (batch.length === 0) break;
    for (const performer of batch) {
      mergePerformer(bySlug, performer, catalogBrand);
    }
    if (batch.length < CATALOG_PAGE_SIZE) break;
  }
  return { pages, raw };
}

export type BuildTimeCatalogResult = {
  models: CamModel[];
  pagesFetched: number;
  rawPerformerRows: number;
  queriesRun: number;
};

/**
 * CRAK pagination — build / CI only. Never call from edge request handlers.
 */
export async function fetchBuildTimeCatalog(): Promise<BuildTimeCatalogResult> {
  const bySlug = new Map<string, CamModel>();
  let pagesFetched = 0;
  let rawPerformerRows = 0;
  let queriesRun = 0;
  const brands = resolveCatalogBrands();
  const ages30Plus = catalogAgeGroupsQuery();

  for (const brand of brands) {
    for (const ageBand of CATALOG_AGE_API_BANDS) {
      queriesRun += 1;
      const { pages, raw } = await paginateInto(
        bySlug,
        {
          ages: ageBand,
          brands: brand,
        },
        brand,
      );
      pagesFetched += pages;
      rawPerformerRows += raw;
    }
  }

  for (const tag of NICHE_TAG_PASSES) {
    for (const brand of brands) {
      queriesRun += 1;
      const { pages, raw } = await paginateInto(
        bySlug,
        {
          tags: tag,
          ages: ages30Plus,
          brands: brand,
        },
        brand,
      );
      pagesFetched += pages;
      rawPerformerRows += raw;
    }
  }

  return {
    models: [...bySlug.values()],
    pagesFetched,
    rawPerformerRows,
    queriesRun,
  };
}

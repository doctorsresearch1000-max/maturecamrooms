import { withCache } from "@/lib/crak/cache";
import { fetchPerformerByName, fetchPerformers } from "@/lib/crak/client";
import { isCrakConfigured, resolveCrakBrands } from "@/lib/crak/config";
import { normalizePerformer } from "@/lib/crak/normalize";
import {
  matureAgeGroupsQuery,
  matureTagsQuery,
} from "@/lib/crak/taxonomy";
import { CRAK_REQUEST_PAGE_SIZE } from "@/lib/seo/config";
import type { CrakFetchParams } from "@/lib/crak/types";
import type { CamModel } from "@/lib/models/types";

export type FeedQuery = {
  page?: number;
  size?: number;
  live?: boolean;
  sorting?: CrakFetchParams["sorting"];
  tags?: string;
  ages?: string;
  name?: string;
};

const LIVE_LIST_TTL = 30_000;
const META_TTL = 120_000;

function cacheKey(prefix: string, query: FeedQuery): string {
  return `${prefix}:${JSON.stringify(query)}`;
}

async function fetchNormalized(query: FeedQuery): Promise<CamModel[]> {
  const res = await fetchPerformers({
    page: query.page ?? 1,
    size: Math.min(query.size ?? 24, CRAK_REQUEST_PAGE_SIZE),
    sorting: query.sorting ?? "score",
    live: query.live,
    tags: query.tags,
    ages: query.ages,
    name: query.name,
    brands: resolveCrakBrands(),
    gender: "f",
    lang: "en",
  });

  return res.performers
    .map((performer) => normalizePerformer(performer))
    .filter((m) => m.thumbnailUrl);
}

async function fetchWithFallback(query: FeedQuery): Promise<CamModel[]> {
  let models = await fetchNormalized(query);
  if (models.length > 0) return models;

  if (query.tags) {
    models = await fetchNormalized({ ...query, tags: matureTagsQuery() });
    if (models.length > 0) return models;
  }

  if (query.ages) {
    models = await fetchNormalized({ ...query, tags: undefined, ages: undefined });
    if (models.length > 0) return models;
  }

  if (query.live) {
    models = await fetchNormalized({
      ...query,
      live: undefined,
      tags: matureTagsQuery(),
      ages: matureAgeGroupsQuery(),
    });
  }

  return models;
}

export async function getCrakFeed(query: FeedQuery = {}): Promise<CamModel[]> {
  if (!isCrakConfigured()) return [];

  const key = cacheKey("feed", {
    live: query.live ?? true,
    ...query,
  });
  const ttl = query.live ? LIVE_LIST_TTL : META_TTL;

  const ages =
    query.ages !== undefined ? query.ages : matureAgeGroupsQuery();

  return withCache(key, ttl, () =>
    fetchWithFallback({
      live: query.live ?? true,
      tags: query.tags ?? matureTagsQuery(),
      ages,
      sorting: query.sorting ?? "score",
      size: query.size ?? 24,
      page: query.page ?? 1,
      name: query.name,
    }),
  );
}

/** Profile resolution uses exact nameClean match only (itemId lookup is not reliable in CRAK). */
async function loadPerformerBySlug(
  slug: string,
): Promise<CamModel | undefined> {
  const res = await fetchPerformerByName(slug);
  const match = res.performers.find(
    (p) => p.nameClean.toLowerCase() === slug.toLowerCase(),
  );
  if (!match) return undefined;
  const model = normalizePerformer(match);
  return model.thumbnailUrl || model.roomUrl ? model : undefined;
}

export async function getCrakPerformerBySlug(
  slug: string,
  options?: { bypassCache?: boolean },
): Promise<CamModel | undefined> {
  if (!isCrakConfigured()) return undefined;

  if (options?.bypassCache) {
    return loadPerformerBySlug(slug);
  }

  const key = `performer:${slug.toLowerCase()}`;
  return withCache(key, LIVE_LIST_TTL, () => loadPerformerBySlug(slug));
}

export async function searchCrakPerformers(
  name: string,
  limit = 24,
): Promise<CamModel[]> {
  if (!name.trim() || !isCrakConfigured()) return [];
  return getCrakFeed({
    name: name.trim(),
    size: limit,
    live: undefined,
    tags: undefined,
    ages: undefined,
  });
}

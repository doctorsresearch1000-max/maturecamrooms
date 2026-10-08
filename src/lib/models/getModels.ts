import { canonicalProfileSlug } from "@/lib/crak/sitemapCatalog";
import { isCrakConfigured } from "@/lib/crak/config";
import { getCrakFeed, getCrakPerformerBySlug, searchCrakPerformers } from "@/lib/crak/service";
import { rankRelatedModels } from "@/lib/crak/related";
import { matureTagsQuery } from "@/lib/crak/taxonomy";
import type { CamModel, ModelsResult } from "@/lib/models/types";

export type ModelQuery = {
  limit?: number;
  page?: number;
  live?: boolean;
  tag?: string;
  name?: string;
  sorting?: "score" | "mostRecent" | "topRated" | "random";
};

async function queryFeed(options: ModelQuery = {}): Promise<ModelsResult> {
  if (!isCrakConfigured()) {
    return {
      models: [],
      source: "unconfigured",
      message:
        "Live model listings are temporarily unavailable. Please check back shortly.",
    };
  }

  try {
    const tagFilter = options.tag?.toLowerCase();
    const tags = tagFilter
      ? [tagFilter, "milf", "mature"].includes(tagFilter)
        ? tagFilter
        : `${matureTagsQuery()},${tagFilter}`
      : matureTagsQuery();

    const size = options.limit ?? 24;
    const models = await getCrakFeed({
      page: options.page ?? 1,
      size,
      live: options.live,
      tags,
      name: options.name,
      sorting: options.sorting ?? "score",
    });

    const page = options.page ?? 1;
    return {
      models,
      source: "crak",
      page,
      hasMore: models.length >= size,
    };
  } catch (err) {
    const base =
      err instanceof Error
        ? err.message
        : "Unable to load performers at this time.";
    const detail =
      err && typeof err === "object" && "detail" in err
        ? String((err as { detail?: string }).detail)
        : undefined;
    return {
      models: [],
      source: "error",
      message: detail ? `${base} (${detail})` : base,
    };
  }
}

export async function getFeaturedModels(
  limit = 24,
  options?: Omit<ModelQuery, "limit">,
): Promise<ModelsResult> {
  return queryFeed({ ...options, limit, live: options?.live ?? true });
}

export async function getModelsPage(
  page: number,
  limit = 24,
  options?: Omit<ModelQuery, "limit" | "page">,
): Promise<ModelsResult> {
  return queryFeed({
    ...options,
    page: Math.max(1, page),
    limit,
    live: options?.live ?? true,
  });
}

export async function getAllModels(): Promise<ModelsResult> {
  return queryFeed({ limit: 48, live: undefined });
}

export async function getModelByUsername(
  username: string,
  options?: { bypassCache?: boolean },
): Promise<CamModel | undefined> {
  if (!isCrakConfigured()) return undefined;
  try {
    return await getCrakPerformerBySlug(canonicalProfileSlug(username), options);
  } catch {
    return undefined;
  }
}

export async function getRelatedModels(
  model: CamModel,
  limit = 8,
): Promise<CamModel[]> {
  const feed = await getCrakFeed({
    size: 48,
    live: true,
    tags: model.primaryCategory ?? matureTagsQuery(),
  });
  if (feed.length === 0) return [];
  return rankRelatedModels(model, feed, limit);
}

export async function searchModels(query: string): Promise<ModelsResult> {
  if (!isCrakConfigured()) {
    return { models: [], source: "unconfigured" };
  }
  try {
    const models = await searchCrakPerformers(query, 24);
    return { models, source: "crak" };
  } catch (err) {
    return {
      models: [],
      source: "error",
      message: err instanceof Error ? err.message : "Search failed",
    };
  }
}

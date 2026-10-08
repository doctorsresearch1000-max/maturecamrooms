import { isCrakConfigured } from "@/lib/crak/config";
import { getCrakFeed, getCrakPerformerBySlug, searchCrakPerformers } from "@/lib/crak/service";
import { rankRelatedModels } from "@/lib/crak/related";
import { matureTagsQuery } from "@/lib/crak/taxonomy";
import type { CamModel, ModelsResult } from "@/lib/models/types";

export type ModelQuery = {
  limit?: number;
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
        "Set CRAKREVENUE_API_KEY and CRAKREVENUE_API_TOKEN on the server to load live performers.",
    };
  }

  try {
    const tagFilter = options.tag?.toLowerCase();
    const tags = tagFilter
      ? [tagFilter, "milf", "mature"].includes(tagFilter)
        ? tagFilter
        : `${matureTagsQuery()},${tagFilter}`
      : matureTagsQuery();

    const models = await getCrakFeed({
      size: options.limit ?? 24,
      live: options.live,
      tags,
      name: options.name,
      sorting: options.sorting ?? "score",
    });

    return { models, source: "crak" };
  } catch (err) {
    return {
      models: [],
      source: "error",
      message:
        err instanceof Error
          ? err.message
          : "Unable to load performers at this time.",
    };
  }
}

export async function getFeaturedModels(
  limit = 24,
  options?: Omit<ModelQuery, "limit">,
): Promise<ModelsResult> {
  return queryFeed({ ...options, limit, live: options?.live ?? true });
}

export async function getAllModels(): Promise<ModelsResult> {
  return queryFeed({ limit: 48, live: undefined });
}

export async function getModelByUsername(
  username: string,
): Promise<CamModel | undefined> {
  if (!isCrakConfigured()) return undefined;
  try {
    return await getCrakPerformerBySlug(username);
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

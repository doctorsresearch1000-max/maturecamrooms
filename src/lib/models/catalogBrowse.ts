import { browseStaticCatalog } from "@/lib/catalog/staticCatalog";
import {
  applyLiveOverlay,
  fetchLiveOverlay,
  sortWithLiveFirst,
} from "@/lib/crak/liveOverlay";
import type { CamModel, ModelsResult } from "@/lib/models/types";

export type CatalogBrowseQuery = {
  page?: number;
  limit?: number;
  liveOnly?: boolean;
  category?: string;
  origin?: string;
};

export async function browseCatalog(
  query: CatalogBrowseQuery = {},
): Promise<ModelsResult & { total?: number }> {
  const limit = Math.min(48, Math.max(1, query.limit ?? 24));
  const page = Math.max(1, query.page ?? 1);

  try {
    if (query.liveOnly) {
      const { liveModels, feedOk } = await fetchLiveOverlay();
      const start = (page - 1) * limit;
      const slice = liveModels.slice(start, start + limit);
      return {
        models: slice,
        source: feedOk ? "crak" : "unconfigured",
        page,
        hasMore: start + limit < liveModels.length,
        total: liveModels.length,
      };
    }

    const staticResult = await browseStaticCatalog({
      kind: query.category ? "category" : "all",
      slug: query.category,
      page,
      limit,
      origin: query.origin,
    });

    const { liveUsernames } = await fetchLiveOverlay();
    const models = sortWithLiveFirst(
      applyLiveOverlay(staticResult.models, liveUsernames),
    );

    return {
      models,
      source: "crak",
      page: staticResult.page,
      hasMore: staticResult.hasMore,
      total: staticResult.total,
    };
  } catch (err) {
    return {
      models: [],
      source: "error",
      message: err instanceof Error ? err.message : "Catalog browse failed",
      page,
      hasMore: false,
    };
  }
}

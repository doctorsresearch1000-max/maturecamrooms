import { browseStaticCatalog } from "@/lib/catalog/staticCatalog";
import { fetchLiveOverlay, mergeCatalogWithLive } from "@/lib/crak/liveOverlay";
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
    const overlay = await fetchLiveOverlay();

    if (query.liveOnly) {
      const start = (page - 1) * limit;
      const slice = overlay.liveModels.slice(start, start + limit);
      return {
        models: slice,
        source: overlay.feedOk ? "crak" : "unconfigured",
        page,
        hasMore: overlay.feedOk && start + limit < overlay.liveModels.length,
        total: overlay.feedOk ? overlay.liveModels.length : 0,
      };
    }

    const staticResult = await browseStaticCatalog({
      kind: query.category ? "category" : "all",
      slug: query.category,
      page,
      limit,
      origin: query.origin,
    });

    const models = mergeCatalogWithLive(staticResult.models, overlay);

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

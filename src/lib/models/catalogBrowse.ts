import {
  getFullCatalog,
  pageCatalog,
  sortCatalogBrowse,
} from "@/lib/crak/fullCatalog";
import {
  fetchLiveOverlay,
  mergeCatalogWithLive,
} from "@/lib/crak/liveOverlay";
import { filterModelsByCategory } from "@/lib/seo/filters";
import type { CamModel, ModelsResult } from "@/lib/models/types";

export type CatalogBrowseQuery = {
  page?: number;
  limit?: number;
  liveOnly?: boolean;
  category?: string;
};

export async function browseCatalog(
  query: CatalogBrowseQuery = {},
): Promise<ModelsResult & { total?: number }> {
  const limit = Math.min(48, Math.max(1, query.limit ?? 48));
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

    const snapshot = await getFullCatalog();
    if (snapshot.models.length === 0) {
      return {
        models: [],
        source: "unconfigured",
        message: "Catalog is temporarily unavailable.",
        page,
        hasMore: false,
      };
    }

    let pool = snapshot.models;
    if (query.category) {
      pool = filterModelsByCategory(pool, query.category);
    }
    pool = mergeCatalogWithLive(pool, overlay);
    if (!overlay.feedOk) {
      pool = sortCatalogBrowse(pool.map((m) => ({ ...m, isLive: false })));
    }

    const paged = pageCatalog(pool, page, limit);
    return {
      models: paged.models,
      source: "crak",
      page: paged.page,
      hasMore: paged.hasMore,
      total: pool.length,
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

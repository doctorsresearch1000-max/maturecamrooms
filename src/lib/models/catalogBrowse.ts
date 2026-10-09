import {
  getFullCatalog,
  pageCatalog,
  sortCatalogBrowse,
} from "@/lib/crak/fullCatalog";
import { filterModelsByCategory } from "@/lib/seo/filters";
import type { CamModel, ModelsResult } from "@/lib/models/types";

export type CatalogBrowseQuery = {
  page?: number;
  limit?: number;
  liveOnly?: boolean;
  category?: string;
  filterFn?: (models: CamModel[], slug: string) => CamModel[];
  filterSlug?: string;
};

export async function browseCatalog(
  query: CatalogBrowseQuery = {},
): Promise<ModelsResult & { total?: number }> {
  const limit = Math.min(48, Math.max(1, query.limit ?? 24));
  const page = Math.max(1, query.page ?? 1);

  try {
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
    if (query.filterFn && query.filterSlug) {
      pool = query.filterFn(pool, query.filterSlug);
    }
    if (query.liveOnly) {
      pool = pool.filter((m) => m.isLive);
    } else {
      pool = sortCatalogBrowse(pool);
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

import type { CamModel } from "@/lib/models/types";

export type FullCatalogSnapshot = {
  models: CamModel[];
  pagesFetched: number;
  rawPerformerRows: number;
  fetchedAt: number;
  queriesRun: number;
};

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

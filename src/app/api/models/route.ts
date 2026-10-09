import {
  discoveryFilterFallbackChain,
  discoveryFilterToQuery,
  type DiscoveryFilterId,
} from "@/lib/models/filterQuery";
import { browseCatalog } from "@/lib/models/catalogBrowse";
import { getModelsPage, searchModels } from "@/lib/models/getModels";
import type { ModelsResult } from "@/lib/models/types";

export const runtime = "edge";

async function fetchDiscoveryPage(
  filter: string,
  page: number,
  limit: number,
): Promise<ModelsResult & { effectiveFilter?: string; broadened?: boolean }> {
  if (filter === "all") {
    const result = await browseCatalog({ page, limit });
    return { ...result, effectiveFilter: "all" };
  }

  const categoryFilters = ["mature", "milf", "cougar"] as const;
  if (categoryFilters.includes(filter as (typeof categoryFilters)[number])) {
    const result = await browseCatalog({
      page,
      limit,
      category: filter,
      liveOnly: false,
    });
    if (result.models.length > 0 || page > 1) {
      return { ...result, effectiveFilter: filter };
    }
  }

  const chain = discoveryFilterFallbackChain(filter);
  const primaryFilter = chain[0] ?? "live";
  const result = await getModelsPage(
    page,
    limit,
    discoveryFilterToQuery(primaryFilter),
  );

  if (result.models.length === 0 && page === 1) {
    for (let i = 1; i < chain.length; i++) {
      const candidate = chain[i];
      const attempt = await getModelsPage(
        page,
        limit,
        discoveryFilterToQuery(candidate),
      );
      if (attempt.models.length > 0) {
        return {
          ...attempt,
          effectiveFilter: candidate,
          broadened: candidate !== primaryFilter,
        };
      }
    }
  }

  if (
    result.models.length === 0 &&
    page > 1 &&
    primaryFilter !== "live" &&
    primaryFilter !== "all"
  ) {
    const broad = await getModelsPage(page, limit, {
      live: true,
      sorting: "score",
    });
    if (broad.models.length > 0) {
      return { ...broad, effectiveFilter: "live", broadened: true };
    }
  }

  return {
    ...result,
    effectiveFilter: primaryFilter,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    48,
    Math.max(1, Number(searchParams.get("limit") ?? "24") || 24),
  );
  const filterParam = searchParams.get("filter") as DiscoveryFilterId | null;
  const source = searchParams.get("source");

  const liveParam = searchParams.get("live");
  const liveFromParam =
    liveParam === "false"
      ? false
      : liveParam === "all"
        ? undefined
        : liveParam === "true"
          ? true
          : undefined;

  if (q) {
    const result = await searchModels(q);
    return Response.json(result, {
      status: result.source === "error" ? 503 : 200,
    });
  }

  if (source === "catalog") {
    const category = searchParams.get("category") ?? undefined;
    const result = await browseCatalog({
      page,
      limit,
      category,
      liveOnly: liveFromParam === true,
    });
    return Response.json(result, {
      status: result.source === "error" ? 503 : 200,
    });
  }

  if (filterParam) {
    const result = await fetchDiscoveryPage(filterParam, page, limit);
    return Response.json(result, {
      status: result.source === "error" ? 503 : 200,
    });
  }

  if (liveFromParam === undefined && source !== "live") {
    const catalog = await browseCatalog({ page, limit });
    if (catalog.models.length > 0) {
      return Response.json(catalog, {
        status: catalog.source === "error" ? 503 : 200,
      });
    }
  }

  const queryOpts = {
    ...(liveFromParam !== undefined ? { live: liveFromParam } : { live: true }),
  };
  const result = await getModelsPage(page, limit, queryOpts);

  return Response.json(result, {
    status: result.source === "error" ? 503 : 200,
  });
}

import { fetchPerformers } from "@/lib/crak/client";
import { isCrakConfigured, resolveCrakBrands } from "@/lib/crak/config";
import { normalizePerformer } from "@/lib/crak/normalize";
import { catalogAgeGroupsQuery } from "@/lib/crak/taxonomy";
import type { CamModel } from "@/lib/models/types";

const LIVE_PAGE_SIZE = 48;

let liveCache: { usernames: Set<string>; liveModels: CamModel[]; at: number } | null =
  null;
const LIVE_TTL_MS = 90_000;

/**
 * Single CRAK list request for live performers (runtime only).
 */
export async function fetchLiveOverlay(): Promise<{
  liveUsernames: Set<string>;
  liveModels: CamModel[];
  feedOk: boolean;
}> {
  const now = Date.now();
  if (liveCache && now - liveCache.at < LIVE_TTL_MS) {
    return {
      liveUsernames: liveCache.usernames,
      liveModels: liveCache.liveModels,
      feedOk: liveCache.liveModels.length > 0,
    };
  }

  if (!isCrakConfigured()) {
    return { liveUsernames: new Set(), liveModels: [], feedOk: false };
  }

  try {
    const res = await fetchPerformers({
      page: 1,
      size: LIVE_PAGE_SIZE,
      sorting: "score",
      live: true,
      ages: catalogAgeGroupsQuery(),
      brands: resolveCrakBrands(),
      gender: "f",
      lang: "en",
    });
    const liveModels = (res.performers ?? [])
      .map((p) => normalizePerformer(p))
      .filter((m) => m.thumbnailUrl && m.username);
    const usernames = new Set(liveModels.map((m) => m.username.toLowerCase()));
    liveCache = { usernames, liveModels, at: now };
    return { liveUsernames: usernames, liveModels, feedOk: liveModels.length > 0 };
  } catch {
    return { liveUsernames: new Set(), liveModels: [], feedOk: false };
  }
}

export function applyLiveOverlay(models: CamModel[], liveUsernames: Set<string>): CamModel[] {
  return models.map((m) =>
    liveUsernames.has(m.username.toLowerCase()) ? { ...m, isLive: true } : m,
  );
}

export function sortWithLiveFirst(models: CamModel[]): CamModel[] {
  return [...models].sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    return (b.score ?? 0) - (a.score ?? 0);
  });
}

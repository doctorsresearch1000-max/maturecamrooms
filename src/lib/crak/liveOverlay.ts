import { fetchPerformers } from "@/lib/crak/client";
import { isCrakConfigured, resolveCrakBrands } from "@/lib/crak/config";
import { normalizePerformer } from "@/lib/crak/normalize";
import { catalogAgeGroupsQuery } from "@/lib/crak/taxonomy";
import type { CamModel } from "@/lib/models/types";

const LIVE_PAGE_SIZE = 48;
const EDGE_CACHE_NAME = "mcr-live-overlay-v1";
const EDGE_CACHE_KEY = "https://maturecamrooms.internal/cache/live-overlay";
const EDGE_CACHE_TTL_SEC = 60;

export type LiveOverlayResult = {
  liveUsernames: Set<string>;
  liveModels: CamModel[];
  feedOk: boolean;
};

type LiveOverlayCachePayload = {
  usernames: string[];
  liveModels: CamModel[];
  feedOk: boolean;
};

const emptyOverlay: LiveOverlayResult = {
  liveUsernames: new Set(),
  liveModels: [],
  feedOk: false,
};

function payloadToResult(payload: LiveOverlayCachePayload): LiveOverlayResult {
  return {
    liveUsernames: new Set(payload.usernames),
    liveModels: payload.liveModels,
    feedOk: payload.feedOk,
  };
}

async function readEdgeCache(): Promise<LiveOverlayResult | null> {
  if (typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(EDGE_CACHE_NAME);
    const hit = await cache.match(EDGE_CACHE_KEY);
    if (!hit) return null;
    const payload = (await hit.json()) as LiveOverlayCachePayload;
    return payloadToResult(payload);
  } catch {
    return null;
  }
}

async function writeEdgeCache(payload: LiveOverlayCachePayload): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(EDGE_CACHE_NAME);
    const body = JSON.stringify(payload);
    await cache.put(
      EDGE_CACHE_KEY,
      new Response(body, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${EDGE_CACHE_TTL_SEC}`,
        },
      }),
    );
  } catch {
    // ignore cache write failures
  }
}

async function fetchLiveFromCrak(): Promise<LiveOverlayResult> {
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
  const usernames = liveModels.map((m) => m.username.toLowerCase());
  const feedOk = liveModels.length > 0;
  const payload: LiveOverlayCachePayload = {
    usernames,
    liveModels,
    feedOk,
  };
  await writeEdgeCache(payload);
  return payloadToResult(payload);
}

/**
 * Single CRAK list request for live performers (runtime only), edge-cached 60s.
 */
export async function fetchLiveOverlay(): Promise<LiveOverlayResult> {
  if (!isCrakConfigured()) {
    return emptyOverlay;
  }

  const cached = await readEdgeCache();
  if (cached) {
    return cached;
  }

  try {
    return await fetchLiveFromCrak();
  } catch {
    return emptyOverlay;
  }
}

export function applyLiveOverlay(
  models: CamModel[],
  liveUsernames: Set<string>,
): CamModel[] {
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

/** Snapshot order when live feed unavailable; live-first when CRAK OK. */
export function mergeCatalogWithLive(
  models: CamModel[],
  overlay: LiveOverlayResult,
): CamModel[] {
  if (!overlay.feedOk) {
    return models;
  }
  return sortWithLiveFirst(applyLiveOverlay(models, overlay.liveUsernames));
}

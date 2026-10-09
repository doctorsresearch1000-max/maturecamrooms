import { readCrakRuntimeEnv } from "@/lib/crak/diagnostics";

/** CRAK `ages` query tokens — one band per catalog fetch pass. */
export const CATALOG_AGE_API_BANDS = [
  "gc_30_39",
  "gc_40_49",
  "gc_50_59",
  "gc_60_plus",
] as const;

export type CatalogAgeApiBand = (typeof CATALOG_AGE_API_BANDS)[number];

export function resolveCatalogBrands(): string[] {
  const raw = readCrakRuntimeEnv("CRAK_BRANDS");
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv.length > 0) return fromEnv;
  return ["streamate"];
}

/** Max list-API pages per brand × age-band query. */
export const CATALOG_MAX_PAGES_PER_QUERY = 80;

/** Hard cap on unique performers collected across all queries. */
export const CATALOG_MAX_TOTAL_CANDIDATES = 12_000;

export const CATALOG_PAGE_SIZE = 48;

export const CATALOG_FETCH_MAX_RETRIES = 4;

export const CATALOG_FETCH_BACKOFF_MS = 400;

export const CATALOG_SNAPSHOT_TTL_MS = 8 * 60 * 1000;

export const CATALOG_SNAPSHOT_CACHE_KEY = "full-catalog:widened-offline:v3";

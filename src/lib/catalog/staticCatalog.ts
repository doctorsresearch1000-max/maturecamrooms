import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site";
import type { CatalogCard, CatalogManifest, CatalogMenuSnapshot } from "@/lib/catalog/types";
import { cardToCamModel } from "@/lib/catalog/cardToModel";
import type { CamModel } from "@/lib/models/types";
import { FACET_SITEMAP_MIN_COUNT } from "@/lib/taxonomy/settings";

const manifestCache: { manifest?: CatalogManifest; at: number } = { at: 0 };
const MANIFEST_TTL_MS = 60_000;

function assetBase(origin?: string): string {
  if (origin) return origin.replace(/\/$/, "");
  return siteConfig.url.replace(/\/$/, "");
}

async function fetchJson<T>(path: string, origin?: string): Promise<T> {
  const url = `${assetBase(origin)}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Catalog asset missing: ${path} (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function getCatalogManifest(origin?: string): Promise<CatalogManifest> {
  const now = Date.now();
  if (manifestCache.manifest && now - manifestCache.at < MANIFEST_TTL_MS) {
    return manifestCache.manifest;
  }
  const manifest = await fetchJson<CatalogManifest>("/data/catalog/manifest.json", origin);
  manifestCache.manifest = manifest;
  manifestCache.at = now;
  return manifest;
}

export async function getCatalogMenuSnapshot(
  origin?: string,
): Promise<CatalogMenuSnapshot> {
  return fetchJson<CatalogMenuSnapshot>("/data/catalog/menu.json", origin);
}

function slugifyPath(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function loadCatalogPage(
  kind:
    | "all"
    | "category"
    | "age"
    | "ethnicity"
    | "hair"
    | "bust"
    | "figure"
    | "country"
    | "language"
    | "combo",
  slug: string,
  page: number,
  origin?: string,
): Promise<CatalogCard[]> {
  const segment = kind === "all" ? "all" : `${kind}/${slugifyPath(slug)}`;
  const path = `/data/catalog/${segment}/page-${page}.json`;
  return fetchJson<CatalogCard[]>(path, origin);
}

export type FacetKind =
  | "age"
  | "ethnicity"
  | "hair"
  | "bust"
  | "figure"
  | "country"
  | "language"
  | "combo";

export function facetManifestEntry(
  manifest: CatalogManifest,
  kind: FacetKind,
  slug: string,
): { count: number; pages: number } | undefined {
  const s = slugifyPath(slug);
  switch (kind) {
    case "age":
      return manifest.ages[s];
    case "ethnicity":
      return manifest.ethnicities[s];
    case "hair":
      return manifest.hairs[s];
    case "bust":
      return manifest.busts[s];
    case "figure":
      return manifest.figures[s];
    case "country":
      return manifest.countries[s];
    case "language":
      return manifest.languages[s];
    case "combo":
      return manifest.combos[s];
    default:
      return undefined;
  }
}

export function isFacetIndexable(
  manifest: CatalogManifest,
  kind: FacetKind,
  slug: string,
): boolean {
  const entry = facetManifestEntry(manifest, kind, slug);
  return Boolean(entry && entry.count >= FACET_SITEMAP_MIN_COUNT && entry.pages > 0);
}

export async function assertFacetIndexable(
  kind: FacetKind,
  slug: string,
  origin?: string,
): Promise<{ count: number; pages: number }> {
  const manifest = await getCatalogManifest(origin);
  const entry = facetManifestEntry(manifest, kind, slug);
  if (!entry || entry.count < FACET_SITEMAP_MIN_COUNT || entry.pages < 1) {
    notFound();
  }
  return entry;
}

export function categoryManifestEntry(
  manifest: CatalogManifest,
  slug: string,
): { count: number; pages: number } | undefined {
  return manifest.categories[slugifyPath(slug)];
}

export async function browseStaticCatalog(params: {
  kind: "all" | "category";
  slug?: string;
  page: number;
  limit?: number;
  origin?: string;
}): Promise<{ models: CamModel[]; total: number; hasMore: boolean; page: number }> {
  const manifest = await getCatalogManifest(params.origin);
  const limit = Math.min(48, params.limit ?? 48);
  const page = Math.max(1, params.page);

  let total = manifest.total;
  let pages = manifest.allPages;
  if (params.kind === "category" && params.slug) {
    const entry = categoryManifestEntry(manifest, params.slug);
    if (!entry || entry.pages === 0) {
      return { models: [], total: entry?.count ?? 0, hasMore: false, page };
    }
    total = entry.count;
    pages = entry.pages;
  }

  if (page > pages) {
    return { models: [], total, hasMore: false, page };
  }

  const cards =
    params.kind === "all"
      ? await loadCatalogPage("all", "all", page, params.origin)
      : await loadCatalogPage("category", params.slug!, page, params.origin);

  const models = cards.slice(0, limit).map(cardToCamModel);
  return {
    models,
    total,
    hasMore: page < pages,
    page,
  };
}

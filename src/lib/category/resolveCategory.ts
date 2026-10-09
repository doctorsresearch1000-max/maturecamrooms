import { notFound, permanentRedirect } from "next/navigation";
import {
  categoryManifestEntry,
  getCatalogManifest,
} from "@/lib/catalog/staticCatalog";
import {
  LEGACY_CATEGORY_SLUGS,
  SITE_CATEGORIES,
} from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";
import { FACET_SITEMAP_MIN_COUNT } from "@/lib/taxonomy/settings";

const KNOWN = new Set<string>(SITE_CATEGORIES);

export function normalizeCategorySlug(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function assertCategoryPageOrRedirect(tag: string): Promise<{
  catalogCount: number;
}> {
  const normalized = normalizeCategorySlug(tag);
  if (!KNOWN.has(normalized)) {
    notFound();
  }

  if (LEGACY_CATEGORY_SLUGS.has(normalized)) {
    permanentRedirect(categoryPath("mature"));
  }

  const manifest = await getCatalogManifest();
  const entry = categoryManifestEntry(manifest, normalized);
  const hasSnapshot = Boolean(
    entry &&
      entry.count >= FACET_SITEMAP_MIN_COUNT &&
      entry.pages >= 1,
  );

  if (!hasSnapshot) {
    if (normalized === "mature") {
      notFound();
    }
    permanentRedirect(categoryPath("mature"));
  }

  return { catalogCount: entry!.count };
}

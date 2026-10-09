import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { assertCategoryPageOrRedirect } from "@/lib/category/resolveCategory";
import {
  getCatalogMenuSnapshot,
  loadCatalogPage,
} from "@/lib/catalog/staticCatalog";
import { cardToCamModel } from "@/lib/catalog/cardToModel";
import { fetchLiveOverlay, mergeCatalogWithLive } from "@/lib/crak/liveOverlay";
import { CATEGORY_DISPLAY, SITE_CATEGORIES, type SiteCategory } from "@/lib/seo/config";
import { slugify } from "@/lib/seo/slug";
import { absoluteUrl } from "@/lib/site";
import { nicheCanonicalHref } from "@/lib/taxonomy/liveMenuInventory";
import { FACET_SITEMAP_MIN_COUNT } from "@/lib/taxonomy/settings";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

const ALLOWED = new Set<string>(SITE_CATEGORIES);

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadCategoryModels(tag: string) {
  const { catalogCount } = await assertCategoryPageOrRedirect(tag);
  const cards = await loadCatalogPage("category", tag, 1);
  const overlay = await fetchLiveOverlay();
  return {
    models: mergeCatalogWithLive(cards.map(cardToCamModel), overlay),
    catalogCount,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = slugify(slug);
  if (!ALLOWED.has(tag)) {
    return { title: "Category not found", robots: { index: false } };
  }
  const { catalogCount } = await loadCategoryModels(tag);
  const label = CATEGORY_DISPLAY[tag as SiteCategory];
  const menu = await getCatalogMenuSnapshot();
  const canonicalPath = nicheCanonicalHref(tag, menu.menu.nicheCanonicalTo);
  const seo = buildTaxonomySeo("category", tag, label, catalogCount, {
    canonicalUrlOverride: canonicalPath
      ? absoluteUrl(canonicalPath)
      : undefined,
    forceIndexable: catalogCount >= FACET_SITEMAP_MIN_COUNT,
  });
  return taxonomySeoToMetadata(seo);
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = slugify(slug);
  if (!ALLOWED.has(tag)) {
    notFound();
  }

  const label = CATEGORY_DISPLAY[tag as SiteCategory];
  const { models, catalogCount } = await loadCategoryModels(tag);
  const menu = await getCatalogMenuSnapshot();
  const canonicalPath = nicheCanonicalHref(tag, menu.menu.nicheCanonicalTo);
  const seo = buildTaxonomySeo("category", tag, label, catalogCount, {
    canonicalUrlOverride: canonicalPath
      ? absoluteUrl(canonicalPath)
      : undefined,
    forceIndexable: catalogCount >= FACET_SITEMAP_MIN_COUNT,
  });

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      emptyMessage="No performers in this category."
    />
  );
}

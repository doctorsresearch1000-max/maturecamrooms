import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFeaturedModels } from "@/lib/models/getModels";
import { CATEGORY_DISPLAY, SITE_CATEGORIES, type SiteCategory } from "@/lib/seo/config";
import { filterModelsByCategory } from "@/lib/seo/filters";
import { slugify } from "@/lib/seo/slug";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

const ALLOWED = new Set<string>(SITE_CATEGORIES);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = slugify(slug);
  if (!ALLOWED.has(tag)) {
    return { title: "Category not found", robots: { index: false } };
  }
  const label = CATEGORY_DISPLAY[tag as SiteCategory];
  const result = await getFeaturedModels(96, { tag, live: true });
  const models = filterModelsByCategory(result.models, tag);
  const seo = buildTaxonomySeo("category", tag, label, models.length);
  return taxonomySeoToMetadata(seo);
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = slugify(slug);
  if (!ALLOWED.has(tag)) {
    notFound();
  }

  const label = CATEGORY_DISPLAY[tag as SiteCategory];
  const result = await getFeaturedModels(96, { tag, live: true });
  const models = filterModelsByCategory(result.models, tag);
  const seo = buildTaxonomySeo("category", tag, label, models.length);

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models.length ? models : result.models}
      statusMessage={result.message}
      emptyMessage="No live performers in this category right now."
    />
  );
}

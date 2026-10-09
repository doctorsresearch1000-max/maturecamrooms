import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFeaturedModels } from "@/lib/models/getModels";
import { filterModelsByHair } from "@/lib/taxonomy/facetFilters";
import { labelFromSlug } from "@/lib/taxonomy/facetLabels";
import { slugify } from "@/lib/seo/slug";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hairSlug = slugify(slug);
  const label = `${labelFromSlug(hairSlug)} hair`;
  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByHair(result.models, hairSlug);
  const seo = buildTaxonomySeo("hair", hairSlug, label, models.length);
  return taxonomySeoToMetadata(seo);
}

export default async function HairFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const hairSlug = slugify(slug);
  const label = `${labelFromSlug(hairSlug)} hair`;

  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByHair(result.models, hairSlug);
  if (models.length === 0) notFound();

  const seo = buildTaxonomySeo("hair", hairSlug, label, models.length);

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      statusMessage={result.message}
      emptyMessage="No live performers with this hair color right now."
    />
  );
}

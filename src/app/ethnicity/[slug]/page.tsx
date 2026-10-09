import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFeaturedModels } from "@/lib/models/getModels";
import { filterModelsByEthnicity } from "@/lib/taxonomy/facetFilters";
import { labelFromSlug } from "@/lib/taxonomy/facetLabels";
import { slugify } from "@/lib/seo/slug";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ethSlug = slugify(slug);
  const label = labelFromSlug(ethSlug);
  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByEthnicity(result.models, ethSlug);
  const seo = buildTaxonomySeo("ethnicity", ethSlug, label, models.length);
  return taxonomySeoToMetadata(seo);
}

export default async function EthnicityFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const ethSlug = slugify(slug);
  const label = labelFromSlug(ethSlug);

  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByEthnicity(result.models, ethSlug);
  if (models.length === 0) notFound();

  const seo = buildTaxonomySeo("ethnicity", ethSlug, label, models.length);

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      statusMessage={result.message}
      emptyMessage="No live performers for this ethnicity right now."
    />
  );
}

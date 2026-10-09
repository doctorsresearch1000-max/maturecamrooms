import type { Metadata } from "next";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { filterModelsByEthnicity } from "@/lib/taxonomy/facetFilters";
import { labelFromSlug } from "@/lib/taxonomy/facetLabels";
import { buildFacetTaxonomyContext } from "@/lib/taxonomy/facetPageContext";
import { slugify } from "@/lib/seo/slug";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ethSlug = slugify(slug);
  const label = labelFromSlug(ethSlug);
  const { seo } = await buildFacetTaxonomyContext(
    "ethnicity",
    ethSlug,
    label,
    filterModelsByEthnicity,
  );
  return taxonomySeoToMetadata(seo);
}

export default async function EthnicityFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const ethSlug = slugify(slug);
  const label = labelFromSlug(ethSlug);

  const { seo, models, result } = await buildFacetTaxonomyContext(
    "ethnicity",
    ethSlug,
    label,
    filterModelsByEthnicity,
  );

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models.length ? models : result.models}
      statusMessage={result.message}
      emptyMessage="No live performers for this ethnicity right now."
    />
  );
}

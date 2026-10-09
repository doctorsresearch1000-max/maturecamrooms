import type { Metadata } from "next";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { filterModelsByHair } from "@/lib/taxonomy/facetFilters";
import { labelFromSlug } from "@/lib/taxonomy/facetLabels";
import { buildFacetTaxonomyContext } from "@/lib/taxonomy/facetPageContext";
import { slugify } from "@/lib/seo/slug";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hairSlug = slugify(slug);
  const label = `${labelFromSlug(hairSlug)} hair`;
  const { seo } = await buildFacetTaxonomyContext(
    "hair",
    hairSlug,
    label,
    filterModelsByHair,
  );
  return taxonomySeoToMetadata(seo);
}

export default async function HairFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const hairSlug = slugify(slug);
  const label = `${labelFromSlug(hairSlug)} hair`;

  const { seo, models, result } = await buildFacetTaxonomyContext(
    "hair",
    hairSlug,
    label,
    filterModelsByHair,
  );

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models.length ? models : result.models}
      emptyMessage="No live performers with this hair color right now."
    />
  );
}

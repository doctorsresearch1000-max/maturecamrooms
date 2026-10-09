import type { Metadata } from "next";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { filterModelsByFigure } from "@/lib/taxonomy/facetFilters";
import { labelFromSlug } from "@/lib/taxonomy/facetLabels";
import { buildFacetTaxonomyContext } from "@/lib/taxonomy/facetPageContext";
import { slugify } from "@/lib/seo/slug";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const figureSlug = slugify(slug);
  const label = labelFromSlug(figureSlug);
  const { seo } = await buildFacetTaxonomyContext(
    "figure",
    figureSlug,
    label,
    filterModelsByFigure,
  );
  return taxonomySeoToMetadata(seo);
}

export default async function FigureFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const figureSlug = slugify(slug);
  const label = labelFromSlug(figureSlug);
  const { seo, models, result } = await buildFacetTaxonomyContext(
    "figure",
    figureSlug,
    label,
    filterModelsByFigure,
  );

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models.length ? models : result.models}
      emptyMessage="No performers with this body type in the catalog."
    />
  );
}

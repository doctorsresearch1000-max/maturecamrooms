import type { Metadata } from "next";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { filterModelsByBust } from "@/lib/taxonomy/facetFilters";
import { labelFromSlug } from "@/lib/taxonomy/facetLabels";
import { buildFacetTaxonomyContext } from "@/lib/taxonomy/facetPageContext";
import { slugify } from "@/lib/seo/slug";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bustSlug = slugify(slug);
  const label = `${labelFromSlug(bustSlug)} bust`;
  const { seo } = await buildFacetTaxonomyContext(
    "bust",
    bustSlug,
    label,
    filterModelsByBust,
  );
  return taxonomySeoToMetadata(seo);
}

export default async function BustFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const bustSlug = slugify(slug);
  const label = `${labelFromSlug(bustSlug)} bust`;
  const { seo, models, result } = await buildFacetTaxonomyContext(
    "bust",
    bustSlug,
    label,
    filterModelsByBust,
  );

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models.length ? models : result.models}
      emptyMessage="No performers with this bust size in the catalog."
    />
  );
}

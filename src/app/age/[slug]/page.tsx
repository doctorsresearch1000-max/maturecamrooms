import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { AGE_FACET_DEFS, filterModelsByAgeBand } from "@/lib/taxonomy/facetFilters";
import { ageBandLabel } from "@/lib/taxonomy/facetLabels";
import { buildFacetTaxonomyContext } from "@/lib/taxonomy/facetPageContext";
import { slugify } from "@/lib/seo/slug";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

const ALLOWED = new Set<string>(AGE_FACET_DEFS.map((d) => d.slug));

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const band = slugify(slug);
  if (!ALLOWED.has(band)) {
    return { title: "Age group not found", robots: { index: false, follow: true } };
  }
  const label = ageBandLabel(band);
  const { seo } = await buildFacetTaxonomyContext(
    "age",
    band,
    label,
    filterModelsByAgeBand,
  );
  return taxonomySeoToMetadata(seo);
}

export default async function AgeFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const band = slugify(slug);
  if (!ALLOWED.has(band)) notFound();

  const label = ageBandLabel(band);
  const { seo, models, result } = await buildFacetTaxonomyContext(
    "age",
    band,
    label,
    filterModelsByAgeBand,
  );

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models.length ? models : result.models}
      statusMessage={result.message}
      emptyMessage="No live performers in this age group right now."
    />
  );
}

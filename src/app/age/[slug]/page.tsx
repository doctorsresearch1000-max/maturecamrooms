import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFeaturedModels } from "@/lib/models/getModels";
import { AGE_FACET_DEFS, filterModelsByAgeBand } from "@/lib/taxonomy/facetFilters";
import { ageBandLabel } from "@/lib/taxonomy/facetLabels";
import { slugify } from "@/lib/seo/slug";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

const ALLOWED = new Set<string>(AGE_FACET_DEFS.map((d) => d.slug));

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const band = slugify(slug);
  if (!ALLOWED.has(band)) {
    return { title: "Age group not found", robots: { index: false } };
  }
  const label = ageBandLabel(band);
  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByAgeBand(result.models, band);
  const seo = buildTaxonomySeo("age", band, label, models.length);
  return taxonomySeoToMetadata(seo);
}

export default async function AgeFacetPage({ params }: PageProps) {
  const { slug } = await params;
  const band = slugify(slug);
  if (!ALLOWED.has(band)) notFound();

  const label = ageBandLabel(band);
  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByAgeBand(result.models, band);
  if (models.length === 0) notFound();

  const seo = buildTaxonomySeo("age", band, label, models.length);

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      statusMessage={result.message}
      emptyMessage="No live performers in this age group right now."
    />
  );
}

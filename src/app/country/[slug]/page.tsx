import type { Metadata } from "next";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { filterModelsByCountry } from "@/lib/seo/filters";
import { buildFacetTaxonomyContext } from "@/lib/taxonomy/facetPageContext";
import { slugify } from "@/lib/seo/slug";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

function countryLabelFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const countrySlug = slugify(slug);
  const label = countryLabelFromSlug(countrySlug);
  const { seo } = await buildFacetTaxonomyContext(
    "country",
    countrySlug,
    label,
    filterModelsByCountry,
  );
  return taxonomySeoToMetadata(seo);
}

export default async function CountryPage({ params }: PageProps) {
  const { slug } = await params;
  const countrySlug = slugify(slug);
  const label = countryLabelFromSlug(countrySlug);

  const { seo, models, result } = await buildFacetTaxonomyContext(
    "country",
    countrySlug,
    label,
    filterModelsByCountry,
  );

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models.length ? models : result.models}
      emptyMessage="No live performers from this country right now."
    />
  );
}

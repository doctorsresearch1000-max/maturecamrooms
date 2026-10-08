import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFeaturedModels } from "@/lib/models/getModels";
import { filterModelsByCountry } from "@/lib/seo/filters";
import { slugify } from "@/lib/seo/slug";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

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
  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByCountry(result.models, countrySlug);
  const seo = buildTaxonomySeo("country", countrySlug, label, models.length);
  return taxonomySeoToMetadata(seo);
}

export default async function CountryPage({ params }: PageProps) {
  const { slug } = await params;
  const countrySlug = slugify(slug);
  const label = countryLabelFromSlug(countrySlug);

  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByCountry(result.models, countrySlug);
  if (models.length === 0) notFound();

  const seo = buildTaxonomySeo("country", countrySlug, label, models.length);

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      statusMessage={result.message}
    />
  );
}

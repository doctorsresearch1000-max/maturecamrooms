import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFeaturedModels } from "@/lib/models/getModels";
import { filterModelsByLanguage } from "@/lib/seo/filters";
import { slugify } from "@/lib/seo/slug";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

function languageLabelFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const languageSlug = slugify(slug);
  const label = languageLabelFromSlug(languageSlug);
  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByLanguage(result.models, languageSlug);
  const seo = buildTaxonomySeo("language", languageSlug, label, models.length);
  return taxonomySeoToMetadata(seo);
}

export default async function LanguagePage({ params }: PageProps) {
  const { slug } = await params;
  const languageSlug = slugify(slug);
  const label = languageLabelFromSlug(languageSlug);

  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByLanguage(result.models, languageSlug);
  if (models.length === 0) notFound();

  const seo = buildTaxonomySeo("language", languageSlug, label, models.length);

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      statusMessage={result.message}
    />
  );
}

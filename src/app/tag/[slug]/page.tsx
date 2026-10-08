import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFeaturedModels } from "@/lib/models/getModels";
import { filterModelsByTag } from "@/lib/seo/filters";
import { tagFromSlug } from "@/lib/seo/tags";
import { buildTaxonomySeo, taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = tagFromSlug(slug);
  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByTag(result.models, tag.slug);
  const seo = buildTaxonomySeo("tag", tag.slug, tag.display, models.length);
  return taxonomySeoToMetadata(seo);
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = tagFromSlug(slug);
  if (!tag.slug) notFound();

  const result = await getFeaturedModels(96, { live: true });
  const models = filterModelsByTag(result.models, tag.slug);
  if (models.length === 0) notFound();

  const seo = buildTaxonomySeo("tag", tag.slug, tag.display, models.length);

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      statusMessage={result.message}
    />
  );
}

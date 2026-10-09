import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { cardToCamModel } from "@/lib/catalog/cardToModel";
import {
  assertFacetIndexable,
  getCatalogManifest,
  loadCatalogPage,
} from "@/lib/catalog/staticCatalog";
import { siteConfig } from "@/lib/site";
import {
  applyLiveOverlay,
  fetchLiveOverlay,
  sortWithLiveFirst,
} from "@/lib/crak/liveOverlay";
import { slugify } from "@/lib/seo/slug";
import { canonicalComboUrl } from "@/lib/seo/canonical";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";
import type { TaxonomySEO } from "@/lib/seo/taxonomySeo";
import { generateTaxonomyBreadcrumbs } from "@/lib/seo/breadcrumbGenerator";
import { buildBreadcrumbListSchema, buildTaxonomyWebPageSchema } from "@/lib/seo/schemaGenerator";
import { comboPath } from "@/lib/seo/slug";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

type ComboMeta = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  count: number;
};

async function loadComboMeta(slug: string): Promise<ComboMeta> {
  await assertFacetIndexable("combo", slug);
  const res = await fetch(`${siteConfig.url}/data/catalog/combos-meta.json`);
  if (res.ok) {
    const all = (await res.json()) as Record<string, ComboMeta>;
    const hit = all[slug] ?? all[slugify(slug)];
    if (hit) return hit;
  }
  const manifest = await getCatalogManifest();
  const entry = manifest.combos[slug];
  if (!entry) notFound();
  return {
    title: `Browse mature cams`,
    description: `${entry.count} models`,
    h1: slug,
    intro: `${entry.count} catalog models.`,
    count: entry.count,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comboSlug = slugify(slug);
  const meta = await loadComboMeta(comboSlug);
  const seo: TaxonomySEO = {
    kind: "combo",
    slug: comboSlug,
    label: meta.h1,
    title: meta.title,
    metaDescription: meta.description,
    h1: meta.h1,
    intro: meta.intro,
    canonicalUrl: canonicalComboUrl(comboSlug),
    indexable: true,
    modelCount: meta.count,
    breadcrumbs: generateTaxonomyBreadcrumbs(meta.h1, comboPath(comboSlug)),
    structuredData: [
      buildTaxonomyWebPageSchema(meta.title, meta.description, canonicalComboUrl(comboSlug)),
      buildBreadcrumbListSchema(
        generateTaxonomyBreadcrumbs(meta.h1, comboPath(comboSlug)),
      ),
    ],
  };
  return taxonomySeoToMetadata(seo);
}

export default async function ComboLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const comboSlug = slugify(slug);
  const meta = await loadComboMeta(comboSlug);

  const cards = await loadCatalogPage("combo", comboSlug, 1);
  const { liveUsernames } = await fetchLiveOverlay();
  const models = sortWithLiveFirst(
    applyLiveOverlay(cards.map(cardToCamModel), liveUsernames),
  );

  const seo: TaxonomySEO = {
    kind: "combo",
    slug: comboSlug,
    label: meta.h1,
    title: meta.title,
    metaDescription: meta.description,
    h1: meta.h1,
    intro: meta.intro,
    canonicalUrl: canonicalComboUrl(comboSlug),
    indexable: true,
    modelCount: meta.count,
    breadcrumbs: generateTaxonomyBreadcrumbs(meta.h1, comboPath(comboSlug)),
    structuredData: [],
  };

  return (
    <TaxonomyPageShell
      seo={seo}
      models={models}
      emptyMessage="No catalog models for this combination."
    />
  );
}

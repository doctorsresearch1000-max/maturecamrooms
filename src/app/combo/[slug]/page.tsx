import type { Metadata } from "next";
import { TaxonomyPageShell } from "@/components/seo/TaxonomyPageShell";
import { getFullCatalog, sortCatalogBrowse } from "@/lib/crak/fullCatalog";
import { getComboBySlug } from "@/lib/taxonomy/catalogInventory";
import { FACET_SITEMAP_MIN_COUNT } from "@/lib/taxonomy/settings";
import { slugify } from "@/lib/seo/slug";
import { canonicalComboUrl } from "@/lib/seo/canonical";
import { taxonomySeoToMetadata } from "@/lib/seo/taxonomySeo";
import type { TaxonomySEO } from "@/lib/seo/taxonomySeo";
import { generateTaxonomyBreadcrumbs } from "@/lib/seo/breadcrumbGenerator";
import { buildBreadcrumbListSchema, buildTaxonomyWebPageSchema } from "@/lib/seo/schemaGenerator";
import { comboPath } from "@/lib/seo/slug";

export const runtime = "edge";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comboSlug = slugify(slug);
  const snapshot = await getFullCatalog();
  const combo = getComboBySlug(snapshot.models, comboSlug);
  if (!combo) {
    return { title: "Browse mature cams", robots: { index: false, follow: true } };
  }
  const seo: TaxonomySEO = {
    kind: "combo",
    slug: comboSlug,
    label: combo.h1,
    title: combo.title,
    metaDescription: combo.description,
    h1: combo.h1,
    intro: combo.intro,
    canonicalUrl: canonicalComboUrl(comboSlug),
    indexable: combo.count >= FACET_SITEMAP_MIN_COUNT,
    modelCount: combo.count,
    breadcrumbs: generateTaxonomyBreadcrumbs(combo.h1, comboPath(comboSlug)),
    structuredData: [
      buildTaxonomyWebPageSchema(combo.title, combo.description, canonicalComboUrl(comboSlug)),
      buildBreadcrumbListSchema(
        generateTaxonomyBreadcrumbs(combo.h1, comboPath(comboSlug)),
      ),
    ],
  };
  return taxonomySeoToMetadata(seo);
}

export default async function ComboLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const comboSlug = slugify(slug);
  const snapshot = await getFullCatalog();
  const combo = getComboBySlug(snapshot.models, comboSlug);

  if (!combo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-text-secondary">
        This browse combination is not available.
      </div>
    );
  }

  const models = sortCatalogBrowse(combo.match(snapshot.models)).slice(0, 96);
  const seo: TaxonomySEO = {
    kind: "combo",
    slug: comboSlug,
    label: combo.h1,
    title: combo.title,
    metaDescription: combo.description,
    h1: combo.h1,
    intro: combo.intro,
    canonicalUrl: canonicalComboUrl(comboSlug),
    indexable: combo.count >= FACET_SITEMAP_MIN_COUNT,
    modelCount: combo.count,
    breadcrumbs: generateTaxonomyBreadcrumbs(combo.h1, comboPath(comboSlug)),
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

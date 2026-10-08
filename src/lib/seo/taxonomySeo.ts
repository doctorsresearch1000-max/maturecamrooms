import type { Metadata } from "next";
import {
  canonicalCategoryUrl,
  canonicalCountryUrl,
  canonicalLanguageUrl,
  canonicalTagUrl,
} from "@/lib/seo/canonical";
import {
  categoryPath,
  countryPath,
  languagePath,
  tagPath,
} from "@/lib/seo/slug";
import { generateTaxonomyBreadcrumbs } from "@/lib/seo/breadcrumbGenerator";
import { generateTaxonomyMetaDescription } from "@/lib/seo/descriptionGenerator";
import { generateTaxonomyH1, generateTaxonomyIntro } from "@/lib/seo/introGenerator";
import {
  isCategoryOwnedSlug,
  isFacetTaxonomyIndexable,
  isTagTaxonomyIndexable,
} from "@/lib/seo/strategy";
import { buildTaxonomyWebPageSchema } from "@/lib/seo/schemaGenerator";
import { buildBreadcrumbListSchema } from "@/lib/seo/schemaGenerator";
import { generateTaxonomyTitle } from "@/lib/seo/titleGenerator";

export type TaxonomyKind = "category" | "tag" | "country" | "language" | "platform";

export type TaxonomySEO = {
  kind: TaxonomyKind;
  slug: string;
  label: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  canonicalUrl: string;
  indexable: boolean;
  modelCount: number;
  breadcrumbs: ReturnType<typeof generateTaxonomyBreadcrumbs>;
  structuredData: unknown[];
};

function resolveCanonical(kind: TaxonomyKind, slug: string): string {
  switch (kind) {
    case "category":
      return canonicalCategoryUrl(slug);
    case "tag":
      return canonicalTagUrl(slug);
    case "country":
      return canonicalCountryUrl(slug);
    case "language":
      return canonicalLanguageUrl(slug);
    default:
      return canonicalCategoryUrl(slug);
  }
}

function resolveTaxonomyPath(kind: TaxonomyKind, slug: string): string {
  switch (kind) {
    case "category":
      return categoryPath(slug);
    case "tag":
      return tagPath(slug);
    case "country":
      return countryPath(slug);
    case "language":
      return languagePath(slug);
    default:
      return categoryPath(slug);
  }
}

export function buildTaxonomySeo(
  kind: TaxonomyKind,
  slug: string,
  label: string,
  modelCount: number,
): TaxonomySEO {
  let canonicalUrl = resolveCanonical(kind, slug);
  let indexable =
    kind === "tag"
      ? isTagTaxonomyIndexable(slug, modelCount)
      : isFacetTaxonomyIndexable(modelCount);

  if (kind === "tag" && isCategoryOwnedSlug(slug)) {
    canonicalUrl = canonicalCategoryUrl(slug);
    indexable = false;
  }
  const title = generateTaxonomyTitle(label);
  const metaDescription = generateTaxonomyMetaDescription(label, modelCount);
  const h1 = generateTaxonomyH1(label);
  const intro = generateTaxonomyIntro(label);
  const breadcrumbs = generateTaxonomyBreadcrumbs(
    label,
    resolveTaxonomyPath(kind, slug),
  );

  const structuredData = [
    buildTaxonomyWebPageSchema(title, metaDescription, canonicalUrl),
    buildBreadcrumbListSchema(breadcrumbs),
  ];

  return {
    kind,
    slug,
    label,
    title,
    metaDescription,
    h1,
    intro,
    canonicalUrl,
    indexable,
    modelCount,
    breadcrumbs,
    structuredData,
  };
}

export function taxonomySeoToMetadata(seo: TaxonomySEO): Metadata {
  return {
    title: seo.title,
    description: seo.metaDescription,
    alternates: { canonical: seo.canonicalUrl },
    robots: seo.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.metaDescription,
      url: seo.canonicalUrl,
    },
  };
}

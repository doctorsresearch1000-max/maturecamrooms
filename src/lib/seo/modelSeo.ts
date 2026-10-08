import { canonicalModelUrl } from "@/lib/seo/canonical";
import { generateModelBreadcrumbs } from "@/lib/seo/breadcrumbGenerator";
import { generateModelMetaDescription } from "@/lib/seo/descriptionGenerator";
import { generateModelInternalLinks } from "@/lib/seo/internalLinks";
import { isModelIndexable } from "@/lib/seo/indexability";
import { generateModelH1, generateModelIntro } from "@/lib/seo/introGenerator";
import { generateModelEntities, generateModelKeywords } from "@/lib/seo/keywordGenerator";
import { buildModelStructuredData, type ModelStructuredData } from "@/lib/seo/schemaGenerator";
import { normalizeModelTags, type CanonicalTag } from "@/lib/seo/tags";
import { generateModelTitle } from "@/lib/seo/titleGenerator";
import {
  buildTaxonomyIndexabilityContext,
  isCategoryIndexableForModel,
  isCountryIndexableForModel,
  type TaxonomyIndexabilityContext,
} from "@/lib/seo/taxonomyInventory";
import { fetchSitemapCatalogCandidates } from "@/lib/crak/sitemapCatalog";
import type { CamModel } from "@/lib/models/types";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbGenerator";
import type { InternalLink } from "@/lib/seo/internalLinks";

export type ModelSEO = {
  title: string;
  metaDescription: string;
  h1: string;
  /** Visible handle, including @ prefix */
  usernameDisplay: string;
  intro: string;
  canonicalUrl: string;
  breadcrumbs: BreadcrumbItem[];
  keywords: string[];
  entities: ReturnType<typeof generateModelEntities>;
  tags: CanonicalTag[];
  internalLinks: InternalLink[];
  relatedModels: CamModel[];
  structuredData: ModelStructuredData;
  indexable: boolean;
  taxonomyIndexability: TaxonomyIndexabilityContext;
  ogImageUrl?: string;
};

export type BuildModelSeoOptions = {
  taxonomyIndexability?: TaxonomyIndexabilityContext;
};

export function buildModelSeo(
  model: CamModel,
  relatedModels: CamModel[] = [],
  options?: BuildModelSeoOptions,
): ModelSEO {
  const taxonomyIndexability =
    options?.taxonomyIndexability ??
    buildTaxonomyIndexabilityContext(relatedModels.length ? relatedModels : [model]);

  const title = generateModelTitle(model);
  const metaDescription = generateModelMetaDescription(model);
  const h1 = generateModelH1(model);
  const intro = generateModelIntro(model);
  const canonicalUrl = canonicalModelUrl(model.username);
  const breadcrumbs = generateModelBreadcrumbs(model, {
    categoryIndexable: isCategoryIndexableForModel(model, taxonomyIndexability),
    countryIndexable: isCountryIndexableForModel(model, taxonomyIndexability),
  });
  const tags = normalizeModelTags(model);
  const entities = generateModelEntities(model);
  const keywords = generateModelKeywords(model);
  const internalLinks = generateModelInternalLinks(model, taxonomyIndexability);
  const indexable = isModelIndexable(model);
  const structuredData = buildModelStructuredData(
    model,
    breadcrumbs,
    title,
    metaDescription,
  );

  const ogImageUrl = model.thumbnailUrl?.startsWith("https://")
    ? model.thumbnailUrl
    : undefined;

  const usernameDisplay = `@${model.username}`;

  return {
    title,
    metaDescription,
    h1,
    usernameDisplay,
    intro,
    canonicalUrl,
    breadcrumbs,
    keywords,
    entities,
    tags,
    internalLinks,
    relatedModels,
    structuredData,
    indexable,
    taxonomyIndexability,
    ogImageUrl,
  };
}

/** Loads inventory once for accurate taxonomy indexability on profile pages. */
export async function buildModelSeoForPage(
  model: CamModel,
  relatedModels: CamModel[] = [],
): Promise<ModelSEO> {
  const inventory = await fetchSitemapCatalogCandidates();
  const taxonomyIndexability = buildTaxonomyIndexabilityContext(
    inventory.models,
  );
  return buildModelSeo(model, relatedModels, { taxonomyIndexability });
}

export function modelSeoToMetadata(seo: ModelSEO) {
  return {
    title: { absolute: seo.title },
    description: seo.metaDescription,
    alternates: { canonical: seo.canonicalUrl },
    robots: seo.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.metaDescription,
      url: seo.canonicalUrl,
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: seo.ogImageUrl ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.metaDescription,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}

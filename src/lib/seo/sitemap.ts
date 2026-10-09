import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { SITE_CATEGORIES } from "@/lib/seo/config";
import {
  canonicalAgeUrl,
  canonicalBustUrl,
  canonicalCategoryUrl,
  canonicalComboUrl,
  canonicalCountryUrl,
  canonicalEthnicityUrl,
  canonicalFigureUrl,
  canonicalHairUrl,
  canonicalLanguageUrl,
  canonicalModelUrl,
  canonicalTagUrl,
} from "@/lib/seo/canonical";
import { isCrakConfigured } from "@/lib/crak/config";
import type { SitemapCatalogResult } from "@/lib/crak/sitemapCatalog";
import {
  buildCatalogSitemapBundle,
  type CatalogSitemapBundle,
} from "@/lib/taxonomy/catalogInventory";
import type { CamModel } from "@/lib/models/types";

export class SitemapGenerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SitemapGenerationError";
  }
}

export type SitemapPipelineResult = {
  catalog: SitemapCatalogResult;
  indexableModels: CamModel[];
  bundle: CatalogSitemapBundle;
};

export async function runSitemapPipeline(
  catalogModels: CamModel[],
): Promise<SitemapPipelineResult> {
  if (!isCrakConfigured()) {
    throw new SitemapGenerationError(
      "Sitemap generation failed: Crak API credentials are not configured",
    );
  }

  if (catalogModels.length === 0) {
    throw new SitemapGenerationError(
      "Sitemap generation failed: empty catalog",
    );
  }

  const catalog: SitemapCatalogResult = {
    models: catalogModels,
    pagesFetched: 0,
    rawPerformerRows: catalogModels.length,
  };

  const bundle = buildCatalogSitemapBundle(catalogModels);
  const indexableModels = catalogModels.filter(
    (m) => m.username && m.thumbnailUrl,
  );

  return {
    catalog,
    indexableModels,
    bundle,
  };
}

export function staticSitemapEntries(): MetadataRoute.Sitemap {
  const legal: MetadataRoute.Sitemap = [
    "/privacy",
    "/terms",
    "/dmca",
    "/2257",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...legal,
  ];
}

export function modelsToSitemapEntries(
  models: CamModel[],
): MetadataRoute.Sitemap {
  return models.map((model) => ({
    url: canonicalModelUrl(model.username),
    lastModified: model.lastConnection
      ? new Date(model.lastConnection)
      : new Date(),
    changeFrequency: "daily" as const,
    priority: model.isLive ? 0.7 : 0.5,
  }));
}

export function taxonomyToSitemapEntries(
  bundle: CatalogSitemapBundle,
): MetadataRoute.Sitemap {
  const ctx = bundle.taxonomyContext;
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const cat of SITE_CATEGORIES) {
    if (!ctx.indexableCategories.has(cat)) continue;
    entries.push({
      url: canonicalCategoryUrl(cat),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    });
  }

  for (const slug of ctx.indexableTags) {
    entries.push({
      url: canonicalTagUrl(slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  for (const slug of ctx.indexableCountries) {
    entries.push({
      url: canonicalCountryUrl(slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.55,
    });
  }

  for (const slug of ctx.indexableLanguages) {
    entries.push({
      url: canonicalLanguageUrl(slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.55,
    });
  }

  for (const slug of ctx.indexableAgeBands) {
    entries.push({
      url: canonicalAgeUrl(slug),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.65,
    });
  }

  for (const slug of ctx.indexableEthnicities) {
    entries.push({
      url: canonicalEthnicityUrl(slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  for (const slug of ctx.indexableHairs) {
    entries.push({
      url: canonicalHairUrl(slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.55,
    });
  }

  for (const slug of bundle.indexableBusts) {
    entries.push({
      url: canonicalBustUrl(slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    });
  }

  for (const slug of bundle.indexableFigures) {
    entries.push({
      url: canonicalFigureUrl(slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    });
  }

  for (const combo of bundle.combos) {
    entries.push({
      url: canonicalComboUrl(combo.slug),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.45,
    });
  }

  return entries;
}

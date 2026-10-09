import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { SITE_CATEGORIES } from "@/lib/seo/config";
import {
  canonicalAgeUrl,
  canonicalCategoryUrl,
  canonicalCountryUrl,
  canonicalEthnicityUrl,
  canonicalHairUrl,
  canonicalLanguageUrl,
  canonicalModelUrl,
  canonicalTagUrl,
} from "@/lib/seo/canonical";
import { isCrakConfigured } from "@/lib/crak/config";
import {
  fetchSitemapCatalogCandidates,
  type SitemapCatalogResult,
} from "@/lib/crak/sitemapCatalog";
import {
  resolveSitemapModels,
  type SitemapResolveResult,
} from "@/lib/crak/sitemapResolve";
import { buildTaxonomyIndexabilityContext } from "@/lib/seo/taxonomyInventory";
import { fetchLiveMenuPool } from "@/lib/taxonomy/fetchLivePool";
import { buildLiveMenuInventory } from "@/lib/taxonomy/liveMenuInventory";
import type { CamModel } from "@/lib/models/types";

export class SitemapGenerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SitemapGenerationError";
  }
}

export type SitemapPipelineResult = {
  catalog: SitemapCatalogResult;
  resolve: SitemapResolveResult;
  indexableModels: CamModel[];
  taxonomyContext: ReturnType<typeof buildTaxonomyIndexabilityContext>;
};

export async function runSitemapPipeline(): Promise<SitemapPipelineResult> {
  if (!isCrakConfigured()) {
    throw new SitemapGenerationError(
      "Sitemap generation failed: Crak API credentials are not configured",
    );
  }

  const catalog = await fetchSitemapCatalogCandidates();
  if (catalog.models.length === 0) {
    throw new SitemapGenerationError(
      "Sitemap generation failed: Crak returned no performer candidates",
    );
  }

  const resolve = await resolveSitemapModels(catalog.models);
  const taxonomyContext = buildTaxonomyIndexabilityContext(catalog.models);
  const { pool, feedOk } = await fetchLiveMenuPool();
  const liveMenu = buildLiveMenuInventory(pool, feedOk);
  const taxonomyContextWithLiveFacets = {
    ...taxonomyContext,
    indexableCategories: new Set(liveMenu.niches.map((n) => n.slug)),
    indexableAgeBands: liveMenu.indexableAge,
    indexableEthnicities: liveMenu.indexableEthnicity,
    indexableHairs: liveMenu.indexableHair,
    indexableCountries: new Set(liveMenu.countries.map((c) => c.slug)),
  };

  return {
    catalog,
    resolve,
    indexableModels: resolve.models,
    taxonomyContext: taxonomyContextWithLiveFacets,
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

export async function fetchIndexableModelsForSitemap(): Promise<CamModel[]> {
  const pipeline = await runSitemapPipeline();
  return pipeline.indexableModels;
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
  ctx: ReturnType<typeof buildTaxonomyIndexabilityContext>,
): MetadataRoute.Sitemap {
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

  return entries;
}

export async function fetchTaxonomySitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const pipeline = await runSitemapPipeline();
  return taxonomyToSitemapEntries(pipeline.taxonomyContext);
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { SITE_CATEGORIES, SITEMAP_MODEL_FETCH_SIZE } from "@/lib/seo/config";
import {
  canonicalCategoryUrl,
  canonicalCountryUrl,
  canonicalLanguageUrl,
  canonicalModelUrl,
  canonicalTagUrl,
} from "@/lib/seo/canonical";
import { isModelIndexable } from "@/lib/seo/indexability";
import { getFeaturedModels } from "@/lib/models/getModels";
import { buildTaxonomyIndexabilityContext } from "@/lib/seo/taxonomyInventory";
import type { CamModel } from "@/lib/models/types";

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
  const result = await getFeaturedModels(SITEMAP_MODEL_FETCH_SIZE, {
    live: undefined,
  });
  return result.models.filter(isModelIndexable);
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

  return entries;
}

export async function fetchTaxonomySitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const result = await getFeaturedModels(SITEMAP_MODEL_FETCH_SIZE, {
    live: undefined,
  });
  const ctx = buildTaxonomyIndexabilityContext(result.models);
  return taxonomyToSitemapEntries(ctx);
}

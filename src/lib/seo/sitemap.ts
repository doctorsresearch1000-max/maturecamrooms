import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { SITE_CATEGORIES } from "@/lib/seo/config";
import { canonicalCategoryUrl, canonicalModelUrl } from "@/lib/seo/canonical";
import { isModelIndexable } from "@/lib/seo/indexability";
import { getFeaturedModels } from "@/lib/models/getModels";
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

  const categories: MetadataRoute.Sitemap = SITE_CATEGORIES.map((tag) => ({
    url: canonicalCategoryUrl(tag),
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...categories,
    ...legal,
  ];
}

export async function fetchIndexableModelsForSitemap(): Promise<CamModel[]> {
  const result = await getFeaturedModels(120, { live: undefined });
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

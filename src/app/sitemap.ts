import type { MetadataRoute } from "next";
import {
  fetchIndexableModelsForSitemap,
  modelsToSitemapEntries,
  staticSitemapEntries,
} from "@/lib/seo/sitemap";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = staticSitemapEntries();

  try {
    const models = await fetchIndexableModelsForSitemap();
    return [...entries, ...modelsToSitemapEntries(models)];
  } catch {
    return entries;
  }
}

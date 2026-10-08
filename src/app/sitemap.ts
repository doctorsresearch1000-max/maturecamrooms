import type { MetadataRoute } from "next";
import {
  fetchIndexableModelsForSitemap,
  fetchTaxonomySitemapEntries,
  modelsToSitemapEntries,
  staticSitemapEntries,
} from "@/lib/seo/sitemap";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = staticSitemapEntries();

  const [models, taxonomies] = await Promise.all([
    fetchIndexableModelsForSitemap(),
    fetchTaxonomySitemapEntries(),
  ]);

  return [...entries, ...taxonomies, ...modelsToSitemapEntries(models)];
}

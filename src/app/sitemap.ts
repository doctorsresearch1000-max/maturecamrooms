import type { MetadataRoute } from "next";
import {
  modelsToSitemapEntries,
  runSitemapPipeline,
  staticSitemapEntries,
  taxonomyToSitemapEntries,
} from "@/lib/seo/sitemap";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = staticSitemapEntries();
  const pipeline = await runSitemapPipeline();

  return [
    ...entries,
    ...taxonomyToSitemapEntries(pipeline.taxonomyContext),
    ...modelsToSitemapEntries(pipeline.indexableModels),
  ];
}

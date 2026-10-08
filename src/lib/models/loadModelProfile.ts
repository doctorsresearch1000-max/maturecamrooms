import { cache } from "react";
import {
  getModelByUsername,
  getRelatedModels,
} from "@/lib/models/getModels";
import { buildModelSeoForPage } from "@/lib/seo/modelSeo";

/** Dedupes model + SEO work within a single request (metadata + page). */
export const loadModelProfile = cache(async (username: string) => {
  const model = await getModelByUsername(username);
  if (!model) return null;
  const related = await getRelatedModels(model, 8);
  const seo = await buildModelSeoForPage(model, related);
  return { model, related, seo };
});

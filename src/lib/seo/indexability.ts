import { TAXONOMY_MIN_MODEL_COUNT } from "@/lib/seo/config";
import type { CamModel } from "@/lib/models/types";

export type ModelQualitySignals = {
  validName: boolean;
  validUsername: boolean;
  hasThumbnail: boolean;
  hasCategory: boolean;
  hasTags: boolean;
  hasCountry: boolean;
  hasDescription: boolean;
  score: number;
};

export function scoreModelQuality(model: CamModel): ModelQualitySignals {
  const validName = Boolean(model.displayName?.trim() && model.displayName.length >= 2);
  const validUsername = Boolean(model.username?.trim());
  const hasThumbnail = Boolean(
    model.thumbnailUrl?.startsWith("https://") && model.thumbnailUrl.length > 12,
  );
  const hasCategory = Boolean(model.primaryCategory?.trim());
  const hasTags = model.tags.length > 0;
  const hasCountry = Boolean(model.country?.trim() || model.countryCode?.trim());
  const hasDescription = Boolean(model.description?.trim());

  let score = 0;
  if (validName) score += 2;
  if (validUsername) score += 2;
  if (hasThumbnail) score += 2;
  if (hasCategory) score += 1;
  if (hasTags) score += 1;
  if (hasCountry) score += 1;
  if (hasDescription) score += 1;
  if (model.hair) score += 0.5;
  if (model.languages?.length) score += 0.5;

  return {
    validName,
    validUsername,
    hasThumbnail,
    hasCategory,
    hasTags,
    hasCountry,
    hasDescription,
    score,
  };
}

/** Minimum quality score for sitemap + index (configurable via score threshold). */
const MODEL_INDEX_MIN_SCORE = 5;

export function isModelIndexable(model: CamModel): boolean {
  const q = scoreModelQuality(model);
  if (!q.validName || !q.validUsername) return false;
  if (!q.hasThumbnail) return false;
  if (q.score < MODEL_INDEX_MIN_SCORE) return false;
  return true;
}

export function isTaxonomyIndexable(modelCount: number): boolean {
  return modelCount >= TAXONOMY_MIN_MODEL_COUNT;
}

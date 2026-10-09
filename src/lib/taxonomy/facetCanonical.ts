import { filterModelsByCategory } from "@/lib/seo/filters";
import { canonicalCategoryUrl } from "@/lib/seo/canonical";
import { FACET_CANONICAL_OVERLAP_RATIO } from "@/lib/taxonomy/constants";
import type { CamModel } from "@/lib/models/types";

export function matureModelIdSet(pool: CamModel[]): Set<string> {
  return new Set(
    filterModelsByCategory(pool, "mature").map((model) => model.id),
  );
}

export function overlapRatioAgainstMature(
  livePool: CamModel[],
  facetModelIds: string[],
): number {
  const mature = matureModelIdSet(livePool);
  const facet = new Set(facetModelIds);
  if (mature.size === 0 || facet.size === 0) return 0;
  let inter = 0;
  for (const id of facet) if (mature.has(id)) inter++;
  return inter / Math.min(mature.size, facet.size);
}

export function facetRedundantWithMature(
  livePool: CamModel[],
  facetModelIds: string[],
): boolean {
  return (
    overlapRatioAgainstMature(livePool, facetModelIds) >=
    FACET_CANONICAL_OVERLAP_RATIO
  );
}

export function matureCategoryCanonicalUrl(): string {
  return canonicalCategoryUrl("mature");
}

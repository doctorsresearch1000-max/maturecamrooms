import {
  FACET_CANONICAL_OVERLAP_RATIO,
  FACET_MENU_MIN_COUNT,
  FACET_SITEMAP_MIN_COUNT,
} from "@/lib/taxonomy/settings";

/** @deprecated Use FACET_MENU_MIN_COUNT or FACET_SITEMAP_MIN_COUNT */
export const FACET_MIN_MODEL_COUNT = FACET_MENU_MIN_COUNT;

export {
  FACET_CANONICAL_OVERLAP_RATIO,
  FACET_MENU_MIN_COUNT,
  FACET_SITEMAP_MIN_COUNT,
};

export const NICHE_FACET_SLUGS = ["mature", "milf", "cougar", "mom"] as const;

export const NICHE_CANONICAL_PRIORITY: readonly string[] = [
  "mature",
  "milf",
  "cougar",
  "mom",
];

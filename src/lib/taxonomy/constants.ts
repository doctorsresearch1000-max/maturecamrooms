import { TAXONOMY_MIN_MODEL_COUNT } from "@/lib/seo/config";

/** Minimum live models for menu visibility, indexability, and sitemap inclusion. */
export const FACET_MIN_MODEL_COUNT = TAXONOMY_MIN_MODEL_COUNT;

/** When two facets share at least this fraction of the smaller set, secondary is canonicalized. */
export const FACET_CANONICAL_OVERLAP_RATIO = 0.9;

export const NICHE_FACET_SLUGS = ["mature", "milf", "cougar", "mom"] as const;

export const NICHE_CANONICAL_PRIORITY: readonly string[] = [
  "mature",
  "milf",
  "cougar",
  "mom",
];

/** Minimum live+eligible models required before a taxonomy page is indexable. */
export const TAXONOMY_MIN_MODEL_COUNT = 8;

/** Max title length (characters) before dropping secondary modifiers. */
export const SEO_TITLE_MAX_LENGTH = 60;

/** Meta description target max length. */
export const SEO_DESCRIPTION_MAX_LENGTH = 155;

/** Related models shown on profile (SEO + discovery). */
export const RELATED_MODEL_LIMIT = 8;

/** Max models fetched per sitemap generation pass (edge-safe). */
export const SITEMAP_MODEL_FETCH_SIZE = 120;

/** Site categories owned by MatureCamRooms (not raw Crak tags). */
export const SITE_CATEGORIES = ["mature", "milf", "cougar", "mom"] as const;

export type SiteCategory = (typeof SITE_CATEGORIES)[number];

export const CATEGORY_DISPLAY: Record<SiteCategory, string> = {
  mature: "Mature",
  milf: "MILF",
  cougar: "Cougar",
  mom: "Mom",
};

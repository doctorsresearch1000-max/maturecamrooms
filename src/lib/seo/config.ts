/** Minimum live+eligible models required before a taxonomy page is indexable. */
export const TAXONOMY_MIN_MODEL_COUNT = 8;

/** Max title length (characters) before dropping secondary modifiers. */
export const SEO_TITLE_MAX_LENGTH = 60;

/** Meta description target max length. */
export const SEO_DESCRIPTION_MAX_LENGTH = 155;

/** Related models shown on profile (SEO + discovery). */
export const RELATED_MODEL_LIMIT = 8;

/** CRAK list API max performers per request (enforced in fetchNormalized). */
export const CRAK_REQUEST_PAGE_SIZE = 48;

/** Max paginated CRAK list requests per sitemap/taxonomy inventory pass. */
export const SITEMAP_MAX_PAGES = 50;

/** Max unique performer candidates collected from CRAK per catalog/sitemap pass. */
export const SITEMAP_MAX_CANDIDATES = 5000;

/** Site categories owned by MatureCamRooms (not raw Crak tags). */
export const SITE_CATEGORIES = ["mature", "milf", "cougar", "mom"] as const;

export type SiteCategory = (typeof SITE_CATEGORIES)[number];

/** Categories shown in nav, chips, and sitemap niches. */
export const NAV_SITE_CATEGORIES = ["mature", "milf"] as const;

export type NavSiteCategory = (typeof NAV_SITE_CATEGORIES)[number];

export const CATEGORY_DISPLAY: Record<SiteCategory, string> = {
  mature: "Mature",
  milf: "MILF",
  cougar: "Cougar",
  mom: "Mom",
};

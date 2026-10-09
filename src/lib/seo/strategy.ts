/**
 * Phase 4/5 SEO strategy — single source for keyword roles, taxonomy rules, and
 * compliance hooks. Reuses numeric thresholds from `config.ts`.
 */
import {
  NAV_SITE_CATEGORIES,
  TAXONOMY_MIN_MODEL_COUNT,
  type NavSiteCategory,
} from "@/lib/seo/config";

/** Primary entity: one canonical profile URL per performer. */
export const PRIMARY_ENTITY_ROLE = "model_profile" as const;

/** Secondary terms (VIP, leak, etc.) — config only; no copy or URLs in Phase 5. */
export const SECONDARY_KEYWORD_ROLES = {
  vip: { enabled: false, allowProfileCopy: false, allowUrls: false },
  leak: { enabled: false, allowProfileCopy: false, allowUrls: false },
  leaks: { enabled: false, allowProfileCopy: false, allowUrls: false },
  private: { enabled: false, allowProfileCopy: false, allowUrls: false },
  exclusive: { enabled: false, allowProfileCopy: false, allowUrls: false },
} as const;

export type SecondaryKeywordRole = keyof typeof SECONDARY_KEYWORD_ROLES;

/** Site-owned category slugs — never duplicate as indexable `/tag/{slug}` hubs. */
export const CATEGORY_OWNED_SLUGS: readonly NavSiteCategory[] =
  NAV_SITE_CATEGORIES;

/**
 * Curated attribute hub allowlist (`/tag/{slug}`).
 * Only slugs listed here may become indexable tag taxonomies (plus inventory threshold).
 * Add slugs deliberately in a future phase; do not auto-index every performer tag.
 */
export const APPROVED_ATTRIBUTE_HUB_SLUGS: readonly string[] = [
  // e.g. "blonde", "bbw" — empty until editorially approved
];

const approvedTagSet = new Set(
  APPROVED_ATTRIBUTE_HUB_SLUGS.map((s) => s.toLowerCase()),
);

export function isCategoryOwnedSlug(slug: string): boolean {
  const normalized = slug.toLowerCase();
  return (CATEGORY_OWNED_SLUGS as readonly string[]).includes(normalized);
}

export function isApprovedAttributeHub(slug: string): boolean {
  return approvedTagSet.has(slug.toLowerCase());
}

export function taxonomyIndexabilityThreshold(): number {
  return TAXONOMY_MIN_MODEL_COUNT;
}

/** Tag taxonomy pages: approved hub + inventory; never category-owned slugs. */
export function isTagTaxonomyIndexable(slug: string, modelCount: number): boolean {
  if (isCategoryOwnedSlug(slug)) return false;
  if (!isApprovedAttributeHub(slug)) return false;
  return modelCount >= TAXONOMY_MIN_MODEL_COUNT;
}

/** Category / country / language taxonomies: inventory threshold only. */
export function isFacetTaxonomyIndexable(modelCount: number): boolean {
  return modelCount >= TAXONOMY_MIN_MODEL_COUNT;
}

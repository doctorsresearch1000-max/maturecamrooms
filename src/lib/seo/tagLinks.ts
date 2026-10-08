import { categoryPath, tagPath } from "@/lib/seo/slug";
import type { CanonicalTag } from "@/lib/seo/tags";
import type { TaxonomyIndexabilityContext } from "@/lib/seo/taxonomyInventory";

export type TagLinkTarget =
  | { href: string; crawlable: true }
  | { href?: undefined; crawlable: false };

/** Resolve profile tag chip target; omit links to thin/noindex taxonomies. */
export function resolveTagLinkTarget(
  tag: CanonicalTag,
  ctx?: TaxonomyIndexabilityContext,
): TagLinkTarget {
  if (tag.type === "category") {
    const cat = tag.slug;
    if (ctx && !ctx.indexableCategories.has(cat)) {
      return { crawlable: false };
    }
    return { href: categoryPath(cat), crawlable: true };
  }

  if (ctx && !ctx.indexableTags.has(tag.slug)) {
    return { crawlable: false };
  }

  return { href: tagPath(tag.slug), crawlable: true };
}

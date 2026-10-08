import {
  categoryPath,
  countryPath,
  languagePath,
  tagPath,
} from "@/lib/seo/slug";
import { CATEGORY_DISPLAY, SITE_CATEGORIES, type SiteCategory } from "@/lib/seo/config";
import { countryLabel } from "@/lib/country";
import { slugify } from "@/lib/seo/slug";
import { isCategoryOwnedSlug } from "@/lib/seo/strategy";
import { normalizeModelTags } from "@/lib/seo/tags";
import type { TaxonomyIndexabilityContext } from "@/lib/seo/taxonomyInventory";
import type { CamModel } from "@/lib/models/types";

export type InternalLink = {
  label: string;
  href: string;
  kind: "category" | "country" | "language" | "tag" | "platform";
};

export function generateModelInternalLinks(
  model: CamModel,
  ctx?: TaxonomyIndexabilityContext,
): InternalLink[] {
  const links: InternalLink[] = [];
  const cat = model.primaryCategory?.toLowerCase();

  if (
    cat &&
    (SITE_CATEGORIES as readonly string[]).includes(cat) &&
    (!ctx || ctx.indexableCategories.has(cat))
  ) {
    links.push({
      label: `${CATEGORY_DISPLAY[cat as SiteCategory]} cams`,
      href: categoryPath(cat),
      kind: "category",
    });
  }

  const country = countryLabel(model.countryCode, model.country);
  if (country) {
    const slug = slugify(country);
    if (!ctx || ctx.indexableCountries.has(slug)) {
      links.push({
        label: `Cams from ${country}`,
        href: countryPath(slug),
        kind: "country",
      });
    }
  }

  const lang = model.languages?.[0]?.trim();
  if (lang) {
    const slug = slugify(lang);
    if (!ctx || ctx.indexableLanguages.has(slug)) {
      links.push({
        label: `${lang} speaking models`,
        href: languagePath(slug),
        kind: "language",
      });
    }
  }

  for (const tag of normalizeModelTags(model)) {
    if (tag.type === "category" || isCategoryOwnedSlug(tag.slug)) continue;
    if (ctx && !ctx.indexableTags.has(tag.slug)) continue;
    if (links.some((l) => l.href === tagPath(tag.slug))) continue;
    links.push({
      label: `${tag.display} cams`,
      href: tagPath(tag.slug),
      kind: "tag",
    });
    if (links.length >= 10) break;
  }

  return links;
}

import { slugify } from "@/lib/seo/slug";
import { countryLabel } from "@/lib/country";
import {
  filterModelsByLanguage,
  filterModelsByTag,
} from "@/lib/seo/filters";
import {
  CATEGORY_DISPLAY,
  type SiteCategory,
} from "@/lib/seo/config";
import {
  isApprovedAttributeHub,
  isCategoryOwnedSlug,
  isFacetTaxonomyIndexable,
  isTagTaxonomyIndexable,
} from "@/lib/seo/strategy";
import { normalizeModelTags } from "@/lib/seo/tags";
import { buildLiveMenuInventory } from "@/lib/taxonomy/liveMenuInventory";
import type { CamModel } from "@/lib/models/types";

export type TaxonomyIndexabilityContext = {
  indexableCategories: Set<string>;
  indexableTags: Set<string>;
  indexableCountries: Set<string>;
  indexableLanguages: Set<string>;
  indexableAgeBands: Set<string>;
  indexableEthnicities: Set<string>;
  indexableHairs: Set<string>;
};

export function buildTaxonomyIndexabilityContext(
  models: CamModel[],
): TaxonomyIndexabilityContext {
  const live = models.filter((m) => m.isLive);
  const menuInv = buildLiveMenuInventory(live, live.length > 0);

  const indexableCategories = new Set<string>();
  for (const item of menuInv.niches) {
    indexableCategories.add(item.slug);
  }

  const indexableCountries = new Set<string>();
  const countrySlugs = new Set<string>();
  for (const model of models) {
    const label = countryLabel(model.countryCode, model.country);
    if (!label) continue;
    countrySlugs.add(slugify(label));
  }
  for (const item of menuInv.countries) {
    indexableCountries.add(item.slug);
  }

  const indexableLanguages = new Set<string>();
  const langSlugs = new Set<string>();
  for (const model of models) {
    for (const lang of model.languages ?? []) {
      const slug = slugify(lang.trim());
      if (slug) langSlugs.add(slug);
    }
  }
  for (const slug of langSlugs) {
    const count = filterModelsByLanguage(models, slug).length;
    if (isFacetTaxonomyIndexable(count)) {
      indexableLanguages.add(slug);
    }
  }

  const tagSlugCounts = new Map<string, number>();
  for (const model of models) {
    for (const tag of normalizeModelTags(model)) {
      if (tag.type === "category" || isCategoryOwnedSlug(tag.slug)) continue;
      if (!isApprovedAttributeHub(tag.slug)) continue;
      tagSlugCounts.set(tag.slug, (tagSlugCounts.get(tag.slug) ?? 0) + 1);
    }
  }
  const indexableTags = new Set<string>();
  for (const [slug] of tagSlugCounts) {
    const count = filterModelsByTag(models, slug).length;
    if (isTagTaxonomyIndexable(slug, count)) {
      indexableTags.add(slug);
    }
  }

  return {
    indexableCategories,
    indexableTags,
    indexableCountries,
    indexableLanguages,
    indexableAgeBands: menuInv.indexableAge,
    indexableEthnicities: menuInv.indexableEthnicity,
    indexableHairs: menuInv.indexableHair,
  };
}

export function isCategoryIndexableForModel(
  model: CamModel,
  ctx: TaxonomyIndexabilityContext,
): boolean {
  const cat = model.primaryCategory?.toLowerCase();
  if (!cat || !(cat in CATEGORY_DISPLAY)) return false;
  return ctx.indexableCategories.has(cat);
}

export function isCountryIndexableForModel(
  model: CamModel,
  ctx: TaxonomyIndexabilityContext,
): boolean {
  const label = countryLabel(model.countryCode, model.country);
  if (!label) return false;
  return ctx.indexableCountries.has(slugify(label));
}

export function primaryCategoryLabel(model: CamModel): string | undefined {
  const cat = model.primaryCategory?.toLowerCase();
  if (!cat || !(cat in CATEGORY_DISPLAY)) return undefined;
  return CATEGORY_DISPLAY[cat as SiteCategory];
}

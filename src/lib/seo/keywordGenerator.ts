import { CATEGORY_DISPLAY, type SiteCategory } from "@/lib/seo/config";
import { countryLabel } from "@/lib/country";
import { slugify } from "@/lib/seo/slug";
import { normalizeModelTags } from "@/lib/seo/tags";
import type { CamModel } from "@/lib/models/types";

export type SeoEntity = {
  label: string;
  slug?: string;
  kind: "category" | "country" | "language" | "hair" | "tag" | "platform";
};

function uniqueByLabel(items: SeoEntity[]): SeoEntity[] {
  const seen = new Set<string>();
  const out: SeoEntity[] = [];
  for (const item of items) {
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function generateModelEntities(model: CamModel): SeoEntity[] {
  const entities: SeoEntity[] = [];
  const cat = model.primaryCategory?.toLowerCase();
  if (cat && cat in CATEGORY_DISPLAY) {
    const label = CATEGORY_DISPLAY[cat as SiteCategory];
    entities.push({ label, slug: cat, kind: "category" });
    entities.push({ label: `${label} cam`, kind: "tag" });
  }

  const country = countryLabel(model.countryCode, model.country);
  if (country) {
    entities.push({
      label: country,
      slug: slugify(country),
      kind: "country",
    });
  }

  if (model.hair?.trim()) {
    const hair = model.hair.trim();
    entities.push({
      label: hair,
      slug: slugify(hair),
      kind: "hair",
    });
  }

  const lang = model.languages?.[0]?.trim();
  if (lang) {
    entities.push({
      label: lang,
      slug: slugify(lang),
      kind: "language",
    });
  }

  if (model.platform) {
    entities.push({
      label: model.platform,
      slug: slugify(model.platform),
      kind: "platform",
    });
  }

  for (const tag of normalizeModelTags(model).slice(0, 8)) {
    if (tag.type === "category") continue;
    entities.push({ label: tag.display, slug: tag.slug, kind: "tag" });
  }

  // Coherent combo: category + country (navigation entity, not a stuffed phrase)
  if (cat && country && cat in CATEGORY_DISPLAY) {
    const label = CATEGORY_DISPLAY[cat as SiteCategory];
    entities.push({
      label: `${label} cams in ${country}`,
      kind: "tag",
    });
  }

  return uniqueByLabel(entities).slice(0, 16);
}

export function generateModelKeywords(model: CamModel): string[] {
  return generateModelEntities(model).map((e) => e.label);
}

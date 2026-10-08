import { CATEGORY_DISPLAY, SEO_TITLE_MAX_LENGTH, type SiteCategory } from "@/lib/seo/config";
import { siteConfig } from "@/lib/site";
import type { CamModel } from "@/lib/models/types";

function primaryCategoryLabel(model: CamModel): string | undefined {
  const cat = model.primaryCategory?.toLowerCase();
  if (!cat) return undefined;
  if (cat in CATEGORY_DISPLAY) {
    return CATEGORY_DISPLAY[cat as SiteCategory];
  }
  return undefined;
}

function trimTitle(parts: string[]): string {
  const brand = siteConfig.name;
  let title = parts.filter(Boolean).join(" — ");
  if (!title.includes(brand)) {
    title = `${title} | ${brand}`;
  }
  if (title.length <= SEO_TITLE_MAX_LENGTH) return title;

  // Drop category modifier first, keep entity + brand.
  const name = parts[0];
  const short = `${name} — Live Mature Cam | ${brand}`;
  if (short.length <= SEO_TITLE_MAX_LENGTH) return short;

  return `${name} | ${brand}`.slice(0, SEO_TITLE_MAX_LENGTH);
}

export function generateModelTitle(model: CamModel): string {
  const name = model.displayName.trim();
  const category = primaryCategoryLabel(model);

  if (category && category !== "Mature") {
    return trimTitle([`${name} — Live ${category} Cam`]);
  }
  return trimTitle([`${name} — Live Mature Cam`]);
}

export function generateTaxonomyTitle(label: string): string {
  const base = `${label} Cam Models | ${siteConfig.name}`;
  return base.length <= SEO_TITLE_MAX_LENGTH
    ? base
    : `${label} Cams | ${siteConfig.name}`.slice(0, SEO_TITLE_MAX_LENGTH);
}

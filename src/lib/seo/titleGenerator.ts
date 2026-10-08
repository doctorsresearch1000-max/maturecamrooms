import { SEO_TITLE_MAX_LENGTH } from "@/lib/seo/config";
import { primaryCategoryLabel } from "@/lib/seo/taxonomyInventory";
import { siteConfig } from "@/lib/site";
import type { CamModel } from "@/lib/models/types";

function trimTitle(candidates: string[]): string {
  const brand = siteConfig.name;
  for (const base of candidates) {
    const withBrand = base.includes(brand) ? base : `${base} | ${brand}`;
    if (withBrand.length <= SEO_TITLE_MAX_LENGTH) return withBrand;
  }
  const name = candidates[0]?.split(" Cam")[0] ?? candidates[0] ?? "Model";
  return `${name} | ${brand}`.slice(0, SEO_TITLE_MAX_LENGTH);
}

export function generateModelTitle(model: CamModel): string {
  const name = model.displayName.trim();
  const category = primaryCategoryLabel(model);

  if (category) {
    return trimTitle([
      `${name} ${category} Cam — Live Webcam`,
      `${name} Cam — Live Webcam`,
    ]);
  }

  return trimTitle([`${name} Cam — Live Webcam`]);
}

export function generateTaxonomyTitle(label: string): string {
  const base = `${label} Cam Models | ${siteConfig.name}`;
  return base.length <= SEO_TITLE_MAX_LENGTH
    ? base
    : `${label} Cams | ${siteConfig.name}`.slice(0, SEO_TITLE_MAX_LENGTH);
}

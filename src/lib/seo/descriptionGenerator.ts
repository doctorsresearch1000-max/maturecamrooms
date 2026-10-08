import {
  CATEGORY_DISPLAY,
  SEO_DESCRIPTION_MAX_LENGTH,
  TAXONOMY_MIN_MODEL_COUNT,
  type SiteCategory,
} from "@/lib/seo/config";
import { countryLabel } from "@/lib/country";
import { siteConfig } from "@/lib/site";
import type { CamModel } from "@/lib/models/types";

function clip(text: string): string {
  if (text.length <= SEO_DESCRIPTION_MAX_LENGTH) return text;
  const cut = text.slice(0, SEO_DESCRIPTION_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

function categoryPhrase(model: CamModel): string | undefined {
  const cat = model.primaryCategory?.toLowerCase();
  if (!cat || !(cat in CATEGORY_DISPLAY)) return undefined;
  return CATEGORY_DISPLAY[cat as SiteCategory].toLowerCase();
}

export function generateModelMetaDescription(model: CamModel): string {
  const name = model.displayName.trim();
  const country = countryLabel(model.countryCode, model.country);
  const category = categoryPhrase(model);

  let text: string;
  if (category && country) {
    text = `Watch ${name} live on ${siteConfig.name}. Explore this ${category} model from ${country}, including profile details, tags and related live models.`;
  } else if (category) {
    text = `Watch ${name} live on ${siteConfig.name}. Explore this ${category} model's profile, tags and related live models.`;
  } else if (country) {
    text = `Watch ${name} live on ${siteConfig.name}. Explore profile details, tags and related models from ${country}.`;
  } else {
    text = `Watch ${name} live on ${siteConfig.name}. Explore profile details, tags and related live models.`;
  }

  return clip(text);
}

export function generateTaxonomyMetaDescription(
  label: string,
  modelCount: number,
): string {
  const countPhrase =
    modelCount >= TAXONOMY_MIN_MODEL_COUNT
      ? `Browse ${modelCount} live ${label.toLowerCase()} cam models`
      : `Browse live ${label.toLowerCase()} cam models`;

  return clip(
    `${countPhrase} on ${siteConfig.name}. Discover profiles, tags and related live webcam models. 18+ only.`,
  );
}

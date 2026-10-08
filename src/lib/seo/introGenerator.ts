import { CATEGORY_DISPLAY, type SiteCategory } from "@/lib/seo/config";
import { countryLabel } from "@/lib/country";
import { siteConfig } from "@/lib/site";
import { templateIndex } from "@/lib/seo/variation";
import type { CamModel } from "@/lib/models/types";

function categoryLabel(model: CamModel): string | undefined {
  const cat = model.primaryCategory?.toLowerCase();
  if (!cat || !(cat in CATEGORY_DISPLAY)) return undefined;
  return CATEGORY_DISPLAY[cat as SiteCategory].toLowerCase();
}

function attributeSentence(model: CamModel): string | null {
  const name = model.displayName.trim();
  const category = categoryLabel(model);
  const country = countryLabel(model.countryCode, model.country);
  const language = model.languages?.[0]?.trim();

  if (category && country && language) {
    return `${name} is a ${category} cam model from ${country} who streams in ${language}.`;
  }
  if (category && country) {
    return `${name} is a ${category} cam model from ${country}.`;
  }
  if (category) {
    return `${name} is a ${category} cam model on ${siteConfig.name}.`;
  }
  if (country) {
    return `${name} is a live cam model from ${country} on ${siteConfig.name}.`;
  }
  return null;
}

const INTRO_PATTERNS: Array<(m: CamModel) => string> = [
  (m) => {
    const attr = attributeSentence(m);
    if (attr) return `${attr} Explore the profile, current status and related models.`;
    return `Discover ${m.displayName}, a live cam model on ${siteConfig.name}. Explore the profile, current status and available attributes.`;
  },
  (m) =>
    `Watch ${m.displayName} live on ${siteConfig.name}. Browse ${m.displayName}'s profile, tags and related models.`,
  (m) =>
    `Explore ${m.displayName}'s ${siteConfig.name} profile, including available profile details, tags and live status.`,
];

export function generateModelH1(model: CamModel): string {
  return `${model.displayName.trim()} Live Cam`;
}

export function generateModelIntro(model: CamModel): string {
  const idx = templateIndex(model.id || model.username, INTRO_PATTERNS.length);
  return INTRO_PATTERNS[idx](model);
}

export function generateTaxonomyIntro(label: string): string {
  return `Explore live ${label.toLowerCase()} cam models available on ${siteConfig.name}.`;
}

export function generateTaxonomyH1(label: string): string {
  return `${label} Cam Models`;
}

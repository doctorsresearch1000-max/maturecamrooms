import { countryLabel } from "@/lib/country";
import { slugify } from "@/lib/seo/slug";
import type { CamModel } from "@/lib/models/types";

export const AGE_FACET_DEFS = [
  { slug: "40-49", label: "40–49" },
  { slug: "50-59", label: "50–59" },
  { slug: "60-plus", label: "60+" },
] as const;

export function modelAgeBand(age?: number): string | null {
  if (age === undefined || age <= 0) return null;
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  return "60-plus";
}

export function filterModelsByAgeBand(
  models: CamModel[],
  bandSlug: string,
): CamModel[] {
  const slug = slugify(bandSlug);
  return models.filter((m) => modelAgeBand(m.age) === slug);
}

export function ethnicitySlug(model: CamModel): string | null {
  if (!model.ethnicity) return null;
  const slug = slugify(model.ethnicity);
  return slug || null;
}

export function filterModelsByEthnicity(
  models: CamModel[],
  targetSlug: string,
): CamModel[] {
  const slug = slugify(targetSlug);
  return models.filter((m) => ethnicitySlug(m) === slug);
}

export function hairSlug(model: CamModel): string | null {
  if (!model.hair) return null;
  const slug = slugify(model.hair);
  return slug || null;
}

export function filterModelsByHair(
  models: CamModel[],
  targetSlug: string,
): CamModel[] {
  const slug = slugify(targetSlug);
  return models.filter((m) => hairSlug(m) === slug);
}

export function countryFacetSlug(model: CamModel): string | null {
  const label = countryLabel(model.countryCode, model.country);
  if (!label) return null;
  const slug = slugify(label);
  return slug || null;
}

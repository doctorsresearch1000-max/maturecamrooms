import { slugify } from "@/lib/seo/slug";
import { countryLabel } from "@/lib/country";
import type { CamModel } from "@/lib/models/types";

export function filterModelsByCategory(
  models: CamModel[],
  categorySlug: string,
): CamModel[] {
  const slug = slugify(categorySlug);
  return models.filter(
    (m) =>
      m.primaryCategory?.toLowerCase() === slug ||
      m.tags.some((t) => slugify(t) === slug),
  );
}

export function filterModelsByTag(
  models: CamModel[],
  tagSlug: string,
): CamModel[] {
  const slug = slugify(tagSlug);
  return models.filter((m) =>
    m.tags.some((t) => slugify(t) === slug),
  );
}

export function filterModelsByCountry(
  models: CamModel[],
  countrySlug: string,
): CamModel[] {
  const slug = slugify(countrySlug);
  return models.filter((m) => {
    const label = countryLabel(m.countryCode, m.country);
    return label ? slugify(label) === slug : false;
  });
}

export function filterModelsByLanguage(
  models: CamModel[],
  languageSlug: string,
): CamModel[] {
  const slug = slugify(languageSlug);
  return models.filter((m) =>
    m.languages?.some((lang) => slugify(lang) === slug),
  );
}

import { absoluteUrl } from "@/lib/site";
import {
  agePath,
  bustPath,
  categoryPath,
  comboPath,
  countryPath,
  ethnicityPath,
  figurePath,
  hairPath,
  languagePath,
  modelProfilePath,
  platformPath,
  tagPath,
} from "@/lib/seo/slug";

export function canonicalModelUrl(username: string): string {
  return absoluteUrl(modelProfilePath(username));
}

export function canonicalCategoryUrl(category: string): string {
  return absoluteUrl(categoryPath(category));
}

export function canonicalTagUrl(tagSlug: string): string {
  return absoluteUrl(tagPath(tagSlug));
}

export function canonicalCountryUrl(countrySlug: string): string {
  return absoluteUrl(countryPath(countrySlug));
}

export function canonicalLanguageUrl(languageSlug: string): string {
  return absoluteUrl(languagePath(languageSlug));
}

export function canonicalPlatformUrl(platform: string): string {
  return absoluteUrl(platformPath(platform));
}

export function canonicalAgeUrl(bandSlug: string): string {
  return absoluteUrl(agePath(bandSlug));
}

export function canonicalEthnicityUrl(ethnicitySlug: string): string {
  return absoluteUrl(ethnicityPath(ethnicitySlug));
}

export function canonicalHairUrl(hairSlug: string): string {
  return absoluteUrl(hairPath(hairSlug));
}

export function canonicalBustUrl(bustSlug: string): string {
  return absoluteUrl(bustPath(bustSlug));
}

export function canonicalFigureUrl(figureSlug: string): string {
  return absoluteUrl(figurePath(figureSlug));
}

export function canonicalComboUrl(comboSlug: string): string {
  return absoluteUrl(comboPath(comboSlug));
}

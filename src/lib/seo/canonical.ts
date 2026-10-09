import { absoluteUrl } from "@/lib/site";
import {
  agePath,
  categoryPath,
  countryPath,
  ethnicityPath,
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

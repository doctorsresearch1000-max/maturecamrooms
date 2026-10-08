export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function modelProfilePath(username: string): string {
  const slug = slugify(username);
  return `/model/${slug || encodeURIComponent(username)}`;
}

export function categoryPath(category: string): string {
  return `/category/${slugify(category)}`;
}

export function tagPath(tagSlug: string): string {
  return `/tag/${tagSlug}`;
}

export function countryPath(countrySlug: string): string {
  return `/country/${countrySlug}`;
}

export function languagePath(languageSlug: string): string {
  return `/language/${languageSlug}`;
}

export function platformPath(platform: string): string {
  return `/platform/${slugify(platform)}`;
}

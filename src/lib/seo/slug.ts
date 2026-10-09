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

export function agePath(bandSlug: string): string {
  return `/age/${slugify(bandSlug)}`;
}

export function ethnicityPath(ethnicitySlug: string): string {
  return `/ethnicity/${slugify(ethnicitySlug)}`;
}

export function hairPath(hairSlug: string): string {
  return `/hair/${slugify(hairSlug)}`;
}

export function bustPath(bustSlug: string): string {
  return `/bust/${slugify(bustSlug)}`;
}

export function figurePath(figureSlug: string): string {
  return `/figure/${slugify(figureSlug)}`;
}

export function comboPath(comboSlug: string): string {
  return `/combo/${slugify(comboSlug)}`;
}

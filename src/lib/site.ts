const trim = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const siteConfig = {
  name: trim(process.env.NEXT_PUBLIC_SITE_NAME, "MatureCamRooms"),
  url: trim(process.env.NEXT_PUBLIC_SITE_URL, "https://maturecamrooms.com"),
  defaultTags: trim(process.env.NEXT_PUBLIC_DEFAULT_TAGS, "milf,mature,cougar,mom")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean),
};

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

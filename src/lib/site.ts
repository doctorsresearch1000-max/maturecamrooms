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
  const pathOnly = path.split("?")[0].split("#")[0];
  const normalized = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return `${base}${normalized}`;
}

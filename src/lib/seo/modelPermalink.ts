import { slugify } from "@/lib/seo/slug";

/**
 * Canonical public model slug for `/model/{username}`.
 * Lowercase, `_` → `-`, no special chars, no trailing/leading hyphens.
 */
export function sanitizeModelSlug(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const decoded = decodeURIComponent(raw).trim().replace(/^@+/, "");
  const normalized = decoded.replace(/_/g, "-");
  const slug = slugify(normalized);
  return slug.length > 0 ? slug : null;
}

/** True when `slug` is already safe for sitemap/indexing (no `_`, matches sanitize). */
export function isSanitizedModelSlug(slug: string): boolean {
  if (!slug || slug.includes("_")) return false;
  const clean = sanitizeModelSlug(slug);
  return clean === slug;
}

/** Internal permalink `/model/{slug}` or null when invalid. */
export function modelProfileHref(raw?: string | null): string | null {
  const slug = sanitizeModelSlug(raw);
  return slug ? `/model/${slug}` : null;
}

/** Internal permalink; falls back to slugify for legacy callers with non-empty raw input. */
export function modelPermalinkPath(raw: string): string {
  const slug =
    sanitizeModelSlug(raw) ??
    slugify(raw.replace(/_/g, "-")) ??
    raw.trim().toLowerCase();
  return `/model/${slug}`;
}

/** Path segment from a request param (before data fetch). */
export function normalizeModelRouteParam(param: string): string | null {
  return sanitizeModelSlug(param);
}

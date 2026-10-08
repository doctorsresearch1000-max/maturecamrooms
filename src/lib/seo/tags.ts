import { slugify } from "@/lib/seo/slug";
import { SITE_CATEGORIES } from "@/lib/seo/config";
import type { CamModel } from "@/lib/models/types";

export type TaxonomyTagType =
  | "category"
  | "attribute"
  | "provider"
  | "other";

export type CanonicalTag = {
  display: string;
  slug: string;
  type: TaxonomyTagType;
};

const SKIP_PREFIXES = ["lang", "gc_"];
const SKIP_EXACT = new Set(["mobilefeed", "woman", "man"]);

function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeRawTag(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  if (!t || t.length < 2) return null;
  if (SKIP_PREFIXES.some((p) => t.startsWith(p))) return null;
  if (SKIP_EXACT.has(t)) return null;
  return t;
}

export function normalizeModelTags(model: CamModel): CanonicalTag[] {
  const seen = new Map<string, CanonicalTag>();

  for (const raw of model.tags) {
    const normalized = normalizeRawTag(raw);
    if (!normalized) continue;

    const slug = slugify(normalized);
    if (!slug || seen.has(slug)) continue;

    const isCategory = (SITE_CATEGORIES as readonly string[]).includes(
      normalized,
    );

    seen.set(slug, {
      display: titleCaseWords(normalized),
      slug,
      type: isCategory ? "category" : "attribute",
    });
  }

  return [...seen.values()].slice(0, 24);
}

export function tagFromSlug(slug: string, displayHint?: string): CanonicalTag {
  const normalized = slugify(slug);
  return {
    slug: normalized,
    display: displayHint ? titleCaseWords(displayHint) : titleCaseWords(normalized.replace(/-/g, " ")),
    type: (SITE_CATEGORIES as readonly string[]).includes(normalized)
      ? "category"
      : "attribute",
  };
}

import { canonicalModelUrl } from "@/lib/seo/canonical";
import {
  isSanitizedModelSlug,
  sanitizeModelSlug,
} from "@/lib/seo/modelPermalink";
import type { CamModel } from "@/lib/models/types";

export type SitemapGuardianRejectReason =
  | "missing_username"
  | "unsanitized_slug"
  | "invalid_canonical_url";

export function guardModelForSitemap(model: CamModel): {
  ok: boolean;
  slug?: string;
  url?: string;
  reason?: SitemapGuardianRejectReason;
} {
  const slug = sanitizeModelSlug(model.username);
  if (!slug) {
    return { ok: false, reason: "missing_username" };
  }
  if (!isSanitizedModelSlug(slug)) {
    return { ok: false, reason: "unsanitized_slug" };
  }
  const url = canonicalModelUrl(slug);
  if (!url.includes(`/model/${slug}`) || url.includes("_")) {
    return { ok: false, reason: "invalid_canonical_url" };
  }
  return { ok: true, slug, url };
}

export function filterModelsForSitemap(models: CamModel[]): CamModel[] {
  const out: CamModel[] = [];
  for (const model of models) {
    const verdict = guardModelForSitemap(model);
    if (!verdict.ok) continue;
    out.push({
      ...model,
      username: verdict.slug!,
    });
  }
  return out;
}

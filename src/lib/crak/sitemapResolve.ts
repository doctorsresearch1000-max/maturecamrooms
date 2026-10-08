import { getModelByUsername } from "@/lib/models/getModels";
import { isModelIndexable } from "@/lib/seo/indexability";
import { canonicalProfileSlug } from "@/lib/crak/sitemapCatalog";
import type { CamModel } from "@/lib/models/types";

export const SITEMAP_RESOLVE_CONCURRENCY = 12;

export type SitemapResolveStats = {
  candidates: number;
  afterIndexability: number;
  resolved: number;
  rejectedNotIndexable: number;
  rejectedUnresolved: number;
  rejectedSlugMismatch: number;
};

export type SitemapResolveResult = {
  models: CamModel[];
  stats: SitemapResolveStats;
};

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/**
 * Same resolution path as model profile pages — list data alone is not enough.
 */
export async function resolveSitemapModels(
  candidates: CamModel[],
): Promise<SitemapResolveResult> {
  const indexable = candidates.filter(isModelIndexable);
  const rejectedNotIndexable = candidates.length - indexable.length;

  const resolved = await mapWithConcurrency(
    indexable,
    SITEMAP_RESOLVE_CONCURRENCY,
    async (model) => {
      const slug = canonicalProfileSlug(model.username);
      const profile = await getModelByUsername(slug, { bypassCache: true });
      if (!profile || !isModelIndexable(profile)) {
        return { ok: false as const, reason: "unresolved" as const };
      }
      if (canonicalProfileSlug(profile.username) !== slug) {
        return { ok: false as const, reason: "slug_mismatch" as const };
      }
      return { ok: true as const, profile };
    },
  );

  const bySlug = new Map<string, CamModel>();
  let rejectedUnresolved = 0;
  let rejectedSlugMismatch = 0;

  for (const entry of resolved) {
    if (!entry.ok) {
      if (entry.reason === "slug_mismatch") rejectedSlugMismatch += 1;
      else rejectedUnresolved += 1;
      continue;
    }
    bySlug.set(
      canonicalProfileSlug(entry.profile.username),
      entry.profile,
    );
  }

  return {
    models: [...bySlug.values()],
    stats: {
      candidates: candidates.length,
      afterIndexability: indexable.length,
      resolved: bySlug.size,
      rejectedNotIndexable,
      rejectedUnresolved,
      rejectedSlugMismatch,
    },
  };
}

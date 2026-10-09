import { getFeaturedModels } from "@/lib/models/getModels";
import {
  facetRedundantWithMature,
  matureCategoryCanonicalUrl,
} from "@/lib/taxonomy/facetCanonical";
import { fetchLiveMenuPool } from "@/lib/taxonomy/fetchLivePool";
import {
  buildTaxonomySeo,
  type TaxonomyKind,
} from "@/lib/seo/taxonomySeo";
import type { CamModel } from "@/lib/models/types";

export async function buildFacetTaxonomyContext(
  kind: TaxonomyKind,
  slug: string,
  label: string,
  filter: (models: CamModel[], slug: string) => CamModel[],
) {
  const result = await getFeaturedModels(96, { live: true });
  const models = filter(result.models, slug);
  const { pool, feedOk } = await fetchLiveMenuPool();
  const livePool = pool.filter((m) => m.isLive);

  let canonicalUrlOverride: string | undefined;
  if (
    feedOk &&
    models.length > 0 &&
    facetRedundantWithMature(livePool, models.map((m) => m.id))
  ) {
    canonicalUrlOverride = matureCategoryCanonicalUrl();
  }

  const seo = buildTaxonomySeo(kind, slug, label, models.length, {
    canonicalUrlOverride,
  });

  return { seo, models, result };
}

import { getFullCatalog, sortCatalogBrowse } from "@/lib/crak/fullCatalog";
import {
  facetRedundantWithMature,
  matureCategoryCanonicalUrl,
} from "@/lib/taxonomy/facetCanonical";
import { FACET_SITEMAP_MIN_COUNT } from "@/lib/taxonomy/settings";
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
  const snapshot = await getFullCatalog();
  const catalog = snapshot.models;
  const filtered = filter(catalog, slug);
  const models = sortCatalogBrowse(filtered).slice(0, 96);
  const catalogCount = filtered.length;

  let canonicalUrlOverride: string | undefined;
  if (
    catalog.length > 0 &&
    catalogCount > 0 &&
    facetRedundantWithMature(catalog, filtered.map((m) => m.id))
  ) {
    canonicalUrlOverride = matureCategoryCanonicalUrl();
  }

  const seo = buildTaxonomySeo(kind, slug, label, catalogCount, {
    canonicalUrlOverride,
    forceIndexable: catalogCount >= FACET_SITEMAP_MIN_COUNT,
  });

  return {
    seo,
    models,
    result: {
      models,
      source: catalog.length ? "crak" : "unconfigured",
      message:
        catalog.length === 0
          ? "Catalog is temporarily unavailable."
          : undefined,
    },
  };
}

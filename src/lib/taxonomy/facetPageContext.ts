import { notFound } from "next/navigation";
import {
  assertFacetIndexable,
  loadCatalogPage,
  type FacetKind,
} from "@/lib/catalog/staticCatalog";
import { cardToCamModel } from "@/lib/catalog/cardToModel";
import {
  applyLiveOverlay,
  fetchLiveOverlay,
  sortWithLiveFirst,
} from "@/lib/crak/liveOverlay";
import { FACET_SITEMAP_MIN_COUNT } from "@/lib/taxonomy/settings";
import {
  buildTaxonomySeo,
  type TaxonomyKind,
} from "@/lib/seo/taxonomySeo";
import type { CamModel } from "@/lib/models/types";

const KIND_TO_FACET: Partial<Record<TaxonomyKind, FacetKind>> = {
  age: "age",
  ethnicity: "ethnicity",
  hair: "hair",
  bust: "bust",
  figure: "figure",
  country: "country",
  language: "language",
  combo: "combo",
};

export async function buildFacetTaxonomyContext(
  kind: TaxonomyKind,
  slug: string,
  label: string,
  _filter?: (models: CamModel[], slug: string) => CamModel[],
) {
  const facetKind = KIND_TO_FACET[kind];
  if (!facetKind) {
    notFound();
  }
  const entry = await assertFacetIndexable(facetKind, slug);
  const catalogCount = entry.count;

  const cards = await loadCatalogPage(facetKind, slug, 1);
  const { liveUsernames } = await fetchLiveOverlay();
  const models = sortWithLiveFirst(
    applyLiveOverlay(cards.map(cardToCamModel), liveUsernames),
  ).slice(0, 96);

  const seo = buildTaxonomySeo(kind, slug, label, catalogCount, {
    forceIndexable: catalogCount >= FACET_SITEMAP_MIN_COUNT,
  });

  return {
    seo,
    models,
    result: {
      models,
      source: "crak" as const,
    },
  };
}

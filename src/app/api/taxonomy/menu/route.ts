import { getFullCatalog } from "@/lib/crak/fullCatalog";
import { buildCatalogMenuInventory } from "@/lib/taxonomy/catalogInventory";
import { fetchLiveMenuPool } from "@/lib/taxonomy/fetchLivePool";
import {
  CATEGORY_DISPLAY,
  SITE_CATEGORIES,
  type SiteCategory,
} from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";

export const runtime = "edge";

export async function GET() {
  const snapshot = await getFullCatalog();
  const catalogOk = snapshot.models.length > 0;
  const inventory = buildCatalogMenuInventory(snapshot.models, catalogOk);

  const { pool, feedOk } = await fetchLiveMenuPool();
  const liveCount = feedOk ? pool.filter((m) => m.isLive).length : undefined;

  const categories = catalogOk
    ? inventory.niches
    : SITE_CATEGORIES.map((slug: SiteCategory) => ({
        slug,
        label: CATEGORY_DISPLAY[slug],
        href: categoryPath(slug),
        count: undefined as number | undefined,
      }));

  return Response.json({
    feedOk,
    liveCount,
    catalogOk: inventory.catalogOk,
    catalogCount: inventory.catalogCount,
    categories,
    categoryCounts: Object.fromEntries(
      inventory.niches.map((n) => [n.slug, n.count]),
    ),
    niches: inventory.niches,
    segments: inventory.segments,
    ageBands: inventory.ageBands,
    ethnicities: inventory.ethnicities,
    hairs: inventory.hairs,
    busts: inventory.busts,
    figures: inventory.figures,
    countries: inventory.countries,
    languages: inventory.languages,
    headerChips: catalogOk ? inventory.headerChips : [],
    nicheCanonicalTo: inventory.nicheCanonicalTo,
  });
}

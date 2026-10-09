import { buildLiveMenuInventory } from "@/lib/taxonomy/liveMenuInventory";
import { fetchLiveMenuPool } from "@/lib/taxonomy/fetchLivePool";
import { CATEGORY_DISPLAY, SITE_CATEGORIES, type SiteCategory } from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";

export const runtime = "edge";

export async function GET() {
  const { pool, feedOk } = await fetchLiveMenuPool();
  const inventory = buildLiveMenuInventory(pool, feedOk);

  const categories = feedOk
    ? inventory.niches
    : SITE_CATEGORIES.map((slug: SiteCategory) => ({
        slug,
        label: CATEGORY_DISPLAY[slug],
        href: categoryPath(slug),
        count: undefined as number | undefined,
      }));

  return Response.json({
    feedOk: inventory.feedOk,
    liveCount: inventory.feedOk ? inventory.liveCount : undefined,
    categories,
    categoryCounts: Object.fromEntries(
      inventory.niches.map((n) => [n.slug, n.count]),
    ),
    niches: inventory.niches,
    ageBands: inventory.ageBands,
    ethnicities: inventory.ethnicities,
    hairs: inventory.hairs,
    countries: inventory.countries,
    headerChips: inventory.feedOk ? inventory.headerChips : [],
    nicheCanonicalTo: inventory.nicheCanonicalTo,
  });
}

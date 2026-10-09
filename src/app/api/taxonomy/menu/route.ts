import { getTaxonomyMenuPayload } from "@/lib/taxonomy/menuPayload";

export const runtime = "edge";

export async function GET() {
  const menu = await getTaxonomyMenuPayload();
  return Response.json({
    feedOk: menu.feedOk,
    liveCount: menu.liveCount,
    catalogOk: menu.catalogOk,
    catalogCount: menu.catalogCount,
    categories: menu.categories,
    categoryCounts: Object.fromEntries(
      menu.categories.map((n) => [n.slug, n.count ?? 0]),
    ),
    niches: menu.categories,
    segments: menu.segments,
    ageBands: menu.ageBands,
    ethnicities: menu.ethnicities,
    hairs: menu.hairs,
    busts: menu.busts,
    figures: menu.figures,
    countries: menu.countries,
    languages: menu.languages,
    headerChips: menu.headerChips,
    nicheCanonicalTo: menu.nicheCanonicalTo,
  });
}

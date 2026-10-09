import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeDiscovery } from "@/components/discovery/HomeDiscovery";
import { ModelGridSkeleton } from "@/components/cams/ModelCardSkeleton";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { browseCatalog } from "@/lib/models/catalogBrowse";
import { getTaxonomyMenuPayload } from "@/lib/taxonomy/menuPayload";
import {
  CATEGORY_DISPLAY,
  NAV_SITE_CATEGORIES,
} from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Live Mature & MILF Cams",
  description:
    "Browse mature and MILF webcam models — live and catalog profiles. Free to explore HD cams — 18+ only.",
  openGraph: {
    title: `Live Mature & MILF Cams | ${siteConfig.name}`,
    description:
      "Mobile-friendly grid of mature performers with lazy-loaded thumbnails.",
  },
};

type PageProps = {
  searchParams: Promise<{ filter?: string; page?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const filter = params.filter ?? "all";
  const useCatalog =
    filter === "all" || filter === "mature" || filter === "milf";

  const catalogResult = useCatalog
    ? await browseCatalog({
        page,
        limit: 48,
        category: filter === "all" ? undefined : filter,
        liveOnly: false,
      })
    : filter === "live"
      ? await browseCatalog({ page, limit: 48, liveOnly: true })
      : await browseCatalog({ page: 1, limit: 48 });

  const menu = await getTaxonomyMenuPayload().catch(() => null);

  const crawlLinks = menu
    ? [
        ...menu.ageBands,
        ...menu.ethnicities,
        ...menu.hairs,
        ...menu.busts,
        ...menu.figures,
        ...menu.countries,
        ...menu.languages,
        ...menu.categories,
      ]
    : [];

  return (
    <>
      {catalogResult.models.length > 0 ? (
        <HomeJsonLd models={catalogResult.models} />
      ) : null}
      <noscript>
        <div className="border-b border-border bg-surface px-4 py-6 text-sm text-text-secondary">
          <p className="mb-3 text-white">
            Browse {siteConfig.name} categories without JavaScript:
          </p>
          <ul className="flex flex-wrap gap-2">
            {NAV_SITE_CATEGORIES.map((cat) => (
              <li key={cat}>
                <a
                  href={categoryPath(cat)}
                  className="rounded-full border border-border px-3 py-1.5 font-semibold text-white"
                >
                  {CATEGORY_DISPLAY[cat]}
                </a>
              </li>
            ))}
          </ul>
          {crawlLinks.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {crawlLinks.slice(0, 40).map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-white underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {catalogResult.models.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {catalogResult.models.slice(0, 48).map((m) => (
                <li key={m.id}>
                  <a href={`/model/${m.username}`} className="text-white underline">
                    {m.displayName}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </noscript>
      <Suspense
        fallback={
          <div className="p-4">
            <ModelGridSkeleton />
          </div>
        }
      >
        <HomeDiscovery
          models={catalogResult.models}
          catalogTotal={catalogResult.total}
          liveCount={menu?.liveCount}
          statusMessage={catalogResult.message}
          unconfigured={
            catalogResult.source === "unconfigured" ||
            catalogResult.source === "error"
          }
        />
      </Suspense>
    </>
  );
}

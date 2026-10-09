import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeDiscovery } from "@/components/discovery/HomeDiscovery";
import { ModelGridSkeleton } from "@/components/cams/ModelCardSkeleton";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { getFeaturedModels } from "@/lib/models/getModels";
import { CATEGORY_DISPLAY, SITE_CATEGORIES } from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Live Mature & MILF Cams",
  description:
    "Browse live mature, MILF, cougar and mom webcam models. Free to explore HD live cams — 18+ only.",
  openGraph: {
    title: `Live Mature & MILF Cams | ${siteConfig.name}`,
    description:
      "Mobile-friendly grid of live mature performers with lazy-loaded thumbnails.",
  },
};

export default async function HomePage() {
  const result = await getFeaturedModels(24);

  return (
    <>
      {result.models.length > 0 ? <HomeJsonLd models={result.models} /> : null}
      <noscript>
        <div className="border-b border-border bg-surface px-4 py-6 text-sm text-text-secondary">
          <p className="mb-3 text-white">
            Browse {siteConfig.name} categories without JavaScript:
          </p>
          <ul className="flex flex-wrap gap-2">
            {SITE_CATEGORIES.map((cat) => (
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
          {result.models.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {result.models.slice(0, 24).map((m) => (
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
          models={result.models}
          statusMessage={result.message}
          unconfigured={result.source === "unconfigured" || result.source === "error"}
        />
      </Suspense>
    </>
  );
}

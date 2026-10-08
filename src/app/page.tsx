import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeDiscovery } from "@/components/discovery/HomeDiscovery";
import { ModelGridSkeleton } from "@/components/cams/ModelCardSkeleton";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { getFeaturedModels } from "@/lib/models/getModels";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Live Mature & MILF Cams",
  description:
    "Browse live mature, MILF, cougar, and mom cam models. Sponsored 18+ affiliate links.",
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

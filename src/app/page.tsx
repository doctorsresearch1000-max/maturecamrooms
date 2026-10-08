import type { Metadata } from "next";
import { ModelGrid } from "@/components/cams/ModelGrid";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { getFeaturedModels } from "@/lib/models/getModels";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Live Mature & MILF Cams",
  description:
    "Browse live mature, MILF, cougar, and mom cam models. Sponsored 18+ affiliate links to Stripchat, Chaturbate, and smartlinks.",
  openGraph: {
    title: `Live Mature & MILF Cams | ${siteConfig.name}`,
    description:
      "Mobile-friendly grid of live mature performers with lazy-loaded thumbnails.",
  },
};

export default async function HomePage() {
  const models = await getFeaturedModels(24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <HomeJsonLd models={models} />
      <section aria-labelledby="home-hero">
        <h1
          id="home-hero"
          className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
        >
          Live Mature & MILF Cam Rooms
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Curated for the {siteConfig.defaultTags.join(", ")} niche. Thumbnails
          load lazily; outbound room links are{" "}
          <span className="text-zinc-300">nofollow sponsored</span>. 18+ only.
        </p>
      </section>
      <section className="mt-8" aria-label="Live model grid">
        <ModelGrid models={models} />
      </section>
    </div>
  );
}

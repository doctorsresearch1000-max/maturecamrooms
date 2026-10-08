import type { Metadata } from "next";
import { HomeDiscovery } from "@/components/discovery/HomeDiscovery";
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
    <>
      <HomeJsonLd models={models} />
      <HomeDiscovery models={models} />
    </>
  );
}

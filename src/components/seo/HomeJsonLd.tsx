import { absoluteUrl, siteConfig } from "@/lib/site";
import type { CamModel } from "@/lib/models/types";
import { buildAffiliateRoomUrl } from "@/lib/affiliate/links";

type HomeJsonLdProps = {
  models: CamModel[];
};

export function HomeJsonLd({ models }: HomeJsonLdProps) {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${siteConfig.name} — Live Mature & MILF Cams`,
    description:
      "Discover live mature, MILF, and cougar cam performers. Fast, mobile-friendly grid with sponsored 18+ room links.",
    url: absoluteUrl("/"),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured mature cam models",
    itemListElement: models.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoObject",
        name: `${model.displayName} live cam`,
        description: `Live ${model.tags.join(", ")} cam show — 18+`,
        thumbnailUrl: model.thumbnailUrl,
        uploadDate: new Date().toISOString().split("T")[0],
        contentUrl: buildAffiliateRoomUrl(model.platform, model.username),
        isLiveBroadcast: model.isLive,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </>
  );
}

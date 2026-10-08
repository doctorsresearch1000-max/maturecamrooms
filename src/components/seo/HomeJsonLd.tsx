import { absoluteUrl, siteConfig } from "@/lib/site";
import { canonicalModelUrl } from "@/lib/seo/canonical";
import type { CamModel } from "@/lib/models/types";

type HomeJsonLdProps = {
  models: CamModel[];
};

export function HomeJsonLd({ models }: HomeJsonLdProps) {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${siteConfig.name} — Live Mature & MILF Cams`,
    description:
      "Discover live mature, MILF and cougar webcam models. Mobile-friendly HD live cam directory for adults 18+.",
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
      url: canonicalModelUrl(model.username),
      item: {
        "@type": "Person",
        name: model.displayName.trim(),
        alternateName: model.username,
        url: canonicalModelUrl(model.username),
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

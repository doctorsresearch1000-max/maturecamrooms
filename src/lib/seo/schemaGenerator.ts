import { absoluteUrl, siteConfig } from "@/lib/site";
import { canonicalModelUrl } from "@/lib/seo/canonical";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbGenerator";
import type { CamModel } from "@/lib/models/types";

export function buildBreadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http")
        ? item.href
        : absoluteUrl(item.href),
    })),
  };
}

export function buildModelWebPageSchema(
  model: CamModel,
  title: string,
  description: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonicalModelUrl(model.username),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };
}

/** Person-like entity only when we have a real display name + profile URL (no fabricated fields). */
export function buildModelProfileEntitySchema(model: CamModel) {
  const url = canonicalModelUrl(model.username);
  const username = model.username.trim();
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: model.displayName.trim(),
    alternateName: username,
    url,
  };
  if (model.thumbnailUrl?.startsWith("https://")) {
    schema.image = model.thumbnailUrl;
  }
  const country = model.country?.trim();
  if (country && country.length > 2) {
    schema.nationality = country;
  }
  return schema;
}

export type ModelStructuredData = {
  breadcrumb: ReturnType<typeof buildBreadcrumbListSchema>;
  webPage: ReturnType<typeof buildModelWebPageSchema>;
  profile?: ReturnType<typeof buildModelProfileEntitySchema>;
};

export function buildModelStructuredData(
  model: CamModel,
  breadcrumbs: BreadcrumbItem[],
  title: string,
  description: string,
): ModelStructuredData {
  return {
    breadcrumb: buildBreadcrumbListSchema(breadcrumbs),
    webPage: buildModelWebPageSchema(model, title, description),
    profile: buildModelProfileEntitySchema(model),
  };
}

export function buildTaxonomyWebPageSchema(
  title: string,
  description: string,
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };
}

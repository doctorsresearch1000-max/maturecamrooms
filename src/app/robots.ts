import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

const CRAWL_ALLOW_PREFIXES = [
  "/",
  "/model/",
  "/category/",
  "/age/",
  "/ethnicity/",
  "/hair/",
  "/country/",
  "/bust/",
  "/figure/",
  "/combo/",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [...CRAWL_ALLOW_PREFIXES],
      disallow: ["/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}

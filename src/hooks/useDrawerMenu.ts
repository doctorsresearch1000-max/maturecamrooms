"use client";

import { useEffect, useState } from "react";
import {
  CATEGORY_DISPLAY,
  NAV_SITE_CATEGORIES,
  type NavSiteCategory,
} from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";
import type { MenuFacetItem } from "@/lib/taxonomy/liveMenuInventory";

export type TaxonomyCategoryItem = {
  slug: string;
  label: string;
  href: string;
  count?: number;
  icon?: string;
};

export type DrawerCountryItem = TaxonomyCategoryItem & { count: number };

type DrawerMenuState = {
  feedOk: boolean;
  liveCount: number | undefined;
  catalogOk: boolean;
  catalogCount: number;
  categories: TaxonomyCategoryItem[];
  segments: TaxonomyCategoryItem[];
  ageBands: TaxonomyCategoryItem[];
  ethnicities: TaxonomyCategoryItem[];
  hairs: TaxonomyCategoryItem[];
  busts: TaxonomyCategoryItem[];
  figures: TaxonomyCategoryItem[];
  countries: DrawerCountryItem[];
  languages: TaxonomyCategoryItem[];
  headerChips: TaxonomyCategoryItem[];
  loading: boolean;
};

function staticFallback(): Omit<DrawerMenuState, "loading"> {
  const categories = NAV_SITE_CATEGORIES.map((slug: NavSiteCategory) => ({
    slug,
    label: CATEGORY_DISPLAY[slug],
    href: categoryPath(slug),
  }));
  return {
    feedOk: false,
    liveCount: undefined,
    catalogOk: false,
    catalogCount: 0,
    categories,
    segments: [],
    ageBands: [],
    ethnicities: [],
    hairs: [],
    busts: [],
    figures: [],
    countries: [],
    languages: [],
    headerChips: [],
  };
}

export function useDrawerMenu(enabled = true) {
  const [state, setState] = useState<DrawerMenuState>({
    ...staticFallback(),
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/taxonomy/menu")
      .then((r) => r.json())
      .then(
        (data: {
          feedOk?: boolean;
          liveCount?: number;
          catalogOk?: boolean;
          catalogCount?: number;
          categories?: TaxonomyCategoryItem[];
          segments?: MenuFacetItem[];
          ageBands?: MenuFacetItem[];
          ethnicities?: MenuFacetItem[];
          hairs?: MenuFacetItem[];
          busts?: MenuFacetItem[];
          figures?: MenuFacetItem[];
          countries?: DrawerCountryItem[];
          languages?: MenuFacetItem[];
          headerChips?: MenuFacetItem[];
        }) => {
          if (cancelled) return;
          const feedOk = Boolean(data.feedOk);
          const catalogOk = Boolean(data.catalogOk);
          const fallback = staticFallback();
          setState({
            feedOk,
            liveCount:
              feedOk && typeof data.liveCount === "number"
                ? data.liveCount
                : undefined,
            catalogOk,
            catalogCount:
              typeof data.catalogCount === "number" ? data.catalogCount : 0,
            categories:
              data.categories?.length ? data.categories : fallback.categories,
            segments: data.segments ?? [],
            ageBands: catalogOk ? (data.ageBands ?? []) : [],
            ethnicities: catalogOk ? (data.ethnicities ?? []) : [],
            hairs: catalogOk ? (data.hairs ?? []) : [],
            busts: catalogOk ? (data.busts ?? []) : [],
            figures: catalogOk ? (data.figures ?? []) : [],
            countries: catalogOk ? (data.countries ?? []) : [],
            languages: catalogOk ? (data.languages ?? []) : [],
            headerChips: catalogOk ? (data.headerChips ?? []) : [],
            loading: false,
          });
        },
      )
      .catch(() => {
        if (!cancelled) {
          setState({ ...staticFallback(), loading: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}

"use client";

import { useEffect, useState } from "react";
import type { MenuFacetItem } from "@/lib/taxonomy/liveMenuInventory";

export type TaxonomyCategoryItem = {
  slug: string;
  label: string;
  href: string;
  count?: number;
  icon?: string;
};

export type DrawerCountryItem = {
  slug: string;
  label: string;
  href: string;
  count: number;
  icon?: string;
};

type DrawerMenuState = {
  feedOk: boolean;
  liveCount: number | undefined;
  categories: TaxonomyCategoryItem[];
  ageBands: TaxonomyCategoryItem[];
  ethnicities: TaxonomyCategoryItem[];
  hairs: TaxonomyCategoryItem[];
  busts: TaxonomyCategoryItem[];
  figures: TaxonomyCategoryItem[];
  languages: TaxonomyCategoryItem[];
  segments: TaxonomyCategoryItem[];
  countries: DrawerCountryItem[];
  headerChips: TaxonomyCategoryItem[];
  loading: boolean;
};

export function useDrawerMenu(enabled = true) {
  const [state, setState] = useState<DrawerMenuState>({
    feedOk: false,
    liveCount: undefined,
    categories: [],
    ageBands: [],
    ethnicities: [],
    hairs: [],
    busts: [],
    figures: [],
    languages: [],
    segments: [],
    countries: [],
    headerChips: [],
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
          categories?: TaxonomyCategoryItem[];
          ageBands?: MenuFacetItem[];
          ethnicities?: MenuFacetItem[];
          hairs?: MenuFacetItem[];
          busts?: MenuFacetItem[];
          figures?: MenuFacetItem[];
          languages?: MenuFacetItem[];
          segments?: MenuFacetItem[];
          countries?: DrawerCountryItem[];
          headerChips?: MenuFacetItem[];
        }) => {
          if (cancelled) return;
          const feedOk = Boolean(data.feedOk);
          setState({
            feedOk,
            liveCount:
              feedOk && typeof data.liveCount === "number"
                ? data.liveCount
                : undefined,
            categories: data.categories ?? [],
            ageBands: data.ageBands ?? [],
            ethnicities: data.ethnicities ?? [],
            hairs: data.hairs ?? [],
            busts: data.busts ?? [],
            figures: data.figures ?? [],
            languages: data.languages ?? [],
            segments: data.segments ?? [],
            countries: data.countries ?? [],
            headerChips: data.headerChips ?? [],
            loading: false,
          });
        },
      )
      .catch(() => {
        if (!cancelled) {
          setState({
            feedOk: false,
            liveCount: undefined,
            categories: [],
            ageBands: [],
            ethnicities: [],
            hairs: [],
            busts: [],
            figures: [],
            languages: [],
            segments: [],
            countries: [],
            headerChips: [],
            loading: false,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}

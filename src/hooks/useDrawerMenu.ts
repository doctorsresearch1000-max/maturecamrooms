"use client";

import { useEffect, useState } from "react";
import type { TaxonomyCategoryItem } from "@/hooks/useTaxonomyCategories";

export type DrawerCountryItem = {
  slug: string;
  label: string;
  href: string;
  count: number;
};

type DrawerMenuState = {
  liveCount: number;
  categories: TaxonomyCategoryItem[];
  countries: DrawerCountryItem[];
  loading: boolean;
};

export function useDrawerMenu(enabled = true) {
  const [state, setState] = useState<DrawerMenuState>({
    liveCount: 0,
    categories: [],
    countries: [],
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/taxonomy/menu")
      .then((r) => r.json())
      .then(
        (data: {
          liveCount?: number;
          categories?: TaxonomyCategoryItem[];
          countries?: DrawerCountryItem[];
        }) => {
          if (cancelled) return;
          setState({
            liveCount: data.liveCount ?? 0,
            categories: data.categories ?? [],
            countries: data.countries ?? [],
            loading: false,
          });
        },
      )
      .catch(() => {
        if (!cancelled) {
          setState({
            liveCount: 0,
            categories: [],
            countries: [],
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

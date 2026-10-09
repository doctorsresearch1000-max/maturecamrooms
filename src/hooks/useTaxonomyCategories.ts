"use client";

import { useEffect, useState } from "react";

export type TaxonomyCategoryItem = {
  slug: string;
  label: string;
  href: string;
  count: number;
};

type State = {
  categories: TaxonomyCategoryItem[];
  loading: boolean;
};

export function useTaxonomyCategories(enabled = true) {
  const [state, setState] = useState<State>({
    categories: [],
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/taxonomy/categories")
      .then((r) => r.json())
      .then((data: { categories?: TaxonomyCategoryItem[] }) => {
        if (cancelled) return;
        setState({
          categories: data.categories ?? [],
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ categories: [], loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}

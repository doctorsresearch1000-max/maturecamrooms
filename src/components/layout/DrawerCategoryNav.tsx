"use client";

import Link from "next/link";
import { useTaxonomyCategories } from "@/hooks/useTaxonomyCategories";

type DrawerCategoryNavProps = {
  onNavigate?: () => void;
};

export function DrawerCategoryNav({ onNavigate }: DrawerCategoryNavProps) {
  const { categories, loading } = useTaxonomyCategories(true);

  return (
    <div>
      <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
        Categories
      </p>
      {loading && categories.length === 0 ? (
        <p className="px-3 py-2 text-xs text-text-muted">Loading categories…</p>
      ) : categories.length === 0 ? (
        <p className="px-3 py-2 text-xs text-text-muted">
          No categories available right now.
        </p>
      ) : (
        <ul className="space-y-0.5" role="list">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={cat.href}
                onClick={onNavigate}
                className="flex min-h-[44px] items-center justify-between rounded-lg px-3 font-medium text-white transition hover:bg-surface-hover"
              >
                <span>{cat.label}</span>
                <span className="text-xs font-semibold tabular-nums text-text-muted">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useShell } from "@/components/layout/ShellContext";
import { countryLabel } from "@/lib/country";
import type { CamModel, ModelsResult } from "@/lib/models/types";

export function SearchPanel() {
  const { searchOpen, setSearchOpen } = useShell();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<CamModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<CamModel[] | null>(null);

  useEffect(() => {
    if (!searchOpen || catalog.length > 0) return;
    setLoading(true);
    fetch("/api/models")
      .then((r) => r.json())
      .then((data: ModelsResult) => setCatalog(data.models ?? []))
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, [searchOpen, catalog.length]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResult(null);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/models?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data: ModelsResult) => setSearchResult(data.models ?? []))
        .catch(() => setSearchResult([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = searchResult ?? (q ? [] : catalog);
    if (!q) return { models: pool.slice(0, 12), categories: [] as string[] };

    const categories = ["mature", "milf", "cougar"].filter((c) =>
      c.includes(q),
    );
    return { models: pool, categories };
  }, [query, catalog, searchResult]);

  const close = useCallback(() => setSearchOpen(false), [setSearchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <input
          type="search"
          autoFocus
          placeholder="Search models, tags, countries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[44px] flex-1 rounded-md border border-border bg-surface px-4 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={close}
          className="min-h-[44px] px-3 text-sm font-medium text-text-secondary"
        >
          Cancel
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : query.trim() === "" ? (
          <p className="text-sm text-text-muted">Type to search performers.</p>
        ) : results.models.length === 0 && results.categories.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No results for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <>
            {results.models.length > 0 ? (
              <section className="mb-6">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  Models
                </h2>
                <ul className="space-y-2">
                  {results.models.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/model/${m.username}`}
                        onClick={close}
                        className="flex min-h-[44px] items-center justify-between rounded-md px-3 py-2 hover:bg-surface-hover"
                      >
                        <span className="font-medium">
                          {m.displayName}
                          {m.isLive ? (
                            <span className="ml-2 text-xs text-live">LIVE</span>
                          ) : null}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {m.age !== undefined ? `${m.age} · ` : ""}
                          {countryLabel(m.countryCode, m.country)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {results.categories.length > 0 ? (
              <section>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  Categories
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {results.categories.map((c) => (
                    <li key={c}>
                      <Link
                        href={`/category/${c}`}
                        onClick={close}
                        className="rounded-full border border-border px-3 py-1.5 text-sm capitalize hover:bg-surface-hover"
                      >
                        {c}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

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
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchOpen || catalog.length > 0) return;
    setLoading(true);
    fetch("/api/models?limit=48&live=all")
      .then((r) => r.json())
      .then((data: ModelsResult) => setCatalog(data.models ?? []))
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, [searchOpen, catalog.length]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResult(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      fetch(`/api/models?q=${encodeURIComponent(q)}&limit=24`)
        .then((r) => r.json())
        .then((data: ModelsResult) => setSearchResult(data.models ?? []))
        .catch(() => setSearchResult([]))
        .finally(() => setSearching(false));
    }, 150);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = searchResult ?? (q ? [] : catalog);
    if (!q) return { models: pool.slice(0, 16), categories: [] as string[] };

    const categories = ["mature", "milf"].filter((c) =>
      c.includes(q),
    );
    return { models: pool, categories };
  }, [query, catalog, searchResult]);

  const close = useCallback(() => setSearchOpen(false), [setSearchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <label className="sr-only" htmlFor="model-search-input">
          Search models
        </label>
        <input
          id="model-search-input"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoFocus
          autoComplete="off"
          placeholder="Search by name, tag or country"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[44px] flex-1 rounded-lg border border-border bg-surface px-4 text-base text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={close}
          className="min-h-[44px] shrink-0 px-3 text-base font-medium text-text-secondary"
        >
          Cancel
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-base text-text-muted">Loading models…</p>
        ) : searching ? (
          <p className="text-base text-text-muted">Searching…</p>
        ) : query.trim() === "" ? (
          <p className="text-base text-text-muted">
            Type a model name to find her live cam profile.
          </p>
        ) : results.models.length === 0 && results.categories.length === 0 ? (
          <p className="text-base text-text-secondary">
            No models found for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <>
            {results.models.length > 0 ? (
              <section className="mb-6">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  Models
                </h2>
                <ul className="space-y-1">
                  {results.models.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/model/${m.username}`}
                        onClick={close}
                        className="flex min-h-[48px] items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-hover active:bg-surface-hover"
                      >
                        <span className="text-base font-medium">
                          {m.displayName}
                          {m.isLive ? (
                            <span className="ml-2 text-xs font-bold text-live">
                              LIVE
                            </span>
                          ) : null}
                        </span>
                        <span className="text-sm text-text-secondary">
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
                        className="rounded-full border border-border px-3 py-2 text-base capitalize hover:bg-surface-hover"
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useShell } from "@/components/layout/ShellContext";
import { countryLabel } from "@/lib/country";
import type { CamModel } from "@/lib/models/types";

export function SearchPanel() {
  const { searchOpen, setSearchOpen } = useShell();
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<CamModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchOpen || models.length > 0) return;
    setLoading(true);
    fetch("/api/models")
      .then((r) => r.json())
      .then((data: CamModel[]) => setModels(data))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, [searchOpen, models.length]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { models: [], categories: [] as string[] };
    const matched = models.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        countryLabel(m.countryCode, m.country).toLowerCase().includes(q),
    );
    const categories = ["mature", "milf", "cougar"].filter((c) =>
      c.includes(q),
    );
    return { models: matched.slice(0, 12), categories };
  }, [query, models]);

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
          <p className="text-sm text-text-muted">Type to search the catalog.</p>
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
                        href={
                          m.isLive
                            ? `/model/${m.username}`
                            : `/model/${m.username}`
                        }
                        onClick={close}
                        className="flex min-h-[44px] items-center justify-between rounded-md px-3 py-2 hover:bg-surface-hover"
                      >
                        <span className="font-medium">{m.displayName}</span>
                        <span className="text-xs text-text-secondary">
                          {m.age} · {countryLabel(m.countryCode, m.country)}
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

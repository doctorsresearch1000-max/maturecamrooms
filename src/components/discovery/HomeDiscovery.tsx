"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModelGrid } from "@/components/cams/ModelGrid";
import { ModelCardSkeleton } from "@/components/cams/ModelCardSkeleton";
import { FilterBar, type DiscoveryFilter } from "@/components/discovery/FilterBar";
import type { CamModel, ModelsResult } from "@/lib/models/types";

type HomeDiscoveryProps = {
  models: CamModel[];
  statusMessage?: string;
  unconfigured?: boolean;
};

const PAGE_SIZE = 24;

function parseFilter(param: string | null): DiscoveryFilter {
  const allowed: DiscoveryFilter[] = [
    "live",
    "all",
    "mature",
    "milf",
    "cougar",
    "popular",
    "new",
  ];
  if (param && allowed.includes(param as DiscoveryFilter)) {
    return param as DiscoveryFilter;
  }
  return "live";
}

function mergeUnique(existing: CamModel[], incoming: CamModel[]): CamModel[] {
  const seen = new Set(existing.map((m) => m.id));
  const next = [...existing];
  for (const m of incoming) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    next.push(m);
  }
  return next;
}

function sectionTitle(filter: DiscoveryFilter): string {
  if (filter === "live") return "Live now";
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}

export function HomeDiscovery({
  models: initialModels,
  statusMessage,
  unconfigured,
}: HomeDiscoveryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<DiscoveryFilter>(() =>
    parseFilter(searchParams.get("filter")),
  );
  const [catalog, setCatalog] = useState<CamModel[]>(initialModels);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const inflightRef = useRef(false);
  const initialHydrated = useRef(false);

  useEffect(() => {
    setFilter(parseFilter(searchParams.get("filter")));
  }, [searchParams]);

  const fetchPage = useCallback(
    async (targetPage: number, activeFilter: DiscoveryFilter) => {
      const res = await fetch(
        `/api/models?page=${targetPage}&limit=${PAGE_SIZE}&filter=${activeFilter}`,
      );
      const data = (await res.json()) as ModelsResult;
      return {
        models: data.models ?? [],
        hasMore: Boolean(data.hasMore) && (data.models?.length ?? 0) > 0,
      };
    },
    [],
  );

  useEffect(() => {
    if (unconfigured) return;
    if (!initialHydrated.current && filter === "live") {
      initialHydrated.current = true;
      setCatalog(initialModels);
      setPage(1);
      setHasMore(initialModels.length >= PAGE_SIZE);
      return;
    }
    initialHydrated.current = true;
    let cancelled = false;
    setFilterLoading(true);
    setPage(1);
    fetchPage(1, filter)
      .then(({ models, hasMore: more }) => {
        if (cancelled) return;
        setCatalog(models);
        setHasMore(more);
      })
      .catch(() => {
        if (!cancelled) {
          setCatalog([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setFilterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, fetchPage, initialModels, unconfigured]);

  const loadNextPage = useCallback(async () => {
    if (inflightRef.current || loadingMore || filterLoading || !hasMore || unconfigured) {
      return;
    }
    inflightRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { models: batch, hasMore: more } = await fetchPage(nextPage, filter);
      setCatalog((prev) => mergeUnique(prev, batch));
      setPage(nextPage);
      setHasMore(more);
    } catch {
      setHasMore(false);
    } finally {
      inflightRef.current = false;
      setLoadingMore(false);
    }
  }, [
    fetchPage,
    filter,
    filterLoading,
    hasMore,
    loadingMore,
    page,
    unconfigured,
  ]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || filterLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNextPage();
      },
      { rootMargin: "320px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, filterLoading, loadNextPage, catalog.length]);

  const handleFilterChange = (next: DiscoveryFilter) => {
    setFilter(next);
    const path = next === "live" ? "/" : `/?filter=${next}`;
    router.replace(path, { scroll: false });
  };

  const liveCount = useMemo(
    () => catalog.filter((m) => m.isLive).length,
    [catalog],
  );

  const showGridSkeleton = filterLoading && catalog.length === 0;

  return (
    <>
      <div
        className="sticky top-[var(--header-h)] z-40 border-b border-white/[0.08] bg-[var(--header-bg)] lg:static lg:border-0 lg:bg-transparent"
      >
        <FilterBar active={filter} onChange={handleFilterChange} />
      </div>

      <div className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6">
        <section aria-labelledby="home-hero" className="mb-2 sm:mb-3">
          <h1
            id="home-hero"
            className="sr-only sm:not-sr-only sm:text-xl sm:font-bold sm:tracking-tight sm:text-foreground"
          >
            {liveCount > 0
              ? `${liveCount} mature live cam models online`
              : "Mature & MILF live cam models"}
          </h1>
          <p className="hidden text-sm text-text-secondary sm:block">
            Watch mature, MILF and cougar webcam performers in HD. Free to browse ·
            18+ only
          </p>
          {unconfigured ? (
            <p className="mt-2 rounded-md border border-white/10 bg-surface-elevated px-3 py-2 text-xs text-text-secondary">
              {statusMessage}
            </p>
          ) : statusMessage ? (
            <p className="mt-2 text-xs text-text-muted">{statusMessage}</p>
          ) : null}
        </section>

        {showGridSkeleton ? (
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ModelCardSkeleton key={i} />
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <p className="mt-6 rounded-card border border-border bg-surface px-4 py-10 text-center text-sm text-text-secondary">
            {unconfigured
              ? "Live listings will appear here when the feed is connected."
              : "No models match this view. Try another filter."}
          </p>
        ) : (
          <section
            className="mt-2 sm:mt-6"
            aria-labelledby="discovery-grid-title"
          >
            <h2
              id="discovery-grid-title"
              className="mb-1.5 hidden items-center gap-1.5 text-sm font-semibold text-foreground sm:mb-3 sm:flex sm:gap-2 sm:text-lg"
            >
              {filter === "live" ? (
                <span
                  className="inline-flex h-1.5 w-1.5 rounded-full bg-accent sm:h-2 sm:w-2"
                  aria-hidden
                />
              ) : null}
              {sectionTitle(filter)}
            </h2>
            <ModelGrid models={catalog} />
            <div
              ref={loadMoreRef}
              className="flex min-h-[3rem] flex-col items-center justify-center gap-2 py-4"
              aria-live="polite"
            >
              {loadingMore ? (
                <>
                  <span
                    className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-accent"
                    aria-hidden
                  />
                  <p className="text-xs text-text-muted">Loading more models…</p>
                </>
              ) : hasMore ? (
                <span className="sr-only">More models load as you scroll</span>
              ) : (
                <p className="text-xs text-text-muted">You&apos;ve seen all models</p>
              )}
            </div>
          </section>
        )}

        {loadingMore && catalog.length > 0 ? (
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ModelCardSkeleton key={i} />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

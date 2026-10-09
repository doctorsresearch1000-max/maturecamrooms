"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModelGrid } from "@/components/cams/ModelGrid";
import { ModelCardSkeleton } from "@/components/cams/ModelCardSkeleton";
import { FilterBar, type DiscoveryFilter } from "@/components/discovery/FilterBar";
import { HeaderFacetChips } from "@/components/discovery/HeaderFacetChips";
import type { CamModel, ModelsResult } from "@/lib/models/types";

type HomeDiscoveryProps = {
  models: CamModel[];
  catalogTotal?: number;
  liveCount?: number;
  statusMessage?: string;
  unconfigured?: boolean;
};

const PAGE_SIZE = 48;
const MAX_MOUNTED_CARDS_MOBILE = 144;
const MAX_MOUNTED_CARDS_DESKTOP = 216;

function maxMountedCards(): number {
  if (typeof window === "undefined") return MAX_MOUNTED_CARDS_DESKTOP;
  return window.innerWidth >= 1024
    ? MAX_MOUNTED_CARDS_DESKTOP
    : MAX_MOUNTED_CARDS_MOBILE;
}

function parseFilter(param: string | null): DiscoveryFilter {
  const allowed: DiscoveryFilter[] = [
    "live",
    "all",
    "mature",
    "milf",
    "popular",
    "new",
  ];
  if (param && allowed.includes(param as DiscoveryFilter)) {
    return param as DiscoveryFilter;
  }
  return "all";
}

function mergeUnique(existing: CamModel[], incoming: CamModel[]): CamModel[] {
  const cap = maxMountedCards();
  const seen = new Set(existing.map((m) => m.id));
  const next = [...existing];
  for (const m of incoming) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    next.push(m);
  }
  if (next.length > cap) {
    return next.slice(next.length - cap);
  }
  return next;
}

function sectionTitle(filter: DiscoveryFilter): string {
  if (filter === "live") return "Live now";
  if (filter === "all") return "All models";
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}

export function HomeDiscovery({
  models: initialModels,
  catalogTotal: initialCatalogTotal,
  liveCount: initialLiveCount,
  statusMessage,
  unconfigured,
}: HomeDiscoveryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<DiscoveryFilter>(() =>
    parseFilter(searchParams.get("filter")),
  );
  const [catalog, setCatalog] = useState<CamModel[]>(initialModels);
  const urlPage = useMemo(
    () => Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
    [searchParams],
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [feedBroadened, setFeedBroadened] = useState(false);
  const [totalModels, setTotalModels] = useState<number | undefined>(
    initialCatalogTotal,
  );
  const [liveCount, setLiveCount] = useState<number | undefined>(
    initialLiveCount,
  );
  const [loadedCount, setLoadedCount] = useState(initialModels.length);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const inflightRef = useRef(false);

  useEffect(() => {
    setFilter(parseFilter(searchParams.get("filter")));
  }, [searchParams]);

  const fetchPage = useCallback(
    async (targetPage: number, activeFilter: DiscoveryFilter) => {
      const res = await fetch(
        `/api/models?page=${targetPage}&limit=${PAGE_SIZE}&filter=${activeFilter}`,
      );
      const data = (await res.json()) as ModelsResult & { total?: number };
      const batch = data.models ?? [];
      return {
        models: batch,
        hasMore: Boolean(data.hasMore) && batch.length > 0,
        broadened: Boolean(data.broadened),
        total: data.total,
      };
    },
    [],
  );

  useEffect(() => {
    if (unconfigured) return;
    let cancelled = false;
    setFilterLoading(true);
    setFeedBroadened(false);
    fetchPage(urlPage, filter)
      .then(({ models, hasMore: more, broadened, total }) => {
        if (cancelled) return;
        setCatalog(models);
        setLoadedCount(models.length);
        setPage(urlPage);
        setHasMore(more);
        setFeedBroadened(Boolean(broadened));
        if (total !== undefined) setTotalModels(total);
      })
      .catch(() => {
        if (!cancelled) {
          setCatalog(initialModels);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setFilterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, urlPage, fetchPage, unconfigured, initialModels]);

  useEffect(() => {
    fetch("/api/taxonomy/menu")
      .then((r) => r.json())
      .then((data: { liveCount?: number; catalogCount?: number }) => {
        if (typeof data.liveCount === "number") setLiveCount(data.liveCount);
        if (typeof data.catalogCount === "number" && !initialCatalogTotal) {
          setTotalModels(data.catalogCount);
        }
      })
      .catch(() => {
        /* keep SSR values */
      });
  }, [initialCatalogTotal]);

  const loadNextPage = useCallback(async () => {
    if (inflightRef.current || loadingMore || filterLoading || !hasMore || unconfigured) {
      return;
    }
    inflightRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { models: batch, hasMore: more, broadened, total } =
        await fetchPage(nextPage, filter);
      setCatalog((prev) => mergeUnique(prev, batch));
      setLoadedCount((c) => c + batch.length);
      setPage(nextPage);
      setHasMore(more);
      if (broadened) setFeedBroadened(true);
      if (total !== undefined) setTotalModels(total);
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
      { rootMargin: "400px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, filterLoading, loadNextPage, catalog.length]);

  const handleFilterChange = (next: DiscoveryFilter) => {
    setFilter(next);
    setPage(1);
    const path =
      next === "all" ? "/" : next === "live" ? "/?filter=live" : `/?filter=${next}`;
    router.replace(path, { scroll: false });
  };

  const displayLiveCount = liveCount ?? 0;
  const catalogTotal = totalModels ?? initialCatalogTotal;

  const heroLine = useMemo(() => {
    if (filter === "live") {
      return displayLiveCount > 0
        ? `${displayLiveCount} live now`
        : "Live mature cam models";
    }
    const livePart =
      displayLiveCount > 0 ? `${displayLiveCount} live now` : null;
    const catalogPart =
      catalogTotal && catalogTotal > 0
        ? `${catalogTotal.toLocaleString()} in catalog`
        : null;
    if (livePart && catalogPart) return `${livePart} · ${catalogPart}`;
    return catalogPart ?? livePart ?? "Mature & MILF cam models";
  }, [filter, displayLiveCount, catalogTotal]);

  const showGridSkeleton = filterLoading && catalog.length === 0;

  return (
    <>
      <div
        className="sticky top-[var(--header-stack-h,var(--header-h-mobile))] z-40 border-b border-white/[0.08] bg-[var(--header-bg)] lg:static lg:border-0 lg:bg-transparent"
      >
        <HeaderFacetChips />
        <FilterBar active={filter} onChange={handleFilterChange} />
      </div>

      <div className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6">
        <section aria-labelledby="home-hero" className="mb-2 sm:mb-3">
          <h1
            id="home-hero"
            className="sr-only sm:not-sr-only sm:text-xl sm:font-bold sm:tracking-tight sm:text-foreground"
          >
            {heroLine}
          </h1>
          <p className="hidden text-sm text-text-secondary sm:block">
            Watch mature and MILF webcam performers in HD. Free to browse · 18+
            only
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
              ? "Listings will appear here when the catalog is connected."
              : "No models match this view. Try another filter."}
          </p>
        ) : (
          <section
            className="mt-2 sm:mt-6"
            aria-labelledby="discovery-grid-title"
          >
            {feedBroadened && filter !== "live" && filter !== "all" ? (
              <p className="mb-2 rounded-md border border-white/[0.08] bg-surface-elevated px-3 py-2 text-xs text-text-secondary">
                Few {filter} models live right now — showing catalog matches so
                you can keep browsing.
              </p>
            ) : null}
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
              {filter !== "live" && loadedCount > 0 ? (
                <span className="text-sm font-normal text-text-muted">
                  ({loadedCount} loaded)
                </span>
              ) : null}
            </h2>
            <ModelGrid models={catalog} />
            {(filter === "all" || filter === "mature" || filter === "milf") &&
            catalogTotal &&
            catalogTotal > PAGE_SIZE ? (
              <nav
                className="mt-4 flex flex-wrap justify-center gap-2 text-xs"
                aria-label="Crawlable pagination"
              >
                {Array.from(
                  { length: Math.min(20, Math.ceil(catalogTotal / PAGE_SIZE)) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <a
                    key={p}
                    href={
                      filter === "all"
                        ? p === 1
                          ? "/"
                          : `/?filter=all&page=${p}`
                        : `/?filter=${filter}&page=${p}`
                    }
                    className="rounded border border-white/10 px-2 py-1 text-text-muted hover:text-white"
                  >
                    Page {p}
                  </a>
                ))}
              </nav>
            ) : null}
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

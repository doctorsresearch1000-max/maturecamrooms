"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function applyFilter(models: CamModel[], filter: DiscoveryFilter): CamModel[] {
  switch (filter) {
    case "live":
      return models.filter((m) => m.isLive);
    case "mature":
      return models.filter((m) =>
        m.tags.some((t) => t.toLowerCase() === "mature"),
      );
    case "milf":
      return models.filter((m) =>
        m.tags.some((t) => t.toLowerCase() === "milf"),
      );
    case "cougar":
      return models.filter((m) =>
        m.tags.some((t) => t.toLowerCase() === "cougar"),
      );
    case "popular":
      return [...models].sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0) || (b.viewers ?? 0) - (a.viewers ?? 0),
      );
    case "new":
      return [...models].reverse();
    case "all":
    default:
      return models;
  }
}

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

function DiscoverySection({
  title,
  models,
  loadMoreRef,
  loadingMore,
  hasMore,
}: {
  title: string;
  models: CamModel[];
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  loadingMore?: boolean;
  hasMore?: boolean;
}) {
  return (
    <section
      className="mt-2 sm:mt-6"
      aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <h2
        id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground sm:mb-3 sm:gap-2 sm:text-lg"
      >
        {title === "Live now" ? (
          <span
            className="inline-flex h-1.5 w-1.5 rounded-full bg-live sm:h-2 sm:w-2"
            aria-hidden
          />
        ) : null}
        {title}
      </h2>
      <ModelGrid models={models} />
      {loadMoreRef ? (
        <div ref={loadMoreRef} className="flex justify-center py-4" aria-hidden>
          {loadingMore ? (
            <p className="text-sm text-text-muted">Loading more models…</p>
          ) : hasMore ? (
            <span className="h-4 w-4" />
          ) : models.length > 0 ? (
            <p className="text-xs text-text-muted">You&apos;ve seen all models</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function HomeDiscovery({
  models: initialModels,
  statusMessage,
  unconfigured,
}: HomeDiscoveryProps) {
  const searchParams = useSearchParams();
  const initial = parseFilter(searchParams.get("filter"));
  const [filter, setFilter] = useState<DiscoveryFilter>(initial);
  const [catalog, setCatalog] = useState<CamModel[]>(initialModels);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCatalog(initialModels);
    setPage(1);
    setHasMore(true);
  }, [initialModels]);

  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore || unconfigured) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(
        `/api/models?page=${nextPage}&limit=${PAGE_SIZE}&live=true`,
      );
      const data = (await res.json()) as ModelsResult;
      const batch = data.models ?? [];
      setCatalog((prev) => mergeUnique(prev, batch));
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore) && batch.length > 0);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page, unconfigured]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNextPage();
      },
      { rootMargin: "240px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  const filtered = useMemo(
    () => applyFilter(catalog, filter),
    [catalog, filter],
  );

  const liveModels = useMemo(
    () => catalog.filter((m) => m.isLive),
    [catalog],
  );

  const popularModels = useMemo(
    () =>
      [...catalog]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 8),
    [catalog],
  );

  const liveCount = liveModels.length;

  const infiniteProps = {
    loadMoreRef,
    loadingMore,
    hasMore: filter !== "all" && hasMore,
  };

  return (
    <div className="px-1.5 py-2 sm:px-4 sm:py-4 lg:px-6">
      <section aria-labelledby="home-hero" className="mb-1 sm:mb-3">
        <h1
          id="home-hero"
          className="text-base font-bold tracking-tight text-foreground sm:text-xl"
        >
          {liveCount > 0
            ? `${liveCount} mature live cam models online`
            : "Mature & MILF live cam models"}
        </h1>
        <p className="mt-0.5 text-[11px] leading-snug text-text-secondary sm:text-sm">
          Watch mature, MILF and cougar webcam performers in HD. Free to browse ·
          18+ only
        </p>
        {unconfigured ? (
          <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {statusMessage}
          </p>
        ) : statusMessage ? (
          <p className="mt-2 text-xs text-text-muted">{statusMessage}</p>
        ) : null}
      </section>

      <FilterBar active={filter} onChange={setFilter} />

      {catalog.length === 0 ? (
        <p className="mt-6 rounded-card border border-border bg-surface px-4 py-10 text-center text-sm text-text-secondary">
          {unconfigured
            ? "Live listings will appear here when the feed is connected."
            : "No models match this view. Try another filter."}
        </p>
      ) : filter !== "all" ? (
        <DiscoverySection
          title={
            filter === "live"
              ? "Live now"
              : filter.charAt(0).toUpperCase() + filter.slice(1)
          }
          models={filtered}
          {...infiniteProps}
        />
      ) : (
        <>
          {liveModels.length > 0 ? (
            <DiscoverySection title="Live now" models={liveModels} />
          ) : null}
          <DiscoverySection
            title="All models"
            models={filtered}
            {...infiniteProps}
          />
          {popularModels.length > 0 ? (
            <DiscoverySection title="Popular now" models={popularModels} />
          ) : null}
        </>
      )}

      {loadingMore && catalog.length > 0 ? (
        <div className="mt-2 grid grid-cols-2 gap-1 sm:gap-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ModelCardSkeleton key={i} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

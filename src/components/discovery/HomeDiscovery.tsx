"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ModelGrid } from "@/components/cams/ModelGrid";
import { FilterBar, type DiscoveryFilter } from "@/components/discovery/FilterBar";
import type { CamModel } from "@/lib/models/types";

type HomeDiscoveryProps = {
  models: CamModel[];
  statusMessage?: string;
  unconfigured?: boolean;
};

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

function DiscoverySection({
  title,
  models,
}: {
  title: string;
  models: CamModel[];
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
    </section>
  );
}

export function HomeDiscovery({
  models,
  statusMessage,
  unconfigured,
}: HomeDiscoveryProps) {
  const searchParams = useSearchParams();
  const initial = parseFilter(searchParams.get("filter"));
  const [filter, setFilter] = useState<DiscoveryFilter>(initial);

  const filtered = useMemo(
    () => applyFilter(models, filter),
    [models, filter],
  );

  const liveModels = useMemo(
    () => models.filter((m) => m.isLive),
    [models],
  );

  const popularModels = useMemo(
    () =>
      [...models]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 8),
    [models],
  );

  const liveCount = liveModels.length;

  return (
    <div className="px-1.5 py-2 sm:px-4 sm:py-4 lg:px-6">
      <section aria-labelledby="home-hero" className="mb-1 sm:mb-3">
        <h1
          id="home-hero"
          className="text-base font-bold tracking-tight text-foreground sm:text-xl"
        >
          {liveCount > 0
            ? `${liveCount} mature models live now`
            : "Mature cam discovery"}
        </h1>
        <p className="mt-0.5 text-[11px] leading-snug text-text-secondary sm:text-sm">
          Real performer data via CrakRevenue · 18+ sponsored room links
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

      {models.length === 0 ? (
        <p className="mt-6 rounded-card border border-border bg-surface px-4 py-10 text-center text-sm text-text-secondary">
          {unconfigured
            ? "Configure server credentials to load live performers."
            : "No performers match this view. Try another filter."}
        </p>
      ) : filter !== "all" ? (
        <DiscoverySection
          title={
            filter === "live"
              ? "Live now"
              : filter.charAt(0).toUpperCase() + filter.slice(1)
          }
          models={filtered}
        />
      ) : (
        <>
          {liveModels.length > 0 ? (
            <DiscoverySection title="Live now" models={liveModels} />
          ) : null}
          <DiscoverySection title="All models" models={filtered} />
          {popularModels.length > 0 ? (
            <DiscoverySection title="Popular now" models={popularModels} />
          ) : null}
        </>
      )}
    </div>
  );
}

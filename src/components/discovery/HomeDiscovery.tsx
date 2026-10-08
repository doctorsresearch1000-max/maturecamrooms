"use client";

import { useMemo, useState } from "react";
import { ModelGrid } from "@/components/cams/ModelGrid";
import { FilterBar, type DiscoveryFilter } from "@/components/discovery/FilterBar";
import type { CamModel } from "@/lib/models/types";

type HomeDiscoveryProps = {
  models: CamModel[];
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
    case "popular":
      return [...models].sort((a, b) => b.viewers - a.viewers);
    case "new":
      return [...models].reverse();
    case "all":
    default:
      return models;
  }
}

function DiscoverySection({
  title,
  models,
}: {
  title: string;
  models: CamModel[];
}) {
  if (models.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        <p className="mt-3 text-sm text-zinc-500">
          No models match this filter right now. Try another category.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8" aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <h2
        id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-50"
      >
        {title === "Live now" ? (
          <span
            className="inline-flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            aria-hidden
          />
        ) : null}
        {title}
      </h2>
      <ModelGrid models={models} />
    </section>
  );
}

export function HomeDiscovery({ models }: HomeDiscoveryProps) {
  const [filter, setFilter] = useState<DiscoveryFilter>("live");

  const filtered = useMemo(
    () => applyFilter(models, filter),
    [models, filter],
  );

  const liveModels = useMemo(
    () => models.filter((m) => m.isLive),
    [models],
  );

  const popularModels = useMemo(
    () => [...models].sort((a, b) => b.viewers - a.viewers).slice(0, 8),
    [models],
  );

  const showLiveSection = filter === "live" || filter === "all";
  const showPopularSection = filter === "all" || filter === "popular";

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <section aria-labelledby="home-hero" className="mb-4">
        <h1
          id="home-hero"
          className="text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl"
        >
          Live mature cam discovery
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Browse live MILF and mature performers. Tap a room to watch — sponsored
          18+ links.
        </p>
      </section>

      <FilterBar active={filter} onChange={setFilter} />

      {filter !== "all" ? (
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
          {showLiveSection && liveModels.length > 0 ? (
            <DiscoverySection title="Live now" models={liveModels} />
          ) : null}
          <DiscoverySection title="All models" models={filtered} />
          {showPopularSection && popularModels.length > 0 ? (
            <DiscoverySection title="Popular now" models={popularModels} />
          ) : null}
        </>
      )}
    </div>
  );
}

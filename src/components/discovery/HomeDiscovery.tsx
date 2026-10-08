"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
    case "cougar":
      return models.filter((m) =>
        m.tags.some((t) => t.toLowerCase() === "cougar"),
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
      className="mt-4 sm:mt-6"
      aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <h2
        id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg"
      >
        {title === "Live now" ? (
          <span
            className="inline-flex h-2 w-2 rounded-full bg-live shadow-[0_0_8px_rgba(244,63,94,0.7)]"
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
    () => [...models].sort((a, b) => b.viewers - a.viewers).slice(0, 8),
    [models],
  );

  const liveCount = liveModels.length;

  return (
    <div className="px-2 py-3 sm:px-4 sm:py-4 lg:px-6">
      <section aria-labelledby="home-hero" className="mb-2 sm:mb-3">
        <h1
          id="home-hero"
          className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          {liveCount > 0
            ? `${liveCount} mature models live now`
            : "Mature cam discovery"}
        </h1>
        <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
          Image-first feed · Sponsored 18+ room links
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

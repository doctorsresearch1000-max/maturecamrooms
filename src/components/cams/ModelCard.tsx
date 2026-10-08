import Link from "next/link";
import { FavoriteButton } from "@/components/cams/FavoriteButton";
import { countryCodeToFlag, countryLabel } from "@/lib/country";
import type { CamModel } from "@/lib/models/types";

type ModelCardProps = {
  model: CamModel;
  priority?: boolean;
};

export function ModelCard({ model, priority = false }: ModelCardProps) {
  const profileHref = `/model/${model.username}`;
  const flag = countryCodeToFlag(model.countryCode);
  const country = countryLabel(model.countryCode, model.country);
  const categoryLine = model.tags
    .slice(0, 2)
    .map((t) => t.toUpperCase())
    .join(" · ");

  const cardClass =
    "relative block aspect-[3/4] overflow-hidden rounded-card bg-surface-elevated";

  const inner = (
    <>
      {model.thumbnailUrl ? (
        <img
          src={model.thumbnailUrl}
          alt={`${model.displayName}${model.age ? `, ${model.age}` : ""}`}
          className={`absolute inset-0 h-full w-full object-cover transition duration-base group-hover:scale-[1.03] ${
            model.isLive ? "" : "opacity-85 saturate-[0.85]"
          }`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-hover" />
      )}

      {model.isLive ? (
        <span
          className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-live px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          Live
        </span>
      ) : (
        <span
          className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-text-secondary backdrop-blur-sm"
        >
          {model.recentlyOnline ? "Recently online" : "Offline"}
        </span>
      )}

      <div className="absolute right-1.5 top-1.5 z-10">
        <FavoriteButton modelId={model.id} />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2 pb-2 pt-10"
      >
        <p className="truncate text-[15px] font-semibold leading-tight text-white">
          {model.displayName}
          {model.age ? (
            <span className="font-normal text-white/80"> · {model.age}</span>
          ) : null}
          {flag ? (
            <span className="ml-1 text-sm" aria-hidden>{flag}</span>
          ) : null}
        </p>
        {country ? (
          <p className="truncate text-[11px] text-white/70">{country}</p>
        ) : null}
        {categoryLine ? (
          <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-white/55">
            {categoryLine}
          </p>
        ) : null}
        {model.viewers !== undefined && model.viewers > 0 ? (
          <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-medium text-white/90">
            <span aria-hidden>👁</span>
            {model.viewers.toLocaleString()}
          </p>
        ) : null}
      </div>

      <span
        className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/40 opacity-0 transition duration-base group-hover:opacity-100 md:flex"
      >
        <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {model.isLive ? "Watch live" : "View profile"}
        </span>
      </span>
    </>
  );

  return (
    <article className="group relative">
      <Link
        href={profileHref}
        className={cardClass}
        aria-label={`View ${model.displayName} profile`}
      >
        {inner}
      </Link>
    </article>
  );
}

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
    "relative block aspect-[3/4] touch-manipulation overflow-hidden rounded-[10px] border border-white/[0.06] bg-surface-elevated sm:rounded-card";

  const inner = (
    <>
      {model.thumbnailUrl ? (
        <img
          src={model.thumbnailUrl}
          alt={`${model.displayName}${model.age ? `, ${model.age}` : ""}`}
          className={`absolute inset-0 h-full w-full object-cover transition duration-base group-hover:scale-[1.02] ${
            model.isLive ? "" : "opacity-90 saturate-[0.9]"
          }`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-hover" />
      )}

      {model.isLive ? (
        <span
          className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-live/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:left-1.5 sm:top-1.5 sm:gap-1 sm:px-2 sm:text-[10px]"
        >
          <span className="h-1 w-1 rounded-full bg-white sm:h-1.5 sm:w-1.5" aria-hidden />
          Live
        </span>
      ) : (
        <span
          className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-medium uppercase text-white/80 sm:left-1.5 sm:top-1.5 sm:text-[10px]"
        >
          {model.recentlyOnline ? "Recent" : "Off"}
        </span>
      )}

      <div className="absolute right-1 top-1 z-20 sm:right-1.5 sm:top-1.5">
        <FavoriteButton modelId={model.id} />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent px-1.5 pb-1.5 pt-6 sm:px-2 sm:pb-2 sm:pt-8"
      >
        <p className="truncate text-[13px] font-semibold leading-tight text-white sm:text-[15px]">
          {model.displayName}
          {model.age ? (
            <span className="font-normal text-white/85"> · {model.age}</span>
          ) : null}
          {flag ? (
            <span className="ml-0.5 text-xs sm:ml-1 sm:text-sm" aria-hidden>
              {flag}
            </span>
          ) : null}
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-1 text-[10px] text-white/65 sm:text-[11px]">
          <span className="min-w-0 truncate">
            {country || categoryLine || "\u00a0"}
          </span>
          {model.viewers !== undefined && model.viewers > 0 ? (
            <span className="shrink-0 font-medium text-white/85">
              {model.viewers.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>

      <span
        className="pointer-events-none absolute inset-0 z-0 hidden items-center justify-center bg-black/40 opacity-0 transition duration-base group-hover:opacity-100 md:flex"
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

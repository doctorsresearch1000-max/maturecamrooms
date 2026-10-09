import Link from "next/link";
import { FavoriteButton } from "@/components/cams/FavoriteButton";
import { countryCodeToFlag } from "@/lib/country";
import { formatViewerCount } from "@/lib/formatViewers";
import type { CamModel } from "@/lib/models/types";

type ModelCardProps = {
  model: CamModel;
  priority?: boolean;
};

/** ~10% shorter than 3:4 — more rows visible at 390px without shrinking type. */
const CARD_ASPECT =
  "aspect-[5/6] lg:aspect-[3/4]";

export function ModelCard({ model, priority = false }: ModelCardProps) {
  const profileHref = `/model/${model.username}`;
  const flag = countryCodeToFlag(model.countryCode);
  const viewerLabel =
    model.viewers !== undefined && model.viewers > 0
      ? formatViewerCount(model.viewers)
      : null;

  const cardClass = `relative block ${CARD_ASPECT} touch-manipulation overflow-hidden rounded-[var(--radius-card)] border border-white/[0.05] bg-surface-elevated shadow-[0_2px_10px_rgba(0,0,0,0.28)]`;

  const inner = (
    <>
      {model.thumbnailUrl ? (
        <img
          src={model.thumbnailUrl}
          alt={`${model.displayName}${model.age ? `, ${model.age}` : ""}`}
          className={`absolute inset-0 h-full w-full object-cover transition duration-base group-hover:scale-[1.015] ${
            model.isLive ? "" : "opacity-88 saturate-[0.92]"
          }`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-hover" />
      )}

      {model.isLive ? (
        <span
          className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/95"
        >
          <span
            className="live-dot-subtle h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden
          />
          Live
        </span>
      ) : (
        <span
          className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white/70"
        >
          {model.recentlyOnline ? "Recent" : "Off"}
        </span>
      )}

      <div className="absolute right-1 top-1 z-20">
        <FavoriteButton
          modelId={model.id}
          className="!h-7 !w-7 !bg-black/35 !text-[15px] backdrop-blur-[2px]"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[3.25rem] items-end justify-between gap-1 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-2 pb-1.5 pt-6"
      >
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-snug text-white">
          {model.displayName}
          {model.age ? (
            <span className="font-medium text-white/88"> · {model.age}</span>
          ) : null}
          {flag ? (
            <span className="ml-0.5 text-[11px]" aria-hidden>{flag}</span>
          ) : null}
        </p>
        {viewerLabel ? (
          <span className="shrink-0 pb-0.5 text-[10px] font-medium text-white/75">
            {viewerLabel}
          </span>
        ) : (
          <span className="shrink-0 pb-0.5 text-[10px] opacity-0" aria-hidden>
            ·
          </span>
        )}
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

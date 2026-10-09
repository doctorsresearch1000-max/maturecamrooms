import Link from "next/link";
import { FavoriteButton } from "@/components/cams/FavoriteButton";
import { countryCodeToFlag } from "@/lib/country";
import { formatViewerCount } from "@/lib/formatViewers";
import type { CamModel } from "@/lib/models/types";

type ModelCardProps = {
  model: CamModel;
  priority?: boolean;
};

export function ModelCard({ model, priority = false }: ModelCardProps) {
  const profileHref = `/model/${model.username}`;
  const flag = countryCodeToFlag(model.countryCode);
  const viewerLabel =
    model.viewers !== undefined && model.viewers > 0
      ? formatViewerCount(model.viewers)
      : null;

  const cardClass =
    "relative block aspect-[3/4] touch-manipulation overflow-hidden rounded-[var(--radius-card)] bg-surface-elevated shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:rounded-card";

  const inner = (
    <>
      {model.thumbnailUrl ? (
        <img
          src={model.thumbnailUrl}
          alt={`${model.displayName}${model.age ? `, ${model.age}` : ""}`}
          className={`absolute inset-0 h-full w-full object-cover transition duration-base group-hover:scale-[1.02] ${
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
          className="live-pulse absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Live
        </span>
      ) : (
        <span
          className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur-sm"
        >
          {model.recentlyOnline ? "Recent" : "Off"}
        </span>
      )}

      <div className="absolute right-1.5 top-1.5 z-20">
        <FavoriteButton
          modelId={model.id}
          className="!h-8 !w-8 !bg-black/40 !text-base"
        />
      </div>

      {viewerLabel ? (
        <span
          className="pointer-events-none absolute bottom-9 right-2 z-10 text-[10px] font-medium text-white/80"
        >
          {viewerLabel}
        </span>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent px-2 pb-2 pt-10"
      >
        <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-white">
          {model.displayName}
          {model.age ? (
            <span className="font-normal text-white/90"> · {model.age}</span>
          ) : null}
          {flag ? (
            <span className="ml-1 text-sm" aria-hidden>{flag}</span>
          ) : null}
        </p>
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

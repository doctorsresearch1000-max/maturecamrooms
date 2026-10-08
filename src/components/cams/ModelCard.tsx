import Image from "next/image";
import {
  affiliateLinkProps,
  buildAffiliateRoomUrl,
} from "@/lib/affiliate/links";
import type { CamModel } from "@/lib/models/types";

type ModelCardProps = {
  model: CamModel;
  priority?: boolean;
};

export function ModelCard({ model, priority = false }: ModelCardProps) {
  const href = buildAffiliateRoomUrl(model.platform, model.username);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-lg shadow-black/40 transition hover:border-rose-500/40 hover:shadow-rose-900/20"
    >
      <a
        href={href}
        className="relative block aspect-[3/4] overflow-hidden bg-zinc-900"
        {...affiliateLinkProps()}
        aria-label={`Watch ${model.displayName} live — 18+ sponsored link`}
      >
        <Image
          src={model.thumbnailUrl}
          alt={`${model.displayName}, ${model.age} — live mature cam`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
        {model.isLive ? (
          <span
            className="absolute left-2 top-2 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          >
            Live
          </span>
        ) : null}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs text-zinc-200">
          {model.viewers.toLocaleString()} watching
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h2 className="truncate text-sm font-semibold text-zinc-50">
          <a
            href={href}
            className="hover:text-rose-300"
            {...affiliateLinkProps()}
          >
            {model.displayName}
          </a>
        </h2>
        <p className="text-xs text-zinc-400">
          {model.age} · {model.platform}
          {model.countryCode ? ` · ${model.countryCode}` : ""}
        </p>
        <ul className="mt-1 flex flex-wrap gap-1">
          {model.tags.slice(0, 4).map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300"
            >
              {tag}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-zinc-500">Sponsored · 18+ only</p>
      </div>
    </article>
  );
}

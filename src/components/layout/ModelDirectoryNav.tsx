"use client";

import Link from "next/link";
import { useModelDirectory } from "@/hooks/useModelDirectory";
import { CATEGORY_DISPLAY, SITE_CATEGORIES } from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";

type ModelDirectoryNavProps = {
  variant: "header" | "drawer";
  onNavigate?: () => void;
};

export function ModelDirectoryNav({
  variant,
  onNavigate,
}: ModelDirectoryNavProps) {
  const { models, loading } = useModelDirectory(true);

  const linkClass =
    variant === "header"
      ? "shrink-0 rounded-full border border-border/80 bg-surface-elevated/80 px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent/40 hover:text-foreground"
      : "flex min-h-[44px] items-center justify-between rounded-lg px-3 font-medium text-foreground transition hover:bg-surface-hover";

  return (
    <div className={variant === "header" ? "min-w-0 flex-1" : ""}>
      {variant === "drawer" ? (
        <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Live models
        </p>
      ) : null}
      {loading && models.length === 0 ? (
        <p className="px-2 text-xs text-text-muted">Loading models…</p>
      ) : models.length === 0 ? (
        <p className="px-2 text-xs text-text-muted">No live models right now.</p>
      ) : (
        <ul
          className={
            variant === "header"
              ? "scrollbar-none flex items-center gap-1.5 overflow-x-auto py-0.5"
              : "max-h-[40vh] space-y-0.5 overflow-y-auto"
          }
          role="list"
        >
          {models.map((m) => (
            <li key={m.id} className={variant === "header" ? "" : ""}>
              <Link
                href={`/model/${m.username}`}
                onClick={onNavigate}
                className={linkClass}
              >
                <span className="truncate">
                  {m.displayName}
                  {m.isLive ? (
                    <span className="ml-1 text-[10px] font-bold text-live">
                      LIVE
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {variant === "drawer" ? (
        <div className="mt-4">
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Categories
          </p>
          <ul className="flex flex-wrap gap-2 px-2">
            {SITE_CATEGORIES.map((cat) => (
              <li key={cat}>
                <Link
                  href={categoryPath(cat)}
                  onClick={onNavigate}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-foreground"
                >
                  {CATEGORY_DISPLAY[cat]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

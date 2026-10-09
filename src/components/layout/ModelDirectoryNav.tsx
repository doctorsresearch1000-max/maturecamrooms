"use client";

import Link from "next/link";
import { useModelDirectory } from "@/hooks/useModelDirectory";

export function ModelDirectoryNav() {
  const { models, loading } = useModelDirectory(true);

  const linkClass =
    "shrink-0 rounded-full border border-border/80 bg-surface-elevated/80 px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent/40 hover:text-white";

  return (
    <div className="min-w-0 flex-1">
      {loading && models.length === 0 ? (
        <p className="px-2 text-xs text-text-muted">Loading models…</p>
      ) : models.length === 0 ? (
        <p className="px-2 text-xs text-text-muted">No live models right now.</p>
      ) : (
        <ul
          className="scrollbar-none flex items-center gap-1.5 overflow-x-auto py-0.5"
          role="list"
        >
          {models.map((m) => (
            <li key={m.id}>
              <Link href={`/model/${m.username}`} className={linkClass}>
                <span className="truncate">
                  {m.displayName}
                  {m.isLive ? (
                    <span className="ml-1 text-[10px] font-bold text-accent">
                      LIVE
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

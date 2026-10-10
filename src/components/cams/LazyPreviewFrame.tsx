"use client";

import { useState } from "react";
import { applyCrakTrackingSubId } from "@/lib/affiliate/crak-subid";
import { affiliateLinkProps } from "@/lib/affiliate/links";

type LazyPreviewFrameProps = {
  embedUrl?: string;
  fallbackHref: string;
  title: string;
};

/**
 * Defers iframe embed until the user opts in — keeps initial paint fast.
 */
export function LazyPreviewFrame({
  embedUrl,
  fallbackHref,
  title,
}: LazyPreviewFrameProps) {
  const [showFrame, setShowFrame] = useState(false);

  if (!embedUrl) {
    return null;
  }

  if (!showFrame) {
    return (
      <button
        type="button"
        onClick={() => setShowFrame(true)}
        className="w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-8 text-sm text-zinc-300 transition hover:border-rose-500/50 hover:text-rose-200"
      >
        Load live preview for {title} (18+)
      </button>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800">
      <iframe
        src={embedUrl}
        title={`${title} live preview`}
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer"
        allow="autoplay; encrypted-media"
      />
      <a
        href={fallbackHref}
        className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white"
        {...affiliateLinkProps()}
      >
        Open full room
      </a>
    </div>
  );
}

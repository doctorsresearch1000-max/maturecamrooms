"use client";

import { useState } from "react";
import Image from "next/image";
import { pickSafeStreamUrl } from "@/lib/crak/allowlist";

type LiveStreamEmbedProps = {
  live: boolean;
  iframeFeedUrl?: string;
  streamFeedUrl?: string;
  thumbnailUrl?: string;
  name: string;
};

export function LiveStreamEmbed({
  live,
  iframeFeedUrl,
  streamFeedUrl,
  thumbnailUrl,
  name,
}: LiveStreamEmbedProps) {
  const [loadError, setLoadError] = useState(false);
  const safeUrl = pickSafeStreamUrl(iframeFeedUrl, streamFeedUrl);

  if (live && safeUrl && !loadError) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black sm:aspect-[16/9] sm:max-h-[min(70vh,520px)]">
        <iframe
          src={safeUrl}
          title={`${name} live stream`}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setLoadError(true)}
        />
        <span
          className="pointer-events-none absolute left-3 top-3 flex items-center gap-1 rounded-md bg-live px-2.5 py-1 text-xs font-bold uppercase text-white"
        >
          <span className="h-2 w-2 rounded-full bg-white" aria-hidden />
          Live
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-surface-elevated sm:aspect-[16/9] sm:max-h-[min(70vh,520px)]">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4 text-center">
        <p className="text-sm font-medium text-foreground">
          {live
            ? "Live stream is temporarily unavailable."
            : "This model is offline."}
        </p>
      </div>
    </div>
  );
}

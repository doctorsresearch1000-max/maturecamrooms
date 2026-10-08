"use client";

import { useEffect, useRef, useState } from "react";
import { pickSafeStreamUrl } from "@/lib/crak/allowlist";
import type { CamModel } from "@/lib/models/types";

type ModelCardLiveMediaProps = {
  model: CamModel;
  priority?: boolean;
};

export function ModelCardLiveMedia({
  model,
  priority = false,
}: ModelCardLiveMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const safeStreamUrl = pickSafeStreamUrl(model.iframeFeedUrl);

  useEffect(() => {
    if (!model.isLive || !safeStreamUrl) return;

    if (priority) {
      setStreamActive(true);
      return;
    }

    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStreamActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px", threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [model.isLive, safeStreamUrl, priority]);

  const showStream = model.isLive && safeStreamUrl && streamActive;

  return (
    <div ref={rootRef} className="absolute inset-0">
      {model.thumbnailUrl ? (
        <img
          src={model.thumbnailUrl}
          alt={`${model.displayName}${model.age ? `, ${model.age}` : ""}`}
          className={`absolute inset-0 h-full w-full object-cover transition duration-base group-hover:scale-[1.03] ${
            showStream ? "opacity-0" : model.isLive ? "" : "opacity-85 saturate-[0.85]"
          }`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-hover" />
      )}

      {showStream ? (
        <iframe
          src={safeStreamUrl}
          title={`${model.displayName} live preview`}
          className="absolute inset-0 h-full w-full border-0 object-cover pointer-events-none"
          allow="autoplay; encrypted-media"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : null}
    </div>
  );
}

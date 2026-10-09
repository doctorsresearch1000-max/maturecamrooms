"use client";

import Image from "next/image";
import Link from "next/link";
import { useModelDirectory } from "@/hooks/useModelDirectory";

const STORY_SIZE = 44;
const AVATAR_SIZE = 38;

function StoryAvatar({
  username,
  displayName,
  thumbnailUrl,
  isLive,
}: {
  username: string;
  displayName: string;
  thumbnailUrl: string;
  isLive: boolean;
}) {
  return (
    <Link
      href={`/model/${username}`}
      className="group flex shrink-0 flex-col items-center gap-0.5"
      title={displayName}
    >
      <span
        className={`relative flex items-center justify-center rounded-full p-[2px] ${
          isLive
            ? "bg-gradient-to-tr from-accent via-[#e879a8] to-[#f5b041]"
            : "bg-gradient-to-tr from-white/25 via-white/15 to-white/25"
        }`}
        style={{ width: STORY_SIZE, height: STORY_SIZE }}
      >
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[var(--header-bg)] p-[2px]">
          <Image
            src={thumbnailUrl}
            alt=""
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            className="h-full w-full rounded-full object-cover"
            sizes="44px"
          />
        </span>
        {isLive ? (
          <span
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded px-1 text-[8px] font-bold uppercase leading-tight text-white bg-accent"
            aria-hidden
          >
            Live
          </span>
        ) : null}
      </span>
      <span className="max-w-[3.25rem] truncate text-[9px] font-medium text-text-muted group-hover:text-white">
        {displayName.split(" ")[0]}
      </span>
    </Link>
  );
}

export function HeaderModelStories() {
  const { models, loading } = useModelDirectory(true);

  if (loading && models.length === 0) {
    return (
      <div className="flex items-center gap-2 px-1 py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-white/10"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  if (models.length === 0) {
    return null;
  }

  return (
    <ul
      className="scrollbar-none flex items-start gap-2 overflow-x-auto py-1"
      role="list"
      aria-label="Live model stories"
    >
      {models.map((m) => (
        <li key={m.id}>
          <StoryAvatar
            username={m.username}
            displayName={m.displayName}
            thumbnailUrl={m.thumbnailUrl}
            isLive={m.isLive}
          />
        </li>
      ))}
    </ul>
  );
}

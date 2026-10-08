"use client";

import { useShell } from "@/components/layout/ShellContext";

type FavoriteButtonProps = {
  modelId: string;
  className?: string;
};

export function FavoriteButton({ modelId, className = "" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useShell();
  const active = isFavorite(modelId);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(modelId);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg backdrop-blur-sm transition duration-fast hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      <span className={active ? "text-accent" : "text-white/90"}>
        {active ? "♥" : "♡"}
      </span>
    </button>
  );
}

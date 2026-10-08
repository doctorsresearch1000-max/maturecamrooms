import Image from "next/image";
import { FavoriteButton } from "@/components/cams/FavoriteButton";
import type { CamModel } from "@/lib/models/types";

type ProfileHeroProps = {
  model: CamModel;
};

export function ProfileHero({ model }: ProfileHeroProps) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-elevated sm:aspect-[16/9] sm:max-h-[420px]">
      <Image
        src={model.thumbnailUrl}
        alt={model.displayName}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      {model.isLive ? (
        <span
          className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-live px-2.5 py-1 text-xs font-bold uppercase text-white"
        >
          <span className="h-2 w-2 rounded-full bg-white" aria-hidden />
          Live
        </span>
      ) : null}
      <div className="absolute right-3 top-3">
        <FavoriteButton modelId={model.id} />
      </div>
      {model.isLive ? (
        <p className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {model.viewers.toLocaleString()} watching
        </p>
      ) : null}
    </div>
  );
}

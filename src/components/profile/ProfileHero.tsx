import { LiveStreamEmbed } from "@/components/live/LiveStreamEmbed";
import { FavoriteButton } from "@/components/cams/FavoriteButton";
import type { CamModel } from "@/lib/models/types";

type ProfileHeroProps = {
  model: CamModel;
};

export function ProfileHero({ model }: ProfileHeroProps) {
  return (
    <div className="relative w-full">
      <LiveStreamEmbed
        live={model.isLive}
        iframeFeedUrl={model.iframeFeedUrl}
        streamFeedUrl={model.streamFeedUrl}
        thumbnailUrl={model.thumbnailUrl}
        name={model.displayName}
      />
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton modelId={model.id} />
      </div>
    </div>
  );
}

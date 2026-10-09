"use client";

import {
  liveProfileCtaLabel,
  offlineProfileCtaLabel,
} from "@/lib/profile/modelCtaCopy";
import { useProfileCtaVariant } from "@/lib/profile/useProfileCtaVariant";
import { trackProfileCtaClick } from "@/lib/analytics/profileCta";
import { resolveRoomUrl } from "@/lib/models/resolveRoomUrl";
import type { CamModel } from "@/lib/models/types";

const CTA_LINK_REL = "sponsored nofollow noopener";

const buttonClassName =
  "flex min-h-[48px] w-full max-w-full items-center justify-center rounded-card bg-accent px-3 text-base font-semibold text-white transition hover:bg-accent-hover sm:max-w-md";

type ProfileRoomCtaProps = {
  model: CamModel;
  position: "hero" | "after-profile" | "sticky";
};

function CtaLabel({ text }: { text: string }) {
  return (
    <span className="block min-w-0 max-w-full truncate text-center">{text}</span>
  );
}

function ProfileRoomCtaLink({ model, position }: ProfileRoomCtaProps) {
  const variantId = useProfileCtaVariant(model.isLive);
  const displayName = model.displayName?.trim() || model.username;
  const label = model.isLive
    ? liveProfileCtaLabel(displayName, variantId)
    : offlineProfileCtaLabel(displayName);
  const dataVariant = model.isLive ? variantId : "offline";
  const roomUrl = resolveRoomUrl(model);

  return (
    <a
      href={roomUrl}
      target="_blank"
      rel={CTA_LINK_REL}
      className={buttonClassName}
      data-cta-position={position}
      data-cta-variant={dataVariant}
      data-model={model.username}
      onClick={() =>
        trackProfileCtaClick({
          position,
          variant: dataVariant,
          model: model.username,
          isLive: model.isLive,
        })
      }
    >
      <CtaLabel text={label} />
    </a>
  );
}

export function ProfileRoomCta({ model, position }: ProfileRoomCtaProps) {
  if (position === "sticky") {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[var(--header-bg)] px-3 pt-3 md:hidden"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
        aria-hidden={false}
      >
        <ProfileRoomCtaLink model={model} position={position} />
        <p className="mt-1.5 text-center text-[11px] text-text-muted">
          Opens in a new window · Adults 18+ only
        </p>
      </div>
    );
  }

  return (
    <div>
      <ProfileRoomCtaLink model={model} position={position} />
      <p className="mt-2 text-[11px] text-text-muted">
        Opens in a new window · Adults 18+ only
      </p>
    </div>
  );
}

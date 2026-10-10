import { applyCrakTrackingSubId } from "@/lib/affiliate/crak-subid";
import {
  affiliateLinkProps,
  buildAffiliateRoomUrl,
} from "@/lib/affiliate/links";
import type { CamModel } from "@/lib/models/types";

export function resolveRoomUrl(model: CamModel): string {
  const raw =
    model.roomUrl?.startsWith("https://")
      ? model.roomUrl
      : buildAffiliateRoomUrl(model.platform, model.username);
  return applyCrakTrackingSubId(raw, { platform: model.platform });
}

export function roomLinkProps(model: CamModel) {
  return model.roomUrl?.startsWith("https://")
    ? affiliateLinkProps()
    : affiliateLinkProps();
}

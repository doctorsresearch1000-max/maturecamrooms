import {
  affiliateLinkProps,
  buildAffiliateRoomUrl,
} from "@/lib/affiliate/links";
import type { CamModel } from "@/lib/models/types";

export function resolveRoomUrl(model: CamModel): string {
  if (model.roomUrl?.startsWith("https://")) {
    return model.roomUrl;
  }
  return buildAffiliateRoomUrl(model.platform, model.username);
}

export function roomLinkProps(model: CamModel) {
  return model.roomUrl?.startsWith("https://")
    ? affiliateLinkProps()
    : affiliateLinkProps();
}

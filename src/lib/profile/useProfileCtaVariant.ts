"use client";

import { useEffect, useState } from "react";
import {
  LIVE_PROFILE_CTA_VARIANTS,
  SSR_LIVE_PROFILE_CTA_VARIANT_ID,
  type ProfileCtaVariantId,
} from "@/lib/profile/modelCtaCopy";

const STORAGE_KEY = "mcr_profile_cta_ab";

function assignVariant(): ProfileCtaVariantId {
  const next: ProfileCtaVariantId = Math.random() < 0.5 ? "a" : "b";
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode / blocked storage */
  }
  return next;
}

function readStoredVariant(): ProfileCtaVariantId | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "a" || stored === "b") return stored;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * SSR and first paint use variant A; after mount, apply stored or newly assigned variant.
 */
export function useProfileCtaVariant(isLive: boolean): ProfileCtaVariantId {
  const [variantId, setVariantId] = useState<ProfileCtaVariantId>(
    SSR_LIVE_PROFILE_CTA_VARIANT_ID,
  );

  useEffect(() => {
    if (!isLive) return;
    const knownIds = new Set(LIVE_PROFILE_CTA_VARIANTS.map((v) => v.id));
    const stored = readStoredVariant();
    if (stored && knownIds.has(stored)) {
      setVariantId(stored);
      return;
    }
    setVariantId(assignVariant());
  }, [isLive]);

  return variantId;
}

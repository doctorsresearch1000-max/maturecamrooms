"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AgeGateModal } from "@/components/age-gate/AgeGateModal";
import {
  isAgeGateCurrentlyAccepted,
  persistAgeGateAcceptance,
} from "@/lib/age-gate/storage";
import { shouldSkipAgeGatePath } from "@/lib/age-gate/config";

export function AgeGateHost() {
  const pathname = usePathname() ?? "/";
  const skip = shouldSkipAgeGatePath(pathname);
  const [visible, setVisible] = useState(false);
  const [liveModelCount, setLiveModelCount] = useState<number | undefined>();

  useEffect(() => {
    if (skip) {
      setVisible(false);
      return;
    }
    if (isAgeGateCurrentlyAccepted()) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [skip, pathname]);

  useEffect(() => {
    if (skip || !visible) return;
    let cancelled = false;
    fetch("/api/crak/health")
      .then((r) => r.json())
      .then((data: { configured?: boolean; count?: number }) => {
        if (cancelled) return;
        if (data.configured && typeof data.count === "number" && data.count > 0) {
          setLiveModelCount(data.count);
        }
      })
      .catch(() => {
        /* omit counter */
      });
    return () => {
      cancelled = true;
    };
  }, [skip, visible]);

  const onAccept = useCallback(() => {
    persistAgeGateAcceptance();
    setVisible(false);
  }, []);

  if (skip || !visible) return null;

  return <AgeGateModal liveModelCount={liveModelCount} onAccept={onAccept} />;
}

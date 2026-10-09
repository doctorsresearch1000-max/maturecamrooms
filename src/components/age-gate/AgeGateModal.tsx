"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { trackAgeGateEvent } from "@/lib/age-gate/analytics";
import { AGE_GATE_EXIT_URL } from "@/lib/age-gate/config";
import { siteConfig } from "@/lib/site";

type AgeGateModalProps = {
  liveModelCount?: number;
  onAccept: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function AgeGateModal({ liveModelCount, onAccept }: AgeGateModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackAgeGateEvent("age_gate_shown");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const nodes = () =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
    nodes()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = nodes();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, []);

  const showCount =
    typeof liveModelCount === "number" && liveModelCount > 0
      ? liveModelCount
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md rounded-card border border-white/10 bg-surface-elevated p-6 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src="/maturecamrooms-logo.png"
            alt={siteConfig.name}
            width={747}
            height={59}
            className="mb-4 h-8 w-auto max-w-[14rem]"
            priority
          />
          <h1 id={titleId} className="text-xl font-bold text-white">
            Adults only (18+)
          </h1>
          <p id={descId} className="mt-2 text-sm leading-relaxed text-text-secondary">
            {showCount
              ? `Live mature cams, ${showCount} models online now.`
              : "Live mature cams for adults who want HD rooms and real performers."}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            className="flex min-h-[48px] w-full items-center justify-center rounded-card bg-accent px-3 text-base font-semibold text-white transition hover:bg-accent-hover"
            onClick={() => {
              trackAgeGateEvent("age_gate_accepted");
              onAccept();
            }}
          >
            I&apos;m 18 or older: Enter
          </button>
          <a
            href={AGE_GATE_EXIT_URL}
            className="flex min-h-[44px] w-full items-center justify-center rounded-card border border-white/10 px-3 text-sm font-medium text-text-secondary transition hover:bg-white/[0.04]"
            onClick={() => trackAgeGateEvent("age_gate_exit")}
          >
            Exit
          </a>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-text-muted">
          By entering you confirm you are at least 18 years old and that this
          site contains adult material. See our{" "}
          <Link href="/terms" className="text-accent underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-accent underline">
            Privacy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

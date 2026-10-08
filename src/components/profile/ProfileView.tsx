"use client";

import { useState } from "react";
import {
  affiliateLinkProps,
  buildAffiliateRoomUrl,
} from "@/lib/affiliate/links";
import { countryCodeToFlag, countryLabel } from "@/lib/country";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ModelCard } from "@/components/cams/ModelCard";
import type { CamModel } from "@/lib/models/types";

type ProfileViewProps = {
  model: CamModel;
  related: CamModel[];
};

export function ProfileView({ model, related }: ProfileViewProps) {
  const [expanded, setExpanded] = useState(false);
  const roomUrl = buildAffiliateRoomUrl(model.platform, model.username);
  const flag = countryCodeToFlag(model.countryCode);
  const country = countryLabel(model.countryCode, model.country);
  const description =
    model.description ??
    `${model.displayName} streams on ${model.platform}. 18+ only.`;

  return (
    <div className="pb-4">
      <ProfileHero model={model} />

      <div className="space-y-6 px-3 py-4 sm:px-6">
        <header>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {model.displayName}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {model.age}
                {country ? ` · ${country}` : ""}
                {flag ? ` ${flag}` : ""}
                {" · "}
                <span
                  className={
                    model.isLive ? "text-live font-medium" : "text-text-muted"
                  }
                >
                  {model.isLive
                    ? "● Live"
                    : model.recentlyOnline
                      ? "Recently online"
                      : "Offline"}
                </span>
              </p>
            </div>
            <span className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase text-text-secondary">
              {model.platform}
            </span>
          </div>

          {model.isLive ? (
            <p className="mt-2 text-sm font-medium text-foreground">
              {model.viewers.toLocaleString()} watching
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {model.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={roomUrl}
            className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-card bg-accent text-base font-semibold text-white transition hover:bg-accent-hover sm:max-w-md"
            {...affiliateLinkProps()}
          >
            {model.isLive ? "Enter live room" : "View room when live"}
          </a>
          <p className="mt-2 text-[11px] text-text-muted">
            Sponsored link · 18+ only · {AFFILIATE_NOTE}
          </p>
        </header>

        <section aria-labelledby="about-heading">
          <h2
            id="about-heading"
            className="text-sm font-bold uppercase tracking-widest text-text-muted"
          >
            About {model.displayName}
          </h2>
          <p
            className={`mt-2 text-sm leading-relaxed text-text-secondary ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {description}
          </p>
          {description.length > 120 ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-sm font-medium text-accent"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          ) : null}
        </section>

        <section aria-labelledby="profile-heading">
          <h2
            id="profile-heading"
            className="text-sm font-bold uppercase tracking-widest text-text-muted"
          >
            Profile
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-muted">Age</dt>
              <dd className="font-medium">{model.age}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Country</dt>
              <dd className="font-medium">{country || "—"}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Hair</dt>
              <dd className="font-medium">{model.hair ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Figure</dt>
              <dd className="font-medium">{model.figure ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Languages</dt>
              <dd className="font-medium">
                {model.languages?.join(", ") ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Platform</dt>
              <dd className="font-medium capitalize">{model.platform}</dd>
            </div>
          </dl>
        </section>

        {related.length > 0 ? (
          <section aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="mb-3 text-lg font-semibold text-foreground"
            >
              Related cams
            </h2>
            <ul
              className="scrollbar-none flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 xl:grid-cols-5"
              role="list"
            >
              {related.map((m, i) => (
                <li
                  key={m.id}
                  className="w-[42vw] shrink-0 snap-start sm:w-[28vw] lg:w-auto"
                >
                  <ModelCard model={m} priority={i < 2} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const AFFILIATE_NOTE = "nofollow sponsored";

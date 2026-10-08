"use client";

import { useState } from "react";
import Link from "next/link";
import { ModelCard } from "@/components/cams/ModelCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { countryCodeToFlag, countryLabel } from "@/lib/country";
import { resolveRoomUrl, roomLinkProps } from "@/lib/models/resolveRoomUrl";
import type { CamModel } from "@/lib/models/types";
import type { ModelSEO } from "@/lib/seo/modelSeo";
import { tagPath } from "@/lib/seo/slug";

type ProfileViewProps = {
  model: CamModel;
  related: CamModel[];
  seo: ModelSEO;
};

export function ProfileView({ model, related, seo }: ProfileViewProps) {
  const [expanded, setExpanded] = useState(false);
  const roomUrl = resolveRoomUrl(model);
  const flag = countryCodeToFlag(model.countryCode);
  const country = countryLabel(model.countryCode, model.country);
  const description = model.description?.trim();

  return (
    <div className="pb-4">
      <ProfileHero model={model} />

      <div className="space-y-6 px-3 py-4 sm:px-6">
        <Breadcrumbs items={seo.breadcrumbs} className="mb-1" />
        <p className="text-sm leading-relaxed text-text-secondary">{seo.intro}</p>

        <header>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{seo.h1}</h1>
              <p className="mt-1 text-sm text-text-secondary">
                {model.age !== undefined ? `${model.age}` : null}
                {model.age !== undefined && country ? " · " : null}
                {country ?? null}
                {flag ? ` ${flag}` : null}
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

          {model.stars !== undefined && model.stars > 0 ? (
            <p className="mt-2 text-sm text-text-secondary">
              Rating: {model.stars}★
            </p>
          ) : null}

          {seo.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {seo.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={tagPath(tag.slug)}
                  className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary transition hover:border-accent hover:text-foreground"
                >
                  {tag.display}
                </Link>
              ))}
            </div>
          ) : null}

          <a
            href={roomUrl}
            className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-card bg-accent text-base font-semibold text-white transition hover:bg-accent-hover sm:max-w-md"
            {...roomLinkProps(model)}
          >
            {model.isLive ? "Enter live room" : "View room when live"}
          </a>
          <p className="mt-2 text-[11px] text-text-muted">
            Sponsored link · 18+ only · nofollow sponsored
          </p>
        </header>

        {description ? (
          <section aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="text-sm font-bold uppercase tracking-widest text-text-muted"
            >
              About {model.displayName}
            </h2>
            <p
              className={`mt-2 text-sm leading-relaxed text-text-secondary ${
                expanded ? "" : "line-clamp-4"
              }`}
            >
              {description}
            </p>
            {description.length > 160 ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 text-sm font-medium text-accent"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            ) : null}
          </section>
        ) : null}

        {model.expertise ? (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
              Expertise
            </h2>
            <p className="mt-2 text-sm text-text-secondary">{model.expertise}</p>
          </section>
        ) : null}

        {model.turnOns ? (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
              Turn-ons
            </h2>
            <p className="mt-2 text-sm text-text-secondary">{model.turnOns}</p>
          </section>
        ) : null}

        <section aria-labelledby="profile-heading">
          <h2
            id="profile-heading"
            className="text-sm font-bold uppercase tracking-widest text-text-muted"
          >
            Profile
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {model.age !== undefined ? (
              <div>
                <dt className="text-text-muted">Age</dt>
                <dd className="font-medium">{model.age}</dd>
              </div>
            ) : null}
            {country ? (
              <div>
                <dt className="text-text-muted">Country</dt>
                <dd className="font-medium">{country}</dd>
              </div>
            ) : null}
            {model.hair ? (
              <div>
                <dt className="text-text-muted">Hair</dt>
                <dd className="font-medium">{model.hair}</dd>
              </div>
            ) : null}
            {model.figure ? (
              <div>
                <dt className="text-text-muted">Figure</dt>
                <dd className="font-medium">{model.figure}</dd>
              </div>
            ) : null}
            {model.languages && model.languages.length > 0 ? (
              <div>
                <dt className="text-text-muted">Languages</dt>
                <dd className="font-medium">{model.languages.join(", ")}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-text-muted">Platform</dt>
              <dd className="font-medium capitalize">{model.platform}</dd>
            </div>
          </dl>
        </section>

        {seo.internalLinks.length > 0 ? (
          <section aria-labelledby="discover-heading">
            <h2
              id="discover-heading"
              className="text-sm font-bold uppercase tracking-widest text-text-muted"
            >
              Discover more
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2" role="list">
              {seo.internalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary hover:border-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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

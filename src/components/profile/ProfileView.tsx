"use client";

import { useState } from "react";
import Link from "next/link";
import { ModelCard } from "@/components/cams/ModelCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { countryCodeToFlag, countryLabel } from "@/lib/country";
import { ProfileRoomCta } from "@/components/profile/ProfileRoomCta";
import type { CamModel } from "@/lib/models/types";
import type { ModelSEO } from "@/lib/seo/modelSeo";
import { categoryPath } from "@/lib/seo/slug";
import { resolveTagLinkTarget } from "@/lib/seo/tagLinks";
import {
  isCategoryIndexableForModel,
  primaryCategoryLabel,
} from "@/lib/seo/taxonomyInventory";
import { ModelSeoFooter } from "@/components/profile/ModelSeoFooter";
import { CATEGORY_DISPLAY } from "@/lib/seo/config";

type ProfileViewProps = {
  model: CamModel;
  related: CamModel[];
  seo: ModelSEO;
};

export function ProfileView({ model, related, seo }: ProfileViewProps) {
  const [expanded, setExpanded] = useState(false);
  const flag = countryCodeToFlag(model.countryCode);
  const country = countryLabel(model.countryCode, model.country);
  const description = model.description?.trim();
  const categoryLabel = primaryCategoryLabel(model);
  const categorySlug = model.primaryCategory?.toLowerCase();
  const showCategoryContext =
    categoryLabel &&
    categorySlug &&
    categorySlug in CATEGORY_DISPLAY &&
    isCategoryIndexableForModel(model, seo.taxonomyIndexability);

  return (
    <div className="pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-4">
      <div className="px-3 pt-3 sm:px-6">
        <Breadcrumbs items={seo.breadcrumbs} className="mb-1" />
      </div>

      <ProfileHero model={model} />

      <div className="space-y-6 px-3 py-4 sm:px-6">
        <header>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{seo.h1}</h1>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                {seo.usernameDisplay}
              </p>
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
            {model.isLive ? (
              <span className="rounded-md border border-live/30 bg-live/10 px-3 py-1.5 text-xs font-semibold uppercase text-live">
                Live now
              </span>
            ) : null}
          </div>

          {model.stars !== undefined && model.stars > 0 ? (
            <p className="mt-2 text-sm text-text-secondary">
              Rating: {model.stars}★
            </p>
          ) : null}
        </header>

        <ProfileRoomCta model={model} position="hero" />

        <p className="text-sm leading-relaxed text-text-secondary">{seo.intro}</p>

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
            {model.ethnicity ? (
              <div>
                <dt className="text-text-muted">Ethnicity</dt>
                <dd className="font-medium">{model.ethnicity}</dd>
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
            {model.bustSize ? (
              <div>
                <dt className="text-text-muted">Bust</dt>
                <dd className="font-medium">{model.bustSize}</dd>
              </div>
            ) : null}
            {model.height ? (
              <div>
                <dt className="text-text-muted">Height</dt>
                <dd className="font-medium">{model.height}</dd>
              </div>
            ) : null}
            {model.languages && model.languages.length > 0 ? (
              <div>
                <dt className="text-text-muted">Languages</dt>
                <dd className="font-medium">{model.languages.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <ProfileRoomCta model={model} position="after-profile" />

        {seo.tags.length > 0 ? (
          <section aria-labelledby="tags-heading">
            <h2
              id="tags-heading"
              className="text-sm font-bold uppercase tracking-widest text-text-muted"
            >
              Tags
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {seo.tags.map((tag) => {
                const target = resolveTagLinkTarget(
                  tag,
                  seo.taxonomyIndexability,
                );
                const chipClass =
                  "rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary";
                if (target.crawlable && target.href) {
                  return (
                    <Link
                      key={tag.slug}
                      href={target.href}
                      className={`${chipClass} transition hover:border-accent hover:text-foreground`}
                    >
                      {tag.display}
                    </Link>
                  );
                }
                return (
                  <span key={tag.slug} className={chipClass}>
                    {tag.display}
                  </span>
                );
              })}
            </div>
          </section>
        ) : null}

        {showCategoryContext ? (
          <section aria-labelledby="category-heading">
            <h2
              id="category-heading"
              className="text-sm font-bold uppercase tracking-widest text-text-muted"
            >
              Category
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              <Link
                href={categoryPath(categorySlug!)}
                className="font-medium text-accent hover:underline"
              >
                {categoryLabel} cams
              </Link>
            </p>
          </section>
        ) : null}

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

      <ModelSeoFooter model={model} related={related} seo={seo} />

      <ProfileRoomCta model={model} position="sticky" />
    </div>
  );
}

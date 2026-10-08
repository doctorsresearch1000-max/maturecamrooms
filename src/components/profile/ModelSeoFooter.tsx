import Link from "next/link";
import { CATEGORY_DISPLAY, SITE_CATEGORIES } from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";
import type { CamModel } from "@/lib/models/types";
import type { ModelSEO } from "@/lib/seo/modelSeo";

type ModelSeoFooterProps = {
  model: CamModel;
  related: CamModel[];
  seo: ModelSEO;
};

export function ModelSeoFooter({ model, related, seo }: ModelSeoFooterProps) {
  const categoryLinks = SITE_CATEGORIES.filter((cat) =>
    seo.taxonomyIndexability.indexableCategories.has(cat),
  );

  return (
    <footer
      className="mt-8 border-t border-border bg-surface/50 px-3 py-6 sm:px-6"
      aria-labelledby="model-seo-footer-heading"
    >
      <h2
        id="model-seo-footer-heading"
        className="text-sm font-semibold text-foreground"
      >
        Explore more live cams
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Browse mature, MILF and cougar webcam models on MatureCamRooms. Watch{" "}
        {model.displayName}&apos;s live room, compare similar performers, and
        discover new models by category or country.
      </p>

      {categoryLinks.length > 0 ? (
        <section className="mt-4" aria-labelledby="footer-categories">
          <h3
            id="footer-categories"
            className="text-xs font-bold uppercase tracking-widest text-text-muted"
          >
            Categories
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2" role="list">
            {categoryLinks.map((cat) => (
              <li key={cat}>
                <Link
                  href={categoryPath(cat)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-secondary hover:border-accent hover:text-foreground"
                >
                  {CATEGORY_DISPLAY[cat]} live cams
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {seo.internalLinks.length > 0 ? (
        <section className="mt-4" aria-labelledby="footer-related-taxonomy">
          <h3
            id="footer-related-taxonomy"
            className="text-xs font-bold uppercase tracking-widest text-text-muted"
          >
            Related searches
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2" role="list">
            {seo.internalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-secondary hover:border-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-4" aria-labelledby="footer-models">
          <h3
            id="footer-models"
            className="text-xs font-bold uppercase tracking-widest text-text-muted"
          >
            Similar models
          </h3>
          <ul className="mt-2 columns-2 gap-x-4 text-sm sm:columns-3" role="list">
            {related.map((m) => (
              <li key={m.id} className="mb-1.5 break-inside-avoid">
                <Link
                  href={`/model/${m.username}`}
                  className="text-text-secondary hover:text-accent"
                >
                  {m.displayName} live cam
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-[11px] text-text-muted">
        Adults 18+ only. All performers are independent third-party broadcasters.
      </p>
    </footer>
  );
}

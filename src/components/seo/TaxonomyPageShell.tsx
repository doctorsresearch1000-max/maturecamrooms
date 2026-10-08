import { ModelGrid } from "@/components/cams/ModelGrid";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { StructuredDataScripts } from "@/components/seo/StructuredDataScripts";
import type { TaxonomySEO } from "@/lib/seo/taxonomySeo";
import type { CamModel } from "@/lib/models/types";

type TaxonomyPageShellProps = {
  seo: TaxonomySEO;
  models: CamModel[];
  emptyMessage?: string;
  statusMessage?: string;
};

export function TaxonomyPageShell({
  seo,
  models,
  emptyMessage = "No performers match this view right now.",
  statusMessage,
}: TaxonomyPageShellProps) {
  return (
    <>
      <StructuredDataScripts data={seo.structuredData} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={seo.breadcrumbs} className="mb-4" />
        <header>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {seo.h1}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            {seo.intro}
          </p>
          {statusMessage ? (
            <p className="mt-2 text-xs text-text-muted">{statusMessage}</p>
          ) : null}
          {!seo.indexable ? (
            <p className="mt-2 text-xs text-text-muted">
              Limited inventory — this listing is shown for discovery but is not
              promoted to search indexes yet.
            </p>
          ) : null}
        </header>
        <div className="mt-8">
          <ModelGrid models={models} emptyMessage={emptyMessage} />
        </div>
      </div>
    </>
  );
}

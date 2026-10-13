import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { StructuredDataScripts } from "@/components/seo/StructuredDataScripts";
import { loadModelProfile } from "@/lib/models/loadModelProfile";
import { canonicalModelUrl } from "@/lib/seo/canonical";
import {
  buildModelIntentPageH1,
  isModelIntentRoute,
  type ModelIntentRoute,
} from "@/lib/seo/modelIntent";
import { modelSeoToMetadata } from "@/lib/seo/modelSeo";

export const runtime = "edge";

type PageProps = {
  params: Promise<{ username: string; intent: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, intent: rawIntent } = await params;
  if (!isModelIntentRoute(rawIntent)) {
    notFound();
  }
  const bundle = await loadModelProfile(username);
  if (!bundle) {
    notFound();
  }
  const base = modelSeoToMetadata(bundle.seo);
  const canonical = canonicalModelUrl(bundle.model.username);
  return {
    ...base,
    robots: { index: false, follow: true },
    alternates: { canonical },
  };
}

export default async function ModelIntentProfilePage({ params }: PageProps) {
  const { username, intent: rawIntent } = await params;
  if (!isModelIntentRoute(rawIntent)) {
    notFound();
  }
  const intent = rawIntent as ModelIntentRoute;
  const bundle = await loadModelProfile(username);
  if (!bundle) {
    notFound();
  }
  const { model, related, seo } = bundle;
  const intentH1 = buildModelIntentPageH1(model.displayName, intent);

  const structuredBlocks = [
    seo.structuredData.breadcrumb,
    seo.structuredData.webPage,
    seo.structuredData.profile,
  ].filter(Boolean);

  return (
    <>
      <StructuredDataScripts data={structuredBlocks} />
      <ProfileView
        model={model}
        related={related}
        seo={seo}
        intent={intent}
        intentPageH1={intentH1}
      />
    </>
  );
}

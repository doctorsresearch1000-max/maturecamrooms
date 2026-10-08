import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { StructuredDataScripts } from "@/components/seo/StructuredDataScripts";
import { loadModelProfile } from "@/lib/models/loadModelProfile";
import { modelSeoToMetadata } from "@/lib/seo/modelSeo";

export const runtime = "edge";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const bundle = await loadModelProfile(username);
  if (!bundle) {
    return { title: "Model not found", robots: { index: false, follow: false } };
  }
  return modelSeoToMetadata(bundle.seo);
}

export default async function ModelProfilePage({ params }: PageProps) {
  const { username } = await params;
  const bundle = await loadModelProfile(username);
  if (!bundle) {
    notFound();
  }
  const { model, related, seo } = bundle;

  const structuredBlocks = [
    seo.structuredData.breadcrumb,
    seo.structuredData.webPage,
    seo.structuredData.profile,
  ].filter(Boolean);

  return (
    <>
      <StructuredDataScripts data={structuredBlocks} />
      <ProfileView model={model} related={related} seo={seo} />
    </>
  );
}

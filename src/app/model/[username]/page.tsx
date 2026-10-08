import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { StructuredDataScripts } from "@/components/seo/StructuredDataScripts";
import {
  getModelByUsername,
  getRelatedModels,
} from "@/lib/models/getModels";
import { buildModelSeo, modelSeoToMetadata } from "@/lib/seo/modelSeo";

export const runtime = "edge";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const model = await getModelByUsername(username);
  if (!model) {
    return { title: "Model not found", robots: { index: false, follow: false } };
  }
  const seo = buildModelSeo(model);
  return modelSeoToMetadata(seo);
}

export default async function ModelProfilePage({ params }: PageProps) {
  const { username } = await params;
  const model = await getModelByUsername(username);
  if (!model) {
    notFound();
  }
  const related = await getRelatedModels(model, 8);
  const seo = buildModelSeo(model, related);

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

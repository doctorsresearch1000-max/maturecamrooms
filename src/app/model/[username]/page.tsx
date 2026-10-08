import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import {
  getModelByUsername,
  getRelatedModels,
} from "@/lib/models/getModels";
import { siteConfig } from "@/lib/site";

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
    return { title: "Model not found", robots: { index: false } };
  }
  return {
    title: `${model.displayName} — Live Cam Profile`,
    description: `Watch ${model.displayName} (${model.age}) on ${siteConfig.name}. Mature live cam profile — 18+.`,
    robots: { index: true, follow: true },
  };
}

export default async function ModelProfilePage({ params }: PageProps) {
  const { username } = await params;
  const model = await getModelByUsername(username);
  if (!model) {
    notFound();
  }
  const related = await getRelatedModels(model, 8);

  return <ProfileView model={model} related={related} />;
}

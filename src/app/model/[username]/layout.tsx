import { notFound } from "next/navigation";
import { loadModelProfile } from "@/lib/models/loadModelProfile";
import { normalizeModelRouteParam } from "@/lib/seo/modelPermalink";

export const revalidate = 300;

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
};

export default async function ModelProfileLayout({
  children,
  params,
}: LayoutProps) {
  const { username } = await params;
  const slug = normalizeModelRouteParam(username);
  if (!slug) {
    notFound();
  }

  const bundle = await loadModelProfile(slug);
  if (!bundle) {
    notFound();
  }

  return children;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelGrid } from "@/components/cams/ModelGrid";
import { getFeaturedModels } from "@/lib/models/getModels";
import { siteConfig, absoluteUrl } from "@/lib/site";

export const runtime = "edge";

const ALLOWED = new Set(siteConfig.defaultTags);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = slug.toLowerCase();
  if (!ALLOWED.has(tag)) {
    return { title: "Category not found", robots: { index: false } };
  }
  const title = `${tag.toUpperCase()} Live Cams`;
  return {
    title,
    description: `Watch live ${tag} cam models on ${siteConfig.name}. 18+ sponsored affiliate rooms.`,
    alternates: { canonical: absoluteUrl(`/category/${tag}`) },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      url: absoluteUrl(`/category/${tag}`),
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = slug.toLowerCase();
  if (!ALLOWED.has(tag)) {
    notFound();
  }

  const all = await getFeaturedModels(48);
  const models = all.filter((m) =>
    m.tags.some((t) => t.toLowerCase() === tag),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold capitalize text-zinc-50 sm:text-3xl">
        {tag} live cams
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Filtered for <strong className="text-zinc-300">{tag}</strong> performers.
      </p>
      <div className="mt-8">
        <ModelGrid models={models.length ? models : all} />
      </div>
    </div>
  );
}

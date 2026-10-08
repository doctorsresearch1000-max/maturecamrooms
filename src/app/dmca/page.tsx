import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "DMCA",
  alternates: { canonical: absoluteUrl("/dmca") },
  robots: { index: true, follow: true },
};

export default function DmcaPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-zinc-400">
      <h1>DMCA</h1>
      <p>DMCA agent contact and takedown procedure — add before production.</p>
    </article>
  );
}

import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  alternates: { canonical: absoluteUrl("/terms") },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-zinc-400">
      <h1>Terms of Use</h1>
      <p>
        By using {siteConfig.name} you confirm you are 18+ and agree to these
        terms. Replace this stub with full legal copy before launch.
      </p>
    </article>
  );
}

import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-zinc-400">
      <h1>Privacy Policy</h1>
      <p>
        {siteConfig.name} respects your privacy. This placeholder policy should
        be replaced with counsel-reviewed text before production launch.
      </p>
    </article>
  );
}

import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 hidden border-t border-border bg-surface lg:block">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-text-secondary sm:px-6">
        <p>
          {siteConfig.name} helps you discover mature and MILF live webcam
          models. All performers are 18+.
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li>
            <Link href="/privacy" className="hover:text-zinc-300">
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-zinc-300">
              Terms
            </Link>
          </li>
          <li>
            <Link href="/dmca" className="hover:text-zinc-300">
              DMCA
            </Link>
          </li>
          <li>
            <Link href="/2257" className="hover:text-zinc-300">
              2257
            </Link>
          </li>
        </ul>
        <p className="text-xs text-zinc-600">
          © {year} {siteConfig.name}. Adults only.
        </p>
      </div>
    </footer>
  );
}

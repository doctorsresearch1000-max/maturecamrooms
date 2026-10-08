import Link from "next/link";
import { siteConfig } from "@/lib/site";

const nav = [
  { href: "/", label: "Live" },
  { href: "/category/milf", label: "MILF" },
  { href: "/category/mature", label: "Mature" },
  { href: "/category/cougar", label: "Cougar" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-bold tracking-tight text-rose-400">
            {siteConfig.name}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            Mature & MILF cams · 18+
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { DrawerMenuNav } from "@/components/layout/DrawerMenuNav";
import { useShell } from "@/components/layout/ShellContext";
import { Drawer } from "@/components/ui/Drawer";
import { siteConfig } from "@/lib/site";

/** Slide-out menu (mobile + desktop): taxonomy, search, favorites. */
export function NavigationDrawer() {
  const { drawerOpen, setDrawerOpen, favorites, setSearchOpen } = useShell();
  const close = () => setDrawerOpen(false);

  return (
    <Drawer
      open={drawerOpen}
      onClose={close}
      ariaLabel="Navigation menu"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[var(--header-bg)] px-2 py-2.5">
        <button
          type="button"
          onClick={close}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/[0.05]"
          aria-label="Close menu"
        >
          ✕
        </button>
        <Link href="/" className="min-w-0 flex-1" onClick={close}>
          <Image
            src="/maturecamrooms-logo.png"
            alt={siteConfig.name}
            width={747}
            height={59}
            className="mx-auto h-7 w-auto max-w-[10.5rem]"
          />
        </Link>
        <span className="w-10 shrink-0" aria-hidden />
      </div>
      <DrawerMenuNav
        favoritesCount={favorites.size}
        onNavigate={close}
        onOpenSearch={() => setSearchOpen(true)}
      />
    </Drawer>
  );
}

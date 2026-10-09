"use client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { NavigationDrawer } from "@/components/layout/Sidebar";
import { SearchPanel } from "@/components/discovery/SearchPanel";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <NavigationDrawer />
      <SearchPanel />
      <div className="mx-auto flex w-full max-w-[1920px] flex-1">
        <main className="min-w-0 flex-1 pt-[var(--header-stack-h,var(--header-h-mobile))] safe-pb-mobile lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}

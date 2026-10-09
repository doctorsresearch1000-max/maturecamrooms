"use client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SidebarDesktop, SidebarMobile } from "@/components/layout/Sidebar";
import { SearchPanel } from "@/components/discovery/SearchPanel";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <SidebarMobile />
      <SearchPanel />
      <div className="mx-auto flex w-full max-w-[1920px] flex-1">
        <SidebarDesktop />
        <main className="min-w-0 flex-1 pt-[var(--header-h)] safe-pb-mobile lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}

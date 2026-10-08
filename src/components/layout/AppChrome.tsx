"use client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SidebarDesktop, SidebarMobile } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SearchPanel } from "@/components/discovery/SearchPanel";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <SidebarMobile />
      <SearchPanel />
      <div className="mx-auto flex w-full max-w-[1920px] flex-1">
        <SidebarDesktop />
        <main className="min-w-0 flex-1 safe-pb-nav lg:pb-0">{children}</main>
      </div>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}

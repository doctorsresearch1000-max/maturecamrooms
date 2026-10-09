"use client";

import { TaxonomyMenuNav } from "@/components/layout/TaxonomyMenuNav";
import { useDrawerMenu } from "@/hooks/useDrawerMenu";

type DrawerMenuNavProps = {
  onNavigate?: () => void;
  favoritesCount?: number;
  onOpenSearch?: () => void;
};

export function DrawerMenuNav({
  onNavigate,
  favoritesCount = 0,
  onOpenSearch,
}: DrawerMenuNavProps) {
  const menu = useDrawerMenu(true);
  return (
    <TaxonomyMenuNav
      variant="drawer"
      onNavigate={onNavigate}
      favoritesCount={favoritesCount}
      onOpenSearch={onOpenSearch}
      {...menu}
    />
  );
}

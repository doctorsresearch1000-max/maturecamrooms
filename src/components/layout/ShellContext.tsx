"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ShellContextValue = {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

const ShellContext = createContext<ShellContextValue | null>(null);

const FAV_KEY = "mcr_favorites";

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) {
        setFavorites(new Set(JSON.parse(raw) as string[]));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistFavorites = useCallback((next: Set<string>) => {
    setFavorites(next);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = new Set(favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistFavorites(next);
    },
    [favorites, persistFavorites],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  useEffect(() => {
    if (!drawerOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    document.body.style.overflow =
      drawerOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, searchOpen]);

  const value = useMemo(
    () => ({
      drawerOpen,
      setDrawerOpen,
      toggleDrawer: () => setDrawerOpen((v) => !v),
      searchOpen,
      setSearchOpen,
      favorites,
      toggleFavorite,
      isFavorite,
    }),
    [
      drawerOpen,
      searchOpen,
      favorites,
      toggleFavorite,
      isFavorite,
    ],
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return ctx;
}

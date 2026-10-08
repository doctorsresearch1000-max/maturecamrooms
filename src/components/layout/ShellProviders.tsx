"use client";

import { ShellProvider } from "@/components/layout/ShellContext";
import { AppChrome } from "@/components/layout/AppChrome";

export function ShellProviders({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <AppChrome>{children}</AppChrome>
    </ShellProvider>
  );
}

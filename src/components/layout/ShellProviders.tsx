"use client";

import { AgeGateHost } from "@/components/age-gate/AgeGateHost";
import { ShellProvider } from "@/components/layout/ShellContext";
import { AppChrome } from "@/components/layout/AppChrome";

export function ShellProviders({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <AgeGateHost />
      <AppChrome>{children}</AppChrome>
    </ShellProvider>
  );
}

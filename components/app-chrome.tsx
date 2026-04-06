"use client";

import { NavigationTransitionProvider } from "@/components/transition/navigation-transition-context";
import { GlobalCommandPalette } from "@/components/command-palette/global-command-palette";

/** Root-level client shell: navigation intent for route transitions + site-wide command palette. */
export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <NavigationTransitionProvider>
      {children}
      <GlobalCommandPalette />
    </NavigationTransitionProvider>
  );
}

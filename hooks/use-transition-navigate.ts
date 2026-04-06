"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useNavigationTransition } from "@/components/transition/navigation-transition-context";

/**
 * Like router.push, but registers navigation intent for PageTransition (slow escalation + handoff).
 * Ported from v3 `components/transition/useTransitionNavigate.js`.
 */
export function useTransitionNavigate() {
  const router = useRouter();
  const ctx = useNavigationTransition();

  return useCallback(
    (href: string) => {
      if (typeof window !== "undefined") {
        try {
          const url = new URL(href, window.location.origin);
          ctx?.beginNavigation(`${url.pathname}${url.search || ""}`);
        } catch {
          /* fall through */
        }
      }
      router.push(href);
    },
    [router, ctx]
  );
}

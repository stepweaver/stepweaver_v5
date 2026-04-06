"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NavigationIntent = { pathKey: string; startedAt: number };

type Ctx = {
  intent: NavigationIntent | null;
  beginNavigation: (_pathKey: string) => void;
  clearIntent: () => void;
};

const NavigationTransitionContext = createContext<Ctx | null>(null);

/**
 * Captures in-app navigation intent on real link activation (click), not on pointerdown.
 * Touch and pen fire pointerdown on contact; using that caused full-tree re-renders (via setIntent)
 * when users scrolled past links or explored without tapping. Click only fires after a committed activation.
 * Ported from v3 `NavigationTransitionContext.jsx`.
 */
function NavigationIntentCapture({ beginNavigation }: { beginNavigation: (_pathKey: string) => void }) {
  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const a = target.closest("a");
      if (!a || !a.href) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (a.target === "_blank") return;
      if (a.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const pathKey = `${url.pathname}${url.search || ""}`;
      const currentKey = `${window.location.pathname}${window.location.search || ""}`;
      if (pathKey === currentKey) return;

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }

      beginNavigation(pathKey);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [beginNavigation]);

  return null;
}

export function NavigationTransitionProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<NavigationIntent | null>(null);

  const beginNavigation = useCallback((pathKey: string) => {
    setIntent({ pathKey, startedAt: Date.now() });
  }, []);

  const clearIntent = useCallback(() => {
    setIntent(null);
  }, []);

  const value = useMemo(
    () => ({ intent, beginNavigation, clearIntent }),
    [intent, beginNavigation, clearIntent]
  );

  return (
    <NavigationTransitionContext.Provider value={value}>
      <NavigationIntentCapture beginNavigation={beginNavigation} />
      {children}
    </NavigationTransitionContext.Provider>
  );
}

export function useNavigationTransition(): Ctx | null {
  return useContext(NavigationTransitionContext);
}

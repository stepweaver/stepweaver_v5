"use client";

import { useState, useEffect } from "react";

export type VisualViewportRect = { top: number; height: number | string };

/**
 * Sync a fixed fullscreen layer to the visual viewport (mobile URL bar, keyboard).
 */
export function useVisualViewportRect(enabled: boolean): VisualViewportRect {
  const [rect, setRect] = useState<VisualViewportRect>(() =>
    typeof window !== "undefined" && window.visualViewport
      ? { top: 0, height: window.visualViewport.height }
      : { top: 0, height: "100dvh" }
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.visualViewport) return;
    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setRect({
          top: window.visualViewport!.offsetTop,
          height: window.visualViewport!.height,
        });
      });
    };
    scheduleUpdate();
    window.visualViewport.addEventListener("resize", scheduleUpdate);
    return () => {
      window.visualViewport!.removeEventListener("resize", scheduleUpdate);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return rect;
}

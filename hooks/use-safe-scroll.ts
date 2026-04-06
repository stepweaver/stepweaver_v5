"use client";

import { useEffect, useRef } from "react";
import { getDocumentScrollProgressX, getDocumentScrollProgressY } from "@/lib/document-scroll-progress";

export type ScrollData = {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
  scrollProgressY: number;
  scrollProgressX: number;
};

function buildScrollData(): ScrollData {
  return {
    scrollTop: window.scrollY || 0,
    scrollLeft: window.scrollX || 0,
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: window.innerHeight,
    clientWidth: window.innerWidth,
    scrollProgressY: getDocumentScrollProgressY(),
    scrollProgressX: getDocumentScrollProgressX(),
  };
}

/** Throttled scroll listener for canvas / parallax (v3 parity, simplified). */
export function useSafeScroll(options: {
  throttleMs?: number;
  onScroll?: (data: ScrollData) => void;
} = {}) {
  const { throttleMs = 16, onScroll } = options;
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;

  useEffect(() => {
    if (typeof window === "undefined") return;
    let last = 0;
    const fn = () => {
      const now = performance.now();
      if (now - last < throttleMs) return;
      last = now;
      try {
        onScrollRef.current?.(buildScrollData());
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [throttleMs]);
}

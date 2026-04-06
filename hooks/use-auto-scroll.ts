"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

function isNearBottom(el: HTMLElement, thresholdPx: number) {
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  return distanceFromBottom < thresholdPx;
}

/**
 * Transcript-owned scroll: auto-scroll only when user is pinned to bottom.
 */
export function useAutoScroll(options: { bottomThreshold?: number } = {}) {
  const thresholdPx = options.bottomThreshold ?? 120;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const shouldStickRef = useRef(true);

  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const stickToBottom = useCallback(() => {
    shouldStickRef.current = true;
  }, []);

  const scrollIfSticky = useCallback(
    (useSmooth = false) => {
      if (shouldStickRef.current) {
        scrollToBottom(useSmooth ? "smooth" : "auto");
      }
    },
    [scrollToBottom]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const near = isNearBottom(el, thresholdPx);
      shouldStickRef.current = near;
      setIsAtBottom(near);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [thresholdPx]);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;

    let rafId: number | null = null;
    const onResize = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (shouldStickRef.current) {
          endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
        }
      });
    };

    vv.addEventListener("resize", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  useLayoutEffect(() => {
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  return {
    scrollerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    stickToBottom,
    scrollIfSticky,
  };
}

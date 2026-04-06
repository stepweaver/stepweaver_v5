"use client";

import { useRef, useCallback } from "react";

/**
 * Client-side bot-protection: honeypot + submit-time timing metadata.
 */
export function useBotProtection() {
  const mountedAt = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);

  const honeypotProps = {
    ref: honeypotRef,
    type: "text" as const,
    name: "_hp_website",
    autoComplete: "off" as const,
    tabIndex: -1,
    "aria-hidden": true as const,
    style: {
      position: "absolute" as const,
      left: "-9999px",
      opacity: 0,
      height: 0,
      width: 0,
      overflow: "hidden" as const,
      pointerEvents: "none" as const,
    },
  };

  const getBotFields = useCallback(
    () => ({
      _hp_website: honeypotRef.current?.value || "",
      _t: Date.now(),
      _d: Math.max(0, Date.now() - mountedAt.current),
    }),
    []
  );

  return { honeypotProps, getBotFields };
}

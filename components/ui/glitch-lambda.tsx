"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  className?: string;
  autoGlitch?: boolean;
  glitchInterval?: number;
  initialDelay?: number;
  children?: React.ReactNode;
  size?: "small" | "normal";
};

export function GlitchLambda({
  className = "",
  autoGlitch = true,
  glitchInterval = 5000,
  initialDelay = 1000,
  children = "λ",
  size = "small",
}: Props) {
  const [glitching, setGlitching] = useState(false);
  const randomized = useRef<{ initial: number; next: () => number } | null>(null);

  useEffect(() => {
    if (!autoGlitch) return;

    if (!randomized.current) {
      const vary = (base: number) => {
        const v = base * 0.3;
        return base + (Math.random() * v * 2 - v);
      };
      randomized.current = {
        initial: vary(initialDelay),
        next: () => vary(glitchInterval),
      };
    }

    const dur = size === "small" ? 300 : 400;
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), dur);
    };

    const t0 = setTimeout(trigger, randomized.current.initial);
    let cancelled = false;

    const chain = () => {
      if (cancelled) return;
      const wait = randomized.current!.next();
      setTimeout(() => {
        if (cancelled) return;
        trigger();
        chain();
      }, wait);
    };
    const t1 = setTimeout(chain, randomized.current.initial);

    return () => {
      cancelled = true;
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, [autoGlitch, glitchInterval, initialDelay, size]);

  return (
    <span
      className={`inline-block font-[var(--font-ocr)] ${glitching ? "animate-glitch" : ""} ${className}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

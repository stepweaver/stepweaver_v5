"use client";

import { GlitchLambda } from "@/components/ui/glitch-lambda";

type Props = {
  /** Outer wrapper (typography, color for non-inherit layouts). */
  className?: string;
  /** Applied to the `//` and `stepweaver` spans. */
  labelClassName?: string;
  /** Passed through to GlitchLambda (use `text-inherit` inside a colored Link). */
  lambdaClassName?: string;
};

/** `//` + glitch λ + `stepweaver` (no `.dev`). Wider gap so `// λ` reads clearly in monospace. */
export function BrandWordmark({ className = "", labelClassName = "", lambdaClassName = "" }: Props) {
  return (
    <span className={`inline-flex items-baseline gap-2 font-[var(--font-ocr)] ${className}`}>
      <span className={labelClassName}>{"//"}</span>
      <GlitchLambda size="small" className={lambdaClassName} />
      <span className={labelClassName}>stepweaver</span>
    </span>
  );
}

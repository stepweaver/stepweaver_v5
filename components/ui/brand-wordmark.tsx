"use client";

import { GlitchLambda } from "@/components/ui/glitch-lambda";

type Props = {
  /** Outer wrapper (typography, color for non-inherit layouts). */
  className?: string;
  /** Applied to the `// ` and optional `stepweaver` spans. */
  labelClassName?: string;
  /** Passed through to GlitchLambda (use `text-inherit` inside a colored Link). */
  lambdaClassName?: string;
  /** When false, only `// λ` (e.g. hero); navbar uses default true. */
  showSiteName?: boolean;
};

/** `// ` + glitch λ + optional `stepweaver` (no `.dev`). */
export function BrandWordmark({
  className = "",
  labelClassName = "",
  lambdaClassName = "",
  showSiteName = true,
}: Props) {
  return (
    <span className={`inline-flex items-baseline gap-0 font-[var(--font-ocr)] ${className}`}>
      <span className={labelClassName}>{"// "}</span>
      <GlitchLambda size="small" className={lambdaClassName} />
      {showSiteName ? <span className={labelClassName}>stepweaver</span> : null}
    </span>
  );
}

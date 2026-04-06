"use client";

import { BrandWordmark } from "@/components/ui/brand-wordmark";

export function HeroHeadline() {
  return (
    <div>
      <div className="mb-3">
        <BrandWordmark
          className="text-sm tracking-wider"
          labelClassName="text-[rgb(var(--neon))]"
          lambdaClassName="text-[rgb(var(--neon))]"
          showSiteName={false}
        />
      </div>
      <h1 className="font-[var(--font-ibm)] text-4xl sm:text-5xl lg:text-6xl text-[rgb(var(--text-color))] leading-tight">
        Systems built
        <br />
        <span className="text-[rgb(var(--neon))]">from first principles</span>
      </h1>
    </div>
  );
}

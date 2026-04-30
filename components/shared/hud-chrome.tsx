"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function HudSidebarPanel({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`hud-panel p-3 ${className}`}>
      {label ? (
        <p className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.45)] uppercase mb-2">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function HudMobileCollapsible({
  title,
  icon: Icon,
  children,
  expandedContentClassName = "",
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  expandedContentClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lg:hidden shrink-0 border-b border-[rgb(var(--neon)/0.15)]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[rgb(var(--panel)/0.3)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3 h-3 text-[rgb(var(--neon)/0.5)]" />
          <span className="font-[var(--font-ocr)] text-xs tracking-[0.2em] text-[rgb(var(--neon)/0.5)] uppercase">
            {title}
          </span>
        </div>
        <ChevronRight
          className={`w-3 h-3 text-[rgb(var(--neon)/0.4)] transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div
          className={["px-3 pb-3 animate-fade-in", expandedContentClassName].filter(Boolean).join(" ")}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function HudFeatureModuleCard({
  title,
  tag,
  body,
  icon: Icon,
  footer,
  bodyMutedClassName = "text-[rgb(var(--muted-color)/0.68)]",
}: {
  title: string;
  tag: string;
  body: string;
  icon: LucideIcon;
  footer?: ReactNode;
  bodyMutedClassName?: string;
}) {
  return (
    <div className="group flex items-start gap-2.5 px-3 py-2.5 rounded-sm bg-[rgb(var(--panel)/0.3)] border border-[rgb(var(--neon)/0.08)] hover:border-[rgb(var(--neon)/0.2)] hover:bg-[rgb(var(--panel)/0.5)] transition-all duration-200">
      <Icon className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.55)] mt-0.5 shrink-0 group-hover:text-[rgb(var(--neon)/0.8)] transition-colors" />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="font-[var(--font-ibm)] text-xs text-[rgb(var(--neon)/0.8)] group-hover:text-neon transition-colors">
            {title}
          </p>
          <span className="font-[var(--font-ocr)] text-[8px] text-[rgb(var(--neon)/0.25)]">{tag}</span>
        </div>
        <p className={`font-[var(--font-ocr)] text-sm leading-snug mt-0.5 ${bodyMutedClassName}`}>{body}</p>
        {footer}
      </div>
    </div>
  );
}

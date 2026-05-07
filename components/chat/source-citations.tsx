"use client";

import Link from "next/link";
import { FileText, FolderOpen, BookOpen, FileCode } from "lucide-react";

export type Citation = {
  type: string;
  label: string;
  href: string;
  section?: string;
};

const TYPE_ICONS: Record<string, typeof FileText> = {
  project: FolderOpen,
  resume: FileText,
  codex: BookOpen,
  page: FileCode,
};

export function SourceCitations({ citations }: { citations: Citation[] }) {
  if (!citations?.length) return null;

  return (
    <div className="mt-2 pt-2 border-t border-[rgb(var(--neon)/0.1)]">
      <div className="flex flex-wrap gap-1.5">
        {citations.map((cite, i) => {
          const Icon = TYPE_ICONS[cite.type] || FileCode;
          const isExternal = cite.href?.startsWith("http");

          return (
            <Link
              key={i}
              href={cite.href || "#"}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1 font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.5)] border border-[rgb(var(--neon)/0.15)] px-1.5 py-0.5 uppercase tracking-[0.1em] hover:text-[rgb(var(--neon)/0.8)] hover:border-[rgb(var(--neon)/0.35)] transition-colors"
            >
              <Icon className="w-2.5 h-2.5 shrink-0" />
              {cite.label}
              {cite.section ? (
                <span className="text-[rgb(var(--neon)/0.3)] ml-0.5">· {cite.section}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

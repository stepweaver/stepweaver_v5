"use client";

import { Mail, Package, Tag, ShieldCheck, Layers, BookOpen, Trash2 } from "lucide-react";
import type { GameMode } from "@/lib/mail-sort-academy/types";
import type { StoredStats } from "@/lib/mail-sort-academy/useGameStorage";

const MODES: Array<{
  mode: GameMode;
  label: string;
  tag: string;
  description: string;
  icon: React.ElementType;
  difficulty: string;
}> = [
  {
    mode: "class_sort",
    label: "Class Sort",
    tag: "MODE-01",
    description:
      "Identify the mail class from the scenario. First-Class, Priority, Periodicals, Marketing Mail, and more.",
    icon: Mail,
    difficulty: "Rookie friendly",
  },
  {
    mode: "ubbm_or_not",
    label: "UBBM or Not",
    tag: "MODE-02",
    description:
      "Decide: is this piece Undeliverable Bulk Business Mail, or does it get forwarding / return service?",
    icon: Package,
    difficulty: "Regular carrier",
  },
  {
    mode: "endorsement_drill",
    label: "Endorsement Drill",
    tag: "MODE-03",
    description:
      "Choose the correct carrier endorsement: ANK, NSN, NSS, REF, VAC, DEC, and others.",
    icon: Tag,
    difficulty: "Regular carrier",
  },
  {
    mode: "accountable_chain",
    label: "Accountable Chain",
    tag: "MODE-04",
    description:
      "Handle Certified, Registered, COD, Signature Confirmation, and other accountable mail correctly.",
    icon: ShieldCheck,
    difficulty: "Inspection level",
  },
  {
    mode: "route_case_sim",
    label: "Route Case Simulation",
    tag: "MODE-05",
    description:
      "Sort a mixed deck of mail into handling bins. Full carrier workflow in one session.",
    icon: Layers,
    difficulty: "Mixed difficulty",
  },
];

interface ModeSelectorProps {
  onSelectMode: (_mode: GameMode) => void;
  onStudyGuide: () => void;
  score: number;
  storedStats: StoredStats | null;
  onClearStats: () => void;
}

export function ModeSelector({
  onSelectMode,
  onStudyGuide,
  score,
  storedStats,
  onClearStats,
}: ModeSelectorProps) {
  const hasHistory =
    storedStats !== null && storedStats.roundsCompleted > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-[var(--font-ocr)] text-xs tracking-[0.3em] text-[rgb(var(--neon)/0.5)] uppercase">
              MSA-v1
            </span>
            {score > 0 && (
              <>
                <span className="text-[rgb(var(--neon)/0.15)]">│</span>
                <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.7)]">
                  Session: {score.toLocaleString()} pts
                </span>
              </>
            )}
          </div>
          <h1 className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--neon))]">
            Mail Sort Academy
          </h1>
          <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed max-w-lg">
            Unofficial USPS Academy study game for mail classes, UBBM,
            endorsements, and accountable handling.
          </p>
        </div>

        {/* Lifetime stats bar */}
        {hasHistory && storedStats && (
          <div className="border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel))] px-4 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase">
                    Lifetime Score
                  </p>
                  <p className="font-[var(--font-ibm)] text-base text-[rgb(var(--neon))]">
                    {storedStats.lifetimeScore.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase">
                    Best Round
                  </p>
                  <p className="font-[var(--font-ibm)] text-base text-[rgb(var(--neon)/0.8)]">
                    {storedStats.bestRoundScore.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase">
                    Rounds
                  </p>
                  <p className="font-[var(--font-ibm)] text-base text-[rgb(var(--neon)/0.8)]">
                    {storedStats.roundsCompleted}
                  </p>
                </div>
                <div>
                  <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase">
                    Cards Answered
                  </p>
                  <p className="font-[var(--font-ibm)] text-base text-[rgb(var(--neon)/0.8)]">
                    {storedStats.cardsAnswered.toLocaleString()}
                  </p>
                </div>
                {storedStats.totalCriticalMistakes > 0 && (
                  <div>
                    <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--danger)/0.5)] uppercase">
                      Critical Errors
                    </p>
                    <p className="font-[var(--font-ibm)] text-base text-[rgb(var(--danger)/0.8)]">
                      {storedStats.totalCriticalMistakes}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={onClearStats}
                title="Clear saved stats"
                className="inline-flex items-center gap-1.5 font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta)/0.5)] hover:text-[rgb(var(--danger)/0.7)] transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Reset stats</span>
              </button>
            </div>
          </div>
        )}

        <div className="w-full h-px bg-gradient-to-r from-[rgb(var(--neon)/0.4)] via-[rgb(var(--neon)/0.1)] to-transparent" />

        {/* Mode list */}
        <div className="space-y-2">
          <p className="font-[var(--font-ocr)] text-xs tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase">
            Select Training Mode
          </p>

          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.mode}
                onClick={() => onSelectMode(m.mode)}
                className="group w-full flex items-start gap-4 px-4 py-4 border border-[rgb(var(--neon)/0.12)] bg-[rgb(var(--panel))] hover:border-[rgb(var(--neon)/0.45)] hover:bg-[rgb(var(--neon)/0.04)] transition-all duration-150 text-left cursor-pointer"
              >
                <Icon className="w-5 h-5 text-[rgb(var(--neon)/0.5)] group-hover:text-[rgb(var(--neon)/0.9)] mt-0.5 shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color)/0.9)] group-hover:text-[rgb(var(--neon)/0.95)] transition-colors">
                      {m.label}
                    </span>
                    <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.25)]">
                      {m.tag}
                    </span>
                  </div>
                  <p className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-meta))] mt-0.5 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta)/0.6)] shrink-0 hidden sm:block whitespace-nowrap">
                  {m.difficulty}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onStudyGuide}
          className="group w-full flex items-center gap-4 px-4 py-3 border border-[rgb(var(--accent)/0.2)] bg-[rgb(var(--panel))] hover:border-[rgb(var(--accent)/0.5)] hover:bg-[rgb(var(--accent)/0.04)] transition-all duration-150 text-left cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[rgb(var(--accent)/0.6)] group-hover:text-[rgb(var(--accent))] transition-colors" />
          <span className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--accent)/0.9)] transition-colors">
            Study Guide
          </span>
          <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta)/0.5)] ml-auto">
            7 core rules
          </span>
        </button>

        <p className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta)/0.5)] leading-relaxed">
          Based on public USPS/NALC references. Not an official USPS product.
          Always follow local instructions and supervisor direction.
        </p>
      </div>
    </div>
  );
}

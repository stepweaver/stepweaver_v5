"use client";

import { Trophy, RotateCcw, BookOpen } from "lucide-react";
import type { GameState } from "@/lib/mail-sort-academy/types";

interface RoundSummaryProps {
  state: GameState;
  onReset: () => void;
  onStudyGuide: () => void;
}

export function RoundSummary({ state, onReset, onStudyGuide }: RoundSummaryProps) {
  const { score, correctCount, criticalMistakes, deck } = state;
  const total = deck.length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const rating =
    criticalMistakes > 0
      ? { label: "Needs Work", color: "text-[rgb(var(--danger))]" }
      : accuracy >= 90
      ? { label: "Expert Carrier", color: "text-[rgb(var(--neon))]" }
      : accuracy >= 70
      ? { label: "Solid Route", color: "text-[rgb(var(--warn))]" }
      : { label: "Keep Drilling", color: "text-[rgb(var(--text-secondary))]" };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-lg mx-auto w-full px-4 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-[rgb(var(--neon)/0.6)]" />
          <h2 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--neon))]">
            Round Complete
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel))] px-4 py-4">
            <p className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.4)] uppercase tracking-[0.2em] mb-1">
              Final Score
            </p>
            <p className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--neon))]">
              {score.toLocaleString()}
            </p>
          </div>
          <div className="border border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel))] px-4 py-4">
            <p className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.4)] uppercase tracking-[0.2em] mb-1">
              Accuracy
            </p>
            <p className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--neon))]">
              {accuracy}%
            </p>
          </div>
          <div className="border border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--panel))] px-4 py-3">
            <p className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.4)] uppercase tracking-[0.2em] mb-1">
              Correct
            </p>
            <p className="font-[var(--font-ibm)] text-xl text-[rgb(var(--neon)/0.8)]">
              {correctCount} / {total}
            </p>
          </div>
          <div className="border border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--panel))] px-4 py-3">
            <p className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--danger)/0.5)] uppercase tracking-[0.2em] mb-1">
              Critical Errors
            </p>
            <p
              className={`font-[var(--font-ibm)] text-xl ${
                criticalMistakes > 0
                  ? "text-[rgb(var(--danger))]"
                  : "text-[rgb(var(--neon)/0.5)]"
              }`}
            >
              {criticalMistakes}
            </p>
          </div>
        </div>

        <div className="border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel))] px-4 py-3 flex items-center gap-3">
          <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta)/0.6)] uppercase tracking-[0.15em]">
            Rating:
          </span>
          <span className={`font-[var(--font-ibm)] text-base ${rating.color}`}>
            {rating.label}
          </span>
        </div>

        {criticalMistakes > 0 && (
          <div className="border border-[rgb(var(--danger)/0.4)] bg-[rgb(var(--danger)/0.06)] px-4 py-3">
            <p className="font-[var(--font-ocr)] text-xs text-[rgb(var(--danger)/0.8)] leading-relaxed">
              You made {criticalMistakes} critical safety mistake
              {criticalMistakes !== 1 ? "s" : ""}. Review the study guide rules
              on accountable mail and UBBM exceptions.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[rgb(var(--neon)/0.4)] bg-[rgb(var(--neon)/0.06)] hover:bg-[rgb(var(--neon)/0.12)] transition-colors font-[var(--font-ocr)] text-xs tracking-[0.2em] text-[rgb(var(--neon)/0.9)] uppercase cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Round
          </button>
          <button
            onClick={onStudyGuide}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[rgb(var(--accent)/0.3)] bg-[rgb(var(--accent)/0.04)] hover:bg-[rgb(var(--accent)/0.1)] transition-colors font-[var(--font-ocr)] text-xs tracking-[0.2em] text-[rgb(var(--accent)/0.8)] uppercase cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Study Guide
          </button>
        </div>
      </div>
    </div>
  );
}

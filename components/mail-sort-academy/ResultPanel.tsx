"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, Zap } from "lucide-react";
import type { EvaluationResult } from "@/lib/mail-sort-academy/types";

interface ResultPanelProps {
  result: EvaluationResult;
  onNext: () => void;
  isLastCard: boolean;
}

export function ResultPanel({ result, onNext, isLastCard }: ResultPanelProps) {
  const [studyOpen, setStudyOpen] = useState(false);

  const { correct, criticalMistake, points, correctAnswer, explanation, mistakeWarnings, isSpeedBonus } = result;

  return (
    <div className="space-y-3">
      {/* Verdict banner */}
      <div
        className={`px-4 py-3 border ${
          criticalMistake
            ? "border-[rgb(var(--danger)/0.6)] bg-[rgb(var(--danger)/0.08)]"
            : correct
            ? "border-[rgb(var(--neon)/0.4)] bg-[rgb(var(--neon)/0.06)]"
            : "border-[rgb(var(--warn)/0.4)] bg-[rgb(var(--warn)/0.05)]"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`font-[var(--font-ocr)] text-sm tracking-[0.2em] uppercase ${
                criticalMistake
                  ? "text-[rgb(var(--danger))]"
                  : correct
                  ? "text-[rgb(var(--neon))]"
                  : "text-[rgb(var(--warn))]"
              }`}
            >
              {criticalMistake
                ? "⚠ Critical Mistake"
                : correct
                ? "✓ Correct"
                : "✗ Incorrect"}
            </span>
            {isSpeedBonus && (
              <span className="inline-flex items-center gap-1 font-[var(--font-ocr)] text-[10px] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.4)] px-1.5 py-0.5">
                <Zap className="w-3 h-3" />
                Speed bonus
              </span>
            )}
          </div>
          <span
            className={`font-[var(--font-ocr)] text-sm ${
              points >= 0 ? "text-[rgb(var(--neon)/0.8)]" : "text-[rgb(var(--danger)/0.8)]"
            }`}
          >
            {points >= 0 ? "+" : ""}
            {points} pts
          </span>
        </div>
      </div>

      {/* Correct answer */}
      <div className="px-4 py-3 border border-[rgb(var(--neon)/0.12)] bg-[rgb(var(--panel))]">
        <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase mb-1">
          Correct Answer
        </p>
        <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))]">
          {correctAnswer}
        </p>
      </div>

      {/* Critical safety warning */}
      {criticalMistake && mistakeWarnings && mistakeWarnings.length > 0 && (
        <div className="px-4 py-3 border border-[rgb(var(--danger)/0.5)] bg-[rgb(var(--danger)/0.07)]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[rgb(var(--danger)/0.8)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.15em] text-[rgb(var(--danger)/0.8)] uppercase">
                Safety Warning
              </p>
              {mistakeWarnings.map((w, i) => (
                <p
                  key={i}
                  className="font-[var(--font-ibm)] text-xs text-[rgb(var(--danger)/0.7)] leading-relaxed"
                >
                  {w}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Study this rule (collapsible) */}
      <div className="border border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--panel))]">
        <button
          className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[rgb(var(--neon)/0.03)] transition-colors cursor-pointer"
          onClick={() => setStudyOpen((v) => !v)}
          aria-expanded={studyOpen}
        >
          {studyOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.4)]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.3)]" />
          )}
          <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.2em] text-[rgb(var(--neon)/0.5)] uppercase">
            Study this rule
          </span>
        </button>

        {studyOpen && (
          <div className="px-4 pb-4 border-t border-[rgb(var(--neon)/0.08)]">
            <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed mt-3">
              {explanation}
            </p>
            {!criticalMistake && mistakeWarnings && mistakeWarnings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[rgb(var(--warn)/0.15)]">
                {mistakeWarnings.map((w, i) => (
                  <p
                    key={i}
                    className="font-[var(--font-ibm)] text-xs text-[rgb(var(--warn)/0.7)] leading-relaxed"
                  >
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next / Finish button */}
      <button
        onClick={onNext}
        className="w-full px-4 py-3 border border-[rgb(var(--neon)/0.4)] bg-[rgb(var(--neon)/0.06)] hover:bg-[rgb(var(--neon)/0.12)] hover:border-[rgb(var(--neon)/0.7)] transition-all font-[var(--font-ocr)] text-xs tracking-[0.2em] text-[rgb(var(--neon)/0.9)] uppercase cursor-pointer"
      >
        {isLastCard ? "See Results →" : "Next Card [Enter]"}
      </button>
    </div>
  );
}

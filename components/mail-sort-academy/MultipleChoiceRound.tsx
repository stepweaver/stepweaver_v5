"use client";

import type { GameMode } from "@/lib/mail-sort-academy/types";
import { getAnswerChoices } from "@/lib/mail-sort-academy/gameLogic";

interface MultipleChoiceRoundProps {
  mode: GameMode;
  onAnswer: (_answer: string) => void;
  disabled?: boolean;
}

export function MultipleChoiceRound({
  mode,
  onAnswer,
  disabled = false,
}: MultipleChoiceRoundProps) {
  const choices = getAnswerChoices(mode);

  return (
    <div className="space-y-2">
      <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase mb-3">
        Your Answer
        {choices.length <= 9 && (
          <span className="ml-2 text-[rgb(var(--text-meta)/0.5)]">
            (keys 1–{choices.length})
          </span>
        )}
      </p>

      <div className="grid gap-2">
        {choices.map((choice, idx) => {
          const keyHint = idx < 9 ? `${idx + 1}` : null;
          return (
            <button
              key={choice.value}
              onClick={() => !disabled && onAnswer(choice.value)}
              disabled={disabled}
              className="group flex items-start gap-3 px-4 py-3 border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel))] hover:border-[rgb(var(--neon)/0.5)] hover:bg-[rgb(var(--neon)/0.05)] transition-all duration-100 text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {keyHint && (
                <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.35)] group-hover:text-[rgb(var(--neon)/0.7)] transition-colors shrink-0 w-4 text-center mt-0.5">
                  {keyHint}
                </span>
              )}
              <span className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color)/0.85)] group-hover:text-[rgb(var(--neon)/0.95)] transition-colors leading-snug">
                {choice.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import type { GameState } from "@/lib/mail-sort-academy/types";

interface ScorePanelProps {
  state: Pick<
    GameState,
    "score" | "streak" | "correctCount" | "wrongCount" | "criticalMistakes" | "deck" | "cardIndex" | "mode"
  >;
}

export function ScorePanel({ state }: ScorePanelProps) {
  const { score, streak, correctCount, wrongCount, criticalMistakes, deck, cardIndex } = state;
  const total = deck.length;
  const answered = correctCount + wrongCount;

  return (
    <div className="border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel))] px-4 py-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase block">
              Score
            </span>
            <span className="font-[var(--font-ibm)] text-lg text-[rgb(var(--neon))]">
              {score.toLocaleString()}
            </span>
          </div>

          {streak >= 2 && (
            <div>
              <span className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--warn)/0.5)] uppercase block">
                Streak
              </span>
              <span className="font-[var(--font-ibm)] text-base text-[rgb(var(--warn)/0.9)]">
                ×{streak}
              </span>
            </div>
          )}

          {answered > 0 && (
            <div className="flex items-center gap-2 text-xs font-[var(--font-ocr)]">
              <span className="text-[rgb(var(--neon)/0.7)]">
                {correctCount}✓
              </span>
              <span className="text-[rgb(var(--danger)/0.6)]">
                {wrongCount}✗
              </span>
              {criticalMistakes > 0 && (
                <span className="text-[rgb(var(--danger))] font-bold">
                  {criticalMistakes}⚠
                </span>
              )}
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-[rgb(var(--neon)/0.1)] overflow-hidden">
              <div
                className="h-full bg-[rgb(var(--neon)/0.5)] transition-all duration-300"
                style={{
                  width: `${Math.min(100, (cardIndex / total) * 100)}%`,
                }}
              />
            </div>
            <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))]">
              {cardIndex}/{total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameMode, GameState } from "./types";

const STORAGE_KEY = "msa-v1-stats";

export type StoredStats = {
  lifetimeScore: number;
  bestRoundScore: number;
  roundsCompleted: number;
  cardsAnswered: number;
  totalCorrect: number;
  totalCriticalMistakes: number;
  lastMode: GameMode | null;
};

const DEFAULT_STATS: StoredStats = {
  lifetimeScore: 0,
  bestRoundScore: 0,
  roundsCompleted: 0,
  cardsAnswered: 0,
  totalCorrect: 0,
  totalCriticalMistakes: 0,
  lastMode: null,
};

function safeRead(): StoredStats {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function safeWrite(data: StoredStats): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Unavailable in private browsing or when quota is exceeded
  }
}

type RoundSnapshot = Pick<
  GameState,
  "score" | "correctCount" | "criticalMistakes" | "deck" | "mode"
>;

export function useGameStorage() {
  const [stats, setStats] = useState<StoredStats>(DEFAULT_STATS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on the client
  useEffect(() => {
    setStats(safeRead());
    setHydrated(true);
  }, []);

  const saveRound = useCallback((round: RoundSnapshot) => {
    setStats((prev) => {
      const next: StoredStats = {
        lifetimeScore: prev.lifetimeScore + round.score,
        bestRoundScore: Math.max(prev.bestRoundScore, round.score),
        roundsCompleted: prev.roundsCompleted + 1,
        cardsAnswered: prev.cardsAnswered + round.deck.length,
        totalCorrect: prev.totalCorrect + round.correctCount,
        totalCriticalMistakes:
          prev.totalCriticalMistakes + round.criticalMistakes,
        lastMode: round.mode,
      };
      safeWrite(next);
      return next;
    });
  }, []);

  const clearStats = useCallback(() => {
    safeWrite(DEFAULT_STATS);
    setStats(DEFAULT_STATS);
  }, []);

  return { stats, hydrated, saveRound, clearStats };
}

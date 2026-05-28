"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

import type { GameMode, GamePhase, GameState } from "@/lib/mail-sort-academy/types";
import {
  evaluateAnswer,
  getAnswerChoices,
  buildRoundDeck,
} from "@/lib/mail-sort-academy/gameLogic";
import { useGameStorage } from "@/lib/mail-sort-academy/useGameStorage";

import { ModeSelector } from "./ModeSelector";
import { MailCardDisplay } from "./MailCardDisplay";
import { MultipleChoiceRound } from "./MultipleChoiceRound";
import { ResultPanel } from "./ResultPanel";
import { ScorePanel } from "./ScorePanel";
import { StudyGuidePanel } from "./StudyGuidePanel";
import { RoundSummary } from "./RoundSummary";

// ─── State & Reducer ─────────────────────────────────────────────────────────

const initialState: GameState = {
  phase: "mode_select",
  mode: null,
  deck: [],
  cardIndex: 0,
  score: 0,
  streak: 0,
  correctCount: 0,
  wrongCount: 0,
  criticalMistakes: 0,
  lastResult: null,
  answerStartTime: null,
};

type Action =
  | { type: "SELECT_MODE"; mode: GameMode }
  | { type: "SUBMIT_ANSWER"; answer: string; elapsedMs: number }
  | { type: "NEXT_CARD" }
  | { type: "RESET" }
  | { type: "STUDY_GUIDE" }
  | { type: "BACK_FROM_STUDY" };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SELECT_MODE": {
      const deck = buildRoundDeck(action.mode, 10);
      return {
        ...initialState,
        score: state.score,
        phase: "playing",
        mode: action.mode,
        deck,
        answerStartTime: Date.now(),
      };
    }

    case "SUBMIT_ANSWER": {
      if (!state.mode || !state.deck[state.cardIndex]) return state;
      const card = state.deck[state.cardIndex];
      const result = evaluateAnswer(
        card,
        state.mode,
        action.answer,
        action.elapsedMs
      );
      return {
        ...state,
        phase: "result",
        score: Math.max(0, state.score + result.points),
        streak: result.correct ? state.streak + 1 : 0,
        correctCount: result.correct
          ? state.correctCount + 1
          : state.correctCount,
        wrongCount: !result.correct ? state.wrongCount + 1 : state.wrongCount,
        criticalMistakes: result.criticalMistake
          ? state.criticalMistakes + 1
          : state.criticalMistakes,
        lastResult: result,
        answerStartTime: null,
      };
    }

    case "NEXT_CARD": {
      const next = state.cardIndex + 1;
      if (next >= state.deck.length) {
        return { ...state, phase: "round_summary" };
      }
      return {
        ...state,
        phase: "playing",
        cardIndex: next,
        lastResult: null,
        answerStartTime: Date.now(),
      };
    }

    case "RESET":
      return { ...initialState };

    case "STUDY_GUIDE":
      return { ...state, phase: "study_guide" };

    case "BACK_FROM_STUDY":
      return {
        ...state,
        phase:
          state.mode && state.phase === "study_guide" && state.deck.length > 0
            ? "playing"
            : "mode_select",
        answerStartTime:
          state.lastResult === null && state.mode
            ? Date.now()
            : state.answerStartTime,
      };

    default:
      return state;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GameShell() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { stats, hydrated, saveRound, clearStats } = useGameStorage();

  // Detect the moment the phase transitions into round_summary and save once
  const prevPhaseRef = useRef<GamePhase>("mode_select");
  useEffect(() => {
    if (
      state.phase === "round_summary" &&
      prevPhaseRef.current !== "round_summary"
    ) {
      saveRound(state);
    }
    prevPhaseRef.current = state.phase;
  });

  const handleAnswer = useCallback(
    (value: string) => {
      if (state.phase !== "playing") return;
      const elapsedMs = state.answerStartTime
        ? Date.now() - state.answerStartTime
        : 0;
      dispatch({ type: "SUBMIT_ANSWER", answer: value, elapsedMs });
    },
    [state.phase, state.answerStartTime]
  );

  const handleNext = useCallback(() => {
    dispatch({ type: "NEXT_CARD" });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "Escape") {
        dispatch({ type: "RESET" });
        return;
      }

      if (state.phase === "result" && e.key === "Enter") {
        handleNext();
        return;
      }

      if (state.phase === "playing" && state.mode) {
        const choices = getAnswerChoices(state.mode);
        const idx = parseInt(e.key, 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < choices.length) {
          handleAnswer(choices[idx].value);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, state.mode, handleAnswer, handleNext]);

  const currentCard = state.deck[state.cardIndex] ?? null;
  const isLastCard = state.cardIndex === state.deck.length - 1;

  return (
    <div className="relative flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar */}
      <header className="shrink-0 border-b border-[rgb(var(--neon)/0.18)] bg-[rgb(var(--border)/0.35)] backdrop-blur-sm px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href="/carrier-journal"
            className="inline-flex items-center gap-1.5 text-[rgb(var(--neon)/0.6)] hover:text-[rgb(var(--neon))] font-[var(--font-ocr)] text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Carrier Journal</span>
          </Link>
          <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">
            │
          </span>
          <span className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.7)] uppercase hidden sm:inline">
            Mail Sort Academy
          </span>
          <span className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.7)] uppercase sm:hidden">
            MSA
          </span>
        </div>

        <div className="flex items-center gap-3">
          {state.phase !== "mode_select" && state.phase !== "study_guide" && (
            <button
              onClick={() => dispatch({ type: "STUDY_GUIDE" })}
              className="inline-flex items-center gap-1.5 text-[rgb(var(--accent)/0.6)] hover:text-[rgb(var(--accent))] font-[var(--font-ocr)] text-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Study</span>
            </button>
          )}
          {state.phase !== "mode_select" && (
            <button
              onClick={() => dispatch({ type: "RESET" })}
              className="font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta)/0.6)] hover:text-[rgb(var(--text-meta))] transition-colors cursor-pointer"
            >
              [Esc] Modes
            </button>
          )}
          {state.score > 0 && (
            <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.8)]">
              {state.score.toLocaleString()} pts
            </span>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {state.phase === "mode_select" && (
          <ModeSelector
            onSelectMode={(mode) => dispatch({ type: "SELECT_MODE", mode })}
            onStudyGuide={() => dispatch({ type: "STUDY_GUIDE" })}
            score={state.score}
            storedStats={hydrated ? stats : null}
            onClearStats={clearStats}
          />
        )}

        {state.phase === "study_guide" && (
          <StudyGuidePanel onBack={() => dispatch({ type: "BACK_FROM_STUDY" })} />
        )}

        {state.phase === "round_summary" && (
          <RoundSummary
            state={state}
            onReset={() => dispatch({ type: "RESET" })}
            onStudyGuide={() => dispatch({ type: "STUDY_GUIDE" })}
          />
        )}

        {(state.phase === "playing" || state.phase === "result") &&
          currentCard &&
          state.mode && (
            <div className="h-full overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                <ScorePanel state={state} />

                <MailCardDisplay
                  card={currentCard}
                  mode={state.mode}
                  cardNumber={state.cardIndex + 1}
                  totalCards={state.deck.length}
                />

                {state.phase === "playing" && (
                  <MultipleChoiceRound
                    mode={state.mode}
                    onAnswer={handleAnswer}
                  />
                )}

                {state.phase === "result" && state.lastResult && (
                  <ResultPanel
                    result={state.lastResult}
                    onNext={handleNext}
                    isLastCard={isLastCard}
                  />
                )}
              </div>
            </div>
          )}
      </main>

      {/* Status bar */}
      <footer className="shrink-0 border-t border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--border)/0.35)] backdrop-blur-sm px-4 py-1.5 flex items-center gap-3 overflow-x-auto">
        <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.5)] whitespace-nowrap">
          MSA-v1
        </span>
        <span className="text-[rgb(var(--neon)/0.1)]">│</span>
        <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))] whitespace-nowrap">
          Unofficial study tool, not an official USPS product
        </span>
        {state.mode && (
          <>
            <span className="text-[rgb(var(--neon)/0.1)] hidden sm:inline">
              │
            </span>
            <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta)/0.6)] uppercase hidden sm:inline whitespace-nowrap">
              {state.mode.replace(/_/g, " ")}
            </span>
          </>
        )}
      </footer>
    </div>
  );
}

"use client";

import { DICE_COLORS } from "@/lib/dice-constants";
import { Lock, LockOpen } from "lucide-react";
import type { RollResult } from "@/lib/roller";

export function formatResultForDisplay(result: RollResult): string {
  if (!result?.breakdown?.length) return result?.notation || "";
  let out = result.breakdown.map((g) => `${g.notation}[ ${g.results.join(", ")} ]`).join(" | ");
  if (result.modifier !== 0) {
    out += result.modifier > 0 ? ` +${result.modifier}` : ` ${result.modifier}`;
  }
  return out;
}

export function DiceResult({
  result,
  heldDice,
  onToggleDiceHold,
  onReroll,
  className = "",
  variant = "default",
  totalLabel = "TOTAL",
  hideResultComment = false,
  showInlineReroll = true,
}: {
  result: RollResult;
  heldDice?: Set<string>;
  onToggleDiceHold?: (_groupIndex: number, _resultIndex: number) => void;
  onReroll?: () => void;
  className?: string;
  variant?: "default" | "readout";
  totalLabel?: string;
  hideResultComment?: boolean;
  showInlineReroll?: boolean;
}) {
  const isReadout = variant === "readout";

  const shellClass = isReadout
    ? `border-l-2 border-[rgb(var(--accent)/0.5)] py-0.5 pl-2.5 sm:py-1 sm:pl-3 ${className}`
    : `bg-[rgb(var(--panel)/0.2)] p-3 sm:p-3.5 ${className}`;

  const rowBtnClass = isReadout
    ? "p-0.5 rounded-none transition-colors cursor-pointer"
    : "p-0.5 rounded transition-colors cursor-pointer";

  const maxRollBg = "rgb(var(--neon) / 0.12)";

  const body = (
    <div className={`space-y-1.5 ${isReadout ? "" : "mb-2"}`}>
      {result.breakdown?.length ? (
        result.breakdown.map((group, index) => {
          const sides = parseInt(group.notation.match(/\d+d(\d+)/)?.[1] || "0", 10);
          const color = DICE_COLORS[sides] || "var(--color-terminal-green)";
          const groupTotal = group.results.reduce((sum, value) => sum + value, 0);
          return (
            <div
              key={index}
              className={`flex items-start gap-2 py-0.5 ${isReadout ? "font-mono text-sm" : ""}`}
            >
              <span
                style={{ color }}
                className="font-mono font-bold text-sm shrink-0 tabular-nums"
              >
                {group.notation}
              </span>
              <span className="font-mono text-base text-[rgb(var(--neon)/0.8)] break-words min-w-0">
                <span className="text-[rgb(var(--neon)/0.5)]">[ </span>
                {group.results.map((roll, rollIndex) => {
                  const key = `${index}-${rollIndex}`;
                  const isHeld = heldDice?.has(key);
                  const isMax = roll === sides;
                  return (
                    <span key={rollIndex} className="inline-flex items-center gap-0.5 mr-1.5">
                      {rollIndex > 0 ? <span className="text-[rgb(var(--neon)/0.4)]">, </span> : null}
                      <span
                        style={{
                          color: isHeld ? "var(--color-terminal-yellow)" : color,
                          backgroundColor: isMax && !isHeld ? maxRollBg : "transparent",
                        }}
                        className="font-bold text-lg leading-none tabular-nums"
                      >
                        {roll}
                      </span>
                      {onToggleDiceHold ? (
                        <button
                          type="button"
                          onClick={() => onToggleDiceHold(index, rollIndex)}
                          className={
                            isHeld
                              ? `${rowBtnClass} text-[rgb(var(--yellow))] hover:text-[rgb(var(--yellow)/0.8)]`
                              : `${rowBtnClass} text-[rgb(var(--neon)/0.4)] hover:text-[rgb(var(--neon)/0.7)]`
                          }
                          aria-label={isHeld ? `Unhold die ${roll}` : `Hold die ${roll}`}
                        >
                          {isHeld ? <Lock size={10} className="shrink-0" /> : <LockOpen size={10} className="shrink-0" />}
                        </button>
                      ) : null}
                    </span>
                  );
                })}
                <span className="text-[rgb(var(--neon)/0.5)]"> ]</span>
              </span>
              <span className="ml-auto font-[var(--font-ibm)] text-sm text-[rgb(var(--neon)/0.75)] shrink-0 tabular-nums">
                = {groupTotal}
              </span>
            </div>
          );
        })
      ) : (
        <p className="font-mono text-base text-[rgb(var(--neon)/0.8)]">{result.notation}</p>
      )}

      {(result.modifier !== 0 || (result.comment && !hideResultComment)) && (
        <div
          className={`flex items-center justify-between gap-2 ${
            isReadout ? "pt-1 border-t border-[rgb(var(--neon)/0.12)]" : ""
          }`}
        >
          {result.modifier !== 0 ? (
            <span className="text-sm font-bold text-[rgb(var(--neon)/0.7)] shrink-0 tabular-nums">
              {result.modifier > 0 ? "+" : ""}
              {result.modifier}
            </span>
          ) : (
            <span />
          )}
          {result.comment && !hideResultComment ? (
            <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.5)] italic truncate max-w-[70%]">
              &quot;{result.comment}&quot;
            </span>
          ) : null}
        </div>
      )}
    </div>
  );

  const instruction = onToggleDiceHold ? (
    <p
      className={`font-[var(--font-ocr)] text-[9px] text-[rgb(var(--text-meta))] ${
        isReadout ? "mt-2.5 tracking-[0.06em]" : "mb-1.5"
      }`}
    >
      LOCK DICE TO PRESERVE // REROLL UNHELD
    </p>
  ) : null;

  const totalRow = isReadout ? (
    <div className="mt-3 flex items-baseline gap-2 min-w-0">
      <span className="font-[var(--font-ocr)] text-xs sm:text-sm text-[rgb(var(--chrome)/0.75)] shrink-0 tracking-[0.12em]">
        {totalLabel}
      </span>
      <span
        className="flex-1 min-w-[1rem] border-b border-dotted border-[rgb(var(--neon)/0.35)] translate-y-[-0.35em]"
        aria-hidden
      />
      <span className="font-mono text-2xl sm:text-3xl font-bold text-[rgb(var(--text-color))] tabular-nums shrink-0 leading-none">
        {result.total}
      </span>
    </div>
  ) : (
    <div className="flex justify-between items-center py-2 px-2.5 bg-[rgb(var(--panel)/0.3)]">
      <span className="font-[var(--font-ocr)] text-sm text-[rgb(var(--neon)/0.6)]">{totalLabel}</span>
      <span className="font-[var(--font-ibm)] text-xl sm:text-2xl leading-none font-bold text-neon">
        = {result.total}
      </span>
    </div>
  );

  const rerollBtn =
    onReroll && heldDice && heldDice.size > 0 && showInlineReroll ? (
      <button
        type="button"
        onClick={onReroll}
        className="mt-2 w-full py-1.5 px-2 bg-[rgb(var(--panel)/0.3)] text-[rgb(var(--neon)/0.8)] hover:bg-[rgb(var(--neon)/0.2)] hover:text-neon font-[var(--font-ocr)] text-sm transition-colors cursor-pointer rounded-none border border-[rgb(var(--neon)/0.2)]"
      >
        RE-ROLL UNHELD
      </button>
    ) : null;

  return (
    <div className={shellClass}>
      {body}
      {instruction}
      {totalRow}
      {rerollBtn}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { UI_CONSTANTS } from "@/lib/dice-constants";
import type { RollResult } from "@/lib/roller";

function formatTimestamp(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

export function RollHistory({
  history,
  onSelectRoll,
  onEditComment,
  onClearHistory,
  isExpanded = false,
  onToggleExpanded,
}: {
  history: RollResult[];
  onSelectRoll?: (_roll: RollResult) => void;
  onEditComment?: (_index: number, _comment: string) => void;
  onClearHistory?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (index: number, currentComment: string | undefined) => {
    setEditingIndex(index);
    setEditValue(currentComment || "");
  };

  const handleSaveEdit = (index: number) => {
    onEditComment?.(index, editValue);
    setEditingIndex(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  if (!history || history.length === 0) {
    return (
      <div className="bg-[rgb(var(--panel)/0.1)] px-3 py-2">
        <p className="font-[var(--font-ocr)] text-[11px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase">
          Roll history
        </p>
        <p className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.5)] mt-1">No rolls yet.</p>
      </div>
    );
  }

  const displayedHistory = isExpanded ? history : history.slice(0, 2);
  const hasMore = history.length > 2;

  return (
    <div className="flex flex-col rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.1)] overflow-hidden">
      <div className="w-full flex items-center justify-between px-3 py-2 hover:bg-[rgb(var(--panel)/0.2)] transition-colors">
        <button
          type="button"
          onClick={() => hasMore && onToggleExpanded?.()}
          className="flex items-center gap-2 text-left flex-1 min-w-0 bg-transparent border-none outline-none p-0 cursor-pointer"
        >
          <ChevronRight
            className={`w-3 h-3 text-[rgb(var(--neon)/0.5)] transition-transform duration-200 shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <span className="font-[var(--font-ocr)] text-[11px] tracking-[0.2em] text-[rgb(var(--neon)/0.5)] uppercase">
            Roll history
          </span>
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.6)]">
            ({history.length})
          </span>
        </button>
        <button
          type="button"
          onClick={() => onClearHistory?.()}
          className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--danger)/0.7)] hover:text-danger transition-colors px-2 py-0.5 shrink-0 cursor-pointer border-none bg-transparent"
        >
          CLEAR
        </button>
      </div>

      <div
        className={`overflow-y-auto max-h-[38vh] min-h-[120px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[rgb(var(--neon)/0.2)] [&::-webkit-scrollbar-thumb]:rounded ${
          !isExpanded ? "border-t border-[rgb(var(--neon)/0.1)]" : ""
        }`}
      >
        {displayedHistory.map((roll, index) => {
          let compactNotation =
            roll.breakdown?.length > 0
              ? roll.breakdown.map((g) => `${g.notation}[ ${g.results.join(", ")} ]`).join(" | ")
              : roll.notation;
          if (roll.modifier !== 0) {
            compactNotation += roll.modifier > 0 ? ` +${roll.modifier}` : ` ${roll.modifier}`;
          }
          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => editingIndex === null && onSelectRoll?.(roll)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (editingIndex === null) onSelectRoll?.(roll);
                }
              }}
              className="px-2 py-1.5 border-b border-[rgb(var(--neon)/0.05)] last:border-b-0 hover:bg-[rgb(var(--panel)/0.2)] cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-mono text-xs text-[rgb(var(--neon)/0.7)] break-words min-w-0">
                  {compactNotation}
                </span>
                <span className="font-[var(--font-ibm)] text-sm font-bold text-neon shrink-0">= {roll.total}</span>
              </div>

              {editingIndex === index ? (
                <div className="mt-2 flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 py-1 px-2 rounded bg-[rgb(var(--panel)/0.5)] border border-[rgb(var(--neon)/0.2)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xs focus:outline-none focus:border-[rgb(var(--neon)/0.5)]"
                    placeholder="Comment..."
                    maxLength={UI_CONSTANTS.MAX_HISTORY_COMMENT_LENGTH}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(index);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit(index);
                    }}
                    className="py-0.5 px-1.5 rounded border border-[rgb(var(--neon)/0.4)] text-neon text-xs cursor-pointer"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEdit();
                    }}
                    className="py-0.5 px-1.5 rounded border border-[rgb(var(--danger)/0.4)] text-danger text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {roll.comment ? (
                    <>
                      <span className="text-[9px] text-[rgb(var(--neon)/0.45)] italic truncate flex-1 min-w-0">
                        &quot;{roll.comment}&quot;
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(index, roll.comment);
                        }}
                        className="text-[11px] text-[rgb(var(--muted-color)/0.4)] hover:text-[rgb(var(--neon)/0.6)] shrink-0 cursor-pointer"
                      >
                        ✎
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(index, "");
                      }}
                      className="text-[11px] text-[rgb(var(--muted-color)/0.35)] italic hover:text-[rgb(var(--neon)/0.5)] cursor-pointer"
                    >
                      + comment
                    </button>
                  )}
                  <span className="text-[10px] text-[rgb(var(--muted-color)/0.35)] shrink-0">
                    {formatTimestamp(roll.timestamp)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

interface RollResult {
  notation: string;
  rolls: number[];
  total: number;
  timestamp: Date;
}

export default function DiceRollerPage() {
  const [pool, setPool] = useState<Array<{ count: number; sides: number; modifier: number }>>([{ count: 1, sides: 20, modifier: 0 }]);
  const [history, setHistory] = useState<RollResult[]>([]);

  const roll = useCallback(() => {
    const results: RollResult[] = [];
    for (const die of pool) {
      const rolls = Array.from({ length: die.count }, () => Math.floor(Math.random() * die.sides) + 1);
      const total = rolls.reduce((a, b) => a + b, 0) + die.modifier;
      const modStr = die.modifier > 0 ? `+${die.modifier}` : die.modifier < 0 ? `${die.modifier}` : "";
      results.push({ notation: `${die.count}d${die.sides}${modStr}`, rolls, total, timestamp: new Date() });
    }
    setHistory((prev) => [...results, ...prev].slice(0, 50));
  }, [pool]);

  const addDie = useCallback((sides: number) => {
    setPool((prev) => [...prev, { count: 1, sides, modifier: 0 }]);
  }, []);

  const removeDie = useCallback((index: number) => {
    setPool((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// DICE ROLLER"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">Dice Pool Builder</h1>
        </div>

        <div className="surface-panel p-6 sm:p-8 mb-6">
          <div className="text-label mb-4">DICE POOL</div>
          <div className="space-y-3 mb-6">
            {pool.map((die, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[rgb(var(--neon))] font-[var(--font-ocr)] text-sm w-16">{die.count}d{die.sides}</span>
                {die.modifier !== 0 && <span className="text-[rgb(var(--warn))] text-sm">{die.modifier > 0 ? "+" : ""}{die.modifier}</span>}
                <button onClick={() => removeDie(i)} className="text-xs text-[rgb(var(--red))] hover:text-[rgb(var(--danger))] transition-colors ml-auto">REMOVE</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {DICE_TYPES.map((sides) => (
              <button key={sides} onClick={() => addDie(sides)} className="glitch-button text-xs px-3 py-1">d{sides}</button>
            ))}
          </div>
          <button onClick={roll} className="glitch-button glitch-button--primary">ROLL</button>
        </div>

        {history.length > 0 && (
          <div className="surface-panel p-6 sm:p-8">
            <div className="text-label mb-4">ROLL HISTORY</div>
            <div className="space-y-2">
              {history.slice(0, 10).map((r, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <span className="text-[rgb(var(--text-meta))] font-[var(--font-ocr)] text-xs w-20">{r.notation}</span>
                  <span className="text-[rgb(var(--text-secondary))]">[{r.rolls.join(", ")}]</span>
                  <span className="text-[rgb(var(--neon))] font-[var(--font-ibm)] ml-auto">= {r.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

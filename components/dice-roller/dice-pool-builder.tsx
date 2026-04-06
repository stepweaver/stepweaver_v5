"use client";

import { useState, useEffect } from "react";
import { DICE_ICONS, DICE_TYPES, UI_CONSTANTS, getRandomColor } from "@/lib/dice-constants";
import type { DicePoolDie } from "@/lib/roller";

export function DicePoolBuilder({
  dicePool,
  onUpdatePool,
}: {
  dicePool: DicePoolDie[];
  onUpdatePool: (_next: DicePoolDie[]) => void;
}) {
  const [buttonColors, setButtonColors] = useState<Record<number, string>>({});

  useEffect(() => {
    const initial: Record<number, string> = {};
    DICE_TYPES.forEach((dice) => {
      initial[dice.sides] = getRandomColor();
    });
    setButtonColors(initial);
  }, []);

  const handleAddDice = (sides: number) => {
    const existingDie = dicePool.find((die) => die.sides === sides);
    if (existingDie) {
      onUpdatePool(
        dicePool.map((die) =>
          die.sides === sides
            ? { ...die, count: Math.min(die.count + 1, UI_CONSTANTS.MAX_DICE_COUNT) }
            : die
        )
      );
    } else {
      onUpdatePool([
        ...dicePool,
        { sides, count: 1, color: buttonColors[sides] || getRandomColor() },
      ]);
    }
  };

  const positions = [
    { left: "50%", top: "0", transform: "translateX(-50%)" },
    { right: "10%", top: "18%", transform: "" },
    { right: "10%", bottom: "18%", transform: "" },
    { left: "50%", bottom: "0", transform: "translateX(-50%)" },
    { left: "10%", bottom: "18%", transform: "" },
    { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
    { left: "10%", top: "18%", transform: "" },
  ];

  return (
    <div className="relative w-[430px] h-[360px] mx-auto max-xl:w-[72vw] max-xl:max-w-[430px] max-xl:h-[320px] max-md:w-[92vw] max-md:max-w-[360px] max-md:h-[280px]">
      {DICE_TYPES.map((dice, index) => {
        const IconComponent = DICE_ICONS[dice.sides];
        if (!IconComponent) return null;
        const pos = positions[index]!;
        const positionStyles: React.CSSProperties = {
          ...(pos.left ? { left: pos.left } : {}),
          ...(pos.right ? { right: pos.right } : {}),
          ...(pos.top ? { top: pos.top } : {}),
          ...(pos.bottom ? { bottom: pos.bottom } : {}),
          ...(pos.transform ? { transform: pos.transform } : {}),
        };
        const color = buttonColors[dice.sides] || "var(--color-terminal-green)";

        return (
          <button
            key={dice.sides}
            type="button"
            onClick={() => handleAddDice(dice.sides)}
            className="absolute p-1 bg-transparent border-none font-[var(--font-ibm)] text-xs font-bold transition-all flex flex-col items-center gap-0.5 justify-center hover:z-10 hover:drop-shadow-[0_0_8px_currentColor] hover:scale-110 cursor-pointer"
            style={{ color, ...positionStyles }}
            onMouseEnter={(e) => {
              const newColor = getRandomColor();
              e.currentTarget.style.color = newColor;
              setButtonColors((prev) => ({ ...prev, [dice.sides]: newColor }));
            }}
            aria-label={`Add ${dice.label} to pool`}
          >
            <div className="relative">
              <IconComponent
                size={62}
                className="max-xl:w-[54px] max-xl:h-[54px] max-md:w-[46px] max-md:h-[46px]"
              />
              {dice.sides === 100 ? (
                <span className="absolute -right-1.5 -bottom-1 px-1 py-px rounded-sm bg-[rgb(var(--panel)/0.9)] border border-[rgb(var(--neon)/0.6)] font-[var(--font-ocr)] text-[9px] leading-none text-neon">
                  %
                </span>
              ) : null}
            </div>
            <span className="text-sm max-md:text-xs opacity-90 font-semibold tracking-wider font-[var(--font-ocr)]">
              {dice.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

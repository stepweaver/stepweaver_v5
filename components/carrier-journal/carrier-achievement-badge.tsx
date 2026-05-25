import type { CarrierAchievement, AchievementRarity } from "@/lib/data/carrier-achievements";
import { RARITY_LABELS } from "@/lib/data/carrier-achievements";

const RARITY_BORDER: Record<AchievementRarity, string> = {
  common: "border-[rgb(var(--border)/0.5)]",
  uncommon: "border-[rgb(var(--neon)/0.5)]",
  rare: "border-[rgb(var(--warn)/0.6)]",
  legendary: "border-[rgb(var(--orange)/0.7)]",
};

const RARITY_LABEL_COLOR: Record<AchievementRarity, string> = {
  common: "text-[rgb(var(--text-label))]",
  uncommon: "text-[rgb(var(--neon))]",
  rare: "text-[rgb(var(--warn))]",
  legendary: "text-[rgb(var(--orange))]",
};

const RARITY_BG_UNLOCKED: Record<AchievementRarity, string> = {
  common: "bg-[rgb(var(--panel))]",
  uncommon: "bg-[rgb(var(--panel))]",
  rare: "bg-[rgb(var(--panel))]",
  legendary: "bg-[rgb(var(--panel))]",
};

type Props = {
  achievement: CarrierAchievement;
  unlocked: boolean;
};

export function CarrierAchievementBadge({ achievement, unlocked }: Props) {
  if (!unlocked && achievement.hidden) {
    return (
      <div className="border border-[rgb(var(--border)/0.2)] bg-[rgb(var(--panel)/0.3)] p-3 flex flex-col gap-1.5 opacity-30">
        <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))]">
          HIDDEN
        </div>
        <div className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-label))] tracking-wide">
          ??? ??? ???
        </div>
        <div className="text-[10px] text-[rgb(var(--text-label))]">
          Unlock to reveal
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="border border-[rgb(var(--border)/0.25)] bg-[rgb(var(--panel)/0.4)] p-3 flex flex-col gap-1.5 opacity-35">
        <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))]">
          LOCKED // {RARITY_LABELS[achievement.rarity]}
        </div>
        <div className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-secondary))] leading-snug line-through decoration-[rgb(var(--border))]">
          {achievement.title}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border ${RARITY_BORDER[achievement.rarity]} ${RARITY_BG_UNLOCKED[achievement.rarity]} p-3 flex flex-col gap-1.5`}
    >
      <div className={`font-[var(--font-ocr)] text-[9px] tracking-widest ${RARITY_LABEL_COLOR[achievement.rarity]}`}>
        {RARITY_LABELS[achievement.rarity]}
      </div>
      <div className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-color))] leading-snug">
        {achievement.title}
      </div>
      <div className="text-[10px] text-[rgb(var(--text-secondary))] leading-relaxed">
        {achievement.description}
      </div>
    </div>
  );
}

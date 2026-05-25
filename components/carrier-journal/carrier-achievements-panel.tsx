import {
  ACHIEVEMENTS,
  CATEGORY_LABELS,
  type AchievementCategory,
} from "@/lib/data/carrier-achievements";
import { CarrierAchievementBadge } from "./carrier-achievement-badge";

const CATEGORY_ORDER: AchievementCategory[] = [
  "break_in",
  "body",
  "weather",
  "safety",
  "route_craft",
  "community",
  "postal_culture",
  "union_literacy",
  "system_builder",
  "hidden",
];

type Props = {
  unlockedIds: Set<string>;
};

export function CarrierAchievementsPanel({ unlockedIds }: Props) {
  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          FIELD ACHIEVEMENTS
        </div>
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))]">
          {unlockedCount}&nbsp;/&nbsp;{totalCount}&nbsp;UNLOCKED
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-px bg-[rgb(var(--border)/0.2)] mb-6 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[rgb(var(--neon)/0.5)]"
          style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Category sections */}
      <div className="space-y-10">
        {CATEGORY_ORDER.map((category) => {
          const categoryAchievements = ACHIEVEMENTS.filter(
            (a) => a.category === category
          );
          const categoryUnlockedCount = categoryAchievements.filter((a) =>
            unlockedIds.has(a.id)
          ).length;

          const unlocked = categoryAchievements.filter((a) => unlockedIds.has(a.id));
          const locked = categoryAchievements.filter((a) => !unlockedIds.has(a.id));

          return (
            <div key={category}>
              <div className="flex items-baseline gap-3 mb-3">
                <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-secondary))]">
                  {CATEGORY_LABELS[category].toUpperCase()}
                </div>
                <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))]">
                  {categoryUnlockedCount}/{categoryAchievements.length}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-[rgb(var(--border)/0.1)]">
                {/* Unlocked first */}
                {unlocked.map((a) => (
                  <CarrierAchievementBadge key={a.id} achievement={a} unlocked={true} />
                ))}
                {/* Locked after */}
                {locked.map((a) => (
                  <CarrierAchievementBadge key={a.id} achievement={a} unlocked={false} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-6 font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] leading-relaxed border-t border-[rgb(var(--border)/0.15)] pt-4">
        AUTOMATIC ACHIEVEMENTS ARE DERIVED FROM PUBLIC-SAFE AGGREGATE DATA ONLY.
        MANUAL ACHIEVEMENTS ARE UNLOCKED AS MILESTONES ARE CONFIRMED.
        REFLECTION ACHIEVEMENTS REQUIRE A TAGGED OR KEYWORD-MATCHED NARRATIVE NOTE.
      </div>
    </div>
  );
}

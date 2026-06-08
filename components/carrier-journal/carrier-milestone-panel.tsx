"use client";

import {
  Activity,
  Award,
  Calendar,
  CloudRain,
  Droplets,
  Flame,
  Heart,
  MapPin,
  Package,
  Shield,
  Snowflake,
  Sun,
  Thermometer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CarrierDispatch } from "@/lib/data/carrier-journal";
import {
  getCarrierLevel,
  getCarrierMilestones,
  type CarrierMilestone,
  type CarrierMilestoneTier,
} from "@/lib/data/carrier-milestones";

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  activity: Activity,
  award: Award,
  calendar: Calendar,
  "cloud-rain": CloudRain,
  droplets: Droplets,
  flame: Flame,
  heart: Heart,
  "map-pin": MapPin,
  package: Package,
  shield: Shield,
  snowflake: Snowflake,
  sun: Sun,
  thermometer: Thermometer,
  zap: Zap,
};

// ---------------------------------------------------------------------------
// Tier colors — grounded field-record palette (no fantasy RPG hues)
// ---------------------------------------------------------------------------

const TIER_COLOR: Record<CarrierMilestoneTier, string> = {
  basic:    "rgb(148 163 184)",    // slate-400 — entry qualification
  field:    "rgb(var(--neon))",    // site neon — active field service
  campaign: "rgb(234 179 8)",      // yellow-500 — sustained campaign record
  veteran:  "rgb(167 139 250)",    // violet-400 — veteran record
};

const TIER_BORDER: Record<CarrierMilestoneTier, string> = {
  basic:    "rgba(148, 163, 184, 0.4)",
  field:    "rgba(var(--neon), 0.4)",
  campaign: "rgba(234, 179, 8, 0.4)",
  veteran:  "rgba(167, 139, 250, 0.4)",
};

const TIER_LABEL: Record<CarrierMilestoneTier, string> = {
  basic:    "BASIC QUALIFICATION",
  field:    "FIELD QUALIFICATION",
  campaign: "CAMPAIGN QUALIFICATION",
  veteran:  "VETERAN RECORD",
};

// ---------------------------------------------------------------------------
// Badge card
// ---------------------------------------------------------------------------

function BadgeCard({ badge }: { badge: CarrierMilestone }) {
  const Icon = ICON_MAP[badge.icon] ?? Award;
  const color = badge.unlocked ? TIER_COLOR[badge.tier] : "rgb(var(--text-meta, 100 116 139))";
  const borderColor = badge.unlocked ? TIER_BORDER[badge.tier] : "rgba(100, 116, 139, 0.2)";

  return (
    <div
      className="relative flex flex-col items-center gap-1.5 p-3 text-center transition-opacity"
      style={{
        border: `1px solid ${borderColor}`,
        background: badge.unlocked ? "rgb(var(--panel))" : "rgba(0,0,0,0.2)",
        opacity: badge.unlocked ? 1 : 0.45,
      }}
      title={badge.description}
    >
      {/* Tier indicator dot */}
      {badge.unlocked && (
        <div
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: TIER_COLOR[badge.tier] }}
        />
      )}

      {/* Icon */}
      <Icon
        size={20}
        strokeWidth={1.5}
        style={{ color }}
      />

      {/* Short label */}
      <div
        className="font-[var(--font-ocr)] text-[9px] tracking-widest leading-tight"
        style={{ color }}
      >
        {badge.shortLabel}
      </div>

      {/* Progress (when locked and target > 1) */}
      {!badge.unlocked && badge.target > 1 && (
        <div className="font-[var(--font-ocr)] text-[8px] text-[rgb(var(--text-meta))] tracking-wide leading-tight">
          {badge.progress.toLocaleString()}/{badge.target.toLocaleString()}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-1.5 w-full bg-[rgb(var(--border)/0.2)] overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

type Props = {
  dispatches: CarrierDispatch[];
};

export function CarrierMilestonePanel({ dispatches }: Props) {
  const level = getCarrierLevel(dispatches);
  const milestones = getCarrierMilestones(dispatches);
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  const tierOrder: CarrierMilestoneTier[] = ["basic", "field", "campaign", "veteran"];

  const milesUntilNext = level.nextMiles != null
    ? Math.max(0, Math.round((level.nextMiles - level.totalMiles) * 10) / 10)
    : null;

  return (
    <div className="surface-panel p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))] mb-1">
            FIELD QUALIFICATIONS // CARRIER RECORD
          </div>
          <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))]">
            {level.title}
          </div>
        </div>
        <div className="border border-[rgb(var(--neon)/0.2)] px-3 py-2 text-center min-w-[72px] shrink-0">
          <div className="font-[var(--font-ibm)] text-xl text-[rgb(var(--neon))]">
            {unlockedCount}/{milestones.length}
          </div>
          <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
            QUALS
          </div>
        </div>
      </div>

      {/* Rank progression */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-[var(--font-ocr)] tracking-widest">
          <span className="text-[rgb(var(--text-label))]">
            {level.totalMiles} mi
          </span>
          {level.nextTitle && milesUntilNext != null && (
            <span className="text-[rgb(var(--text-meta))]">
              {milesUntilNext} mi until {level.nextTitle}
            </span>
          )}
        </div>
        <ProgressBar value={level.progressToNext} color="rgb(var(--neon))" />
      </div>

      {/* Qualification groups by tier */}
      {tierOrder.map((tier) => {
        const badges = milestones.filter((m) => m.tier === tier);
        if (badges.length === 0) return null;
        return (
          <div key={tier}>
            <div
              className="font-[var(--font-ocr)] text-[9px] tracking-[0.25em] mb-2"
              style={{ color: TIER_COLOR[tier] }}
            >
              {TIER_LABEL[tier]}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5">
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] pt-1 border-t border-[rgb(var(--border)/0.15)]">
        QUALIFICATIONS COMPUTED FROM FIELD DATA
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

type Props = {
  /** Achievement IDs computed server-side that are not yet stored in Notion. */
  newlyUnlockedIds: string[];
};

/**
 * Invisible client component that fires a single POST after hydration to write
 * newly-detected achievement unlocks back to the Notion Achievement Unlocks DB.
 * Fire-and-forget: no UI, no error display, no retry.
 */
export function CarrierAchievementSync({ newlyUnlockedIds }: Props) {
  useEffect(() => {
    if (newlyUnlockedIds.length === 0) return;
    fetch("/api/carrier-journal/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: newlyUnlockedIds }),
    }).catch(() => {});
    // Run once on mount only — deps intentionally empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

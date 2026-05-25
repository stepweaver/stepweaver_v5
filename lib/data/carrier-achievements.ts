/**
 * Carrier's Log achievement system.
 * Public-safe. All evaluation operates on aggregated, sanitized fields only.
 * No addresses, route numbers, names, scanner data, or official mail volume.
 */

import type { CarrierDispatch, CarrierTotals } from "./carrier-journal";

export type AchievementCategory =
  | "break_in"
  | "body"
  | "weather"
  | "safety"
  | "route_craft"
  | "community"
  | "postal_culture"
  | "union_literacy"
  | "system_builder"
  | "hidden";

export type AchievementRarity = "common" | "uncommon" | "rare" | "legendary";

export type AchievementUnlockType = "automatic" | "manual" | "reflection";

export type CarrierAchievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  unlockType: AchievementUnlockType;
  publicSafe: boolean;
  hidden?: boolean;
  sourceNote?: string;
};

export type CarrierAchievementUnlock = {
  achievementId: string;
  unlockedAt: string;
  entryId?: string;
  manualNote?: string;
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  break_in: "Break-In Arc",
  body: "Mailwalker Body",
  weather: "Weather & Environment",
  safety: "Safety & Situational Awareness",
  route_craft: "Route Craft",
  community: "Community Witness",
  postal_culture: "Postal Culture & Service",
  union_literacy: "Union Literacy",
  system_builder: "System Builder",
  hidden: "Hidden & Rare",
};

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: "COMMON",
  uncommon: "UNCOMMON",
  rare: "RARE",
  legendary: "LEGENDARY",
};

export const ACHIEVEMENTS: CarrierAchievement[] = [
  // ── Break-In Arc ──────────────────────────────────────────────────────────
  {
    id: "shadow_day",
    title: "Shadow Day",
    description: "First logged shadow or training day.",
    category: "break_in",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_satchel",
    title: "The Satchel Chooses You",
    description: "First day carrying a satchel.",
    category: "break_in",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_10_mile_day",
    title: "Ten-Mile Initiate",
    description: "First day over 10 walking miles.",
    category: "break_in",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "first_25k_steps",
    title: "Twenty-Five Thousand Footfalls",
    description: "First day over 25,000 steps.",
    category: "break_in",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "first_full_route",
    title: "Full Loop Completed",
    description: "First full route or assignment completed.",
    category: "break_in",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "first_back_to_back",
    title: "Back-to-Back Carrier",
    description: "Two logged workdays in a row.",
    category: "break_in",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "week_one_survivor",
    title: "Week One Survivor",
    description: "Five logged field days.",
    category: "break_in",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "first_brutal_day",
    title: "Brutal Load, Still Standing",
    description: "First day tagged as a brutal mail load.",
    category: "break_in",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "panic_to_pace",
    title: "Pace Beats Panic",
    description: "Logged reflection mentioning pacing improvement.",
    category: "break_in",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "not_dead_yet",
    title: "Not Dead Yet",
    description: "High-mile day followed by next-day soreness at 3 or below.",
    category: "break_in",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "break_in_complete",
    title: "Break-In Complete",
    description: "Phase advanced out of Break-In.",
    category: "break_in",
    rarity: "rare",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "mailwalker_mode",
    title: "Mailwalker Mode",
    description: "Phase advanced to Mailwalker Mode.",
    category: "break_in",
    rarity: "legendary",
    unlockType: "manual",
    publicSafe: true,
  },

  // ── Mailwalker Body ────────────────────────────────────────────────────────
  {
    id: "fifty_miles",
    title: "50 Miles Delivered",
    description: "50 cumulative walking miles logged.",
    category: "body",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hundred_miles",
    title: "100 Miles Delivered",
    description: "100 cumulative walking miles.",
    category: "body",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "two_fifty_miles",
    title: "250 Miles Delivered",
    description: "250 cumulative walking miles.",
    category: "body",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "five_hundred_miles",
    title: "500 Miles Delivered",
    description: "500 cumulative walking miles.",
    category: "body",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "thousand_miles",
    title: "The Long Walk",
    description: "1,000 cumulative walking miles.",
    category: "body",
    rarity: "legendary",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hundred_k_steps",
    title: "100K Steps",
    description: "100,000 cumulative steps.",
    category: "body",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "million_steps",
    title: "Million-Step Carrier",
    description: "1,000,000 cumulative steps.",
    category: "body",
    rarity: "legendary",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hydration_rookie",
    title: "Water Before Pride",
    description: "First day meeting the hydration goal.",
    category: "body",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hydration_streak_3",
    title: "Three-Day Hydration Discipline",
    description: "Hydration goal met three logged days in a row.",
    category: "body",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hydration_streak_10",
    title: "The Canteen Doctrine",
    description: "Hydration goal met 10 or more times total.",
    category: "body",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "low_soreness_high_miles",
    title: "Adaptation Signal",
    description: "8+ miles walked with soreness at 2 or below.",
    category: "body",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "recovery_logged",
    title: "Recovery Is Part of the Route",
    description: "First recovery note logged.",
    category: "body",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hip_protocol",
    title: "Hip Maintenance Protocol",
    description: "Recovery note includes hip, piriformis, QL, or stretching.",
    category: "body",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "shoe_lesson",
    title: "Shoes Matter",
    description: "First footwear or shoe note logged.",
    category: "body",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "body_debugger",
    title: "Body Debugger",
    description: "10 entries include soreness, energy, mood, and recovery.",
    category: "body",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },

  // ── Weather & Environment ──────────────────────────────────────────────────
  {
    id: "first_heat_day",
    title: "First Heat Day",
    description: "First entry tagged as a heat or high heat-index day.",
    category: "weather",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "heat_protocol",
    title: "Heat Protocol Activated",
    description: "Heat day completed with hydration goal met.",
    category: "weather",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "first_rain_day",
    title: "Rain Walk Certified",
    description: "First rain-tagged entry.",
    category: "weather",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "first_wind_day",
    title: "Wind Has Opinions",
    description: "First high-wind-tagged entry.",
    category: "weather",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_snow_day",
    title: "Snow Route Initiate",
    description: "First snow-tagged entry.",
    category: "weather",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "first_ice_day",
    title: "Ice Discipline",
    description: "First ice or slip-risk day logged.",
    category: "weather",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "weather_stack",
    title: "Same Route, Different Planet",
    description: "Three different weather types logged across days.",
    category: "weather",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "summer_carrier",
    title: "Summer Carrier",
    description: "10 heat-season entries logged.",
    category: "weather",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "winter_carrier",
    title: "Winter Carrier",
    description: "10 cold, snow, or ice entries logged.",
    category: "weather",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "soaked_but_done",
    title: "Soaked but Done",
    description: "Rain day completed with mood at 5 or above.",
    category: "weather",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "heat_respecter",
    title: "Respect the Heat",
    description: "Heat day with pace, break, or hydration adjustment logged.",
    category: "weather",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "storm_sense",
    title: "Storm Sense",
    description: "Entry notes weather changed operational choices.",
    category: "weather",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },

  // ── Safety & Situational Awareness ────────────────────────────────────────
  {
    id: "first_dog_tag",
    title: "Dog on Route",
    description: "First dog encounter logged.",
    category: "safety",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "dog_radar",
    title: "Dog Radar Online",
    description: "10 dog encounter days without an incident note.",
    category: "safety",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "gate_check",
    title: "Gate Check",
    description: "First gate, fence, or yard caution note logged.",
    category: "safety",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "nope_dog",
    title: "Nope Protocol",
    description: "Entry notes an unsafe dog situation successfully avoided.",
    category: "safety",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "heat_warning",
    title: "Heat Warning Light",
    description: "Heat day logged with water below goal or energy at 4 or below.",
    category: "safety",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hydration_save",
    title: "Caught It Early",
    description: "Heat warning followed by a hydration adjustment note.",
    category: "safety",
    rarity: "rare",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "slip_trip_mindset",
    title: "Eyes on the Ground",
    description: "First slip, trip, or uneven-surface note logged.",
    category: "safety",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "defensive_walking",
    title: "Defensive Walking",
    description: "Five entries with any safety signal logged.",
    category: "safety",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "scanner_down_eyes_up",
    title: "Eyes Up",
    description: "Note logged about situational awareness over rushing.",
    category: "safety",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "safe_finish",
    title: "Safe Finish",
    description: "Heavy or brutal day completed with no safety issue noted.",
    category: "safety",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "hazard_reported",
    title: "Hazard Noticed",
    description: "Public-safe hazard note logged.",
    category: "safety",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "safety_culture",
    title: "Safety Is the System",
    description: "25 entries with any safety signal.",
    category: "safety",
    rarity: "legendary",
    unlockType: "automatic",
    publicSafe: true,
  },

  // ── Route Craft ───────────────────────────────────────────────────────────
  {
    id: "satchel_adjustment",
    title: "Satchel Geometry",
    description: "First note about bag position or posture.",
    category: "route_craft",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "break_strategy",
    title: "Breaks Are Tools",
    description: "First note about strategic break or water-stop timing.",
    category: "route_craft",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "route_rhythm",
    title: "Route Rhythm",
    description: "Entry notes the route felt more predictable.",
    category: "route_craft",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "less_guessing",
    title: "Less Guessing, More Flow",
    description: "Five entries logged after the Adaptation phase begins.",
    category: "route_craft",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "steady_walk",
    title: "The Steady Walk Wins",
    description: "Entry notes steady pace over rushing.",
    category: "route_craft",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "load_reading",
    title: "Load Reader",
    description: "First perceived mail load tagged.",
    category: "route_craft",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "brutal_load_repeat",
    title: "Heavy Week",
    description: "Three heavy or brutal days logged in one calendar week.",
    category: "route_craft",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "morale_rebound",
    title: "Morale Rebound",
    description: "Mood score improves after a hard previous day.",
    category: "route_craft",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "energy_rebound",
    title: "Energy Rebound",
    description: "Energy score improves after a hard previous day.",
    category: "route_craft",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "route_notes",
    title: "Field Notes Become Systems",
    description: "10 narrative dispatches logged.",
    category: "route_craft",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "under_90_seconds",
    title: "Fast Log Discipline",
    description: "Entry marked as logged quickly and without friction.",
    category: "route_craft",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "public_safe_operator",
    title: "Public-Safe Operator",
    description: "10 entries logged with no restricted fields exposed.",
    category: "route_craft",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },

  // ── Community Witness ──────────────────────────────────────────────────────
  {
    id: "first_neighbor_story",
    title: "Neighborhood Witness",
    description: "First sanitized community or customer story logged.",
    category: "community",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "human_route",
    title: "The Route Has People In It",
    description: "Five community-reflection entries logged.",
    category: "community",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "quiet_kindness",
    title: "Quiet Kindness",
    description: "Entry tagged as a kindness or helping moment.",
    category: "community",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "something_off",
    title: "Something Felt Off",
    description: "Public-safe note about noticing an unusual pattern.",
    category: "community",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "carrier_alert_spirit",
    title: "Carrier Alert Spirit",
    description: "Entry reflects concern for a vulnerable customer, no identifying details.",
    category: "community",
    rarity: "rare",
    unlockType: "reflection",
    publicSafe: true,
    sourceNote: "Carrier Alert is a joint NALC/USPS program for monitoring elderly and disabled patrons.",
  },
  {
    id: "porch_conversation",
    title: "Porch Conversation",
    description: "Public-safe conversation with a customer or neighbor logged.",
    category: "community",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "grief_on_route",
    title: "The Mail Sees Grief",
    description: "Entry tagged with grief, loss, or community weight.",
    category: "community",
    rarity: "rare",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "small_town_radar",
    title: "Neighborhood Radar",
    description: "10 entries with community observations.",
    category: "community",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "helped_without_heroics",
    title: "Helped Without Heroics",
    description: "Entry tagged as a minor assistance moment.",
    category: "community",
    rarity: "uncommon",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "route_memory",
    title: "The Route Remembers",
    description: "Entry connects today's observation to an earlier public-safe pattern.",
    category: "community",
    rarity: "rare",
    unlockType: "reflection",
    publicSafe: true,
  },

  // ── Postal Culture & Service ───────────────────────────────────────────────
  {
    id: "uniform_ordered",
    title: "Uniform Quest Started",
    description: "First uniform order or allowance note logged.",
    category: "postal_culture",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_blue_day",
    title: "In the Blues",
    description: "First day in official carrier uniform.",
    category: "postal_culture",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "scanner_basics",
    title: "Scanner Doesn't Own Me",
    description: "First scanner-learning note logged.",
    category: "postal_culture",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_collection",
    title: "Collection Box Initiate",
    description: "First collection-related training note, no times or locations.",
    category: "postal_culture",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_accountable",
    title: "Accountable Mail Respecter",
    description: "First accountable-mail learning note, no identifying details.",
    category: "postal_culture",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_peak_day",
    title: "Peak Season Initiate",
    description: "First holiday or peak-season heavy day logged.",
    category: "postal_culture",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_holiday_push",
    title: "Holiday Push",
    description: "Logged workday during a holiday period.",
    category: "postal_culture",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "stamp_out_hunger",
    title: "Stamp Out Hunger",
    description: "Logged participation in Stamp Out Hunger food drive day.",
    category: "postal_culture",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
    sourceNote:
      "NALC Stamp Out Hunger is the nation's largest one-day food drive, held the second Saturday in May.",
  },
  {
    id: "food_drive_loader",
    title: "The Satchel Was Not Enough",
    description: "Food drive day with heavy donation load noted.",
    category: "postal_culture",
    rarity: "rare",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "first_route_hold",
    title: "Held Down",
    description: "First opt or hold-down note logged.",
    category: "postal_culture",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "career_conversion",
    title: "Career Path Marker",
    description: "Conversion milestone reached.",
    category: "postal_culture",
    rarity: "legendary",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "regular_route",
    title: "Route of One's Own",
    description: "Won or held a regular assignment.",
    category: "postal_culture",
    rarity: "legendary",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "safe_driver_30",
    title: "30 Safe Driving Days",
    description: "30 driving days without a preventable incident, self-tracked.",
    category: "postal_culture",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "safe_driver_year",
    title: "One-Year Safe Driver",
    description: "One year without a preventable incident, self-tracked.",
    category: "postal_culture",
    rarity: "rare",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "million_mile_dream",
    title: "Million Mile Dream",
    description: "Aspirational long-range badge. Keep showing up.",
    category: "postal_culture",
    rarity: "legendary",
    unlockType: "manual",
    publicSafe: true,
    sourceNote:
      "The USPS/National Safety Council Million Mile Award recognizes 1 million miles or 30 years without preventable incidents.",
  },

  // ── Union Literacy ────────────────────────────────────────────────────────
  {
    id: "met_steward",
    title: "Met the Steward",
    description: "First steward-related note logged.",
    category: "union_literacy",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "branch_awareness",
    title: "Know Your Branch",
    description: "First NALC branch or local note.",
    category: "union_literacy",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "contract_lookup",
    title: "Contract Lookup",
    description: "First National Agreement or JCAM lookup note.",
    category: "union_literacy",
    rarity: "common",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "jcam_bookmark",
    title: "JCAM Bookmark",
    description: "First JCAM-specific note logged.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
    sourceNote:
      "The JCAM is jointly prepared by NALC and USPS to explain how the National Agreement applies locally.",
  },
  {
    id: "opt_rights",
    title: "Opt Rights Unlocked",
    description: "First hold-down or opt rights note logged.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "odl_awareness",
    title: "ODL Awareness",
    description: "First ODL or work-assignment-list note.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "paper_trail",
    title: "Paper Trail Beats Memory",
    description: "First note about documenting a workplace issue.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "ask_the_steward",
    title: "Ask the Steward",
    description: "First note where a question was brought to a steward.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "fourteen_day_clock",
    title: "Fourteen-Day Clock",
    description: "First grievance-timeline learning note logged.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
    sourceNote: "NALC notes a 14-day filing window after a contract violation.",
  },
  {
    id: "resolved_informally",
    title: "Nipped in the Bud",
    description: "Issue resolved without formal conflict.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "grievance_literacy",
    title: "Grievance Literacy",
    description: "Logged understanding of wages, hours, or conditions issue.",
    category: "union_literacy",
    rarity: "rare",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "dignity_respect",
    title: "Dignity and Respect",
    description: "Note about professional treatment or workplace dignity.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "rights_not_rumors",
    title: "Rights, Not Rumors",
    description: "Note references a verified source instead of station folklore.",
    category: "union_literacy",
    rarity: "rare",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "union_culture",
    title: "Union Culture Initiate",
    description: "Five union or workplace-literacy notes logged.",
    category: "union_literacy",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
  },

  // ── System Builder ────────────────────────────────────────────────────────
  {
    id: "first_public_dispatch",
    title: "First Public Dispatch",
    description: "First public-safe entry published.",
    category: "system_builder",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "private_boundary",
    title: "Boundary Layer Active",
    description: "Entry excludes restricted details successfully.",
    category: "system_builder",
    rarity: "common",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "notion_wired",
    title: "Notion Pipeline Online",
    description: "App pulls live data from a private Notion database.",
    category: "system_builder",
    rarity: "rare",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "kpi_dashboard",
    title: "KPI Dashboard Live",
    description: "Aggregate KPIs render from live data.",
    category: "system_builder",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "achievement_engine",
    title: "Achievement Engine Online",
    description: "First achievement unlocks automatically.",
    category: "system_builder",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
  },
  {
    id: "field_first_ux",
    title: "Field-First UX",
    description: "Mobile logging flow completed and used.",
    category: "system_builder",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "ninety_second_log",
    title: "90-Second Log",
    description: "Entry captured under the friction target.",
    category: "system_builder",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "operator_reflection",
    title: "Operator Reflection",
    description: "Entry connects field work to systems thinking.",
    category: "system_builder",
    rarity: "rare",
    unlockType: "reflection",
    publicSafe: true,
  },
  {
    id: "portfolio_artifact",
    title: "This Is a Portfolio Artifact",
    description: "Page includes public explanation of why it belongs on a dev portfolio.",
    category: "system_builder",
    rarity: "rare",
    unlockType: "manual",
    publicSafe: true,
  },
  {
    id: "public_private_system",
    title: "Public/Private System Designer",
    description: "Public page correctly filters private data.",
    category: "system_builder",
    rarity: "legendary",
    unlockType: "manual",
    publicSafe: true,
  },

  // ── Hidden & Rare ─────────────────────────────────────────────────────────
  {
    id: "mystery_lawn_object",
    title: "Why Is That in the Yard?",
    description: "Tagged a weird public-safe object encountered on route.",
    category: "hidden",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "aggressive_squirrel",
    title: "Squirrel Had Standing",
    description: "Animal encounter tag: squirrel or other small animal.",
    category: "hidden",
    rarity: "uncommon",
    unlockType: "manual",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "porch_goose",
    title: "Goose Jurisdiction",
    description: "Goose or territorial bird encounter logged.",
    category: "hidden",
    rarity: "rare",
    unlockType: "manual",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "wrong_shoes_regret",
    title: "Footwear Hubris",
    description: "Shoe-related pain note logged after a bad footwear choice.",
    category: "hidden",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "hydration_debt",
    title: "Hydration Debt Collector",
    description: "Heat day with water below goal and an energy crash.",
    category: "hidden",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "tiny_victory",
    title: "Tiny Victory, Logged Anyway",
    description: "Entry tagged as a small win.",
    category: "hidden",
    rarity: "common",
    unlockType: "reflection",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "route_zen",
    title: "Route Zen",
    description: "Mood at 8 or above after 8+ miles.",
    category: "hidden",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "the_wall",
    title: "Hit the Wall",
    description: "Energy at 3 or below after 8+ miles.",
    category: "hidden",
    rarity: "uncommon",
    unlockType: "automatic",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "the_second_wind",
    title: "Second Wind",
    description: "Entry mentions recovering energy mid-route.",
    category: "hidden",
    rarity: "rare",
    unlockType: "reflection",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "mailwalker_lore",
    title: "Mailwalker Lore",
    description: "25 public dispatches logged.",
    category: "hidden",
    rarity: "legendary",
    unlockType: "automatic",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "blue_collar_boss_fight",
    title: "Blue-Collar Boss Fight",
    description: "Brutal mail load, bad weather, and soreness at 7 or above — same day.",
    category: "hidden",
    rarity: "legendary",
    unlockType: "automatic",
    publicSafe: true,
    hidden: true,
  },
  {
    id: "came_back_anyway",
    title: "Came Back Anyway",
    description: "Logged a workday after a brutal prior entry.",
    category: "hidden",
    rarity: "rare",
    unlockType: "automatic",
    publicSafe: true,
    hidden: true,
  },
];

/**
 * System-level bootstraps that unlock by virtue of the app existing.
 * These have no corresponding field entry and are never written to Notion.
 *
 * All other manual achievements (shadow_day, first_satchel, first_blue_day,
 * scanner_basics, met_steward, etc.) should be rows in the
 * NOTION_ACHIEVEMENT_UNLOCKS_DB_ID database. Add a row with the achievement's
 * id as "Achievement ID" and today's date as "Unlocked At" to mark it off.
 */
export const STATIC_MANUAL_UNLOCK_IDS: string[] = [
  "notion_wired",
  "kpi_dashboard",
  "portfolio_artifact",
  "public_private_system",
];

// ── Evaluator ──────────────────────────────────────────────────────────────

function allText(entry: CarrierDispatch): string {
  return [entry.publicNote, entry.bodyNote, entry.recoveryNote]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function entryHasKeyword(entry: CarrierDispatch, keywords: string[]): boolean {
  const text = allText(entry);
  return keywords.some((kw) => text.includes(kw));
}

function hasConsecutiveEntries(entries: CarrierDispatch[]): boolean {
  const ms = entries
    .map((e) => new Date(e.date).getTime())
    .sort((a, b) => a - b);
  for (let i = 1; i < ms.length; i++) {
    if (ms[i] - ms[i - 1] === 86_400_000) return true;
  }
  return false;
}

function hasHydrationStreakN(entries: CarrierDispatch[], n: number): boolean {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let streak = 0;
  for (const e of sorted) {
    if (
      e.waterOz !== undefined &&
      e.hydrationGoalOz !== undefined &&
      e.waterOz >= e.hydrationGoalOz
    ) {
      streak++;
      if (streak >= n) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

function hasThreeHeavyInOneWeek(entries: CarrierDispatch[]): boolean {
  const heavy = entries.filter(
    (e) => e.mailLoad === "heavy" || e.mailLoad === "brutal"
  );
  const weekCounts = new Map<string, number>();
  for (const e of heavy) {
    const d = new Date(e.date);
    const dayOfWeek = d.getDay(); // 0=Sun
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);
    const key = startOfWeek.toISOString().slice(0, 10);
    weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1);
  }
  return [...weekCounts.values()].some((c) => c >= 3);
}

function countWeatherTypes(entries: CarrierDispatch[]): number {
  const types = new Set<string>();
  for (const e of entries) {
    if (e.heatDay) types.add("heat");
    if (e.rain) types.add("rain");
    if (e.storm) types.add("storm");
    if (e.snow) types.add("snow");
    if (e.tags?.includes("wind")) types.add("wind");
    if (e.tags?.includes("ice")) types.add("ice");
  }
  return types.size;
}

function countSafetySignalEntries(entries: CarrierDispatch[]): number {
  return entries.filter(
    (e) =>
      e.dogEncounter ||
      e.heatDay ||
      entryHasKeyword(e, ["dog", "safety", "hazard", "slip", "fall", "caution", "gate", "fence"])
  ).length;
}

function countCommunityEntries(entries: CarrierDispatch[]): number {
  return entries.filter(
    (e) =>
      e.tags?.some((t) =>
        ["community", "neighbor", "customer", "kindness", "grief", "help", "conversation"].includes(t)
      ) ||
      entryHasKeyword(e, [
        "neighbor",
        "customer",
        "community",
        "kindness",
        "conversation",
        "noticed",
        "someone",
      ])
  ).length;
}

/**
 * Evaluates which achievements are unlocked given the current dispatch data
 * and a set of manually unlocked IDs.
 *
 * Pure function — safe to call at render time on server or client.
 */
export function evaluateCarrierAchievements(
  entries: CarrierDispatch[],
  stats: CarrierTotals,
  manualUnlocks: Set<string> = new Set()
): Set<string> {
  const unlocked = new Set<string>(manualUnlocks);

  const unlock = (id: string, condition: boolean) => {
    if (condition) unlocked.add(id);
  };

  const hasTag = (tag: string) =>
    entries.some((e) => e.tags?.includes(tag));

  const hasAny = (predicate: (e: CarrierDispatch) => boolean) =>
    entries.some(predicate);

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // ── Break-In Arc ────────────────────────────────────────────────────────
  unlock("shadow_day", hasTag("shadow_day"));
  unlock("first_10_mile_day", hasAny((e) => e.milesWalked >= 10));
  unlock("first_25k_steps", hasAny((e) => e.steps >= 25_000));
  unlock("first_full_route", entries.length >= 1);
  unlock("first_back_to_back", hasConsecutiveEntries(entries));
  unlock("week_one_survivor", stats.daysLogged >= 5);
  unlock("first_brutal_day", hasAny((e) => e.mailLoad === "brutal"));
  unlock(
    "panic_to_pace",
    hasAny((e) => entryHasKeyword(e, ["pacing", "pace beats", "pace over", "not rushing", "slower pace"]))
  );
  unlock(
    "not_dead_yet",
    sorted.some(
      (e, i) => i > 0 && sorted[i - 1].milesWalked >= 8 && e.soreness <= 3
    )
  );
  unlock(
    "break_in_complete",
    hasAny((e) => e.phase === "adapting" || e.phase === "building" || e.phase === "regular")
  );

  // ── Mailwalker Body ─────────────────────────────────────────────────────
  unlock("fifty_miles", stats.totalMiles >= 50);
  unlock("hundred_miles", stats.totalMiles >= 100);
  unlock("two_fifty_miles", stats.totalMiles >= 250);
  unlock("five_hundred_miles", stats.totalMiles >= 500);
  unlock("thousand_miles", stats.totalMiles >= 1_000);
  unlock("hundred_k_steps", stats.totalSteps >= 100_000);
  unlock("million_steps", stats.totalSteps >= 1_000_000);
  unlock("hydration_rookie", stats.hydrationGoalHitDays >= 1);
  unlock("hydration_streak_3", hasHydrationStreakN(entries, 3));
  unlock("hydration_streak_10", stats.hydrationGoalHitDays >= 10);
  unlock("low_soreness_high_miles", hasAny((e) => e.milesWalked >= 8 && e.soreness <= 2));
  unlock("recovery_logged", hasAny((e) => !!e.recoveryNote?.trim()));
  unlock(
    "hip_protocol",
    hasAny((e) =>
      entryHasKeyword(e, ["hip", "piriformis", "ql ", "quad", "stretching", "stretch"])
    )
  );
  unlock(
    "shoe_lesson",
    hasAny((e) => entryHasKeyword(e, ["shoe", "shoes", "footwear", "boot", "insole"]))
  );
  unlock(
    "body_debugger",
    entries.filter(
      (e) =>
        e.soreness !== undefined &&
        e.energy !== undefined &&
        e.mood !== undefined &&
        !!e.recoveryNote?.trim()
    ).length >= 10
  );

  // ── Weather & Environment ───────────────────────────────────────────────
  unlock("first_heat_day", stats.heatDays >= 1);
  unlock(
    "heat_protocol",
    hasAny(
      (e) =>
        !!e.heatDay &&
        e.waterOz !== undefined &&
        e.hydrationGoalOz !== undefined &&
        e.waterOz >= e.hydrationGoalOz
    )
  );
  unlock("first_rain_day", hasAny((e) => !!e.rain));
  unlock("first_snow_day", hasAny((e) => !!e.snow));
  unlock("weather_stack", countWeatherTypes(entries) >= 3);
  unlock("summer_carrier", stats.heatDays >= 10);
  unlock(
    "winter_carrier",
    entries.filter((e) => e.snow || e.storm || e.tags?.includes("ice") || e.tags?.includes("cold")).length >= 10
  );
  unlock("soaked_but_done", hasAny((e) => !!e.rain && (e.mood ?? 0) >= 5));
  unlock(
    "heat_respecter",
    hasAny(
      (e) =>
        !!e.heatDay &&
        entryHasKeyword(e, ["slowed", "slow down", "adjusted", "took water", "drank more", "water stop", "took a break"])
    )
  );
  unlock(
    "storm_sense",
    hasAny((e) => !!e.storm && entryHasKeyword(e, ["adjusted", "changed", "shorter", "different"]))
  );

  // ── Safety & Situational Awareness ─────────────────────────────────────
  unlock("first_dog_tag", stats.dogEncounterDays >= 1);
  unlock("dog_radar", stats.dogEncounterDays >= 10);
  unlock(
    "gate_check",
    hasAny((e) => entryHasKeyword(e, ["gate", "fence", "yard", "caution"]))
  );
  unlock(
    "heat_warning",
    hasAny(
      (e) =>
        !!e.heatDay &&
        ((e.waterOz !== undefined && e.hydrationGoalOz !== undefined && e.waterOz < e.hydrationGoalOz) ||
          e.energy <= 4)
    )
  );
  unlock(
    "slip_trip_mindset",
    hasAny((e) => entryHasKeyword(e, ["slip", "trip", "uneven", "wet surface", "slippery"]))
  );
  unlock("defensive_walking", countSafetySignalEntries(entries) >= 5);
  unlock(
    "scanner_down_eyes_up",
    hasAny((e) => entryHasKeyword(e, ["situational", "aware", "eyes up", "looking up"]))
  );
  unlock(
    "safe_finish",
    hasAny(
      (e) =>
        (e.mailLoad === "heavy" || e.mailLoad === "brutal") &&
        !e.dogEncounter &&
        !entryHasKeyword(e, ["unsafe", "hazard", "accident", "fell", "slipped", "injured"])
    )
  );
  unlock("safety_culture", countSafetySignalEntries(entries) >= 25);

  // ── Route Craft ─────────────────────────────────────────────────────────
  unlock(
    "satchel_adjustment",
    hasAny((e) => entryHasKeyword(e, ["bag position", "satchel", "posture", "shoulder", "strap"]))
  );
  unlock(
    "break_strategy",
    hasAny((e) => entryHasKeyword(e, ["water stop", "break", "rest stop", "took a break"]))
  );
  unlock(
    "route_rhythm",
    hasAny((e) => entryHasKeyword(e, ["rhythm", "predictable", "natural", "more natural", "felt natural"]))
  );
  unlock(
    "less_guessing",
    (() => {
      const firstAdaptMs = Math.min(
        ...entries
          .filter((e) => e.phase === "adapting" || e.phase === "building" || e.phase === "regular")
          .map((e) => new Date(e.date).getTime())
      );
      if (!isFinite(firstAdaptMs)) return false;
      return entries.filter((e) => new Date(e.date).getTime() >= firstAdaptMs).length >= 5;
    })()
  );
  unlock(
    "steady_walk",
    hasAny((e) => entryHasKeyword(e, ["steady", "pacing", "pace beats", "not rushing", "steady walk"]))
  );
  unlock("load_reading", entries.length >= 1);
  unlock("brutal_load_repeat", hasThreeHeavyInOneWeek(entries));
  unlock(
    "morale_rebound",
    sorted.some((e, i) => i > 0 && sorted[i - 1].mood <= 6 && e.mood > sorted[i - 1].mood)
  );
  unlock(
    "energy_rebound",
    sorted.some((e, i) => i > 0 && sorted[i - 1].energy <= 5 && e.energy > sorted[i - 1].energy)
  );
  unlock("route_notes", entries.length >= 10);
  unlock("public_safe_operator", entries.length >= 10);

  // ── Community Witness ───────────────────────────────────────────────────
  unlock("human_route", countCommunityEntries(entries) >= 5);
  unlock(
    "quiet_kindness",
    hasTag("kindness") || hasTag("help") || hasTag("quiet_kindness")
  );
  unlock("grief_on_route", hasTag("grief") || hasTag("loss"));
  unlock("small_town_radar", countCommunityEntries(entries) >= 10);

  // ── System Builder ──────────────────────────────────────────────────────
  unlock("first_public_dispatch", entries.length >= 1);
  unlock("private_boundary", entries.length >= 1);
  unlock("achievement_engine", entries.length >= 1);
  unlock("mailwalker_lore", entries.length >= 25);

  // ── Hidden / Rare ────────────────────────────────────────────────────────
  unlock(
    "hydration_debt",
    hasAny(
      (e) =>
        !!e.heatDay &&
        e.waterOz !== undefined &&
        e.hydrationGoalOz !== undefined &&
        e.waterOz < e.hydrationGoalOz &&
        e.energy <= 4
    )
  );
  unlock("route_zen", hasAny((e) => e.milesWalked >= 8 && (e.mood ?? 0) >= 8));
  unlock("the_wall", hasAny((e) => e.milesWalked >= 8 && (e.energy ?? 10) <= 3));
  unlock(
    "the_second_wind",
    hasAny((e) => entryHasKeyword(e, ["second wind", "recovered", "energy came back", "got through it"]))
  );
  unlock(
    "blue_collar_boss_fight",
    hasAny(
      (e) =>
        e.mailLoad === "brutal" &&
        (!!e.heatDay || !!e.rain || !!e.storm || !!e.snow) &&
        e.soreness >= 7
    )
  );
  unlock(
    "came_back_anyway",
    sorted.some((_, i) => i > 0 && sorted[i - 1].mailLoad === "brutal")
  );

  // ── Tag-based override ────────────────────────────────────────────────────
  // Any dispatch entry tagged with an achievement's id unlocks it.
  // This is the primary field workflow: add the achievement ID to a dispatch
  // entry's Tags multi-select in Notion to mark it as earned.
  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id)) {
      unlock(achievement.id, hasTag(achievement.id));
    }
  }

  return unlocked;
}

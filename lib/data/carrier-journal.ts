/** Public-safe carrier field journal data. No addresses, route numbers, coworker/customer names, scanner data, or official mail volume. */

export type MailLoad = "light" | "normal" | "heavy" | "brutal";

export type CarrierDispatch = {
  id: string;
  date: string;
  title: string;
  milesWalked: number;
  steps: number;
  soreness: number; // 1–10
  energy: number; // 1–10
  mood: number; // 1–10
  weather: string;
  temperatureF?: number;
  heatIndexF?: number;
  mailLoad: MailLoad;
  heatDay?: boolean;
  rain?: boolean;
  storm?: boolean;
  snow?: boolean;
  dogEncounter?: boolean;
  publicNote: string;
};

export type CarrierKpi = {
  label: string;
  value: string;
  detail?: string;
};

export type CarrierTotals = {
  daysLogged: number;
  totalMiles: number;
  avgMilesPerDay: number;
  totalSteps: number;
  heatDays: number;
  weatherDays: number;
  heavyBrutalDays: number;
  avgSoreness: number;
  avgEnergy: number;
  avgMood: number;
};

const DISPATCHES: CarrierDispatch[] = [
  {
    id: "cj-001",
    date: "2026-05-20",
    title: "First full solo day",
    milesWalked: 9.2,
    steps: 19800,
    soreness: 6,
    energy: 7,
    mood: 8,
    weather: "Partly cloudy",
    temperatureF: 68,
    mailLoad: "heavy",
    publicNote:
      "First day running a full route without a trainer. Longer than expected. Feet held up better than anticipated. Learned that pacing matters more than rushing.",
  },
  {
    id: "cj-002",
    date: "2026-05-21",
    title: "Rain day — gear test",
    milesWalked: 8.6,
    steps: 18400,
    soreness: 5,
    energy: 6,
    mood: 7,
    weather: "Light rain",
    temperatureF: 58,
    mailLoad: "normal",
    rain: true,
    publicNote:
      "Light rain most of the morning. Rain gear worked. Wet shoes by hour three — that is the weak point. Route rhythm felt more natural today.",
  },
  {
    id: "cj-003",
    date: "2026-05-22",
    title: "Hot load day — hydration check",
    milesWalked: 10.1,
    steps: 21600,
    soreness: 7,
    energy: 5,
    mood: 6,
    weather: "Clear, humid",
    temperatureF: 82,
    heatIndexF: 89,
    mailLoad: "brutal",
    heatDay: true,
    dogEncounter: true,
    publicNote:
      "Heaviest load so far. Heat index climbed through the afternoon. Drank more water than I thought I needed — still felt low by the last stretch. Dog encounter on a residential block; no contact, redirected cleanly.",
  },
  {
    id: "cj-004",
    date: "2026-05-23",
    title: "Recovery pace — lighter load",
    milesWalked: 7.8,
    steps: 16700,
    soreness: 4,
    energy: 7,
    mood: 8,
    weather: "Overcast, cool",
    temperatureF: 63,
    mailLoad: "light",
    publicNote:
      "Lighter day. Used it to work on technique: posture, bag position, walking economy. Noticed the soreness in the left ankle from earlier days is tracking down, not up.",
  },
  {
    id: "cj-005",
    date: "2026-05-24",
    title: "Saturday volume — the long one",
    milesWalked: 11.3,
    steps: 24100,
    soreness: 8,
    energy: 4,
    mood: 6,
    weather: "Sunny, warm",
    temperatureF: 76,
    mailLoad: "heavy",
    publicNote:
      "Saturdays have more volume. This one ran long. Body felt the cumulative week by hour five. Took every water stop seriously. Route completion felt like a real win.",
  },
];

export function getCarrierDispatches(): CarrierDispatch[] {
  return [...DISPATCHES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getCarrierJournalTotals(): CarrierTotals {
  return computeTotalsFromDispatches(DISPATCHES);
}

export function computeTotalsFromDispatches(dispatches: CarrierDispatch[]): CarrierTotals {
  const count = dispatches.length;
  if (count === 0) {
    return {
      daysLogged: 0,
      totalMiles: 0,
      avgMilesPerDay: 0,
      totalSteps: 0,
      heatDays: 0,
      weatherDays: 0,
      heavyBrutalDays: 0,
      avgSoreness: 0,
      avgEnergy: 0,
      avgMood: 0,
    };
  }

  const totalMiles = dispatches.reduce((s, d) => s + d.milesWalked, 0);
  const totalSteps = dispatches.reduce((s, d) => s + d.steps, 0);
  const heatDays = dispatches.filter((d) => d.heatDay).length;
  const weatherDays = dispatches.filter((d) => d.rain || d.storm || d.snow).length;
  const heavyBrutalDays = dispatches.filter(
    (d) => d.mailLoad === "heavy" || d.mailLoad === "brutal"
  ).length;
  const avgSoreness = dispatches.reduce((s, d) => s + d.soreness, 0) / count;
  const avgEnergy = dispatches.reduce((s, d) => s + d.energy, 0) / count;
  const avgMood = dispatches.reduce((s, d) => s + d.mood, 0) / count;

  return {
    daysLogged: count,
    totalMiles: Math.round(totalMiles * 10) / 10,
    avgMilesPerDay: Math.round((totalMiles / count) * 10) / 10,
    totalSteps,
    heatDays,
    weatherDays,
    heavyBrutalDays,
    avgSoreness: Math.round(avgSoreness * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    avgMood: Math.round(avgMood * 10) / 10,
  };
}

export function totalsToKpis(t: CarrierTotals): CarrierKpi[] {
  return [
    { label: "Days Logged", value: String(t.daysLogged), detail: "Active field days" },
    { label: "Total Miles", value: `${t.totalMiles} mi`, detail: "Cumulative walking distance" },
    { label: "Avg Miles / Day", value: `${t.avgMilesPerDay} mi`, detail: "Per logged shift" },
    { label: "Total Steps", value: t.totalSteps.toLocaleString(), detail: "Cumulative step count" },
    { label: "Heat Days", value: String(t.heatDays), detail: "High heat index shifts" },
    { label: "Weather Days", value: String(t.weatherDays), detail: "Rain, storm, or snow" },
    { label: "Heavy / Brutal Load", value: String(t.heavyBrutalDays), detail: "High mail volume shifts" },
    { label: "Avg Soreness", value: `${t.avgSoreness} / 10`, detail: "Physical load marker" },
    { label: "Avg Energy", value: `${t.avgEnergy} / 10`, detail: "Self-reported end-of-shift" },
    { label: "Avg Mood", value: `${t.avgMood} / 10`, detail: "Morale signal" },
  ];
}

export function getCarrierKpis(): CarrierKpi[] {
  return totalsToKpis(getCarrierJournalTotals());
}

export function getMailLoadSummary(): Record<MailLoad, number> {
  const summary: Record<MailLoad, number> = {
    light: 0,
    normal: 0,
    heavy: 0,
    brutal: 0,
  };
  for (const d of DISPATCHES) {
    summary[d.mailLoad]++;
  }
  return summary;
}

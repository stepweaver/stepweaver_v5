"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MAIL_DAY_CONTEXT_OPTIONS } from "@/lib/dps";
import { formatMileage, formatTemperature } from "@/lib/carrier-journal/helpers";
import {
  calculateHydrationGoal,
  HEAT_BAND_LABEL,
  type HeatBand,
  type HydrationRecommendation,
} from "@/lib/hydration";
import {
  computeFuelScore,
  FUEL_SCORE_WIN,
  formatFuelScore,
  type FuelLogInput,
  type MealQuality,
  type RouteFoodEaten,
} from "@/lib/carrier-journal/fuel";

// ZIP 46614 (South Bend, IN) - fixed coordinates for weather lookup
const ZIP_LAT = 41.6764;
const ZIP_LON = -86.252;

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; tempF: number; heatIndexF: number | null }
  | { status: "error" };

type SubmitResult = {
  pageId: string;
  dpsPerMile: number | null;
  publicSummary: string;
  fuelScore?: number;
  fuelScoreLabel?: string;
  fuelIsWin?: boolean;
};

type Props = {
  token: string;
  /** Most recent recorded weight from Notion. Used as the active weight on non-Monday days. */
  latestWeightLbs?: number | null;
};

function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function CarrierDaybookForm({ token, latestWeightLbs }: Props) {
  const today = todayIsoDate();

  const [date, setDate] = useState(today);
  const [miles, setMiles] = useState("");
  const [dpsCount, setDpsCount] = useState("");
  const [mailDayContext, setMailDayContext] = useState<string[]>([]);
  const [parcels, setParcels] = useState("");
  const [waterOz, setWaterOz] = useState("");

  // Only entered on Mondays; used silently in hydration calc all week.
  const [weightLbs, setWeightLbs] = useState("");

  const [directSun, setDirectSun] = useState(false);
  const [hydrationGoalOverride, setHydrationGoalOverride] = useState("");
  const [showGoalOverride, setShowGoalOverride] = useState(false);

  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [soreness, setSoreness] = useState("");

  const [breakfastProtein, setBreakfastProtein] = useState<boolean | null>(null);
  const [routeFoodPacked, setRouteFoodPacked] = useState<boolean | null>(null);
  const [routeFoodEaten, setRouteFoodEaten] = useState<RouteFoodEaten | null>(null);
  const [proteinAnchors, setProteinAnchors] = useState<0 | 1 | 2 | 3 | 4 | null>(null);
  const [fruitVegServings, setFruitVegServings] = useState<0 | 1 | 2 | 3 | null>(null);
  const [gatorade, setGatorade] = useState<0 | 1 | 2 | null>(null);
  const [mountainDewOz, setMountainDewOz] = useState("");
  const [postShiftMealQuality, setPostShiftMealQuality] = useState<MealQuality | null>(null);

  const [publicNote, setPublicNote] = useState("");
  const [privateNote, setPrivateNote] = useState("");

  const [weather, setWeather] = useState<WeatherState>({ status: "idle" });
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [weatherHeat, setWeatherHeat] = useState<number | null>(null);

  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const weatherAbort = useRef<AbortController | null>(null);

  // Auto-fetch weather when date == today
  useEffect(() => {
    if (date !== today) {
      setWeather({ status: "idle" });
      return;
    }

    weatherAbort.current?.abort();
    const controller = new AbortController();
    weatherAbort.current = controller;

    setWeather({ status: "loading" });

    fetch(`/api/weather?lat=${ZIP_LAT}&lon=${ZIP_LON}&peak=true`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Weather fetch failed");
        const data = (await res.json()) as {
          peakTempF?: number;
          peakHeatIndexF?: number | null;
        };
        const tempF = data.peakTempF ?? null;
        const heatIndexF = data.peakHeatIndexF ?? null;
        if (tempF !== null) {
          setWeather({ status: "ok", tempF, heatIndexF });
          setWeatherTemp(tempF);
          setWeatherHeat(heatIndexF);
        } else {
          setWeather({ status: "error" });
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setWeather({ status: "error" });
      });

    return () => controller.abort();
  }, [date, today]);

  const dateIsMonday = new Date(`${date}T12:00:00`).getDay() === 1;

  // Compute hydration goal from available inputs
  const computedHydration = useMemo((): HydrationRecommendation => {
    const peakTempF = weatherTemp ?? 72;
    const peakHeatIndexF = weatherHeat ?? peakTempF;
    const milesNum = miles.trim() ? parseFloat(miles) : undefined;

    const weightNum = weightLbs.trim() ? parseFloat(weightLbs) : null;
    const activeWeight =
      weightNum !== null && Number.isFinite(weightNum) && weightNum > 0
        ? weightNum
        : (latestWeightLbs ?? undefined);

    return calculateHydrationGoal({
      weightLbs: activeWeight,
      peakTempF,
      peakHeatIndexF,
      milesWalked: milesNum,
      directSun,
    });
  }, [weatherTemp, weatherHeat, miles, weightLbs, latestWeightLbs, directSun]);

  const fuelInput = useMemo((): FuelLogInput | null => {
    const dewNum = mountainDewOz.trim() ? Number(mountainDewOz) : undefined;
    const hasAny =
      breakfastProtein !== null ||
      routeFoodPacked !== null ||
      routeFoodEaten !== null ||
      proteinAnchors !== null ||
      fruitVegServings !== null ||
      gatorade !== null ||
      (dewNum !== undefined && Number.isFinite(dewNum)) ||
      postShiftMealQuality !== null;

    if (!hasAny) return null;

    return {
      ...(breakfastProtein !== null && { breakfastProtein }),
      ...(routeFoodPacked !== null && { routeFoodPacked }),
      ...(routeFoodEaten !== null && { routeFoodEaten }),
      ...(proteinAnchors !== null && { proteinAnchors }),
      ...(fruitVegServings !== null && { fruitVegServings }),
      ...(gatorade !== null && { gatorade }),
      ...(dewNum !== undefined && Number.isFinite(dewNum) && dewNum >= 0 && { mountainDewOz: dewNum }),
      ...(postShiftMealQuality !== null && { postShiftMealQuality }),
    };
  }, [
    breakfastProtein,
    routeFoodPacked,
    routeFoodEaten,
    proteinAnchors,
    fruitVegServings,
    gatorade,
    mountainDewOz,
    postShiftMealQuality,
  ]);

  const fuelScore = useMemo(
    () => (fuelInput ? computeFuelScore(fuelInput) : null),
    [fuelInput]
  );

  const toggleContext = useCallback((tag: string) => {
    setMailDayContext((prev) => (prev.includes(tag) ? [] : [tag]));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitStatus("saving");
      setErrorMsg("");

      const milesNum = miles.trim() ? parseFloat(miles) : undefined;
      if (milesNum !== undefined && (!Number.isFinite(milesNum) || milesNum < 0)) {
        setErrorMsg("Miles must be a valid number (0 or greater).");
        setSubmitStatus("error");
        return;
      }

      const body: Record<string, unknown> = {
        logSecret: token,
        date,
        ...(milesNum !== undefined && { miles: milesNum }),
      };

      const dpsNum = dpsCount.trim() ? Number(dpsCount.replace(/,/g, "")) : undefined;
      if (dpsNum !== undefined && Number.isFinite(dpsNum) && dpsNum >= 0) {
        body.dpsCount = dpsNum;
      }

      if (mailDayContext.length > 0) body.mailDayContext = mailDayContext;

      const parcelsNum = parcels.trim() ? Number(parcels) : undefined;
      if (parcelsNum !== undefined && Number.isFinite(parcelsNum) && parcelsNum >= 0) {
        body.parcels = parcelsNum;
      }

      const waterNum = waterOz.trim() ? Number(waterOz) : undefined;
      if (waterNum !== undefined && Number.isFinite(waterNum) && waterNum >= 0) {
        body.waterOz = waterNum;
      }

      // Write weight only on Monday weigh-in
      if (dateIsMonday) {
        const weightNum = weightLbs.trim() ? Number(weightLbs) : undefined;
        if (weightNum !== undefined && Number.isFinite(weightNum) && weightNum > 0) {
          body.weightLbs = weightNum;
        }
      }

      // Use manual override if present; otherwise commit the computed goal
      const overrideNum = hydrationGoalOverride.trim() ? Number(hydrationGoalOverride) : undefined;
      const effectiveGoalOz =
        overrideNum !== undefined && Number.isFinite(overrideNum) && overrideNum > 0
          ? overrideNum
          : computedHydration.totalSuggestedOz;
      if (effectiveGoalOz > 0) {
        body.hydrationGoalOz = effectiveGoalOz;
      }

      const moodNum = mood.trim() ? Number(mood) : undefined;
      if (moodNum !== undefined && Number.isInteger(moodNum) && moodNum >= 1 && moodNum <= 10) {
        body.mood = moodNum;
      }

      const energyNum = energy.trim() ? Number(energy) : undefined;
      if (energyNum !== undefined && Number.isInteger(energyNum) && energyNum >= 1 && energyNum <= 10) {
        body.energy = energyNum;
      }

      const sorenessNum = soreness.trim() ? Number(soreness) : undefined;
      if (sorenessNum !== undefined && Number.isInteger(sorenessNum) && sorenessNum >= 1 && sorenessNum <= 10) {
        body.soreness = sorenessNum;
      }

      if (weatherTemp !== null) body.temperatureF = weatherTemp;
      if (weatherHeat !== null) body.heatIndexF = weatherHeat;

      if (publicNote.trim()) body.publicNote = publicNote.trim();
      if (privateNote.trim()) body.privateNote = privateNote.trim();
      if (fuelInput) body.fuel = fuelInput;

      try {
        const res = await fetch("/api/carrier-journal/daybook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as {
          error?: string;
          ok?: boolean;
          pageId?: string;
          dpsPerMile?: number | null;
          publicSummary?: string;
          fuelScore?: number;
          fuelScoreLabel?: string;
          fuelIsWin?: boolean;
        };
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to save");
        }
        setResult({
          pageId: data.pageId ?? "",
          dpsPerMile: data.dpsPerMile ?? null,
          publicSummary: data.publicSummary ?? "",
          fuelScore: data.fuelScore,
          fuelScoreLabel: data.fuelScoreLabel,
          fuelIsWin: data.fuelIsWin,
        });
      } catch (err) {
        setSubmitStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to save carrier daybook entry.");
      }
    },
    [
      token, date, dateIsMonday, miles, dpsCount, mailDayContext, parcels, waterOz,
      weightLbs, hydrationGoalOverride, computedHydration,
      mood, energy, soreness, publicNote, privateNote, weatherTemp, weatherHeat, fuelInput,
    ]
  );

  if (result) {
    const milesNum = miles.trim() ? parseFloat(miles) : undefined;
    const dpsNum = dpsCount.trim() ? Number(dpsCount.replace(/,/g, "")) : undefined;
    return (
      <SuccessCard
        result={result}
        date={date}
        miles={milesNum}
        dpsCount={dpsNum}
        temperatureF={weatherTemp ?? undefined}
        heatIndexF={weatherHeat ?? undefined}
        onLogAnother={() => {
          setResult(null);
          setSubmitStatus("idle");
          setMiles("");
          setDpsCount("");
          setMailDayContext([]);
          setParcels("");
          setWaterOz("");
          setWeightLbs("");
          setDirectSun(false);
          setHydrationGoalOverride("");
          setShowGoalOverride(false);
          setMood("");
          setEnergy("");
          setSoreness("");
          setBreakfastProtein(null);
          setRouteFoodPacked(null);
          setRouteFoodEaten(null);
          setProteinAnchors(null);
          setFruitVegServings(null);
          setGatorade(null);
          setMountainDewOz("");
          setPostShiftMealQuality(null);
          setPublicNote("");
          setPrivateNote("");
          setWeatherTemp(null);
          setWeatherHeat(null);
          setDate(today);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-[10px] tracking-widest mb-1">
          CARRIER DAYBOOK // FIELD ENTRY
        </div>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))]">
          Log a Carrier Day
        </h1>
      </div>

      {/* Date */}
      <div className="surface-panel p-5 space-y-4">
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
          DATE
        </div>
        <label htmlFor="db-date" className="sr-only">
          DATE (YYYY-MM-DD)
        </label>
        <input
          id="db-date"
          type="text"
          inputMode="numeric"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          pattern="\d{4}-\d{2}-\d{2}"
          placeholder="YYYY-MM-DD"
          className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-base px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
        />
      </div>

      {/* Core stats */}
      <div className="surface-panel p-5 space-y-5">
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
          FIELD STATS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="db-miles" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
              MILES WALKED
            </label>
            <input
              id="db-miles"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="9.4"
            />
          </div>

          <div>
            <label htmlFor="db-dps" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
              DPS COUNT
            </label>
            <input
              id="db-dps"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={dpsCount}
              onChange={(e) => setDpsCount(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="1842"
            />
          </div>

          <div>
            <label htmlFor="db-parcels" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
              PARCELS
            </label>
            <input
              id="db-parcels"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={parcels}
              onChange={(e) => setParcels(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="24"
            />
          </div>
        </div>

        {/* Mail Day Context */}
        <div>
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
            MAIL DAY CONTEXT
          </div>
          <div className="flex flex-wrap gap-2">
            {MAIL_DAY_CONTEXT_OPTIONS.map((tag) => {
              const selected = mailDayContext.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleContext(tag)}
                  className="font-[var(--font-ocr)] text-[9px] tracking-widest border px-3 py-2 transition-colors"
                  style={{
                    color: selected ? "rgb(var(--neon))" : "rgb(var(--text-secondary))",
                    borderColor: selected ? "rgb(var(--neon)/0.5)" : "rgb(var(--border)/0.4)",
                    background: selected ? "rgb(var(--neon)/0.08)" : "transparent",
                  }}
                >
                  {tag.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weather - read-only, auto-filled for today */}
      <div className="surface-panel p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
            WEATHER // ZIP 46614
          </div>
          {weather.status === "loading" && (
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] animate-pulse">
              FETCHING...
            </div>
          )}
          {weather.status === "ok" && (
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--neon)/0.6)]">
              AUTO-FILLED
            </div>
          )}
          {weather.status === "error" && (
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--red)/0.8)]">
              LOOKUP FAILED
            </div>
          )}
          {date !== today && (
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
              PAST DATE
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <WeatherCell label="TEMPERATURE (°F)" value={weatherTemp} loading={weather.status === "loading"} />
          <WeatherCell label="HEAT INDEX (°F)" value={weatherHeat} loading={weather.status === "loading"} />
        </div>

        {/* Direct sun toggle - affects hydration calc */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={directSun}
            onChange={(e) => setDirectSun(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`relative flex-none w-10 h-6 border transition-colors ${
              directSun
                ? "bg-[rgb(var(--warn)/0.15)] border-[rgb(var(--warn)/0.5)]"
                : "bg-transparent border-[rgb(var(--border)/0.4)]"
            }`}
            role="presentation"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 transition-transform ${
                directSun
                  ? "translate-x-4 bg-[rgb(var(--warn))]"
                  : "translate-x-0 bg-[rgb(var(--text-meta)/0.5)]"
              }`}
            />
          </span>
          <span className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))]">
            {directSun ? "DIRECT SUN (adds ~10°F to effective heat)" : "DIRECT SUN"}
          </span>
        </label>
      </div>

      {/* Body stats */}
      <div className="surface-panel p-5 space-y-4">
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
          BODY &amp; HYDRATION
        </div>

        {/* Water drank */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="db-water" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
              WATER DRANK (oz)
            </label>
            <input
              id="db-water"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={waterOz}
              onChange={(e) => setWaterOz(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="96"
            />
          </div>
        </div>

        {/* Monday weigh-in - only shown on Mondays, never displayed back */}
        {dateIsMonday && (
          <div>
            <label
              htmlFor="db-weight"
              className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
            >
              WEIGHT (lbs) / MONDAY
            </label>
            <input
              id="db-weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="242"
            />
          </div>
        )}

        {/* Computed hydration goal */}
        <HydrationGoalPanel
          recommendation={computedHydration}
          hasWeather={weather.status === "ok"}
          milesStr={miles}
          override={hydrationGoalOverride}
          onOverrideChange={setHydrationGoalOverride}
          showOverride={showGoalOverride}
          onToggleOverride={() => setShowGoalOverride((v) => !v)}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="db-soreness" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
              SORENESS (1–10)
            </label>
            <input
              id="db-soreness"
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              max="10"
              value={soreness}
              onChange={(e) => setSoreness(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="4"
            />
          </div>
          <div>
            <label htmlFor="db-mood" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
              MOOD (1–10)
            </label>
            <input
              id="db-mood"
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="7"
            />
          </div>
          <div>
            <label htmlFor="db-energy" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
              ENERGY (1–10)
            </label>
            <input
              id="db-energy"
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="6"
            />
          </div>
        </div>
      </div>

      {/* Fuel */}
      <div className="surface-panel p-5 space-y-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
            FUEL
          </div>
          {fuelScore && (
            <div className="font-[var(--font-ocr)] text-[10px] tracking-widest">
              <span className="text-[rgb(var(--text-label))]">SCORE </span>
              <span
                className={
                  fuelScore.isWin ? "text-[rgb(var(--neon))]" : "text-[rgb(var(--text-secondary))]"
                }
              >
                {formatFuelScore(fuelScore.score)}
              </span>
              {fuelScore.isWin && (
                <span className="text-[rgb(var(--neon)/0.7)] ml-2">WIN</span>
              )}
              {!fuelScore.isWin && fuelScore.score > 0 && (
                <span className="text-[rgb(var(--text-meta))] ml-2">
                  {FUEL_SCORE_WIN}/{fuelScore.max} TO WIN
                </span>
              )}
            </div>
          )}
        </div>

        <FuelYesNo
          label="BREAKFAST PROTEIN"
          value={breakfastProtein}
          onChange={setBreakfastProtein}
        />
        <FuelYesNo
          label="ROUTE FOOD PACKED"
          value={routeFoodPacked}
          onChange={setRouteFoodPacked}
        />
        <FuelSegment<RouteFoodEaten>
          label="ROUTE FOOD EATEN"
          options={[
            { value: "none", label: "NONE" },
            { value: "partial", label: "PARTIAL" },
            { value: "all", label: "ALL" },
          ]}
          value={routeFoodEaten}
          onChange={setRouteFoodEaten}
        />
        <FuelSegment<0 | 1 | 2 | 3 | 4>
          label="PROTEIN ANCHORS"
          options={[
            { value: 0 as const, label: "0" },
            { value: 1 as const, label: "1" },
            { value: 2 as const, label: "2" },
            { value: 3 as const, label: "3" },
            { value: 4 as const, label: "4" },
          ]}
          value={proteinAnchors}
          onChange={setProteinAnchors}
        />
        <FuelSegment<0 | 1 | 2 | 3>
          label="FRUIT/VEG SERVINGS"
          options={[
            { value: 0, label: "0" },
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3+" },
          ]}
          value={fruitVegServings}
          onChange={setFruitVegServings}
        />
        <FuelSegment<0 | 1 | 2>
          label="GATORADE"
          options={[
            { value: 0 as const, label: "0" },
            { value: 1 as const, label: "1" },
            { value: 2 as const, label: "2" },
          ]}
          value={gatorade}
          onChange={setGatorade}
        />

        <div>
          <label
            htmlFor="db-dew"
            className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
          >
            MOUNTAIN DEW (oz)
          </label>
          <input
            id="db-dew"
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={mountainDewOz}
            onChange={(e) => setMountainDewOz(e.target.value)}
            className="w-full sm:w-32 bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
            placeholder="20"
          />
        </div>

        <FuelSegment<MealQuality>
          label="POST-SHIFT MEAL QUALITY"
          options={[
            { value: "poor", label: "POOR" },
            { value: "okay", label: "OKAY" },
            { value: "solid", label: "SOLID" },
          ]}
          value={postShiftMealQuality}
          onChange={setPostShiftMealQuality}
        />
      </div>

      {/* Notes */}
      <div className="surface-panel p-5 space-y-4">
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
          NOTES
        </div>

        <div>
          <label htmlFor="db-public-note" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
            PUBLIC NOTE
          </label>
          <textarea
            id="db-public-note"
            value={publicNote}
            onChange={(e) => setPublicNote(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors resize-none"
            placeholder="What do you want the public log to say?"
          />
        </div>

        <div>
          <label htmlFor="db-private-note" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
            PRIVATE NOTE{" "}
            <span className="text-[rgb(var(--text-meta))] normal-case tracking-normal font-[var(--font-ibm)] text-[10px]">
              (never published)
            </span>
          </label>
          <textarea
            id="db-private-note"
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors resize-none"
            placeholder="Field notes, complaints, things to remember. Stays private."
          />
        </div>
      </div>

      {/* Error */}
      {submitStatus === "error" && errorMsg && (
        <div className="border border-[rgb(var(--red)/0.4)] bg-[rgb(var(--red)/0.04)] px-4 py-3 text-sm text-[rgb(var(--red))] font-[var(--font-ibm)]">
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitStatus === "saving"}
          className="glitch-button glitch-button--primary"
        >
          {submitStatus === "saving" ? "Saving..." : "Save Carrier Day"}
        </button>
        <Link href="/carrier-journal" className="glitch-button">
          Back to Log
        </Link>
      </div>
    </form>
  );
}

// ─── Hydration Goal Panel ─────────────────────────────────────────────────────

const HEAT_BAND_COLOR: Record<HeatBand, string> = {
  "normal": "rgb(var(--text-secondary))",
  "caution": "rgb(var(--warn))",
  "extreme-caution": "rgb(var(--orange))",
  "danger": "rgb(var(--red))",
  "extreme-danger": "rgb(var(--red))",
};

function HydrationGoalPanel({
  recommendation,
  hasWeather,
  milesStr,
  override,
  onOverrideChange,
  showOverride,
  onToggleOverride,
}: {
  recommendation: HydrationRecommendation;
  hasWeather: boolean;
  milesStr: string;
  override: string;
  onOverrideChange: (v: string) => void;
  showOverride: boolean;
  onToggleOverride: () => void;
}) {
  const {
    routeWaterGoalOz,
    preShiftWaterOz,
    totalSuggestedOz,
    heatBand,
    effectiveHeatF,
    routeHours,
    electrolyteRecommended,
    warnings,
  } = recommendation;

  const overrideNum = override.trim() ? Number(override) : null;
  const displayOz =
    overrideNum !== null && Number.isFinite(overrideNum) && overrideNum > 0
      ? overrideNum
      : totalSuggestedOz;

  const basisParts: string[] = [];
  if (milesStr.trim()) basisParts.push(`${milesStr} mi`);
  if (hasWeather) basisParts.push(`${Math.round(effectiveHeatF)}°F eff. heat`);

  return (
    <div className="space-y-2">
      <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))]">
        HYDRATION GOAL (oz)
      </div>

      <div className="w-full bg-[rgb(var(--window)/0.5)] border border-[rgb(var(--border)/0.2)] px-4 py-3 space-y-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--neon))]">
            {displayOz}
          </span>
          <span
            className="font-[var(--font-ocr)] text-[9px] tracking-widest"
            style={{ color: HEAT_BAND_COLOR[heatBand] }}
          >
            {HEAT_BAND_LABEL[heatBand]}
          </span>
          {electrolyteRecommended && (
            <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--warn)/0.9)]">
              ELECTROLYTES REC.
            </span>
          )}
          {override.trim() && (
            <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta)/0.7)]">
              OVERRIDE
            </span>
          )}
        </div>

        <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
          {routeWaterGoalOz} oz route
          {preShiftWaterOz ? ` + ${preShiftWaterOz} oz pre-shift` : ""}
          {" · "}
          {routeHours % 1 === 0 ? routeHours : routeHours.toFixed(1)} h est.
        </div>

        {basisParts.length > 0 && (
          <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta)/0.6)]">
            {basisParts.join(" · ")}
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="font-[var(--font-ibm)] text-[11px] text-[rgb(var(--red)/0.9)] border-l-2 border-[rgb(var(--red)/0.4)] pl-2 py-0.5"
            >
              {w}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onToggleOverride}
        className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta)/0.5)] hover:text-[rgb(var(--text-meta))] transition-colors"
      >
        {showOverride ? "▲ HIDE OVERRIDE" : "▼ MANUAL OVERRIDE"}
      </button>

      {showOverride && (
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          value={override}
          onChange={(e) => onOverrideChange(e.target.value)}
          className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-xl px-4 py-3 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
          placeholder="Custom goal oz"
        />
      )}
    </div>
  );
}

// ─── Success card ─────────────────────────────────────────────────────────────

type SuccessCardProps = {
  result: SubmitResult;
  date: string;
  miles?: number;
  dpsCount?: number;
  temperatureF?: number;
  heatIndexF?: number;
  onLogAnother: () => void;
};

function SuccessCard({
  result,
  date,
  miles,
  dpsCount,
  temperatureF,
  heatIndexF,
  onLogAnother,
}: SuccessCardProps) {
  return (
    <div className="space-y-6">
      <div className="surface-panel p-6 sm:p-8 space-y-5">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider">
          CARRIER DAY LOGGED
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          <StatCell label="DATE" value={date} />
          {miles !== undefined && <StatCell label="MILES" value={formatMileage(miles)} />}
          {temperatureF !== undefined && (
            <StatCell label="TEMP" value={formatTemperature(temperatureF)} />
          )}
          {heatIndexF !== undefined && (
            <StatCell label="HEAT INDEX" value={formatTemperature(heatIndexF)} />
          )}
          {dpsCount !== undefined && (
            <StatCell label="DPS COUNT" value={dpsCount.toLocaleString("en-US")} />
          )}
          {result.dpsPerMile !== null && (
            <StatCell label="DPS / MILE" value={String(result.dpsPerMile)} />
          )}
          {result.fuelScoreLabel && (
            <StatCell
              label="FUEL SCORE"
              value={`${result.fuelScoreLabel}${result.fuelIsWin ? " · WIN" : ""}`}
            />
          )}
        </div>

        {result.publicSummary && (
          <div className="border-l-2 border-[rgb(var(--neon)/0.4)] pl-4">
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mb-1">
              PUBLIC SUMMARY
            </div>
            <p className="text-sm text-[rgb(var(--text-secondary))] font-[var(--font-ibm)] leading-relaxed">
              {result.publicSummary}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onLogAnother} className="glitch-button glitch-button--primary">
          Log Another Day
        </button>
        <Link href="/carrier-journal" className="glitch-button">
          Back to Carrier&apos;s Log
        </Link>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function WeatherCell({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | null;
  loading: boolean;
}) {
  return (
    <div>
      <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
        {label}
      </div>
      <div className="w-full bg-[rgb(var(--window)/0.5)] border border-[rgb(var(--border)/0.2)] px-4 py-3 font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))]">
        {loading ? (
          <span className="text-[rgb(var(--text-meta))] animate-pulse text-sm">···</span>
        ) : value !== null ? (
          `${Math.round(value)}`
        ) : (
          <span className="text-[rgb(var(--text-meta)/0.5)] text-sm">--</span>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[rgb(var(--panel))] p-4">
      <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] mb-1">
        {label}
      </div>
      <div className="font-[var(--font-ibm)] text-base text-[rgb(var(--text-color))]">{value}</div>
    </div>
  );
}

function FuelYesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (next: boolean) => void;
}) {
  return (
    <FuelSegment<boolean>
      label={label}
      options={[
        { value: true, label: "YES" },
        { value: false, label: "NO" },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}

function FuelSegment<T extends string | number | boolean>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (next: T) => void;
}) {
  return (
    <div>
      <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className="font-[var(--font-ocr)] text-[9px] tracking-widest border px-3 py-2 transition-colors"
              style={{
                color: selected ? "rgb(var(--neon))" : "rgb(var(--text-secondary))",
                borderColor: selected ? "rgb(var(--neon)/0.5)" : "rgb(var(--border)/0.4)",
                background: selected ? "rgb(var(--neon)/0.08)" : "transparent",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

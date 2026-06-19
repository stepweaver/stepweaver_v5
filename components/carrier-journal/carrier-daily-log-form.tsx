"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  formatPrivateDpsLine,
  MAIL_DAY_CONTEXT_OPTIONS,
  type DpsClassification,
} from "@/lib/dps";

const LOG_SECRET_STORAGE_KEY = "carrier-journal-log-secret";

type Props = {
  logEnabled: boolean;
};

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CarrierDailyLogForm({ logEnabled }: Props) {
  const [logSecret, setLogSecret] = useState("");
  const [date, setDate] = useState(todayIsoDate);
  const [dpsCount, setDpsCount] = useState("");
  const [mailDayContext, setMailDayContext] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<DpsClassification | null>(null);
  const previewRequestId = useRef(0);

  useEffect(() => {
    const stored = sessionStorage.getItem(LOG_SECRET_STORAGE_KEY);
    if (stored) setLogSecret(stored);
  }, []);

  const parsedDpsCount = useMemo(() => {
    const trimmed = dpsCount.trim();
    if (!trimmed) return undefined;
    const value = Number(trimmed.replace(/,/g, ""));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }, [dpsCount]);

  const privatePreviewLine = useMemo(() => {
    if (!parsedDpsCount) return null;
    return formatPrivateDpsLine({
      dpsCount: parsedDpsCount,
      dpsRatio: preview?.ratio,
    });
  }, [parsedDpsCount, preview]);

  useEffect(() => {
    if (!logEnabled || !logSecret || !parsedDpsCount) {
      setPreview(null);
      return;
    }

    const requestId = ++previewRequestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/carrier-journal/log", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logSecret,
            date,
            dpsCount: parsedDpsCount,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { classification: DpsClassification };
        if (requestId === previewRequestId.current) {
          setPreview(data.classification);
        }
      } catch {
        if (requestId === previewRequestId.current) {
          setPreview(null);
        }
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [date, logEnabled, logSecret, parsedDpsCount]);

  const toggleContext = useCallback((tag: string) => {
    setMailDayContext((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setStatus("saving");
      setErrorMsg("");

      sessionStorage.setItem(LOG_SECRET_STORAGE_KEY, logSecret);

      try {
        const res = await fetch("/api/carrier-journal/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logSecret,
            date,
            ...(parsedDpsCount !== undefined && { dpsCount: parsedDpsCount }),
            ...(mailDayContext.length > 0 && { mailDayContext }),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to save log entry");
        }

        setPreview(data.classification ?? null);
        setStatus("saved");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to save log entry");
      }
    },
    [date, logSecret, mailDayContext, parsedDpsCount]
  );

  if (!logEnabled) {
    return (
      <div className="surface-panel p-6 sm:p-8">
        <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-2">
          LOGGING UNAVAILABLE
        </div>
        <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
          Configure <code className="text-[rgb(var(--neon))]">NOTION_API_KEY</code>,{" "}
          <code className="text-[rgb(var(--neon))]">NOTION_CARRIER_JOURNAL_DB_ID</code>, and{" "}
          <code className="text-[rgb(var(--neon))]">CARRIER_JOURNAL_LOG_SECRET</code> to enable
          private mobile logging.
        </p>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="surface-panel p-6 sm:p-8 space-y-4">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider">
          MAIL VOLUME SAVED
        </div>
        {privatePreviewLine && (
          <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))]">
            {privatePreviewLine}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="glitch-button glitch-button--primary"
          >
            Log Another Day
          </button>
          <Link href="/carrier-journal" className="glitch-button">
            Back to Carrier&apos;s Log
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8 space-y-6">
      <div>
        <label htmlFor="log-secret" className="text-label block mb-2">
          Log Secret
        </label>
        <input
          id="log-secret"
          type="password"
          value={logSecret}
          onChange={(event) => setLogSecret(event.target.value)}
          required
          autoComplete="current-password"
          className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-3 py-2 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
          placeholder="Private logging secret"
        />
      </div>

      <div>
        <label htmlFor="log-date" className="text-label block mb-2">
          Date
        </label>
        <input
          id="log-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-3 py-2 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
        />
      </div>

      <div className="border border-[rgb(var(--border)/0.25)] p-4 sm:p-5 space-y-5">
        <div>
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] mb-1">
            MAIL VOLUME
          </div>
          <p className="text-xs text-[rgb(var(--text-meta))]">
            Enter DPS count only. Ratio is calculated automatically.
          </p>
        </div>

        <div>
          <label htmlFor="dps-count" className="text-label block mb-2">
            DPS Count
          </label>
          <input
            id="dps-count"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={dpsCount}
            onChange={(event) => setDpsCount(event.target.value)}
            className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-3 py-2 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
            placeholder="e.g. 2740"
          />
        </div>

        {privatePreviewLine && (
          <div className="border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.35)] px-3 py-2">
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mb-1">
              CALCULATED
            </div>
            <div className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))]">
              {privatePreviewLine}
            </div>
          </div>
        )}

        <div>
          <div className="text-label mb-2">Mail Day Context</div>
          <div className="flex flex-wrap gap-2">
            {MAIL_DAY_CONTEXT_OPTIONS.map((tag) => {
              const selected = mailDayContext.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleContext(tag)}
                  className="font-[var(--font-ocr)] text-[9px] tracking-widest border px-2 py-1 transition-colors"
                  style={{
                    color: selected ? "rgb(var(--neon))" : "rgb(var(--text-secondary))",
                    borderColor: selected
                      ? "rgb(var(--neon)/0.5)"
                      : "rgb(var(--border)/0.4)",
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

      {errorMsg && <div className="text-[rgb(var(--red))] text-sm">{errorMsg}</div>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="glitch-button glitch-button--primary w-full sm:w-auto"
      >
        {status === "saving" ? "Saving..." : "Save Mail Volume"}
      </button>
    </form>
  );
}

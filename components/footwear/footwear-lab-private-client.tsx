"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  token: string;
  shoes: Array<{
    id: string;
    slug: string;
    brand: string;
    model: string;
    nickname: string | null;
    status: string;
    isLegacyRecord: boolean;
    public: boolean;
    mileage: { totalMiles: number };
    level: { title: string; miles: number };
    conditionLabel: string;
  }>;
};

const emptyForm = {
  brand: "HOKA",
  model: "Bondi 9",
  nickname: "The Rookie",
  size: "10.5",
  width: "D",
  status: "active",
  acquisitionType: "purchased",
  isLegacyRecord: true,
  mileageConfidence: "estimated",
  public: true,
  estimatedWorkMiles: "250",
  estimatedPersonalMiles: "",
  amountPaid: "",
  purchaseDate: "",
  firstWearDate: "",
  baselineNotes: "",
};

export function FootwearLabPrivateClient({ token, shoes: initial }: Props) {
  const [shoes, setShoes] = useState(initial);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(
    () => shoes.find((s) => s.status === "active"),
    [shoes]
  );

  async function refresh() {
    const res = await fetch(
      `/api/footwear/shoes?logSecret=${encodeURIComponent(token)}`
    );
    const data = await res.json();
    if (res.ok && data.shoes) setShoes(data.shoes);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/footwear/shoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logSecret: token,
          brand: form.brand,
          model: form.model,
          nickname: form.nickname || undefined,
          size: form.size,
          width: form.width || undefined,
          status: form.status,
          acquisitionType: form.acquisitionType,
          isLegacyRecord: form.isLegacyRecord,
          mileageConfidence: form.mileageConfidence,
          public: form.public,
          amountPaid: form.amountPaid ? parseFloat(form.amountPaid) : undefined,
          purchaseDate: form.purchaseDate || undefined,
          firstWearDate: form.firstWearDate || undefined,
          baselineNotes: form.baselineNotes || undefined,
          estimatedWorkMiles: form.estimatedWorkMiles
            ? parseFloat(form.estimatedWorkMiles)
            : undefined,
          estimatedPersonalMiles: form.estimatedPersonalMiles
            ? parseFloat(form.estimatedPersonalMiles)
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Create failed");
        return;
      }
      setMessage(`Created ${data.shoe.slug}`);
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function makeActive(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/footwear/shoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logSecret: token,
          action: "setActive",
          id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not set active");
        return;
      }
      setMessage(`Active loadout: ${data.shoe.brand} ${data.shoe.model}`);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/footwear/shoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logSecret: token, id, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))] mb-2">
          FOOTWEAR LAB // PRIVATE
        </p>
        <h1 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">
          Equipment roster
        </h1>
        <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] max-w-xl">
          Create pairs, set the active loadout, and open a shoe for checkpoints,
          field notes, and retirement. Occupational mileage still comes from the
          daily field log.
        </p>
        {active && (
          <p className="mt-3 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
            ACTIVE LOADOUT // {active.brand} {active.model}
            {active.nickname ? ` “${active.nickname}”` : ""}:{" "}
            {active.mileage.totalMiles} MI // {active.level.title}
          </p>
        )}
      </header>

      {message && (
        <p className="text-sm text-[rgb(var(--neon))]" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <section className="surface-panel p-5 space-y-4" aria-labelledby="roster-heading">
        <h2
          id="roster-heading"
          className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
        >
          EQUIPMENT ROSTER
        </h2>
        {shoes.length === 0 ? (
          <p className="text-sm text-[rgb(var(--text-meta))]">
            No shoes yet. Create the legacy HOKA profile below to start.
          </p>
        ) : (
          <ul className="space-y-3">
            {shoes.map((shoe) => (
              <li
                key={shoe.id}
                className="border border-[rgb(var(--neon)/0.2)] p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              >
                <div>
                  <p className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))]">
                    {shoe.brand} {shoe.model}
                  </p>
                  {shoe.nickname && (
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      “{shoe.nickname}”
                    </p>
                  )}
                  <p className="mt-1 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
                    {shoe.status.toUpperCase()}
                    {shoe.isLegacyRecord ? " // LEGACY RECORD" : ""}
                    {" // "}
                    {shoe.mileage.totalMiles} MI // {shoe.level.title} //{" "}
                    {shoe.conditionLabel}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shoe.status !== "active" &&
                    shoe.status !== "retired" &&
                    shoe.status !== "failed" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => makeActive(shoe.id)}
                        className="border border-[rgb(var(--neon)/0.4)] px-3 py-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--neon))]"
                      >
                        Set Active
                      </button>
                    )}
                  {shoe.status === "active" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setStatus(shoe.id, "paused")}
                      className="border border-[rgb(var(--neon)/0.25)] px-3 py-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-secondary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--neon))]"
                    >
                      Pause
                    </button>
                  )}
                  <Link
                    href={`/log/footwear/${shoe.slug}?token=${encodeURIComponent(token)}`}
                    className="border border-[rgb(var(--neon)/0.4)] px-3 py-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)]"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface-panel p-5 space-y-4" aria-labelledby="create-heading">
        <h2
          id="create-heading"
          className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
        >
          CREATE SHOE PROFILE
        </h2>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Defaults are set for the legacy HOKA Bondi 9. Clear estimated miles for
          a true Mile 0 pair.
        </p>
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["brand", "Brand"],
              ["model", "Model"],
              ["nickname", "Nickname"],
              ["size", "Size"],
              ["width", "Width"],
              ["purchaseDate", "Purchase date"],
              ["firstWearDate", "First wear date"],
              ["amountPaid", "Amount paid"],
              ["estimatedWorkMiles", "Estimated work miles"],
              ["estimatedPersonalMiles", "Estimated personal miles"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label
                htmlFor={`shoe-${key}`}
                className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
              >
                {label}
              </label>
              <input
                id={`shoe-${key}`}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm text-[rgb(var(--text-color))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--neon))]"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label
              htmlFor="shoe-baselineNotes"
              className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
            >
              Baseline notes
            </label>
            <textarea
              id="shoe-baselineNotes"
              rows={3}
              value={form.baselineNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, baselineNotes: e.target.value }))
              }
              className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm text-[rgb(var(--text-color))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--neon))]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
            <input
              type="checkbox"
              checked={form.isLegacyRecord}
              onChange={(e) =>
                setForm((f) => ({ ...f, isLegacyRecord: e.target.checked }))
              }
            />
            Legacy record
          </label>
          <label className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
            <input
              type="checkbox"
              checked={form.public}
              onChange={(e) =>
                setForm((f) => ({ ...f, public: e.target.checked }))
              }
            />
            Public profile
          </label>
          <label className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
            <input
              type="checkbox"
              checked={form.status === "active"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.checked ? "active" : "planned",
                }))
              }
            />
            Set as active loadout
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="glitch-button px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.2em] uppercase"
            >
              {busy ? "Saving…" : "Create shoe"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

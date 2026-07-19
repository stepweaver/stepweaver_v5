"use client";

import { useMemo, useState } from "react";
import {
  getCheckpointThresholds,
  getSuggestedCheckpoint,
} from "@/lib/footwear/checkpoints";

export type ManageObservation = {
  id: string;
  date: string;
  entryType: string;
  checkpointMiles: number | null;
  title: string | null;
  notes: string;
  cushioning: number | null;
  stability: number | null;
  tractionDry: number | null;
  tractionWet: number | null;
  comfort: number | null;
  fitSecurity: number | null;
  breathability: number | null;
  durability: number | null;
  footComfort: number | null;
  kneeComfort: number | null;
  hipBackComfort: number | null;
  endOfShiftSupport: number | null;
  outsoleWear: number | null;
  midsoleWear: number | null;
  upperWear: number | null;
  heelWear: number | null;
  insoleWear: number | null;
  structuralDeformation: number | null;
  retrospective: boolean;
  public: boolean;
  shoeMileageAtEntry: string | number | null;
};

type Props = {
  token: string;
  shoe: {
    id: string;
    slug: string;
    brand: string;
    model: string;
    nickname: string | null;
    status: string;
    isLegacyRecord: boolean;
  };
  totalMiles: number;
  pendingCheckpoints: { miles: number; title: string }[];
  observations?: ManageObservation[];
};

const RATING_FIELDS = [
  ["cushioning", "Cushioning"],
  ["stability", "Stability"],
  ["comfort", "Overall comfort"],
  ["tractionDry", "Dry traction"],
  ["tractionWet", "Wet traction"],
  ["fitSecurity", "Fit security"],
  ["breathability", "Breathability"],
  ["durability", "Durability"],
] as const;

const BODY_FIELDS = [
  ["footComfort", "Foot comfort"],
  ["kneeComfort", "Knee comfort"],
  ["hipBackComfort", "Hip / back comfort"],
  ["endOfShiftSupport", "End-of-shift support"],
] as const;

const WEAR_FIELDS = [
  ["outsoleWear", "Outsole"],
  ["midsoleWear", "Midsole"],
  ["upperWear", "Upper"],
  ["heelWear", "Heel collar"],
  ["insoleWear", "Insole"],
  ["structuralDeformation", "Structural deformation"],
] as const;

const EDITABLE_ENTRY_TYPES = new Set(["checkpoint", "field_note", "incident"]);

function numToField(v: number | null | undefined): string {
  return v == null ? "" : String(v);
}

export function FootwearShoeManageClient({
  token,
  shoe,
  totalMiles,
  pendingCheckpoints,
  observations: initialObservations = [],
}: Props) {
  const [tab, setTab] = useState<
    "checkpoint" | "field_note" | "incident" | "allocation" | "retire" | "photo"
  >("checkpoint");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [observations, setObservations] = useState(initialObservations);
  const [editingId, setEditingId] = useState<string | null>(null);

  const suggested = getSuggestedCheckpoint({
    totalMiles,
    pendingCheckpoints,
  });
  const highestPending =
    pendingCheckpoints.length > 0
      ? pendingCheckpoints.reduce((best, cur) =>
          cur.miles >= best.miles ? cur : best
        )
      : null;
  const checkpointOptions = useMemo(
    () => getCheckpointThresholds(totalMiles),
    [totalMiles]
  );
  const loggedCheckpointMiles = useMemo(() => {
    const logged = new Set<number>();
    for (const obs of observations) {
      if (
        obs.entryType === "checkpoint" &&
        obs.checkpointMiles != null &&
        obs.id !== editingId
      ) {
        logged.add(obs.checkpointMiles);
      }
    }
    return logged;
  }, [observations, editingId]);

  const [checkpointMiles, setCheckpointMiles] = useState(
    String(suggested.miles)
  );
  const [customCheckpoint, setCustomCheckpoint] = useState(
    () => !checkpointOptions.some((t) => t.miles === suggested.miles)
  );
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState(suggested.title ?? "");
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [publicObs, setPublicObs] = useState(true);
  const [retrospective, setRetrospective] = useState(shoe.isLegacyRecord);

  const [allocMiles, setAllocMiles] = useState("");
  const [allocType, setAllocType] = useState("estimated");
  const [allocNotes, setAllocNotes] = useState("");

  const [retireReason, setRetireReason] = useState("cushioning_degradation");
  const [verdict, setVerdict] = useState("serviceable");
  const [postWork, setPostWork] = useState("casual_use_only");
  const [finalReview, setFinalReview] = useState("");
  const [wouldBuyAgain, setWouldBuyAgain] = useState(true);

  const [photoType, setPhotoType] = useState("pair");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoPublic, setPhotoPublic] = useState(true);

  function ratingPayload(forUpdate = false) {
    const out: Record<string, number | null> = {};
    for (const [key] of [...RATING_FIELDS, ...BODY_FIELDS, ...WEAR_FIELDS]) {
      const v = ratings[key];
      if (v != null && v !== "") out[key] = parseInt(v, 10);
      else if (forUpdate) out[key] = null;
    }
    return out;
  }

  function selectNamedCheckpoint(miles: number, namedTitle: string) {
    setCustomCheckpoint(false);
    setCheckpointMiles(String(miles));
    setTitle(namedTitle);
  }

  function resetObservationForm() {
    setEditingId(null);
    const isNamed = checkpointOptions.some((t) => t.miles === suggested.miles);
    setCustomCheckpoint(!isNamed);
    setCheckpointMiles(String(suggested.miles));
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setTitle(suggested.title ?? "");
    setRatings({});
    setPublicObs(true);
    setRetrospective(shoe.isLegacyRecord);
  }

  function startEdit(obs: ManageObservation) {
    if (!EDITABLE_ENTRY_TYPES.has(obs.entryType)) {
      setError("This entry type cannot be edited here.");
      return;
    }
    setError(null);
    setMessage(null);
    setEditingId(obs.id);
    setTab(
      obs.entryType === "checkpoint"
        ? "checkpoint"
        : obs.entryType === "incident"
          ? "incident"
          : "field_note"
    );
    setDate(obs.date);
    const miles = obs.checkpointMiles;
    const isNamed =
      miles != null && checkpointOptions.some((t) => t.miles === miles);
    setCustomCheckpoint(miles != null && !isNamed);
    setCheckpointMiles(miles != null ? String(miles) : "");
    setTitle(obs.title ?? "");
    setNotes(obs.notes);
    setPublicObs(obs.public);
    setRetrospective(obs.retrospective);
    const next: Record<string, string> = {};
    for (const [key] of [...RATING_FIELDS, ...BODY_FIELDS, ...WEAR_FIELDS]) {
      next[key] = numToField(obs[key]);
    }
    setRatings(next);
  }

  async function submitObservation(entryType: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const isEdit = editingId != null;
      const body: Record<string, unknown> = {
        logSecret: token,
        ...(isEdit
          ? { id: editingId }
          : { shoeId: shoe.id, entryType }),
        date,
        title: title || null,
        notes,
        public: publicObs,
        retrospective,
        ...ratingPayload(isEdit),
      };
      if (entryType === "checkpoint" || (isEdit && checkpointMiles !== "")) {
        body.checkpointMiles = parseInt(checkpointMiles, 10);
      }
      const res = await fetch("/api/footwear/observations", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      const saved = data.observation as ManageObservation;
      if (isEdit) {
        setObservations((list) =>
          list.map((o) => (o.id === saved.id ? { ...o, ...saved } : o))
        );
        setMessage(`Updated ${entryType} entry.`);
        resetObservationForm();
      } else {
        setObservations((list) => [saved, ...list]);
        setMessage(`${entryType} saved at ${totalMiles} mi service mileage.`);
        setNotes("");
        setTitle("");
        setRatings({});
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitAllocation(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/footwear/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logSecret: token,
          shoeId: shoe.id,
          date,
          miles: parseFloat(allocMiles),
          mileageType: allocType,
          notes: allocNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Allocation failed");
        return;
      }
      setMessage("Mileage allocation saved.");
      setAllocMiles("");
    } finally {
      setBusy(false);
    }
  }

  async function submitRetire(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/footwear/retire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logSecret: token,
          id: shoe.id,
          retirementDate: date,
          retirementReason: retireReason,
          retiredFromWorkOnly: false,
          wouldBuyAgain,
          finalVerdict: verdict,
          finalReview,
          postWorkStatus: postWork,
          public: publicObs,
          ...ratingPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Retirement failed");
        return;
      }
      setMessage("Shoe retired. Final report filed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!photoFile) {
      setError("Choose an image file.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", photoFile);
      form.append(
        "meta",
        JSON.stringify({
          logSecret: token,
          shoeId: shoe.id,
          imageType: photoType,
          caption: photoCaption || undefined,
          public: photoPublic,
          sortOrder: 0,
        })
      );
      const res = await fetch("/api/footwear/media", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setMessage("Photo uploaded.");
      setPhotoFile(null);
      setPhotoCaption("");
    } finally {
      setBusy(false);
    }
  }

  const tabs = [
    ["checkpoint", "Checkpoint"],
    ["field_note", "Field note"],
    ["incident", "Incident"],
    ["allocation", "Mileage"],
    ["photo", "Photos"],
    ["retire", "Retire"],
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))] mb-2">
          FIELD DIAGNOSTIC // {shoe.slug.toUpperCase()}
        </p>
        <h1 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">
          {shoe.brand} {shoe.model}
        </h1>
        {shoe.nickname && (
          <p className="text-[rgb(var(--text-secondary))]">“{shoe.nickname}”</p>
        )}
        <p className="mt-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
          SERVICE MILEAGE // {totalMiles} MI
          {highestPending
            ? ` // PENDING ${highestPending.miles} ${highestPending.title.toUpperCase()}`
            : ""}
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Manage shoe">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              if (editingId) resetObservationForm();
              setTab(id);
            }}
            className={`border px-3 py-2 font-[var(--font-ocr)] text-[10px] tracking-widest uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--neon))] ${
              tab === id
                ? "border-[rgb(var(--neon))] text-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.12)]"
                : "border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      {observations.length > 0 && (
        <section className="surface-panel p-5 space-y-3" aria-labelledby="history-heading">
          <h2
            id="history-heading"
            className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))]"
          >
            SERVICE HISTORY
          </h2>
          <ul className="space-y-2">
            {observations.map((obs) => (
              <li
                key={obs.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 justify-between border p-3 ${
                  editingId === obs.id
                    ? "border-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.08)]"
                    : "border-[rgb(var(--neon)/0.2)]"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
                    {obs.entryType.replace(/_/g, " ").toUpperCase()}
                    {obs.checkpointMiles != null ? ` // ${obs.checkpointMiles} MI` : ""}
                    {` // ${obs.date}`}
                    {obs.retrospective ? " // RETROSPECTIVE" : ""}
                  </p>
                  <p className="text-sm text-[rgb(var(--text-color))] truncate">
                    {obs.title || obs.notes.slice(0, 80)}
                    {!obs.title && obs.notes.length > 80 ? "…" : ""}
                  </p>
                </div>
                {EDITABLE_ENTRY_TYPES.has(obs.entryType) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startEdit(obs)}
                    className="shrink-0 border border-[rgb(var(--neon)/0.4)] px-3 py-2 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--neon))]"
                  >
                    {editingId === obs.id ? "Editing…" : "Edit"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(tab === "checkpoint" || tab === "field_note" || tab === "incident") && (
        <form
          className="surface-panel p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submitObservation(
              tab === "checkpoint" ? "checkpoint" : tab === "incident" ? "incident" : "field_note"
            );
          }}
        >
          {editingId && (
            <p className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))]">
              EDITING ENTRY // {editingId.slice(0, 12).toUpperCase()}…
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="obs-date" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Date
              </label>
              <input
                id="obs-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
            {tab === "checkpoint" && (
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label
                    htmlFor="obs-cp-select"
                    className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
                  >
                    Checkpoint
                  </label>
                  <select
                    id="obs-cp-select"
                    value={
                      customCheckpoint
                        ? "custom"
                        : checkpointOptions.some(
                              (t) => String(t.miles) === checkpointMiles
                            )
                          ? checkpointMiles
                          : "custom"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "custom") {
                        setCustomCheckpoint(true);
                        return;
                      }
                      const miles = parseInt(value, 10);
                      const named = checkpointOptions.find(
                        (t) => t.miles === miles
                      );
                      if (named) selectNamedCheckpoint(named.miles, named.title);
                    }}
                    className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
                  >
                    {checkpointOptions.map((t) => {
                      const logged = loggedCheckpointMiles.has(t.miles);
                      return (
                        <option
                          key={t.miles}
                          value={String(t.miles)}
                          disabled={logged}
                        >
                          {t.miles} mi — {t.title}
                          {logged ? " (logged)" : ""}
                        </option>
                      );
                    })}
                    <option value="custom">Custom miles…</option>
                  </select>
                  <p className="mt-1 text-[10px] text-[rgb(var(--text-meta))]">
                    Service mileage is {totalMiles} mi
                    {highestPending
                      ? ` · suggested ${highestPending.miles} mi (${highestPending.title})`
                      : ""}
                    .
                  </p>
                </div>
                {customCheckpoint && (
                  <div>
                    <label
                      htmlFor="obs-cp"
                      className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
                    >
                      Custom checkpoint miles
                    </label>
                    <input
                      id="obs-cp"
                      value={checkpointMiles}
                      onChange={(e) => setCheckpointMiles(e.target.value)}
                      className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            )}
            <div className="sm:col-span-2">
              <label htmlFor="obs-title" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Title
              </label>
              <input
                id="obs-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="obs-notes" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                {tab === "checkpoint" ? "Written assessment" : "Observation"}
              </label>
              <textarea
                id="obs-notes"
                required
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
          </div>

          {tab === "checkpoint" && (
            <>
              <fieldset>
                <legend className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-3">
                  PERFORMANCE (1–10)
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RATING_FIELDS.map(([key, label]) => (
                    <div key={key}>
                      <label htmlFor={`r-${key}`} className="text-xs text-[rgb(var(--text-label))] block mb-1">
                        {label}
                      </label>
                      <input
                        id={`r-${key}`}
                        type="number"
                        min={1}
                        max={10}
                        value={ratings[key] ?? ""}
                        onChange={(e) =>
                          setRatings((r) => ({ ...r, [key]: e.target.value }))
                        }
                        className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-3">
                  BODY RESPONSE (1–10)
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BODY_FIELDS.map(([key, label]) => (
                    <div key={key}>
                      <label htmlFor={`b-${key}`} className="text-xs text-[rgb(var(--text-label))] block mb-1">
                        {label}
                      </label>
                      <input
                        id={`b-${key}`}
                        type="number"
                        min={1}
                        max={10}
                        value={ratings[key] ?? ""}
                        onChange={(e) =>
                          setRatings((r) => ({ ...r, [key]: e.target.value }))
                        }
                        className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="font-[var(--font-ocr)] text-[10px] tracking-[0.25em] text-[rgb(var(--neon))] mb-3">
                  WEAR (0–5)
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WEAR_FIELDS.map(([key, label]) => (
                    <div key={key}>
                      <label htmlFor={`w-${key}`} className="text-xs text-[rgb(var(--text-label))] block mb-1">
                        {label}
                      </label>
                      <input
                        id={`w-${key}`}
                        type="number"
                        min={0}
                        max={5}
                        value={ratings[key] ?? ""}
                        onChange={(e) =>
                          setRatings((r) => ({ ...r, [key]: e.target.value }))
                        }
                        className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={publicObs}
                onChange={(e) => setPublicObs(e.target.checked)}
              />
              Public
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={retrospective}
                onChange={(e) => setRetrospective(e.target.checked)}
              />
              Retrospective
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="glitch-button px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.2em] uppercase"
            >
              {busy ? "Saving…" : editingId ? "Save changes" : "Submit"}
            </button>
            {editingId && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  resetObservationForm();
                  setMessage(null);
                }}
                className="border border-[rgb(var(--neon)/0.35)] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.2em] uppercase text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--neon)/0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--neon))]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {tab === "allocation" && (
        <form className="surface-panel p-5 space-y-4" onSubmit={submitAllocation}>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Use this for prior/baseline mileage or corrections. Day-to-day miles
            should normally be assigned from the daily field log.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="alloc-date" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Date
              </label>
              <input
                id="alloc-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="alloc-miles" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Miles
              </label>
              <input
                id="alloc-miles"
                required
                value={allocMiles}
                onChange={(e) => setAllocMiles(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="alloc-type" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Type
              </label>
              <select
                id="alloc-type"
                value={allocType}
                onChange={(e) => setAllocType(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              >
                <option value="estimated">Prior / baseline</option>
                <option value="adjustment">Adjustment</option>
                <option value="work">Logged (manual)</option>
              </select>
            </div>
            <div>
              <label htmlFor="alloc-notes" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Notes
              </label>
              <input
                id="alloc-notes"
                value={allocNotes}
                onChange={(e) => setAllocNotes(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="glitch-button px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.2em] uppercase"
          >
            Save allocation
          </button>
        </form>
      )}

      {tab === "photo" && (
        <form className="surface-panel p-5 space-y-4" onSubmit={submitPhoto}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="photo-file" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Image
              </label>
              <input
                id="photo-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label htmlFor="photo-type" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Image type
              </label>
              <select
                id="photo-type"
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              >
                <option value="hero">Hero</option>
                <option value="pair">Pair</option>
                <option value="left_outsole">Left outsole</option>
                <option value="right_outsole">Right outsole</option>
                <option value="lateral">Lateral</option>
                <option value="medial">Medial</option>
                <option value="heel">Heel</option>
                <option value="upper">Upper</option>
                <option value="insole">Insole</option>
                <option value="damage">Damage</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="photo-caption" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Caption
              </label>
              <input
                id="photo-caption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={photoPublic}
              onChange={(e) => setPhotoPublic(e.target.checked)}
            />
            Public
          </label>
          <button
            type="submit"
            disabled={busy}
            className="glitch-button px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.2em] uppercase"
          >
            Upload photo
          </button>
        </form>
      )}

      {tab === "retire" && (
        <form className="surface-panel p-5 space-y-4" onSubmit={submitRetire}>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Files a final retirement report and marks the unit retired or failed.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="retire-date" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Last worn / retirement date
              </label>
              <input
                id="retire-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="retire-reason" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Reason
              </label>
              <select
                id="retire-reason"
                value={retireReason}
                onChange={(e) => setRetireReason(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              >
                <option value="cushioning_degradation">Cushioning degradation</option>
                <option value="traction_loss">Traction loss</option>
                <option value="uneven_wear">Uneven wear</option>
                <option value="upper_failure">Upper failure</option>
                <option value="heel_collar_failure">Heel collar failure</option>
                <option value="fit_problem">Fit problem</option>
                <option value="pain_or_injury_concern">Pain or injury concern</option>
                <option value="weather_limitation">Weather limitation</option>
                <option value="reached_planned_testing_endpoint">Planned endpoint</option>
                <option value="replaced_but_still_usable">Replaced but usable</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="retire-verdict" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Final verdict
              </label>
              <select
                id="retire-verdict"
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              >
                <option value="elite">Elite</option>
                <option value="reliable">Reliable</option>
                <option value="serviceable">Serviceable</option>
                <option value="specialist">Specialist</option>
                <option value="disappointing">Disappointing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label htmlFor="retire-post" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Post-work status
              </label>
              <select
                id="retire-post"
                value={postWork}
                onChange={(e) => setPostWork(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              >
                <option value="casual_use_only">Casual use only</option>
                <option value="backup_pair">Backup pair</option>
                <option value="wet_weather_pair">Wet-weather pair</option>
                <option value="donated">Donated</option>
                <option value="discarded">Discarded</option>
                <option value="fully_retired">Fully retired</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="retire-review" className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2">
                Final review
              </label>
              <textarea
                id="retire-review"
                required
                rows={5}
                value={finalReview}
                onChange={(e) => setFinalReview(e.target.value)}
                className="w-full border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.3)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={wouldBuyAgain}
              onChange={(e) => setWouldBuyAgain(e.target.checked)}
            />
            Would buy again
          </label>
          <button
            type="submit"
            disabled={busy}
            className="glitch-button px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.2em] uppercase"
          >
            Retire unit
          </button>
        </form>
      )}
    </div>
  );
}

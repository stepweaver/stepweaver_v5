"use client";

import type { MailCard, GameMode } from "@/lib/mail-sort-academy/types";

const SHAPE_LABELS: Record<string, string> = {
  card: "Postcard / Card",
  letter: "Letter",
  flat: "Flat",
  parcel: "Parcel",
  magazine: "Magazine",
  catalog: "Catalog",
  flyer: "Flyer",
  unknown: "Unknown",
};

const MAILER_ENDORSEMENT_LABELS: Record<string, string> = {
  none: "None",
  address_service_requested: "Address Service Requested",
  forwarding_service_requested: "Forwarding Service Requested",
  return_service_requested: "Return Service Requested",
  change_service_requested: "Change Service Requested",
  electronic_service_requested: "Electronic Service Requested",
};

const EXTRA_SERVICE_LABELS: Record<string, string> = {
  none: "None",
  certified: "Certified Mail",
  registered: "Registered Mail",
  cod: "COD (Collect on Delivery)",
  insured_signature: "Insured, Signature Required",
  signature_confirmation: "Signature Confirmation",
  return_receipt: "Return Receipt",
  postage_due: "Postage Due",
  customs_due: "Customs Due",
  arrow_key: "Arrow Key / Official Mail",
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  rookie: { label: "ROOKIE", color: "text-[rgb(var(--neon)/0.7)]" },
  regular: { label: "REGULAR", color: "text-[rgb(var(--warn)/0.8)]" },
  inspection: { label: "INSPECTION", color: "text-[rgb(var(--danger)/0.8)]" },
};

interface MailCardDisplayProps {
  card: MailCard;
  mode: GameMode;
  cardNumber: number;
  totalCards: number;
}

function MetaChip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--neon)/0.4)] uppercase">
        {label}
      </span>
      <span
        className={`font-[var(--font-ibm)] text-xs ${
          highlight
            ? "text-[rgb(var(--accent))]"
            : "text-[rgb(var(--text-secondary))]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function MailCardDisplay({
  card,
  mode,
  cardNumber,
  totalCards,
}: MailCardDisplayProps) {
  const diff = DIFFICULTY_LABELS[card.difficulty];

  return (
    <div className="border border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel))]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--neon)/0.03)]">
        <div className="flex items-center gap-2">
          <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.4)]">
            {card.id}
          </span>
          <span className="text-[rgb(var(--neon)/0.15)]">│</span>
          <span
            className={`font-[var(--font-ocr)] text-[10px] ${diff.color}`}
          >
            {diff.label}
          </span>
        </div>
        <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))]">
          {cardNumber} / {totalCards}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h2 className="font-[var(--font-ibm)] text-base sm:text-lg text-[rgb(var(--text-color))]">
            {card.title}
          </h2>
          <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed mt-2">
            {card.scenario}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[rgb(var(--neon)/0.08)]">
          <MetaChip label="Shape" value={SHAPE_LABELS[card.shape] ?? card.shape} />
          <MetaChip
            label="Mailer Endorsement"
            value={MAILER_ENDORSEMENT_LABELS[card.mailerEndorsement]}
            highlight={card.mailerEndorsement !== "none"}
          />
          <MetaChip
            label="Extra Service"
            value={EXTRA_SERVICE_LABELS[card.extraService]}
            highlight={card.extraService !== "none"}
          />
        </div>

        {(card.isAccountable || card.extraService !== "none") && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--accent)/0.08)] border border-[rgb(var(--accent)/0.25)]">
            <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.15em] text-[rgb(var(--accent)/0.9)] uppercase">
              ⚠ Accountable / Special Service
            </span>
          </div>
        )}

        <div className="pt-1">
          <p className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta)/0.6)] tracking-[0.15em] uppercase">
            Mode:{" "}
            <span className="text-[rgb(var(--neon)/0.6)]">
              {mode.replace(/_/g, " ")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

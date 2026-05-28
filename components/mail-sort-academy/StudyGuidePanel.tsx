"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, ArrowLeft } from "lucide-react";

const RULES = [
  {
    number: 1,
    title: "Class is not the same as accountable status.",
    detail:
      "Mail class (First-Class, Priority, Periodicals, Marketing Mail, etc.) tells you the postage rate and base forwarding rules. Accountable status (Certified, Registered, COD, Insured, Signature Confirmation) is a layer on top of the class that adds tracking, signature, or money requirements. A Certified letter is still First-Class Mail; the class does not change.",
  },
  {
    number: 2,
    title:
      "First-Class, Priority, PME, Ground Advantage, Periodicals, and Package Services are never UBBM.",
    detail:
      "UBBM (Undeliverable Bulk Business Mail) applies only to USPS Marketing Mail that cannot be delivered and has no mailer endorsement authorizing return or forwarding. Every other class receives forwarding or return-to-sender treatment. A First-Class letter to a moved customer goes to CFS (Change of Address forwarding) or back to sender, never to the UBBM bin.",
  },
  {
    number: 3,
    title:
      "USPS Marketing Mail can become UBBM when undeliverable and unendorsed.",
    detail:
      "If a Marketing Mail piece (formerly Standard Mail or Bulk Business Mail) has no mailer endorsement and cannot be delivered, for example because the customer moved, the address does not exist, the unit is vacant, or the addressee is unknown, the piece is handled as UBBM. ESR (Electronic Service Requested) also results in UBBM treatment. UBBM handling is local procedure; follow your unit's instructions.",
  },
  {
    number: 4,
    title:
      "Mailer endorsements request forwarding, return, or address correction service.",
    detail:
      "Mailer endorsements are printed by the sender on the mailpiece and tell you what to do when the piece can't be delivered:\n• Address Service Requested (ASR): return with new address\n• Forwarding Service Requested (FSR): forward if COA; return if not\n• Return Service Requested (RSR): return to sender\n• Change Service Requested (CSR): return with address info for data update\n• Electronic Service Requested (ESR): electronic notification only; treat as UBBM\nAny endorsement other than ESR means the piece is NOT UBBM.",
  },
  {
    number: 5,
    title: "Carrier endorsements explain why the piece could not be delivered.",
    detail:
      "Carrier endorsements are notations you apply to explain undeliverable mail:\n• ANK: Addressee Not Known at this address\n• IA: Insufficient Address (missing street, number, etc.)\n• NSN: No Such Number on this street\n• NSS: No Such Street in this city\n• NMR: No Mail Receptacle\n• REF: Refused by addressee\n• UNC: Unclaimed after notice period\n• UTF: Unable to Forward (forwarding order expired or none on file)\n• VAC: Vacant unit\n• DEC: Deceased (confirmed; use carefully)\n• ILL: Illegible address\nApply the most accurate endorsement so the sender understands why return occurred.",
  },
  {
    number: 6,
    title:
      "Accountable / special-service mail is never casually discarded or put in UBBM.",
    detail:
      "Certified, Registered, COD, Insured (sig required), Signature Confirmation, and Arrow Key mail must all be scanned and returned to the office if undeliverable. Each piece is tracked in the chain of custody. Placing accountable mail in UBBM or discarding it is a serious compliance violation. When you can't deliver, leave PS Form 3849 and return the piece to the accountable section.",
  },
  {
    number: 7,
    title: "When unsure, choose Ask Supervisor.",
    detail:
      "USPS mail handling rules have exceptions, local variations, and edge cases. If you're uncertain whether a piece is UBBM, needs a specific endorsement, or should go to the accountable section, ask your supervisor before acting. It is always better to hold a piece and ask than to mishandle it.",
  },
];

interface StudyGuidePanelProps {
  onBack: () => void;
}

export function StudyGuidePanel({ onBack }: StudyGuidePanelProps) {
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  const toggle = (n: number) =>
    setExpandedRule((prev) => (prev === n ? null : n));

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--border)/0.35)] backdrop-blur-sm px-4 py-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[rgb(var(--neon)/0.7)] hover:text-[rgb(var(--neon))] font-[var(--font-ocr)] text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-[rgb(var(--neon)/0.15)]">│</span>
        <BookOpen className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.6)]" />
        <span className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.7)] uppercase">
          Study Guide
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        <p className="font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))] mb-4">
          Based on public USPS/NALC references. Always follow local instructions
          and supervisor direction.
        </p>

        {RULES.map((rule) => (
          <div
            key={rule.number}
            className="border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel))] overflow-hidden"
          >
            <button
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[rgb(var(--neon)/0.05)] transition-colors cursor-pointer"
              onClick={() => toggle(rule.number)}
              aria-expanded={expandedRule === rule.number}
            >
              <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.5)] shrink-0 pt-0.5 w-8">
                R{String(rule.number).padStart(2, "0")}
              </span>
              <span className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color)/0.9)] flex-1">
                {rule.title}
              </span>
              {expandedRule === rule.number ? (
                <ChevronDown className="w-4 h-4 text-[rgb(var(--neon)/0.5)] shrink-0 mt-0.5" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[rgb(var(--neon)/0.3)] shrink-0 mt-0.5" />
              )}
            </button>

            {expandedRule === rule.number && (
              <div className="px-4 pb-4 pt-0 border-t border-[rgb(var(--neon)/0.1)]">
                <p className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed whitespace-pre-line mt-3">
                  {rule.detail}
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="mt-6 p-3 border border-[rgb(var(--warn)/0.3)] bg-[rgb(var(--warn)/0.05)]">
          <p className="font-[var(--font-ocr)] text-xs text-[rgb(var(--warn)/0.8)]">
            UNOFFICIAL STUDY TOOL. This game is not an official USPS product.
            Content is based on publicly available USPS and NALC references.
            Always follow your local unit&apos;s instructions and supervisor
            direction.
          </p>
        </div>
      </div>
    </div>
  );
}

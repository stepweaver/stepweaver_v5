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
      "UBBM (Undeliverable Bulk Business Mail) applies mainly to USPS Marketing Mail (formerly Standard Mail / Bulk Business Mail) that is undeliverable and has no mailer endorsement. Every other class receives forwarding, return, or CFS/PARS processing, never the UBBM bin. A First-Class letter to a moved customer goes to CFS or back to sender. Periodicals go through Periodicals/CFS/non-machinable processing.",
  },
  {
    number: 3,
    title:
      "USPS Marketing Mail can become UBBM only when undeliverable AND unendorsed.",
    detail:
      "Unendorsed Marketing Mail with no mailer endorsement that cannot be delivered, because the customer moved with no forwarding order, the address does not exist, the unit is vacant, or the addressee is unknown, is handled as UBBM per local unit procedures.\n\nEndorsed Marketing Mail is NOT plain UBBM regardless of the delivery problem. Each endorsement activates a different service:\n• ASR (Address Service Requested): with active COA in months 1–12, may forward and generate address-correction notice. Carrier-facing safe bucket: CFS/PARS/local forwarding flow.\n• FSR (Forwarding Service Requested): forward if COA exists; return if not.\n• RSR (Return Service Requested): return the piece to the sender.\n• CSR (Change Service Requested): ACS/address-correction processing. Depending on option/profile and COA age, the piece may be forwarded or disposed after notice. Carrier-facing safe answer: CFS/PARS/local procedure.\n• ESR (Electronic Service Requested): NOT plain UBBM. Means CFS/PARS/ACS processing; handling is determined by the mailer's ACS profile and barcode service type. Carrier-facing safe bucket: CFS/PARS/local forwarding procedure.\n\nFinal downstream processing (fees, notices, ACS data) may happen at CFS/PARS after you hand it off. Your job is to get the piece to the right bucket.",
  },
  {
    number: 4,
    title:
      "Periodicals are not UBBM; they go through Periodicals/CFS processing.",
    detail:
      "Periodicals-class mail (magazines, newspapers authorized as Periodicals) has its own DMM rules. When undeliverable, Periodicals are not automatically returned; final treatment (notice, disposal, or return) depends on whether the publisher requested return service and the piece's forwarding/CFS eligibility. Carrier-facing safe handling: send through the Periodicals/CFS/non-machinable procedure, not the UBBM bin.",
  },
  {
    number: 5,
    title: "Carrier endorsements explain why the piece could not be delivered.",
    detail:
      "Carrier endorsements are notations you apply to explain undeliverable mail:\n• ANK: Addressee Not Known at this address\n• IA: Insufficient Address (missing street, number, etc.)\n• NSN: No Such Number on this street\n• NSS: No Such Street in this city\n• NMR: No Mail Receptacle\n• REF: Refused by addressee\n• UNC: Unclaimed after notice period\n• UTF: Unable to Forward (forwarding order expired or none on file)\n• VAC: Vacant unit, used when mail is addressed to 'Occupant' or 'Current Resident' at a confirmed vacant address. Do NOT use VAC for named-addressee mail; use the appropriate endorsement (UTF, ANK, etc.) instead.\n• DEC: Deceased (confirmed; use carefully)\n• ILL: Illegible address\nApply the most accurate endorsement so the sender understands why return occurred.",
  },
  {
    number: 6,
    title:
      "Accountable / special-service mail is never casually discarded or put in UBBM.",
    detail:
      "Certified, Registered, COD, Insured (sig required), Signature Confirmation, Priority Mail Express, and Postage Due items must all be handled through proper accountable or revenue procedures. Each tracked piece has a chain of custody. Placing any of these in UBBM or discarding them is a serious compliance violation.\n\nPostage Due is accountable revenue handling; do not UBBM or discard it.\n\nPriority Mail Express has time-value and special handling requirements. Follow your scanner, PS Form 3849, and local clearance procedures.\n\nWhen you can't deliver any accountable or special-service piece, leave PS Form 3849 and return it to the appropriate section.",
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

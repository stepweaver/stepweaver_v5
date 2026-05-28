import type {
  MailCard,
  GameMode,
  EvaluationResult,
  HandlingBin,
  CarrierEndorsement,
} from "./types";
import { mailCards } from "./mailCards";

export const MAIL_CLASS_LABELS: Record<string, string> = {
  first_class: "First-Class Mail",
  priority_mail: "Priority Mail",
  priority_mail_express: "Priority Mail Express",
  usps_ground_advantage: "USPS Ground Advantage",
  periodicals: "Periodicals",
  usps_marketing_mail: "USPS Marketing Mail",
  package_services: "Package Services / Media Mail",
  unknown: "Unknown",
};

export const HANDLING_BIN_LABELS: Record<HandlingBin, string> = {
  deliver: "Deliver to Mailbox",
  forward_cfs: "Forward via CFS",
  return_to_sender: "Return to Sender",
  ubbm: "UBBM",
  accountable_clerk: "Accountable Clerk / Post Office",
  leave_notice: "Leave Notice (PS 3849)",
  hold: "Hold at Post Office",
  ask_supervisor: "Ask Supervisor",
};

export const CARRIER_ENDORSEMENT_LABELS: Record<CarrierEndorsement, string> = {
  none: "None, no endorsement needed",
  ank: "ANK – Addressee Not Known",
  ia: "IA – Insufficient Address",
  nsn: "NSN – No Such Number",
  nss: "NSS – No Such Street",
  utf: "UTF – Unable to Forward",
  nmr: "NMR – No Mail Receptacle",
  ref: "REF – Refused",
  unc: "UNC – Unclaimed",
  vac: "VAC – Vacant",
  dec: "DEC – Deceased",
  ill: "ILL – Illegible",
  moved_left_no_address: "Moved Left No Address",
};

const SPEED_BONUS_THRESHOLD_MS = 7000;
const POINTS_CORRECT = 100;
const POINTS_SPEED_BONUS = 25;
const POINTS_WRONG = -50;
const POINTS_CRITICAL = -100;

const NEVER_UBBM_CLASSES = new Set([
  "first_class",
  "priority_mail",
  "priority_mail_express",
  "usps_ground_advantage",
  "periodicals",
  "package_services",
]);

const ACCOUNTABLE_SERVICES = new Set([
  "certified",
  "registered",
  "cod",
  "insured_signature",
  "signature_confirmation",
  "postage_due",
  "customs_due",
]);

function isCriticalMistake(
  card: MailCard,
  mode: GameMode,
  userAnswer: string
): boolean {
  if (
    (mode === "ubbm_or_not" && userAnswer === "ubbm") ||
    ((mode === "accountable_chain" || mode === "route_case_sim") &&
      userAnswer === "ubbm")
  ) {
    if (NEVER_UBBM_CLASSES.has(card.class)) return true;
    if (card.isAccountable) return true;
    if (ACCOUNTABLE_SERVICES.has(card.extraService)) return true;
    if (card.mailerEndorsement !== "none") return true;
  }

  if (
    mode === "endorsement_drill" &&
    userAnswer === "dec" &&
    card.tags.includes("warn_dec") &&
    card.correctCarrierEndorsement !== "dec"
  ) {
    return true;
  }

  return false;
}

export function evaluateAnswer(
  card: MailCard,
  mode: GameMode,
  userAnswer: string,
  elapsedMs = 0
): EvaluationResult {
  let correct = false;
  let correctAnswer = "";

  switch (mode) {
    case "class_sort":
      correct = userAnswer === card.class;
      correctAnswer = MAIL_CLASS_LABELS[card.class] ?? card.class;
      break;
    case "ubbm_or_not":
      correct = userAnswer === (card.isUBBM ? "ubbm" : "not_ubbm");
      correctAnswer = card.isUBBM ? "UBBM" : "Not UBBM";
      break;
    case "endorsement_drill":
      correct = userAnswer === (card.correctCarrierEndorsement ?? "none");
      correctAnswer =
        CARRIER_ENDORSEMENT_LABELS[
          (card.correctCarrierEndorsement ?? "none") as CarrierEndorsement
        ] ?? "None";
      break;
    case "accountable_chain":
    case "route_case_sim":
      correct = userAnswer === card.correctBin;
      correctAnswer = HANDLING_BIN_LABELS[card.correctBin as HandlingBin] ?? card.correctBin;
      break;
  }

  const critical = !correct && isCriticalMistake(card, mode, userAnswer);
  const speedBonus =
    correct && elapsedMs > 0 && elapsedMs < SPEED_BONUS_THRESHOLD_MS;

  let points = 0;
  if (correct) {
    points = POINTS_CORRECT + (speedBonus ? POINTS_SPEED_BONUS : 0);
  } else if (critical) {
    points = POINTS_CRITICAL;
  } else {
    points = POINTS_WRONG;
  }

  return {
    correct,
    points,
    criticalMistake: critical,
    correctAnswer,
    explanation: card.explanation,
    mistakeWarnings: card.mistakeWarnings,
    isSpeedBonus: speedBonus,
  };
}

export function getAnswerChoices(
  mode: GameMode
): Array<{ value: string; label: string }> {
  switch (mode) {
    case "class_sort":
      return [
        { value: "first_class", label: "First-Class Mail" },
        { value: "priority_mail", label: "Priority Mail" },
        { value: "priority_mail_express", label: "Priority Mail Express" },
        { value: "usps_ground_advantage", label: "USPS Ground Advantage" },
        { value: "periodicals", label: "Periodicals" },
        { value: "usps_marketing_mail", label: "USPS Marketing Mail" },
        {
          value: "package_services",
          label: "Package Services / Media Mail",
        },
      ];
    case "ubbm_or_not":
      return [
        {
          value: "ubbm",
          label: "UBBM, bulk undeliverable. Handle per local instructions.",
        },
        {
          value: "not_ubbm",
          label: "Not UBBM, must forward, return, or deliver",
        },
      ];
    case "endorsement_drill":
      return [
        { value: "ank", label: "ANK – Addressee Not Known" },
        { value: "ia", label: "IA – Insufficient Address" },
        { value: "nsn", label: "NSN – No Such Number" },
        { value: "nss", label: "NSS – No Such Street" },
        { value: "nmr", label: "NMR – No Mail Receptacle" },
        { value: "ref", label: "REF – Refused" },
        { value: "unc", label: "UNC – Unclaimed" },
        { value: "utf", label: "UTF – Unable to Forward" },
        { value: "vac", label: "VAC – Vacant" },
        { value: "dec", label: "DEC – Deceased" },
        { value: "ill", label: "ILL – Illegible" },
        { value: "moved_left_no_address", label: "Moved Left No Address" },
        { value: "none", label: "None, no endorsement needed" },
      ];
    case "accountable_chain":
    case "route_case_sim":
      return [
        { value: "deliver", label: "Deliver to mailbox" },
        { value: "forward_cfs", label: "Forward via CFS (Change of Address)" },
        { value: "return_to_sender", label: "Return to Sender" },
        { value: "ubbm", label: "UBBM" },
        { value: "accountable_clerk", label: "Accountable Clerk / Post Office" },
        { value: "leave_notice", label: "Leave Notice (PS 3849)" },
        { value: "hold", label: "Hold at Post Office" },
        { value: "ask_supervisor", label: "Ask Supervisor" },
      ];
  }
}

export function shuffleDeck(deck: MailCard[]): MailCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function filterDeckForMode(
  deck: MailCard[],
  mode: GameMode
): MailCard[] {
  switch (mode) {
    case "class_sort":
      return deck;
    case "ubbm_or_not":
      return deck;
    case "endorsement_drill":
      return deck.filter(
        (c) => c.correctCarrierEndorsement && c.correctCarrierEndorsement !== "none"
      );
    case "accountable_chain":
      return deck.filter(
        (c) => c.isAccountable || c.extraService !== "none"
      );
    case "route_case_sim":
      return deck;
  }
}

export function buildRoundDeck(mode: GameMode, count = 10): MailCard[] {
  const filtered = filterDeckForMode(mailCards, mode);
  const shuffled = shuffleDeck(filtered);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

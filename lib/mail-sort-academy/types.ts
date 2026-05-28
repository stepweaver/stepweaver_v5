export type MailClass =
  | "first_class"
  | "priority_mail"
  | "priority_mail_express"
  | "usps_ground_advantage"
  | "periodicals"
  | "usps_marketing_mail"
  | "package_services"
  | "unknown";

export type MailShape =
  | "card"
  | "letter"
  | "flat"
  | "parcel"
  | "magazine"
  | "catalog"
  | "flyer"
  | "unknown";

export type MailerEndorsement =
  | "none"
  | "address_service_requested"
  | "forwarding_service_requested"
  | "return_service_requested"
  | "change_service_requested"
  | "electronic_service_requested";

export type CarrierEndorsement =
  | "none"
  | "ank"
  | "ia"
  | "nsn"
  | "nss"
  | "utf"
  | "nmr"
  | "ref"
  | "unc"
  | "vac"
  | "dec"
  | "ill"
  | "moved_left_no_address";

export type HandlingBin =
  | "deliver"
  | "forward_cfs"
  | "return_to_sender"
  | "ubbm"
  | "accountable_clerk"
  | "leave_notice"
  | "hold"
  | "ask_supervisor";

export type ExtraService =
  | "none"
  | "certified"
  | "registered"
  | "cod"
  | "insured_signature"
  | "signature_confirmation"
  | "return_receipt"
  | "postage_due"
  | "customs_due"
  | "arrow_key";

export type MailCard = {
  id: string;
  title: string;
  scenario: string;
  class: MailClass;
  shape: MailShape;
  mailerEndorsement: MailerEndorsement;
  extraService: ExtraService;
  isAccountable: boolean;
  isUBBM: boolean;
  correctCarrierEndorsement?: CarrierEndorsement;
  correctBin: HandlingBin;
  difficulty: "rookie" | "regular" | "inspection";
  explanation: string;
  mistakeWarnings?: string[];
  tags: string[];
};

export type GameMode =
  | "class_sort"
  | "ubbm_or_not"
  | "endorsement_drill"
  | "accountable_chain"
  | "route_case_sim";

export type GamePhase =
  | "mode_select"
  | "playing"
  | "result"
  | "round_summary"
  | "study_guide";

export type EvaluationResult = {
  correct: boolean;
  points: number;
  criticalMistake: boolean;
  correctAnswer: string;
  explanation: string;
  mistakeWarnings?: string[];
  isSpeedBonus: boolean;
};

export interface GameState {
  phase: GamePhase;
  mode: GameMode | null;
  deck: MailCard[];
  cardIndex: number;
  score: number;
  streak: number;
  correctCount: number;
  wrongCount: number;
  criticalMistakes: number;
  lastResult: EvaluationResult | null;
  answerStartTime: number | null;
}

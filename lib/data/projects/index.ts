import type { Project } from "../projects.schema";
import { aiIntegrations } from "./ai-integrations";
import { carrierJournal } from "./carrier-journal";
import { billPlanner } from "./bill-planner";
import { googleAnalytics } from "./google-analytics";
import { iamResist } from "./iam-resist";
import { itConsulting } from "./it-consulting";
import { lambdaOrthodontics } from "./lambda-orthodontics";
import { lcerebro } from "./lcerebro";
import { llambdaLlmAgent } from "./llambda-llm-agent";
import { lsigilSetup } from "./lsigil-setup";
import { mishawakaShowerBooking } from "./mishawaka-shower-booking";
import { n8nAutomations } from "./n8n-automations";
import { neonProfileCard } from "./neon-profile-card";
import { orthodonticTracker } from "./orthodontic-tracker";
import { portfolioTerminal } from "./portfolio-terminal";
import { rpgDiceRoller } from "./rpg-dice-roller";
import { serviceBusinessDemo } from "./service-business-demo";
import { silentAuction } from "./silent-auction";
import { soapStache } from "./soap-stache";
import { mailSortAcademy } from "./mail-sort-academy";
import { parcelSweep } from "./parcel-sweep";
import { stepweaverDev } from "./stepweaver-dev";
import { websiteRefreshes } from "./website-refreshes";

/** Homepage / Work flagships: production software proofs for hiring. */
export const FEATURED_SLUGS = [
  "parcel-sweep",
  "silent-auction",
  "lsigil-setup",
  "bill-planner",
  "mishawaka-shower-booking",
  "portfolio-terminal",
] as const;

export const FEATURED_PROOFS: Record<(typeof FEATURED_SLUGS)[number], string> = {
  "parcel-sweep": "Operational workflow modeling + full-stack architecture",
  "silent-auction": "Production app + realtime + users + business rules",
  "lsigil-setup": "Business automation + deterministic systems + AI boundaries",
  "bill-planner": "Product thinking + data modeling + application UX",
  "mishawaka-shower-booking": "Process analysis → practical internal tool",
  "portfolio-terminal": "Technical creativity + AI integration + frontend systems",
};

/** Full catalog sort: featured block first, then remaining order. */
const CATALOG_ORDER = [
  ...FEATURED_SLUGS,
  "llambda-llm-agent",
  "ai-integrations",
  "carrier-journal",
  "mail-sort-academy",
  "stepweaver-dev",
  "iam-resist",
  "lcerebro",
  "lambda-orthodontics",
  "service-business-demo",
  "n8n-automations",
  "it-consulting",
  "orthodontic-tracker",
  "soap-stache",
  "rpg-dice-roller",
  "neon-profile-card",
  "google-analytics",
  "website-refreshes",
] as const;

const CATALOG_SLUG_SET = new Set<string>(CATALOG_ORDER);

const RAW_PROJECTS: Project[] = [
  aiIntegrations,
  carrierJournal,
  mailSortAcademy,
  parcelSweep,
  billPlanner,
  googleAnalytics,
  iamResist,
  itConsulting,
  lambdaOrthodontics,
  lcerebro,
  llambdaLlmAgent,
  lsigilSetup,
  mishawakaShowerBooking,
  n8nAutomations,
  neonProfileCard,
  orthodonticTracker,
  portfolioTerminal,
  rpgDiceRoller,
  serviceBusinessDemo,
  silentAuction,
  soapStache,
  stepweaverDev,
  websiteRefreshes,
];

function sortByCatalogOrder(projects: Project[]): Project[] {
  const map = new Map(projects.map((p) => [p.slug, p]));
  const ordered: Project[] = [];
  for (const slug of CATALOG_ORDER) {
    const p = map.get(slug);
    if (p) ordered.push(p);
  }
  for (const p of projects) {
    if (!CATALOG_SLUG_SET.has(p.slug)) ordered.push(p);
  }
  return ordered;
}

const ALL_PROJECTS: Project[] = sortByCatalogOrder(RAW_PROJECTS);

export function getAllProjects(): Project[] {
  return ALL_PROJECTS;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return ALL_PROJECTS.find((p) => p.slug === slug);
}

/** Curated homepage carousel / Work flagship set. */
export function getFeaturedProjects(): Project[] {
  return getHomepageCarouselProjects();
}

export function getHomepageCarouselProjects(): Project[] {
  const map = new Map(ALL_PROJECTS.map((p) => [p.slug, p]));
  return FEATURED_SLUGS.map((slug) => map.get(slug)).filter((p): p is Project => p !== undefined);
}

export function isFeaturedSlug(slug: string): boolean {
  return (FEATURED_SLUGS as readonly string[]).includes(slug);
}

export function getArchiveProjects(): Project[] {
  const featured = new Set<string>(FEATURED_SLUGS);
  return ALL_PROJECTS.filter((p) => !featured.has(p.slug));
}

export function getProjectProof(slug: string): string | undefined {
  if ((FEATURED_SLUGS as readonly string[]).includes(slug)) {
    return FEATURED_PROOFS[slug as (typeof FEATURED_SLUGS)[number]];
  }
  return undefined;
}

export function getProjectsByTag(tag: string): Project[] {
  return ALL_PROJECTS.filter((p) => p.tags.includes(tag));
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const p of ALL_PROJECTS) {
    for (const t of p.tags) tagSet.add(t);
  }
  return Array.from(tagSet).sort();
}

export function getProjectSlugs(): string[] {
  return ALL_PROJECTS.map((p) => p.slug);
}

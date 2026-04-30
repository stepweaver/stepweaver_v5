import type { Project } from "../projects.schema";
import { aiIntegrations } from "./ai-integrations";
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
import { stepweaverDev } from "./stepweaver-dev";
import { websiteRefreshes } from "./website-refreshes";

/** Homepage featured dossiers: v3 `carouselProjects.js` FEATURED_ORDER parity (8 entries). */
const FEATURED_SLUGS = [
  "stepweaver-dev",
  "silent-auction",
  "bill-planner",
  "llambda-llm-agent",
  "portfolio-terminal",
  "iam-resist",
  "lcerebro",
  "lsigil-setup",
] as const;

/** Full catalog sort: featured block first, then v3 REMAINING_ORDER. */
const CATALOG_ORDER = [
  ...FEATURED_SLUGS,
  "ai-integrations",
  "lambda-orthodontics",
  "service-business-demo",
  "n8n-automations",
  "mishawaka-shower-booking",
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

/** Curated homepage carousel: exactly the 8 featured slugs when all exist. */
function getFeaturedProjects(): Project[] {
  return getHomepageCarouselProjects();
}

export function getHomepageCarouselProjects(): Project[] {
  const map = new Map(ALL_PROJECTS.map((p) => [p.slug, p]));
  return FEATURED_SLUGS.map((slug) => map.get(slug)).filter((p): p is Project => p !== undefined);
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
